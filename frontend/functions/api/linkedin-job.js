/**
 * Cloudflare Pages Function — fetches LinkedIn guest job HTML server-side.
 * No API key. Avoids CORS + flaky public proxies.
 *
 * GET /api/linkedin-job?jobId=1234567890
 */
export async function onRequest(context) {
    const { request } = context;

    const cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...cors, 'Content-Type': 'application/json' },
        });
    }

    const jobId = new URL(request.url).searchParams.get('jobId') || '';
    if (!/^\d{6,20}$/.test(jobId)) {
        return new Response(JSON.stringify({ error: 'Invalid jobId' }), {
            status: 400,
            headers: { ...cors, 'Content-Type': 'application/json' },
        });
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
            const upstream = await fetch(url, { headers });
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
            lastError = String(err?.message || err);
        }
    }

    return new Response(
        JSON.stringify({ error: 'LinkedIn fetch failed', detail: lastError }),
        {
            status: 502,
            headers: { ...cors, 'Content-Type': 'application/json' },
        }
    );
}
