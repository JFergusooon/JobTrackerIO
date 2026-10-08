import { useState, useEffect, useRef } from 'react';
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

const LINKEDIN_IMPORT_MAX_ATTEMPTS = 30;
const LINKEDIN_IMPORT_RETRY_DELAY_MS = 700;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableLinkedInImportError = (err) => {
    const msg = String(err?.message || '');
    if (err?.name === 'AbortError' || /aborted/i.test(msg)) return true;
    if (msg === 'PROXY_GATEWAY' || /bad gateway|\b502\b|\b503\b/i.test(msg)) return true;
    if (/empty response|could not read job details|failed to fetch|networkerror|network request failed/i.test(msg)) return true;
    return false;
};

const linkedInImportErrorMessage = (err) => {
    const msg = String(err?.message || '');
    const timedOut = err?.name === 'AbortError' || /aborted/i.test(msg);
    const gateway = msg === 'PROXY_GATEWAY' || /bad gateway|\b502\b|\b503\b/i.test(msg);
    if (timedOut) return 'Import timed out. Please try again.';
    if (gateway) return 'Import service briefly unavailable. Please try again in a moment.';
    return 'Failed to import listing. Check the URL and try again.';
};

const greenhouseImportErrorMessage = (err) => {
    const msg = String(err?.message || '');
    if (msg === 'GREENHOUSE_NOT_FOUND') {
        return 'Could not find that Greenhouse job. Check the URL and try again.';
    }
    if (msg === 'GREENHOUSE_UNREADABLE') {
        return 'Could not read job details from that Greenhouse listing.';
    }
    if (err?.name === 'AbortError' || /aborted/i.test(msg)) {
        return 'Import timed out. Please try again.';
    }
    return 'Failed to import listing. Check the URL and try again.';
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

const LINKEDIN_IMPORT_SOURCE = {
    id: 'linkedin',
    buttonLabel: 'Import LinkedIn Job Listing',
    heading: 'Import LinkedIn Job',
    description: 'Paste a LinkedIn job listing URL to auto-fill the application fields',
    placeholder: 'https://www.linkedin.com/jobs/view/...',
};

const GREENHOUSE_IMPORT_SOURCE = {
    id: 'greenhouse',
    buttonLabel: 'Import Greenhouse Job Listing',
    heading: 'Import Greenhouse Job',
    description: 'Paste a Greenhouse job listing URL to auto-fill the application fields',
    placeholder: 'https://boards.greenhouse.io/company/jobs/...',
};

const IMPORT_SOURCES = [LINKEDIN_IMPORT_SOURCE, GREENHOUSE_IMPORT_SOURCE];

const GREENHOUSE_BOARD_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,80}$/;
const GREENHOUSE_JOB_ID_PATTERN = /^\d{3,20}$/;

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

const isGreenhouseHost = (hostname) => {
    const host = String(hostname || '').toLowerCase();
    return host === 'greenhouse.io' || host.endsWith('.greenhouse.io');
};

const extractGreenhouseJob = (rawUrl) => {
    try {
        const url = new URL(rawUrl.trim());
        if (!isGreenhouseHost(url.hostname)) return null;

        const region = url.hostname.toLowerCase().includes('.eu.greenhouse.io') ? 'eu' : 'us';
        let board = '';
        let jobId = '';

        if (/\/embed\//i.test(url.pathname)) {
            board = url.searchParams.get('for') || '';
            jobId = url.searchParams.get('token') || url.searchParams.get('gh_jid') || '';
        } else {
            const match = url.pathname.match(/^\/([^/]+)\/jobs\/(\d+)/i);
            if (!match || match[1].toLowerCase() === 'embed') return null;
            board = decodeURIComponent(match[1]);
            jobId = match[2];
        }

        if (!GREENHOUSE_BOARD_PATTERN.test(board) || !GREENHOUSE_JOB_ID_PATTERN.test(jobId)) {
            return null;
        }

        return { board, jobId, region };
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

    // jina application/json: { data: { title: "Company hiring Role in Location | LinkedIn" } }
    const trimmed = payload.trim();
    if (trimmed.startsWith('{')) {
        try {
            const data = JSON.parse(trimmed);
            candidates.push(data?.data?.title, data?.title);
        } catch {
            // not JSON — continue with other extractors
        }
    }

    candidates.push(
        payload.match(/^Title:\s*(.+)$/m)?.[1],
        payload.match(/<title[^>]*>\s*([\s\S]*?)\s*<\/title>/i)?.[1],
        payload.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1],
        payload.match(/content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1],
        // Escaped title tags inside truncated JSON proxy wrappers
        payload.match(/&lt;title[^&]*&gt;\s*([\s\S]*?)\s*&lt;\/title&gt;/i)?.[1],
    );

    for (const candidate of candidates) {
        const parsed = parseLinkedInDocumentTitle(candidate || '');
        if (parsed?.company && parsed?.position) {
            return parsed;
        }
    }

    return null;
};

/**
 * Guest job HTML uses: Join to apply for the <strong>Role</strong> role at <strong>Company</strong>
 * Markdown proxies use: Join to apply for the **Role** role at **Company**
 * Do not use optional \*{0,2} around .+? — on HTML that captures company as "<".
 */
const extractJoinToApply = (payload) => {
    if (!payload) return null;

    const patterns = [
        /join to apply for the\s+<strong>([^<]+)<\/strong>\s+role at\s+<strong>([^<]+)<\/strong>/i,
        /join to apply for the\s+\*\*([^*]+)\*\*\s+role at\s+\*\*([^*]+)\*\*/i,
        /join to apply for the\s+([^<*\n]+?)\s+role at\s+([^<*\n.|]+)/i,
    ];

    for (const pattern of patterns) {
        const match = payload.match(pattern);
        if (!match?.[1] || !match?.[2]) continue;
        const position = match[1].replace(/\*+/g, '').replace(/\s+/g, ' ').trim();
        const company = match[2].replace(/\*+/g, '').replace(/\s+/g, ' ').trim();
        if (position && company) {
            return { position, company, location: '' };
        }
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
    // Reject HTML leftovers from bad join-to-apply matches
    if (/[<>]/.test(parsed.company) || /[<>]/.test(parsed.position)) return false;
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

    // Prefer structured HTML / JSON-LD when present (includes location from top card)
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

    const fromJoinToApply = extractJoinToApply(payload);
    if (fromJoinToApply) {
        const finalized = finalizeParsedJob(fromJoinToApply);
        if (isUsableImport(finalized)) return finalized;
    }

    return parseLinkedInJobMarkdown(payload);
};

const parseGreenhouseJobPayload = (payload) => {
    let data = payload;
    if (typeof payload === 'string') {
        const trimmed = payload.trim();
        if (!trimmed.startsWith('{')) {
            return { position: '', company: '', location: '' };
        }
        try {
            data = JSON.parse(trimmed);
        } catch {
            return { position: '', company: '', location: '' };
        }
    }
    if (!data || typeof data !== 'object') {
        return { position: '', company: '', location: '' };
    }

    const officeLocation = Array.isArray(data.offices)
        ? data.offices.map((office) => office?.location || office?.name).find(Boolean)
        : '';

    return {
        position: String(data.title || '').replace(/\s+/g, ' ').trim(),
        company: String(data.company_name || data.company || '').replace(/\s+/g, ' ').trim(),
        location: normalizeImportedLocation(data.location?.name || officeLocation || ''),
    };
};

const API_STAGE = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";

const readCompanyName = (job) => String(job?.companyName ?? job?.company ?? '');

const normalizeCompanyName = (value) => String(value ?? '').trim().toLowerCase();

const findExactCompanyMatches = (jobs, companyName) => {
    const name = normalizeCompanyName(companyName);
    if (!name || !Array.isArray(jobs)) return [];

    const seen = new Set();
    const matches = [];
    for (const job of jobs) {
        const storedName = readCompanyName(job);
        if (!normalizeCompanyName(storedName) || normalizeCompanyName(storedName) !== name || seen.has(storedName)) continue;
        seen.add(storedName);
        matches.push(job);
    }
    return matches;
};

const deleteExistingApplication = async (companyName) => {
    const url = API_STAGE + "/Jobs/deleteJob"
        + "?username=" + localStorage.getItem('username')
        + "&companyName=" + encodeURIComponent(companyName);
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
        throw new Error(`Delete failed (${res.status})`);
    }
    await res.json().catch(() => ({}));
};

const ModernNewApplicationPopup = ({text, closePopup, listNames, onApplicationCreated, existingJobs = [] }) => {

    const location = useLocation();
    const [viewMode, setViewMode] = useState('form');
    const [importSource, setImportSource] = useState(LINKEDIN_IMPORT_SOURCE.id);
    const [importMenuOpen, setImportMenuOpen] = useState(false);
    const [listingUrl, setListingUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importAttempt, setImportAttempt] = useState(0);
    const [importError, setImportError] = useState('');
    const linkedInImportRunRef = useRef(0);
    const linkedInImportAbortRef = useRef(null);
    const greenhouseImportAbortRef = useRef(null);
    const importMenuRef = useRef(null);
    const activeImportSource = IMPORT_SOURCES.find((source) => source.id === importSource) || LINKEDIN_IMPORT_SOURCE;
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
    const duplicateApplications = findExactCompanyMatches(existingJobs, newCompanyName);
    const duplicateApplication = duplicateApplications[0] || null;

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

    const fetchWithTimeout = async (url, options = {}, timeoutMs = 20000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const { signal: externalSignal, ...rest } = options;
        const onExternalAbort = () => controller.abort();
        if (externalSignal) {
            if (externalSignal.aborted) controller.abort();
            else externalSignal.addEventListener('abort', onExternalAbort);
        }
        try {
            const res = await fetch(url, { ...rest, signal: controller.signal });
            return res;
        } finally {
            clearTimeout(timer);
            externalSignal?.removeEventListener('abort', onExternalAbort);
        }
    };

    /**
     * Same-origin server proxy only (Cloudflare Pages Function in prod, setupProxy locally).
     * No Jina / allorigins — those rate-limit and break imports.
     */
    const fetchLinkedInJobPayload = async (jobId, signal) => {
        const res = await fetchWithTimeout(
            `/api/linkedin-job?jobId=${encodeURIComponent(jobId)}`,
            { signal },
            20000
        );
        if (!res.ok) {
            const detail = await res.text().catch(() => '');
            const gateway =
                res.status === 502 ||
                res.status === 503 ||
                /bad gateway|cf-error-details|error code 502/i.test(detail);
            if (gateway) {
                throw new Error('PROXY_GATEWAY');
            }
            throw new Error(`LinkedIn proxy failed (${res.status}) ${detail.slice(0, 120)}`);
        }
        const html = await res.text();
        if (!html || html.length < 80) {
            throw new Error('LinkedIn proxy returned an empty response');
        }
        // Cloudflare sometimes returns an HTML error page with a 200 — reject it
        if (/cf-error-details|error code 502|bad gateway/i.test(html)) {
            throw new Error('PROXY_GATEWAY');
        }
        return html;
    };

    const fetchGreenhouseJobPayload = async ({ board, jobId, region }, signal) => {
        const params = new URLSearchParams({ board, jobId, region });
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000);
        const onExternalAbort = () => controller.abort();
        if (signal) {
            if (signal.aborted) controller.abort();
            else signal.addEventListener('abort', onExternalAbort);
        }
        try {
            const res = await fetch(`/api/greenhouse-job?${params}`, { signal: controller.signal });
            const raw = await res.text();
            if (!res.ok) {
                if (res.status === 404) throw new Error('GREENHOUSE_NOT_FOUND');
                throw new Error(`Greenhouse proxy failed (${res.status}) ${raw.slice(0, 120)}`);
            }
            if (!raw || raw.length < 10) {
                throw new Error('Greenhouse proxy returned an empty response');
            }
            return raw;
        } finally {
            clearTimeout(timer);
            signal?.removeEventListener('abort', onExternalAbort);
        }
    };

    const stopLinkedInImport = () => {
        linkedInImportRunRef.current += 1;
        linkedInImportAbortRef.current?.abort();
    };

    const stopGreenhouseImport = () => {
        greenhouseImportAbortRef.current?.abort();
        greenhouseImportAbortRef.current = null;
    };

    useEffect(() => () => {
        linkedInImportRunRef.current += 1;
        linkedInImportAbortRef.current?.abort();
        greenhouseImportAbortRef.current?.abort();
    }, []);

    useEffect(() => {
        if (!importMenuOpen) return undefined;
        const onPointerDown = (event) => {
            if (!importMenuRef.current?.contains(event.target)) {
                setImportMenuOpen(false);
            }
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setImportMenuOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [importMenuOpen]);

    const chooseImportSource = (sourceId) => {
        setImportSource(sourceId);
        setImportMenuOpen(false);
    };

    const openListingImport = () => {
        setImportMenuOpen(false);
        setViewMode('listingImport');
        setImportError('');
    };

    const importLinkedInJob = async () => {
        const trimmedUrl = listingUrl.trim();
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

        linkedInImportAbortRef.current?.abort();
        const controller = new AbortController();
        linkedInImportAbortRef.current = controller;
        const runId = ++linkedInImportRunRef.current;

        setImportAttempt(1);
        setIsImporting(true);
        try {
            for (let attempt = 1; attempt <= LINKEDIN_IMPORT_MAX_ATTEMPTS; attempt += 1) {
                if (linkedInImportRunRef.current !== runId) return;
                setImportAttempt(attempt);
                try {
                    const payload = await fetchLinkedInJobPayload(jobId, controller.signal);
                    if (linkedInImportRunRef.current !== runId) return;
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
                    return;
                } catch (err) {
                    if (linkedInImportRunRef.current !== runId) return;
                    const lastAttempt = attempt === LINKEDIN_IMPORT_MAX_ATTEMPTS;
                    if (!isRetryableLinkedInImportError(err) || lastAttempt) {
                        console.error('LinkedIn import failed:', err);
                        setImportError(linkedInImportErrorMessage(err));
                        return;
                    }
                }

                await wait(LINKEDIN_IMPORT_RETRY_DELAY_MS);
            }
        } finally {
            if (linkedInImportRunRef.current === runId) {
                setIsImporting(false);
                linkedInImportAbortRef.current = null;
            }
        }
    };

    const importGreenhouseJob = async () => {
        const trimmedUrl = listingUrl.trim();
        setImportError('');

        if (!trimmedUrl) {
            setImportError('Please paste a Greenhouse job URL.');
            return;
        }

        const target = extractGreenhouseJob(trimmedUrl);
        if (!target) {
            setImportError('That does not look like a valid Greenhouse job URL.');
            return;
        }

        stopGreenhouseImport();
        const controller = new AbortController();
        greenhouseImportAbortRef.current = controller;

        setIsImporting(true);
        try {
            const payload = await fetchGreenhouseJobPayload(target, controller.signal);
            if (greenhouseImportAbortRef.current !== controller) return;
            const parsed = parseGreenhouseJobPayload(payload);

            if (!parsed.company || !parsed.position || parsed.company.length < 2 || parsed.position.length < 2) {
                throw new Error('GREENHOUSE_UNREADABLE');
            }

            setNewCompanyName(parsed.company);
            setNewPosition(parsed.position);
            handleLocationChange(parsed.location || '');
            setNewJobLink(trimmedUrl);
            setViewMode('form');
            setImportError('');
        } catch (err) {
            if (greenhouseImportAbortRef.current !== controller) return;
            if (err?.name === 'AbortError') return;
            console.error('Greenhouse import failed:', err);
            setImportError(greenhouseImportErrorMessage(err));
        } finally {
            if (greenhouseImportAbortRef.current === controller) {
                setIsImporting(false);
                greenhouseImportAbortRef.current = null;
            }
        }
    };

    async function addNewApplication() {
        if (isSaving) return;
        const matches = findExactCompanyMatches(existingJobs, newCompanyName);
        setIsSaving(true);
        setSaveStatus(matches.length > 0 ? 'Removing existing application...' : 'Saving...');
        console.log('Adding new application' + text)

        let removedExisting = false;
        if (matches.length > 0) {
            try {
                for (const match of matches) {
                    await deleteExistingApplication(readCompanyName(match));
                    removedExisting = true;
                }
            } catch (err) {
                console.error("ERROR:", err);
                setSaveStatus('Failed to remove the existing application. The new application was not saved.');
                setIsSaving(false);
                return;
            }
            setSaveStatus('Saving...');
        }

        const url = API_STAGE + "/Jobs/create"

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

            if (!res.ok) {
                throw new Error(`Create failed (${res.status})`);
            }

            const data = await res.json().catch(() => ({}));
            console.log("SUCCESS:", data);
            setSaveStatus('Success!');
            setTimeout(() => {
                if (typeof onApplicationCreated === 'function') {
                    onApplicationCreated(params, {
                        replacedCompanyName: matches[0] ? readCompanyName(matches[0]) : undefined,
                    });
                }
                closePopup();
            }, 800);
            return;
        } catch (err) {
            console.error("ERROR:", err);
            setSaveStatus(
                removedExisting
                    ? 'Failed to save the new application after removing the existing one. Please try again.'
                    : 'Failed to save. Please try again.'
            );
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
                {viewMode === 'listingImport' ? (
                    <>
                        <h2 style={{ margin: "0 0 12px", fontSize: "26px", fontWeight: "700", color: "#ffffff" }}>
                            {activeImportSource.heading}
                        </h2>
                        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#a0a0a0" }}>
                            {activeImportSource.description}
                        </p>
                        <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                        <div style={{ marginBottom: "20px" }}>
                            <textarea
                                placeholder={activeImportSource.placeholder}
                                value={listingUrl}
                                onChange={({ target }) => {
                                    setListingUrl(target.value);
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
                                    if (importSource === 'greenhouse') stopGreenhouseImport();
                                    else stopLinkedInImport();
                                    setIsImporting(false);
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
                                onClick={importSource === 'greenhouse' ? importGreenhouseJob : importLinkedInJob}
                                disabled={isImporting || !listingUrl.trim()}
                                style={{
                                    padding: "10px 22px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: isImporting || !listingUrl.trim() ? "#3a5080" : "#4a9eff",
                                    color: isImporting || !listingUrl.trim() ? "#7a9aaa" : "#ffffff",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: isImporting || !listingUrl.trim() ? "not-allowed" : "pointer",
                                    transition: "background-color 0.2s",
                                }}
                            >
                                {isImporting
                                    ? (importSource === 'linkedin' ? `Importing... ${importAttempt}` : 'Importing...')
                                    : 'Import'}
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
                                {duplicateApplication && (
                                    <span
                                        role="status"
                                        style={{
                                            fontSize: '12px',
                                            color: '#ffffff',
                                            backgroundColor: 'rgba(204, 136, 0, 0.22)',
                                            border: '1px solid rgba(204, 136, 0, 0.55)',
                                            padding: '8px 10px',
                                            borderRadius: '8px',
                                            marginTop: '8px',
                                            display: 'block',
                                            lineHeight: '1.45',
                                        }}
                                    >
                                        An application for "{readCompanyName(duplicateApplication).trim()}"
                                        {duplicateApplication.list ? ` in "${duplicateApplication.list}"` : ''} already exists.
                                        Clicking Add Application will delete that application and save only this new one.
                                    </span>
                                )}
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

                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                            <div
                                ref={importMenuRef}
                                style={{
                                    position: "relative",
                                    display: "inline-flex",
                                    alignItems: "stretch",
                                    flex: "0 0 auto",
                                    height: "40px",
                                    boxSizing: "border-box",
                                    borderRadius: importMenuOpen ? "8px 8px 0 0" : "8px",
                                    border: "1px solid #444",
                                    backgroundColor: "#2c2c2e",
                                    color: "#f0f0f0",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3a3a3c"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2c2c2e"; }}
                            >
                                <button
                                    type="button"
                                    onClick={openListingImport}
                                    style={{
                                        padding: "0 14px 0 16px",
                                        border: "none",
                                        background: "transparent",
                                        color: "inherit",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        fontFamily: "inherit",
                                        lineHeight: "1",
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        alignItems: "center",
                                        flex: "0 0 auto",
                                    }}
                                >
                                    <span style={{ display: "inline-grid" }}>
                                        {IMPORT_SOURCES.map((source) => (
                                            <span
                                                key={source.id}
                                                style={{
                                                    gridArea: "1 / 1",
                                                    visibility: source.id === importSource ? "visible" : "hidden",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {source.buttonLabel}
                                            </span>
                                        ))}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    aria-label="Choose job listing source"
                                    aria-haspopup="menu"
                                    aria-expanded={importMenuOpen}
                                    onClick={() => setImportMenuOpen((open) => !open)}
                                    style={{
                                        padding: "0 10px",
                                        width: "36px",
                                        flex: "0 0 36px",
                                        boxSizing: "border-box",
                                        border: "none",
                                        borderLeft: "1px solid #555",
                                        background: "transparent",
                                        color: "inherit",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style={{ display: "block", transform: importMenuOpen ? "rotate(180deg)" : "none" }}>
                                        <path d="M2.2 4.3 L6 8 L9.8 4.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                {importMenuOpen && (
                                    <div
                                        role="menu"
                                        aria-label="Job listing sources"
                                        style={{
                                            position: "absolute",
                                            top: "calc(100% + 1px)",
                                            left: "-1px",
                                            zIndex: 5,
                                            width: "calc(100% + 2px)",
                                            boxSizing: "border-box",
                                            backgroundColor: "#2c2c2e",
                                            border: "1px solid #444",
                                            borderTop: "none",
                                            borderRadius: "0 0 8px 8px",
                                            overflow: "hidden",
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        {IMPORT_SOURCES.filter((source) => source.id !== importSource).map((source) => (
                                                <button
                                                    key={source.id}
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => chooseImportSource(source.id)}
                                                    style={{
                                                        padding: "10px 14px",
                                                        border: "none",
                                                        backgroundColor: "transparent",
                                                        color: "#f0f0f0",
                                                        fontSize: "14px",
                                                        fontWeight: "600",
                                                        fontFamily: "inherit",
                                                        textAlign: "left",
                                                        cursor: "pointer",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3a3a3c"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                                                >
                                                    {source.buttonLabel}
                                                </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: "0 0 auto" }}>
                                <button
                                    onClick={closePopup}
                                    style={{ ...secondaryButtonStyle, height: "40px", boxSizing: "border-box" }}
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
                                        height: "40px",
                                        boxSizing: "border-box",
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
