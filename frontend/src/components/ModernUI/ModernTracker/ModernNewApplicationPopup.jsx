import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #3a3a3c",
    backgroundColor: "#2c2c2e",
    color: "#f0f0f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
};

const secondaryButtonStyle = {
    padding: "10px 22px",
    borderRadius: "8px",
    border: "1px solid #444",
    backgroundColor: "#2c2c2e",
    color: "#f0f0f0",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
};

const extractLinkedInJobId = (rawUrl) => {
    try {
        const url = new URL(rawUrl.trim());
        if (!url.hostname.includes('linkedin.com')) {
            return null;
        }
        const pathMatch = url.pathname.match(/\/jobs\/view\/(?:[^/?]*?-)?(\d{6,})/i);
        if (pathMatch) return pathMatch[1];
        return url.searchParams.get('currentJobId');
    } catch {
        return null;
    }
};

const looksLikeLocation = (value) => {
    if (!value) return false;
    const v = value.replace(/\s+/g, ' ').trim();
    if (!v || v.length > 120) return false;
    if (/^remote\b/i.test(v)) return true;
    if (/^united states$/i.test(v)) return true;
    if (/\b(greater|metro(politan)?)\b.+\barea\b/i.test(v)) return true;
    if (/^.+,\s*[A-Za-z]{2}(\s*,|$)/.test(v)) return true;
    if (/,.+\b(United States|USA|Canada|United Kingdom|UK)\b/i.test(v)) return true;
    return false;
};

const normalizeImportedLocation = (raw) => {
    if (!raw) return '';
    let value = raw.replace(/\s+/g, ' ').trim();
    value = value.replace(/\s*[|·•]\s*LinkedIn\s*$/i, '').trim();
    if (/^remote\b/i.test(value)) return 'Remote';
    if (/^united states$/i.test(value)) return 'United States';

    // "City, ST, United States" -> "City, ST"
    const cityStateCountry = value.match(/^([^,]+),\s*([A-Za-z]{2})\s*,\s*.+$/);
    if (cityStateCountry) {
        return `${cityStateCountry[1].trim()}, ${cityStateCountry[2].toUpperCase()}`;
    }

    const cityState = value.match(/^([^,]+),\s*([A-Za-z]{2})(?:\s*,|$)/);
    if (cityState) {
        return `${cityState[1].trim()}, ${cityState[2].toUpperCase()}`;
    }

    // "City, State, United States" keep as-is unless we can simplify
    return value;
};

/**
 * LinkedIn page titles are almost always:
 *   "{Company} hiring {Position} in {Location} | LinkedIn"
 * Never treat the part before "hiring" as the job title.
 */
const parseLinkedInDocumentTitle = (titleLine) => {
    if (!titleLine) return null;

    let title = titleLine.replace(/\s+/g, ' ').trim();
    title = title.replace(/\s*[|·•]\s*LinkedIn\s*$/i, '').trim();
    title = title.replace(/\s+jobs?\s+in\s+.+$/i, '').trim();

    // Ignore LinkedIn search/index titles
    if (/^\d[\d+,]*\+?\s+.+\s+jobs?\b/i.test(title)) {
        return null;
    }

    const hiringIn = title.match(/^(.+?)\s+hiring\s+(.+?)\s+in\s+(.+)$/i);
    if (hiringIn) {
        return {
            company: hiringIn[1].trim(),
            position: hiringIn[2].trim(),
            location: hiringIn[3].trim(),
        };
    }

    const hiring = title.match(/^(.+?)\s+hiring\s+(.+)$/i);
    if (hiring) {
        return {
            company: hiring[1].trim(),
            position: hiring[2].trim(),
            location: '',
        };
    }

    return null;
};

const finalizeParsedJob = ({ position, company, location }) => ({
    position: (position || '').replace(/\s+/g, ' ').trim(),
    company: (company || '').replace(/\s+/g, ' ').trim(),
    location: normalizeImportedLocation(location || ''),
});

const parseLinkedInJobHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const textOf = (...selectors) => {
        for (const selector of selectors) {
            const value = doc.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
            if (value) return value;
        }
        return '';
    };

    let position = '';
    let company = '';
    let locationValue = '';

    const jsonLdNodes = [...doc.querySelectorAll('script[type="application/ld+json"]')];
    for (const node of jsonLdNodes) {
        try {
            const parsed = JSON.parse(node.textContent);
            const candidates = Array.isArray(parsed) ? parsed : [parsed];
            const jobPosting = candidates.find((item) => item?.['@type'] === 'JobPosting');
            if (!jobPosting) continue;

            position = jobPosting.title || position;
            company = jobPosting.hiringOrganization?.name || company;

            const address = jobPosting.jobLocation?.address;
            if (address) {
                const city = address.addressLocality || '';
                const region = address.addressRegion || '';
                locationValue = [city, region].filter(Boolean).join(', ') || address.addressCountry || locationValue;
            }
            if (jobPosting.jobLocationType === 'TELECOMMUTE') {
                locationValue = 'Remote';
            }
        } catch {
            // ignore malformed JSON-LD
        }
    }

    const docTitleParsed = parseLinkedInDocumentTitle(doc.querySelector('title')?.textContent || '');
    if (docTitleParsed) {
        position = position || docTitleParsed.position;
        company = company || docTitleParsed.company;
        locationValue = locationValue || docTitleParsed.location;
    }

    // Only use LinkedIn job-card selectors — never a generic h1 (search pages break that)
    if (!position) {
        position = textOf(
            'h1.top-card-layout__title',
            '.top-card-layout__title',
            'h2.top-card-layout__title'
        );
    }

    if (!company) {
        company = textOf(
            'a.topcard__org-name-link',
            '.topcard__org-name-link',
            'a.topcard__flavor--black-link',
            '.topcard__flavor--black-link'
        );
    }

    if (!locationValue) {
        const flavors = [
            ...doc.querySelectorAll(
                '.topcard__flavor--bullet, span.topcard__flavor--bullet, .top-card__bullet, .job-details-jobs-unified-top-card__bullet'
            ),
        ];
        for (const el of flavors) {
            const value = el.textContent?.replace(/\s+/g, ' ').trim() || '';
            if (!value || value === company) continue;
            if (/employees|followers|applicants|ago|people/i.test(value)) continue;
            locationValue = value;
            break;
        }
    }

    return finalizeParsedJob({
        position,
        company,
        location: locationValue,
    });
};

const parseLinkedInJobMarkdown = (text) => {
    const titleLine = text.match(/^Title:\s*(.+)$/m)?.[1]?.trim() || '';
    const fromTitle = parseLinkedInDocumentTitle(titleLine);

    const body = text.includes('Markdown Content:')
        ? text.split('Markdown Content:').slice(1).join('Markdown Content:')
        : text;

    // Keep link labels: [Company](url) -> Company
    const lines = body
        .split('\n')
        .map((line) =>
            line
                .replace(/!\[.*?\]\(.*?\)/g, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/^[#>*\-\s]+/, '')
                .replace(/\s+/g, ' ')
                .trim()
        )
        .filter(Boolean);

    let position = fromTitle?.position || '';
    let company = fromTitle?.company || '';
    let locationValue = fromTitle?.location || '';

    // If title gave us the structured "Company hiring Position in Location" form, trust it.
    // Only fill missing fields from body lines.
    const skipLine = (line) =>
        /skip to main|expand search|sign in|join now|linkedin|set alert|get notified|employees|followers|applicants|show more|clear text|any time|job type|experience level|salary|^\d+\+/i.test(
            line
        );

    for (const line of lines) {
        if (skipLine(line) || line.length < 2 || line.length > 140) continue;

        if (!position && !looksLikeLocation(line)) {
            // Body often starts with "Position in Location"
            const positionInLoc = line.match(/^(.+?)\s+in\s+(.+)$/i);
            if (positionInLoc && looksLikeLocation(positionInLoc[2])) {
                position = positionInLoc[1].trim();
                locationValue = locationValue || positionInLoc[2].trim();
            } else {
                position = line;
            }
            continue;
        }

        if (position && !company && line !== position && !looksLikeLocation(line)) {
            company = line;
            continue;
        }

        if (!locationValue && looksLikeLocation(line)) {
            locationValue = line;
            break;
        }

        if (company && position && locationValue) break;
    }

    return finalizeParsedJob({
        position,
        company,
        location: locationValue,
    });
};

const parseLinkedInJobPayload = (payload) => {
    if (!payload || payload.length < 20) {
        return { position: '', company: '', location: '' };
    }

    // Prefer structured HTML / JSON-LD when present
    if (
        payload.includes('<') &&
        (payload.includes('JobPosting') ||
            payload.includes('top-card') ||
            payload.includes('topcard') ||
            payload.includes('job-details-jobs-unified-top-card'))
    ) {
        const fromHtml = parseLinkedInJobHtml(payload);
        if (fromHtml.company || fromHtml.position) return fromHtml;
    }

    // Title: "Company hiring Position in Location" (common from jina reader)
    const titleLine = payload.match(/^Title:\s*(.+)$/m)?.[1]?.trim() || '';
    const fromTitle = parseLinkedInDocumentTitle(titleLine);
    if (fromTitle?.company && fromTitle?.position) {
        // Still run markdown pass to fill any missing location from body
        const fromMarkdown = parseLinkedInJobMarkdown(payload);
        return finalizeParsedJob({
            position: fromTitle.position,
            company: fromTitle.company,
            location: fromTitle.location || fromMarkdown.location,
        });
    }

    return parseLinkedInJobMarkdown(payload);
};

const ModernNewApplicationPopup = ({text, closePopup, listNames }) => {

    const location = useLocation();
    const [viewMode, setViewMode] = useState('form');
    const [linkedInUrl, setLinkedInUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [newCompanyName, setNewCompanyName] = useState("");
    const [newJobLink, setNewJobLink] = useState("");
    const [newList, setNewList] = useState("");
    const [newLocation, setNewLocation] = useState("");
    const [newPosition, setNewPosition] = useState("");
    const [locationValidationError, setLocationValidationError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");

    const validateLocationFormat = (loc) => {
        if (!loc || loc.trim() === '') return false;
        const normalized = loc.trim().toLowerCase();
        if (normalized === 'remote') return true;
        if (normalized === 'united states') return true;
        const locationRegex = /^.+,\s*[a-z]{2}$/i;
        return locationRegex.test(loc);
    };

    const handleLocationChange = (newLoc) => {
        setNewLocation(newLoc);
        if (newLoc.trim() === '') {
            setLocationValidationError('Location is required');
        } else if (!validateLocationFormat(newLoc)) {
            setLocationValidationError('Format: Remote, United States, or City, XX (case-insensitive)');
        } else {
            setLocationValidationError('');
        }
    };

    useEffect(() => {
        const listName = new URLSearchParams(location.search).get("listName");
        if (listName) {
            setNewList(listName);
        }
    }, [location.search]);

    const isLocationValid = validateLocationFormat(newLocation);
    const isFormValid = newCompanyName && newPosition && newJobLink && isLocationValid && newList;

    const buildDateAppliedValue = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const microseconds = `${String(now.getMilliseconds()).padStart(3, '0')}000`;

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${microseconds}`;
    };

    const scoreLinkedInPayload = (payload) => {
        if (!payload || payload.length < 50) return -1;
        let score = 0;
        const titleLine = payload.match(/^Title:\s*(.+)$/m)?.[1] || '';
        if (/\bhiring\b/i.test(titleLine)) score += 50;
        if (parseLinkedInDocumentTitle(titleLine)) score += 40;
        if (payload.includes('JobPosting') || payload.includes('topcard__org-name-link') || payload.includes('top-card-layout__title')) {
            score += 30;
        }
        // Search / expired-redirect pages are useless
        if (/^\d[\d+,]*\+?\s+.+\s+jobs?\b/i.test(titleLine)) score -= 80;
        if (/expired_jd_redirect|jobs_registration|public_jobs_nav/i.test(payload) && !/\bhiring\b/i.test(titleLine)) {
            score -= 40;
        }
        return score;
    };

    const fetchLinkedInJobPayload = async (jobId, originalUrl) => {
        const guestUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;
        const viewUrl = `https://www.linkedin.com/jobs/view/${jobId}`;
        const publicUrl = /linkedin\.com\/jobs\/view/i.test(originalUrl) ? originalUrl.trim() : viewUrl;

        // Free, no API key — try several sources and keep the best parseable payload
        const attempts = [
            async () => {
                const res = await fetch(`https://r.jina.ai/${publicUrl}`, {
                    headers: { Accept: 'text/plain' },
                });
                if (!res.ok) throw new Error(`jina ${res.status}`);
                return res.text();
            },
            async () => {
                const res = await fetch(`https://r.jina.ai/${guestUrl}`, {
                    headers: { Accept: 'text/plain' },
                });
                if (!res.ok) throw new Error(`jina-guest ${res.status}`);
                return res.text();
            },
            async () => {
                const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(guestUrl)}`);
                if (!res.ok) throw new Error(`allorigins ${res.status}`);
                const data = await res.json();
                return data?.contents || '';
            },
            async () => {
                const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(publicUrl)}`);
                if (!res.ok) throw new Error(`allorigins-view ${res.status}`);
                const data = await res.json();
                return data?.contents || '';
            },
        ];

        let bestPayload = '';
        let bestScore = -1;
        let lastError = null;

        for (const attempt of attempts) {
            try {
                const payload = await attempt();
                const score = scoreLinkedInPayload(payload);
                if (score > bestScore) {
                    bestScore = score;
                    bestPayload = payload;
                }
                // Good enough: structured hiring title or HTML job card
                if (score >= 40) {
                    return payload;
                }
            } catch (err) {
                lastError = err;
            }
        }

        if (bestPayload && bestScore >= 0) {
            return bestPayload;
        }

        throw lastError || new Error('Unable to fetch LinkedIn job');
    };

    const importLinkedInJob = async () => {
        const trimmedUrl = linkedInUrl.trim();
        setImportError('');

        if (!trimmedUrl) {
            setImportError('Please paste a LinkedIn job URL.');
            return;
        }

        const jobId = extractLinkedInJobId(trimmedUrl);
        if (!jobId) {
            setImportError('That does not look like a valid LinkedIn job URL.');
            return;
        }

        setIsImporting(true);
        try {
            const payload = await fetchLinkedInJobPayload(jobId, trimmedUrl);
            const parsed = parseLinkedInJobPayload(payload);

            if (!parsed.company && !parsed.position) {
                throw new Error('Could not read job details from LinkedIn.');
            }

            setNewCompanyName(parsed.company);
            setNewPosition(parsed.position);
            handleLocationChange(parsed.location || '');
            setNewJobLink(trimmedUrl);
            setViewMode('form');
            setImportError('');
        } catch (err) {
            console.error('LinkedIn import failed:', err);
            setImportError('Failed to import listing. Check the URL and try again.');
        } finally {
            setIsImporting(false);
        }
    };

    async function addNewApplication() {
        setIsSaving(true);
        setSaveStatus('Saving...');
        console.log('Adding new application' + text)

        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Jobs/create" 

        const params = {
            username: localStorage.getItem('username'),
            dateApplied: buildDateAppliedValue(),
            companyName: newCompanyName,
            jobLink: newJobLink || "N/A",
            list: newList,
            location: newLocation || "N/A",
            position: newPosition || "N/A", 
            nextInterviewDate: "",
            notes: "No Notes...",
            rejected: false,
            favorited: false,
            stage: "0"
        };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(params)
            });

            const data = await res.json();
            console.log("SUCCESS:", data);
            setSaveStatus('Success!');
            setTimeout(() => {
                closePopup();
                window.location.reload();
            }, 1500);
            return;
        } catch (err) {
            console.error("ERROR:", err);
            setSaveStatus('Failed to save. Please try again.');
            setIsSaving(false);
            return;
        }
    }

    return (
        <div style={{
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 9999,
        }}>
            <div
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    borderRadius: "16px",
                    padding: "36px 32px 28px",
                    width: "520px",
                    maxWidth: "95vw",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0px",
                    color: "#f0f0f0",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                }}
            >
                {viewMode === 'linkedinImport' ? (
                    <>
                        <h2 style={{ margin: "0 0 12px", fontSize: "26px", fontWeight: "700", color: "#ffffff" }}>
                            Import LinkedIn Job
                        </h2>
                        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#a0a0a0" }}>
                            Paste a LinkedIn job listing URL to auto-fill the application fields
                        </p>
                        <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                        <div style={{ marginBottom: "20px" }}>
                            <textarea
                                placeholder="https://www.linkedin.com/jobs/view/..."
                                value={linkedInUrl}
                                onChange={({ target }) => {
                                    setLinkedInUrl(target.value);
                                    if (importError) setImportError('');
                                }}
                                rows={4}
                                style={{
                                    ...inputStyle,
                                    resize: "vertical",
                                    height: "102px",
                                    minHeight: "102px",
                                    fontFamily: "inherit",
                                }}
                            />
                            {importError && (
                                <span style={{
                                    fontSize: '12px',
                                    color: '#ffffff',
                                    backgroundColor: 'rgba(204, 0, 0, 0.2)',
                                    border: '1px solid rgba(204, 0, 0, 0.45)',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    marginTop: '8px',
                                    display: 'block'
                                }}>
                                    {importError}
                                </span>
                            )}
                        </div>

                        <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setViewMode('form');
                                    setImportError('');
                                }}
                                style={secondaryButtonStyle}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#3a3a3c"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#2c2c2e"}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={importLinkedInJob}
                                disabled={isImporting || !linkedInUrl.trim()}
                                style={{
                                    padding: "10px 22px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: isImporting || !linkedInUrl.trim() ? "#3a5080" : "#4a9eff",
                                    color: isImporting || !linkedInUrl.trim() ? "#7a9aaa" : "#ffffff",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: isImporting || !linkedInUrl.trim() ? "not-allowed" : "pointer",
                                    transition: "background-color 0.2s",
                                }}
                            >
                                {isImporting ? 'Importing...' : 'Import'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 style={{ margin: "0 0 12px", fontSize: "26px", fontWeight: "700", color: "#ffffff" }}>
                            Add Job Application
                        </h2>

                        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#a0a0a0" }}>
                            Enter the details for the new job application
                        </p>

                        <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                            <div>
                                <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                                    Company Name *
                                </label>
                                <input
                                    placeholder="Enter company name..."
                                    value={newCompanyName}
                                    onChange={({ target }) => setNewCompanyName(target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                                    Position *
                                </label>
                                <input
                                    placeholder="Enter position..."
                                    value={newPosition}
                                    onChange={({ target }) => setNewPosition(target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                                    Location / Remote *
                                </label>
                                <input
                                    placeholder="Remote, United States, or City, XX..."
                                    value={newLocation}
                                    onChange={({ target }) => handleLocationChange(target.value)}
                                    style={inputStyle}
                                />
                                {locationValidationError && (
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#ffffff',
                                        backgroundColor: 'rgba(204, 0, 0, 0.2)',
                                        border: '1px solid rgba(204, 0, 0, 0.45)',
                                        padding: '6px 10px',
                                        borderRadius: '8px',
                                        marginTop: '6px',
                                        display: 'block'
                                    }}>
                                        {locationValidationError}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                                    Job Link *
                                </label>
                                <input
                                    placeholder="Enter job link..."
                                    value={newJobLink}
                                    onChange={({ target }) => setNewJobLink(target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                                    List *
                                </label>
                                <select
                                    value={newList}
                                    onChange={(e) => setNewList(e.target.value)}
                                    style={{
                                        ...inputStyle,
                                        cursor: "pointer",
                                    }}
                                >
                                    <option value="" disabled> Select a list... </option>
                                    {listNames?.map((list, index) => (
                                        <option key={index} value={list}> {list} </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                        {saveStatus && (
                            <div style={{ marginBottom: '20px' }}>
                                <span style={{
                                    fontSize: '14px',
                                    color: saveStatus.includes('Failed') ? '#ff6b6b' : '#00b894',
                                    backgroundColor: saveStatus.includes('Failed') ? 'rgba(255, 107, 107, 0.15)' : 'rgba(0, 184, 148, 0.15)',
                                    border: saveStatus.includes('Failed') ? '1px solid rgba(255, 107, 107, 0.4)' : '1px solid rgba(0, 184, 148, 0.4)',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    display: 'block',
                                    textAlign: 'center'
                                }}>
                                    {saveStatus}
                                </span>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setViewMode('linkedinImport');
                                    setImportError('');
                                }}
                                style={secondaryButtonStyle}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#3a3a3c"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#2c2c2e"}
                            >
                                Import LinkedIn Job Listing
                            </button>
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <button
                                    onClick={closePopup}
                                    style={secondaryButtonStyle}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#3a3a3c"}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = "#2c2c2e"}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addNewApplication}
                                    disabled={!isFormValid || isSaving}
                                    style={{
                                        padding: "10px 22px",
                                        borderRadius: "8px",
                                        border: "none",
                                        backgroundColor: isFormValid && !isSaving ? "#4a9eff" : "#3a5080",
                                        color: isFormValid && !isSaving ? "#ffffff" : "#7a9aaa",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        cursor: isFormValid && !isSaving ? "pointer" : "not-allowed",
                                        transition: "background-color 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (isFormValid && !isSaving) e.target.style.backgroundColor = "#3a8eef";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (isFormValid && !isSaving) e.target.style.backgroundColor = "#4a9eff";
                                    }}
                                >
                                    {isSaving ? 'Saving...' : 'Add Application'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ModernNewApplicationPopup;
