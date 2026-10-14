const BOARD_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,80}$/;
const EMBED_FOR_PATTERN = /(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/embed\/job_(?:board(?:\/js)?|app)\?(?:[^"'\\\s<>]*&)?for=([A-Za-z0-9][A-Za-z0-9_-]{0,80})/i;
const BOARD_PATH_PATTERN = /(?:job-boards|boards)(?:\.eu)?\.greenhouse\.io\/([A-Za-z0-9][A-Za-z0-9_-]{0,80})\/jobs\/\d+/i;

const publicHttpsUrl = (raw) => {
    let url;
    try {
        url = new URL(String(raw));
    } catch {
        return null;
    }

    if (url.protocol !== 'https:' || url.username || url.password) return null;

    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    if (!host || !host.includes('.') || host.includes(':')) return null;
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return null;
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return null;

    return url;
};

const findBoard = (text) => {
    const source = String(text || '');
    const embed = source.match(EMBED_FOR_PATTERN);
    if (embed && BOARD_PATTERN.test(embed[1])) {
        return {
            board: embed[1],
            region: /\.eu\.greenhouse\.io/i.test(embed[0]) ? 'eu' : 'us',
        };
    }

    const path = source.match(BOARD_PATH_PATTERN);
    if (path && BOARD_PATTERN.test(path[1]) && path[1].toLowerCase() !== 'embed') {
        return {
            board: path[1],
            region: /\.eu\.greenhouse\.io/i.test(path[0]) ? 'eu' : 'us',
        };
    }

    return null;
};

const fetchText = async (url, { maxBytes = 1500000, timeoutMs = 8000 } = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url.href, {
            redirect: 'manual',
            headers: {
                Accept: 'text/html,application/javascript,*/*',
                'User-Agent': 'JobTrackerIO/1.0',
            },
            signal: controller.signal,
        });

        if (response.status >= 300 && response.status < 400) {
            const next = publicHttpsUrl(new URL(response.headers.get('location') || '', url).href);
            return next ? { redirect: next } : { text: '' };
        }

        if (!response.ok) return { text: '' };
        const text = await response.text();
        return { text: text.slice(0, maxBytes) };
    } catch {
        return { text: '' };
    } finally {
        clearTimeout(timer);
    }
};

const readText = async (startUrl) => {
    let current = startUrl;
    for (let hop = 0; hop < 4; hop += 1) {
        const result = await fetchText(current);
        if (result.redirect) {
            current = result.redirect;
            continue;
        }
        return { url: current, text: result.text || '' };
    }
    return { url: current, text: '' };
};

const sameOriginScripts = (html, pageUrl) => {
    const found = new Set();
    const patterns = [
        /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi,
        /\\?"src\\?"\s*:\s*\\?"([^"\\]+\.js)\\?"/gi,
    ];

    patterns.forEach((pattern) => {
        let match = pattern.exec(html);
        while (match) {
            try {
                const absolute = new URL(match[1].replace(/\\\//g, '/'), pageUrl);
                if (absolute.origin === pageUrl.origin && absolute.protocol === 'https:') {
                    found.add(absolute.href);
                }
            } catch {
                // Ignore malformed script URLs.
            }
            match = pattern.exec(html);
        }
    });

    return [...found].slice(0, 30);
};

export const resolveGreenhouseBoardFromPage = async (pageUrl, jobId) => {
    const url = publicHttpsUrl(pageUrl);
    if (!url || url.searchParams.get('gh_jid') !== String(jobId || '')) return null;

    const page = await readText(url);
    const fromHtml = findBoard(page.text);
    if (fromHtml) return fromHtml;

    const scripts = sameOriginScripts(page.text, page.url);
    const batchSize = 8;
    for (let index = 0; index < scripts.length; index += batchSize) {
        const batch = scripts.slice(index, index + batchSize);
        const texts = await Promise.all(batch.map(async (src) => {
            const scriptUrl = publicHttpsUrl(src);
            if (!scriptUrl) return '';
            const result = await readText(scriptUrl);
            return result.text;
        }));

        for (const text of texts) {
            const found = findBoard(text);
            if (found) return found;
        }
    }

    return null;
};
