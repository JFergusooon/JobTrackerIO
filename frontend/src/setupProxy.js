/**
 * Local CRA proxy for /api/linkedin-job (same contract as Cloudflare Pages Function).
 * Requires Node 18+ (global fetch).
 */
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

        res.status(502).json({ error: 'LinkedIn fetch failed', detail: lastError });
    });
};
