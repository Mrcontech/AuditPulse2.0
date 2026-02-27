// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

export async function getPageSpeedMetrics(url: string, apiKey: string) {
    console.log(`Getting PageSpeed metrics for ${url}...`)

    const fetchStrategy = async (strategy: 'mobile' | 'desktop') => {
        const controller = new AbortController()
        const timeoutMs = 60000; // 60s for PSI
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
        const start = Date.now();

        if (!apiKey) {
            console.error(`PageSpeed API key is missing for ${strategy}`)
            return { success: false, errorType: 'MISSING_KEY' }
        }

        try {
            console.log(`[PageSpeed] Starting ${strategy} fetch for ${url}...`)
            const categories = 'category=performance&category=seo&category=accessibility&category=best-practices';
            const apiUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&${categories}&key=${apiKey}`;

            const response = await fetch(apiUrl, { signal: controller.signal })
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);

            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`[PageSpeed] API error (${strategy}) [${response.status}] after ${elapsed}s: ${errorText}`);
                return { success: false, status: response.status, errorType: 'API_ERROR' }
            }

            console.log(`[PageSpeed] ${strategy} successful in ${elapsed}s`)
            const data = await response.json();
            return { success: true, ...data };
        } catch (err: any) {
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);
            const isTimeout = err.name === 'AbortError';
            console.warn(`[PageSpeed] ${strategy} ${isTimeout ? 'TIMED OUT' : 'FAILED'} for ${url} after ${elapsed}s:`, err.message)
            return { success: false, errorType: isTimeout ? 'TIMEOUT' : 'FETCH_ERROR' }
        } finally {
            clearTimeout(timeoutId)
        }
    }

    const extractPSI = (data: any) => {
        const lighthouse = data.lighthouseResult?.audits || {};
        const categories = data.lighthouseResult?.categories || {};
        const loading = data.loadingExperience?.metrics || {};

        return {
            available: data.success || false,
            score: Math.round((categories.performance?.score ?? 0) * 100),
            seo_score: Math.round((categories.seo?.score ?? 0) * 100),
            accessibility_score: Math.round((categories.accessibility?.score ?? 0) * 100),
            best_practices_score: Math.round((categories['best-practices']?.score ?? 0) * 100),
            lcp: (loading.LARGEST_CONTENTFUL_PAINT_MS?.percentile || lighthouse['largest-contentful-paint']?.numericValue || 0) / 1000,
            fcp: (loading.FIRST_CONTENTFUL_PAINT_MS?.percentile || lighthouse['first-contentful-paint']?.numericValue || 0) / 1000,
            ttfb: (loading.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile || lighthouse['server-response-time']?.numericValue || 0) / 1000,
            cls: loading.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile / 100 || lighthouse['cumulative-layout-shift']?.numericValue || 0,
            inp: loading.INTERACTION_TO_NEXT_PAINT?.percentile || lighthouse['total-blocking-time']?.numericValue || 0,
            hasModernImages: lighthouse['modern-image-formats']?.score === 1,
            hasCompression: lighthouse['uses-text-compression']?.score === 1
        };
    }

    // Primary: Google PageSpeed Insights
    let mobile = await fetchStrategy('mobile');
    let results = extractPSI(mobile);

    return {
        mobile: results,
        desktop: { available: false, score: 0, seo_score: 0, accessibility_score: 0, best_practices_score: 0, lcp: 0, cls: 0, inp: 0 },
        available: results.available,
        diag: results.available ? 'mobile_ok' : 'psi_fail'
    }
}

/**
 * Fire-and-forget: Trigger a DebugBear analysis for a URL.
 * Returns the analysisId immediately (does NOT wait for results).
 */
export async function triggerDebugBear(url: string, apiKey: string): Promise<string | null> {
    if (!apiKey) {
        console.log('[DebugBear] No API key, skipping trigger.');
        return null;
    }
    try {
        console.log(`[DebugBear] Triggering analysis for ${url}...`);
        const triggerResp = await fetch('https://www.debugbear.com/api/v1/page/588570/analyze', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!triggerResp.ok) {
            console.warn(`[DebugBear] Trigger failed: ${triggerResp.status}`);
            return null;
        }

        const data = await triggerResp.json();
        const analysisId = data.analysis?.id;
        console.log(`[DebugBear] Triggered successfully. Analysis ID: ${analysisId}`);
        return analysisId || null;
    } catch (err: any) {
        console.error(`[DebugBear] Trigger error: ${err.message}`);
        return null;
    }
}

/**
 * Check if a previously triggered DebugBear analysis has finished.
 * Polls for up to `maxWaitMs` (default 30s) with 5s intervals.
 * Returns metrics if available, or { available: false } if still pending.
 */
export async function checkDebugBearResult(analysisId: string, apiKey: string, maxWaitMs = 30000) {
    if (!analysisId || !apiKey) {
        return { available: false };
    }

    console.log(`[DebugBear] Checking analysis ${analysisId}...`);
    const start = Date.now();
    const pollInterval = 5000;
    const maxPolls = Math.ceil(maxWaitMs / pollInterval);

    for (let i = 0; i < maxPolls; i++) {
        try {
            const pollResp = await fetch(`https://www.debugbear.com/api/v1/analysis/${analysisId}`, {
                headers: { 'x-api-key': apiKey }
            });
            const data = await pollResp.json();

            if (data.hasFinished) {
                const metrics = data.build?.metrics || {};
                console.log(`[DebugBear] Analysis ${analysisId} finished! Score: ${metrics['performance.score']}`);
                return {
                    available: true,
                    score: Math.round((metrics['performance.score'] || 0) * 100),
                    seo_score: Math.round((metrics['seo.score'] || 0) * 100),
                    accessibility_score: Math.round((metrics['accessibility.score'] || 0) * 100),
                    best_practices_score: Math.round((metrics['bestPractices.score'] || 0) * 100),
                    lcp: (metrics['performance.largestContentfulPaint'] || 0) / 1000,
                    fcp: (metrics['performance.firstContentfulPaint'] || 0) / 1000,
                    ttfb: (metrics['performance.timeToFirstByte'] || metrics['performance.ttfb'] || 0) / 1000,
                    cls: metrics['performance.cumulativeLayoutShift'] || 0,
                    inp: metrics['performance.totalBlockingTime'] || 0,
                    hasModernImages: true,
                    hasCompression: true
                };
            }

            const elapsed = ((Date.now() - start) / 1000).toFixed(0);
            console.log(`[DebugBear] Analysis ${analysisId} still pending after ${elapsed}s...`);

            if (i < maxPolls - 1) {
                await new Promise(r => setTimeout(r, pollInterval));
            }
        } catch (err: any) {
            console.error(`[DebugBear] Poll error: ${err.message}`);
            return { available: false };
        }
    }

    console.warn(`[DebugBear] Analysis ${analysisId} not finished after ${maxWaitMs / 1000}s polling.`);
    return { available: false };
}
