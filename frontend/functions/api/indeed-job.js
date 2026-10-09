/**
 * Cloudflare Pages Function — fetches a public Indeed job page.
 * No API key. Avoids CORS on indeed.com.
 *
 * GET /api/indeed-job?jk=b2919a774a345329&host=www.indeed.com
 *
 * Note: do not return HTTP 502 for handled failures — Cloudflare may replace
 * those with its branded Bad Gateway HTML page.
 */
const JOB_KEY_PATTERN = /^[a-f0-9]{10,32}$/i;
const HOST_PATTERN = /^(?:[a-z0-9-]+\.)?indeed\.(?:com|ca|co\.uk|co\.in|com\.au|de|fr|nl|es|it|ie|sg|com\.br|com\.mx)$/i;

const fetchHost = (host) => {
    const normalized = String(host || 'www.indeed.com').toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    if (normalized.startsWith('indeed.')) return `www.${normalized}`;
    return normalized;
};

const looksLikeJobPage = (html) =>
    /JobPosting|jobTitle|companyName|jobsearch-JobInfoHeader|formattedLocation/i.test(html);

const looksLikeBotWall = (html) =>
    /bot-detection-anonymous|Authenticating\.\.\./i.test(html) && !looksLikeJobPage(html);

export async function onRequest(context) {
    const { request } = context;

    const cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    const json = (status, body) =>
        new Response(JSON.stringify(body), {
            status,
            headers: { ...cors, 'Content-Type': 'application/json' },
        });

    try {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: cors });
        }

        if (request.method !== 'GET') {
            return json(405, { error: 'Method not allowed' });
        }

        const params = new URL(request.url).searchParams;
        const jobKey = params.get('jk') || '';
        const host = fetchHost(params.get('host') || 'www.indeed.com');

        if (!JOB_KEY_PATTERN.test(jobKey) || !HOST_PATTERN.test(host)) {
            return json(400, { error: 'Invalid jk or host' });
        }

        const url = `https://${host}/viewjob?jk=${encodeURIComponent(jobKey)}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        let upstream;
        try {
            upstream = await fetch(url, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                signal: controller.signal,
                redirect: 'follow',
            });
        } finally {
            clearTimeout(timer);
        }

        const html = await upstream.text();
        if (upstream.status === 404) {
            return json(404, { error: 'Indeed job not found' });
        }
        if (!html || looksLikeBotWall(html)) {
            return json(503, { error: 'Indeed blocked the request' });
        }
        if (!upstream.ok || !looksLikeJobPage(html)) {
            return json(503, {
                error: 'Indeed fetch failed',
                detail: upstream.ok ? 'Unusable upstream response' : `Upstream ${upstream.status}`,
            });
        }

        return new Response(html, {
            status: 200,
            headers: {
                ...cors,
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=120',
            },
        });
    } catch (err) {
        const msg = String(err?.message || err);
        return json(503, {
            error: 'Indeed proxy error',
            detail: /abort/i.test(msg) ? 'Upstream timeout' : msg,
        });
    }
}
