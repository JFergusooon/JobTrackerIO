/**
 * Cloudflare Pages Function — fetches a public Greenhouse job posting.
 * No API key. Avoids CORS on the job board API.
 *
 * GET /api/greenhouse-job?board=acme&jobId=1234567&region=us|eu
 *
 * Note: do not return HTTP 502 for handled failures — Cloudflare may replace
 * those with its branded Bad Gateway HTML page.
 */
const BOARD_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,80}$/;
const JOB_ID_PATTERN = /^\d{3,20}$/;

const apiBases = (region) =>
    region === 'eu'
        ? ['https://boards-api.eu.greenhouse.io', 'https://boards-api.greenhouse.io']
        : ['https://boards-api.greenhouse.io', 'https://boards-api.eu.greenhouse.io'];

const slimJob = (body) => ({
    title: body?.title || '',
    company_name: body?.company_name || '',
    location: body?.location?.name ? { name: body.location.name } : null,
    offices: Array.isArray(body?.offices)
        ? body.offices.map((office) => ({
            name: office?.name || '',
            location: office?.location || '',
        }))
        : [],
});

async function fetchJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
        return await fetch(url, {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'JobTrackerIO/1.0',
            },
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timer);
    }
}

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
        const board = params.get('board') || '';
        const jobId = params.get('jobId') || '';
        const region = params.get('region') === 'eu' ? 'eu' : 'us';

        if (!BOARD_PATTERN.test(board) || !JOB_ID_PATTERN.test(jobId)) {
            return json(400, { error: 'Invalid board or jobId' });
        }

        let lastError = null;
        let sawNotFound = false;
        let sawFailure = false;

        for (const base of apiBases(region)) {
            try {
                const upstream = await fetchJson(
                    `${base}/v1/boards/${encodeURIComponent(board)}/jobs/${encodeURIComponent(jobId)}`
                );

                if (upstream.status === 404) {
                    sawNotFound = true;
                    lastError = 'Job not found';
                    continue;
                }
                if (!upstream.ok) {
                    sawFailure = true;
                    lastError = `Upstream ${upstream.status}`;
                    continue;
                }

                const body = await upstream.json();
                const job = slimJob(body);
                if (!job.company_name) {
                    try {
                        const boardRes = await fetchJson(`${base}/v1/boards/${encodeURIComponent(board)}`);
                        if (boardRes.ok) {
                            const boardBody = await boardRes.json();
                            job.company_name = boardBody?.name || '';
                        }
                    } catch {
                        // Company name is optional at this step; the job title may still be usable.
                    }
                }

                if (!job.title && !job.company_name) {
                    sawFailure = true;
                    lastError = 'Unusable upstream response';
                    continue;
                }

                return json(200, job);
            } catch (err) {
                sawFailure = true;
                const msg = String(err?.message || err);
                lastError = /abort/i.test(msg) ? 'Upstream timeout' : msg;
            }
        }

        if (sawNotFound && !sawFailure) {
            return json(404, { error: 'Greenhouse job not found', detail: lastError });
        }

        return json(503, { error: 'Greenhouse fetch failed', detail: lastError });
    } catch (err) {
        return json(503, {
            error: 'Greenhouse proxy error',
            detail: String(err?.message || err),
        });
    }
}
