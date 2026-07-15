/**
 * Cloudflare Pages Function — fetches LinkedIn guest job HTML server-side.
 * No API key. Avoids CORS + flaky public proxies.
 *
 * GET /api/linkedin-job?jobId=1234567890
 *
 * Note: do not return HTTP 502 for handled failures — Cloudflare may replace
 * those with its branded Bad Gateway HTML page.
 */
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

        const jobId = new URL(request.url).searchParams.get('jobId') || '';
        if (!/^\d{6,20}$/.test(jobId)) {
            return json(400, { error: 'Invalid jobId' });
        }

        const urls = [
            `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`,
            `https://www.linkedin.com/jobs/view/${jobId}/`,
        ];

        const headers = {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        };

        let lastError = null;
        for (const url of urls) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 12000);
                let upstream;
                try {
                    upstream = await fetch(url, {
                        headers,
                        signal: controller.signal,
                        redirect: 'follow',
                    });
                } finally {
                    clearTimeout(timer);
                }

                if (!upstream.ok) {
                    lastError = `Upstream ${upstream.status}`;
                    continue;
                }
                const html = await upstream.text();
                if (!html || html.length < 80) {
                    lastError = 'Empty upstream response';
                    continue;
                }
                // Prefer responses that look like a real job page
                if (
                    !/hiring|JobPosting|topcard|top-card-layout|og:title/i.test(html) &&
                    html.length < 500
                ) {
                    lastError = 'Unusable upstream response';
                    continue;
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
                lastError = /abort/i.test(msg) ? 'Upstream timeout' : msg;
            }
        }

        return json(503, { error: 'LinkedIn fetch failed', detail: lastError });
    } catch (err) {
        return json(503, {
            error: 'LinkedIn proxy error',
            detail: String(err?.message || err),
        });
    }
}
