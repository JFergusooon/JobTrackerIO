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

const decodeHtmlEntities = (value) =>
    (value || '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

/**
 * LinkedIn page titles are almost always:
 *   "{Company} hiring {Position} in {Location} | LinkedIn"
 * Never treat the part before "hiring" as the job title.
 */
const parseLinkedInDocumentTitle = (titleLine) => {
    if (!titleLine) return null;

    let title = decodeHtmlEntities(titleLine).replace(/\s+/g, ' ').trim();
    title = title.replace(/\s*[|·•]\s*LinkedIn\s*$/i, '').trim();

    // Ignore LinkedIn search/index titles ("1,000+ ... jobs in ...")
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

const extractHiringTitleFromPayload = (payload) => {
    if (!payload) return null;

    const candidates = [];
    let jsonContent = '';

    // jina application/json: { data: { title: "Company hiring Role in Location | LinkedIn" } }
    const trimmed = payload.trim();
    if (trimmed.startsWith('{')) {
        try {
            const data = JSON.parse(trimmed);
            candidates.push(data?.data?.title, data?.title);
            jsonContent = data?.data?.content || data?.content || '';
        } catch {
            // not JSON — continue with other extractors
        }
    }

    candidates.push(
        payload.match(/^Title:\s*(.+)$/m)?.[1],
        payload.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1],
        payload.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1],
        payload.match(/content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1],
    );

    for (const candidate of candidates) {
        const parsed = parseLinkedInDocumentTitle(candidate || '');
        if (parsed?.company && parsed?.position) {
            return parsed;
        }
    }

    // "Join to apply for the **Software Engineer** role at **Dutch Vet**"
    const applyText = `${jsonContent}\n${payload}`;
    const applyMatch = applyText.match(
        /join to apply for the\s+\*{0,2}(.+?)\*{0,2}\s+role at\s+\*{0,2}(.+?)\*{0,2}/i
    );
    if (applyMatch) {
        return {
            company: applyMatch[2].replace(/\*+/g, '').trim(),
            position: applyMatch[1].replace(/\*+/g, '').trim(),
            location: '',
        };
    }

    return null;
};

const isLinkedInUiJunk = (value) =>
    /^(remove photo|not you\??|sign in|join now|apply|save|clear text|skip to main content|expand search|agree & join linkedin|report this job|see who you know|show more|show less)$/i.test(
        (value || '').trim()
    );

const finalizeParsedJob = ({ position, company, location }) => ({
    position: (position || '').replace(/\s+/g, ' ').trim(),
    company: (company || '').replace(/\s+/g, ' ').trim(),
    location: normalizeImportedLocation(location || ''),
});

const isUsableImport = (parsed) => {
    if (!parsed?.company || !parsed?.position) return false;
    if (isLinkedInUiJunk(parsed.company) || isLinkedInUiJunk(parsed.position)) return false;
    if (parsed.company.length < 2 || parsed.position.length < 2) return false;
    return true;
};

const parseLinkedInJobHtml = (html) => {
    // Document title / og:title is the most reliable signal on LinkedIn job pages
    const fromHiringTitle = extractHiringTitleFromPayload(html);
    if (fromHiringTitle) {
        return finalizeParsedJob(fromHiringTitle);
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const textOf = (...selectors) => {
        for (const selector of selectors) {
            const value = doc.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
            if (value && !isLinkedInUiJunk(value)) return value;
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

            if (jobPosting.title && !isLinkedInUiJunk(jobPosting.title)) {
                position = jobPosting.title;
            }
            if (jobPosting.hiringOrganization?.name && !isLinkedInUiJunk(jobPosting.hiringOrganization.name)) {
                company = jobPosting.hiringOrganization.name;
            }

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
            if (!value || value === company || isLinkedInUiJunk(value)) continue;
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

const splitTrailingLocation = (raw) => {
    if (!raw) return { company: '', location: '' };
    const value = raw.replace(/\s+/g, ' ').trim();

    // "Dutch Vet United States" / "NetDocuments Lehi, UT"
    const withUnitedStates = value.match(/^(.*?)\s+(United States)$/i);
    if (withUnitedStates?.[1]) {
        return { company: withUnitedStates[1].trim(), location: 'United States' };
    }

    const withCityState = value.match(/^(.*?)\s+([^,]+,\s*[A-Za-z]{2})$/);
    if (withCityState?.[1] && looksLikeLocation(withCityState[2])) {
        return { company: withCityState[1].trim(), location: withCityState[2].trim() };
    }

    if (looksLikeLocation(value)) {
        return { company: '', location: value };
    }

    return { company: value, location: '' };
};

const parseLinkedInJobMarkdown = (text) => {
    const fromTitle = extractHiringTitleFromPayload(text);
    // Trust LinkedIn's "Company hiring Position in Location" title completely
    if (fromTitle?.company && fromTitle?.position) {
        return finalizeParsedJob(fromTitle);
    }

    let body = text.includes('Markdown Content:')
        ? text.split('Markdown Content:').slice(1).join('Markdown Content:')
        : text;

    // jina JSON body may live in data.content
    if (body.trim().startsWith('{')) {
        try {
            const data = JSON.parse(body);
            body = data?.data?.content || data?.content || body;
        } catch {
            // keep original
        }
    }

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

    const skipLine = (line) =>
        isLinkedInUiJunk(line) ||
        /skip to main|expand search|sign in|join now|linkedin|set alert|get notified|employees|followers|applicants|show more|clear text|any time|job type|experience level|salary|remove photo|not you|agree & join|jobs$|people$|learning$|^\d+\+/i.test(
            line
        );

    // LinkedIn personalizes the search chrome with the viewer's city (e.g. Council Bluffs) —
    // never treat that as the job location when it appears as "Role in <viewer city>"
    const isViewerGeoChrome = (line) =>
        /^.+\s+in\s+.+$/i.test(line) &&
        !/hiring/i.test(line) &&
        /(council\s+bluffs|ashburn|near you)/i.test(line);

    for (const line of lines) {
        if (skipLine(line) || isViewerGeoChrome(line) || line.length < 2 || line.length > 160) continue;

        if (!position && !looksLikeLocation(line)) {
            const positionInLoc = line.match(/^(.+?)\s+in\s+(.+)$/i);
            if (positionInLoc && looksLikeLocation(positionInLoc[2])) {
                position = positionInLoc[1].trim();
                locationValue = locationValue || positionInLoc[2].trim();
            } else {
                position = line;
            }
            continue;
        }

        if (position && !company && line !== position) {
            const split = splitTrailingLocation(line);
            if (split.company) {
                company = split.company;
                if (split.location && !locationValue) locationValue = split.location;
            } else if (looksLikeLocation(line)) {
                locationValue = locationValue || line;
            }
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

    // Always prefer "{Company} hiring {Position} in {Location}" from Title / <title> / og:title
    const fromHiringTitle = extractHiringTitleFromPayload(payload);
    if (fromHiringTitle) {
        return finalizeParsedJob(fromHiringTitle);
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
        if (isUsableImport(fromHtml)) return fromHtml;
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

    const scoreParsedImport = (parsed, payload = '') => {
        if (!isUsableImport(parsed)) return -1;
        let score = 20;
        if (parsed.location) score += 10;
        const hiringTitle = extractHiringTitleFromPayload(payload);
        // Only a real "Company hiring Role in Location" (or apply-for) title is trustworthy enough
        // to stop the parallel race early — weak body scrapes used to win first with wrong fields
        if (hiringTitle?.company && hiringTitle?.position) {
            score += 70;
        }
        if (/remove photo|not you\?/i.test(payload)) score -= 50;
        if (/council\s+bluffs/i.test(parsed.location || '')) score -= 20;
        return score;
    };

    const fetchWithTimeout = async (url, options = {}, timeoutMs = 35000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            return res;
        } finally {
            clearTimeout(timer);
        }
    };

    const fetchLinkedInJobPayload = async (jobId) => {
        const guestUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;
        // Strip tracking query params — cleaner public job URL parses more reliably
        const publicUrl = `https://www.linkedin.com/jobs/view/${jobId}/`;

        // Race free sources — jina JSON title is most reliable but often needs 15–30s
        const attempts = [
            async () => {
                const res = await fetchWithTimeout(`https://r.jina.ai/${publicUrl}`, {
                    headers: { Accept: 'application/json' },
                }, 40000);
                if (!res.ok) throw new Error(`jina-json ${res.status}`);
                return res.text();
            },
            async () => {
                const res = await fetchWithTimeout(`https://r.jina.ai/${publicUrl}`, {
                    headers: { Accept: 'text/plain' },
                }, 40000);
                if (!res.ok) throw new Error(`jina-md ${res.status}`);
                return res.text();
            },
            async () => {
                const res = await fetchWithTimeout(
                    `https://api.allorigins.win/get?url=${encodeURIComponent(publicUrl)}`,
                    {},
                    15000
                );
                if (!res.ok) throw new Error(`allorigins ${res.status}`);
                const raw = await res.text();
                try {
                    const data = JSON.parse(raw);
                    return data?.contents || '';
                } catch {
                    return raw;
                }
            },
            async () => {
                const res = await fetchWithTimeout(
                    `https://api.allorigins.win/get?url=${encodeURIComponent(guestUrl)}`,
                    {},
                    15000
                );
                if (!res.ok) throw new Error(`allorigins-guest ${res.status}`);
                const raw = await res.text();
                try {
                    const data = JSON.parse(raw);
                    return data?.contents || '';
                } catch {
                    return raw;
                }
            },
        ];

        return new Promise((resolve, reject) => {
            let settled = false;
            let pending = attempts.length;
            let bestPayload = '';
            let bestScore = -1;
            let lastError = null;

            const finish = (payload) => {
                if (settled) return;
                settled = true;
                resolve(payload);
            };

            attempts.forEach(async (attempt) => {
                try {
                    const payload = await attempt();
                    const parsed = parseLinkedInJobPayload(payload);
                    const score = scoreParsedImport(parsed, payload);
                    if (score > bestScore) {
                        bestScore = score;
                        bestPayload = payload;
                    }
                    // Stop early only when we have a hiring-title-quality parse (score ~90+)
                    if (score >= 80) {
                        finish(payload);
                        return;
                    }
                } catch (err) {
                    lastError = err;
                } finally {
                    pending -= 1;
                    if (!settled && pending === 0) {
                        if (bestPayload && bestScore >= 0) {
                            resolve(bestPayload);
                        } else {
                            reject(lastError || new Error('Unable to fetch LinkedIn job'));
                        }
                    }
                }
            });
        });
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
            const payload = await fetchLinkedInJobPayload(jobId);
            const parsed = parseLinkedInJobPayload(payload);

            if (!isUsableImport(parsed)) {
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
            const timedOut = err?.name === 'AbortError' || /aborted/i.test(String(err?.message || ''));
            setImportError(
                timedOut
                    ? 'Import timed out — LinkedIn is slow right now. Please try again.'
                    : 'Failed to import listing. Check the URL and try again.'
            );
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
