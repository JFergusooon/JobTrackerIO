/**
 * Local CRA proxy for /api/linkedin-job, /api/greenhouse-job, and /api/indeed-job
 * (same contract as the Cloudflare Pages Functions).
 * Requires Node 18+ (global fetch).
 */
const GREENHOUSE_BOARD_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,80}$/;
const GREENHOUSE_JOB_ID_PATTERN = /^\d{3,20}$/;

const greenhouseApiBases = (region) =>
    region === 'eu'
        ? ['https://boards-api.eu.greenhouse.io', 'https://boards-api.greenhouse.io']
        : ['https://boards-api.greenhouse.io', 'https://boards-api.eu.greenhouse.io'];

const slimGreenhouseJob = (body) => ({
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

module.exports = function setupProxy(app) {
    app.get('/api/linkedin-job', async (req, res) => {
        const jobId = String(req.query.jobId || '');
        if (!/^\d{6,20}$/.test(jobId)) {
            res.status(400).json({ error: 'Invalid jobId' });
            return;
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
                if (
                    !/hiring|JobPosting|topcard|top-card-layout|og:title/i.test(html) &&
                    html.length < 500
                ) {
                    lastError = 'Unusable upstream response';
                    continue;
                }

                res.set('Content-Type', 'text/html; charset=utf-8');
                res.set('Cache-Control', 'public, max-age=120');
                res.status(200).send(html);
                return;
            } catch (err) {
                lastError = String(err?.message || err);
            }
        }

        res.status(503).json({ error: 'LinkedIn fetch failed', detail: lastError });
    });

    app.get('/api/greenhouse-job', async (req, res) => {
        const board = String(req.query.board || '');
        const jobId = String(req.query.jobId || '');
        const region = req.query.region === 'eu' ? 'eu' : 'us';

        if (!GREENHOUSE_BOARD_PATTERN.test(board) || !GREENHOUSE_JOB_ID_PATTERN.test(jobId)) {
            res.status(400).json({ error: 'Invalid board or jobId' });
            return;
        }

        let lastError = null;
        let sawNotFound = false;
        let sawFailure = false;

        for (const base of greenhouseApiBases(region)) {
            try {
                const upstream = await fetch(
                    `${base}/v1/boards/${encodeURIComponent(board)}/jobs/${encodeURIComponent(jobId)}`,
                    { headers: { Accept: 'application/json', 'User-Agent': 'JobTrackerIO/1.0' } }
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
                const job = slimGreenhouseJob(body);
                if (!job.company_name) {
                    try {
                        const boardRes = await fetch(
                            `${base}/v1/boards/${encodeURIComponent(board)}`,
                            { headers: { Accept: 'application/json', 'User-Agent': 'JobTrackerIO/1.0' } }
                        );
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

                res.set('Cache-Control', 'public, max-age=120');
                res.status(200).json(job);
                return;
            } catch (err) {
                sawFailure = true;
                lastError = String(err?.message || err);
            }
        }

        if (sawNotFound && !sawFailure) {
            res.status(404).json({ error: 'Greenhouse job not found', detail: lastError });
            return;
        }

        res.status(503).json({ error: 'Greenhouse fetch failed', detail: lastError });
    });

    const INDEED_JOB_KEY_PATTERN = /^[a-f0-9]{10,32}$/i;
    const INDEED_HOST_PATTERN = /^(?:[a-z0-9-]+\.)?indeed\.(?:com|ca|co\.uk|co\.in|com\.au|de|fr|nl|es|it|ie|sg|com\.br|com\.mx)$/i;

    const indeedFetchHost = (host) => {
        const normalized = String(host || 'www.indeed.com').toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
        if (normalized.startsWith('indeed.')) return `www.${normalized}`;
        return normalized;
    };

    const indeedLooksLikeJobPage = (html) =>
        /JobPosting|jobTitle|companyName|jobsearch-JobInfoHeader|formattedLocation/i.test(html);

    const indeedLooksLikeBotWall = (html) =>
        /bot-detection-anonymous|Authenticating\.\.\./i.test(html) && !indeedLooksLikeJobPage(html);

    app.get('/api/indeed-job', async (req, res) => {
        const jobKey = String(req.query.jk || '');
        const host = indeedFetchHost(req.query.host || 'www.indeed.com');

        if (!INDEED_JOB_KEY_PATTERN.test(jobKey) || !INDEED_HOST_PATTERN.test(host)) {
            res.status(400).json({ error: 'Invalid jk or host' });
            return;
        }

        try {
            const upstream = await fetch(`https://${host}/viewjob?jk=${encodeURIComponent(jobKey)}`, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
            });
            const html = await upstream.text();
            if (upstream.status === 404) {
                res.status(404).json({ error: 'Indeed job not found' });
                return;
            }
            if (!html || indeedLooksLikeBotWall(html)) {
                res.status(503).json({ error: 'Indeed blocked the request' });
                return;
            }
            if (!upstream.ok || !indeedLooksLikeJobPage(html)) {
                res.status(503).json({
                    error: 'Indeed fetch failed',
                    detail: upstream.ok ? 'Unusable upstream response' : `Upstream ${upstream.status}`,
                });
                return;
            }

            res.set('Content-Type', 'text/html; charset=utf-8');
            res.set('Cache-Control', 'public, max-age=120');
            res.status(200).send(html);
        } catch (err) {
            res.status(503).json({ error: 'Indeed proxy error', detail: String(err?.message || err) });
        }
    });
};
