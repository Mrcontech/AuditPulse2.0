// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

export async function getPageSpeedMetrics(url: string, apiKey: string) {
    console.log(`Getting PageSpeed metrics for ${url}...`)

    const fetchStrategy = async (strategy: 'mobile' | 'desktop') => {
        const controller = new AbortController()
        const timeoutMs = 45000; // 45s per strategy — fits in 150s wall clock with parallel crawl
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        if (!apiKey) {
            console.error(`PageSpeed API key is missing for ${strategy}`)
            return { success: false, errorType: 'MISSING_KEY', lighthouseResult: { categories: {}, audits: {} }, loadingExperience: { metrics: {} } }
        }

        try {
            const categories = 'category=performance&category=seo&category=accessibility&category=best-practices';
            const apiUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&${categories}&key=${apiKey}`;

            const response = await fetch(apiUrl, { signal: controller.signal })

            if (!response.ok) {
                const errorText = await response.text();
                let parsedError = {};
                try { parsedError = JSON.parse(errorText); } catch (e) { }

                console.warn(`PageSpeed API error (${strategy}) [${response.status}]: ${errorText}`);
                return {
                    success: false,
                    status: response.status,
                    errorType: 'API_ERROR',
                    errorDetails: parsedError,
                    lighthouseResult: { categories: {}, audits: {} },
                    loadingExperience: { metrics: {} }
                }
            }

            const data = await response.json();
            return { success: true, ...data };
        } catch (err: any) {
            const isTimeout = err.name === 'AbortError';
            console.warn(`PageSpeed ${strategy} ${isTimeout ? 'timed out' : 'failed'} for ${url}:`, err.message)
            return {
                success: false,
                errorType: isTimeout ? 'TIMEOUT' : 'FETCH_ERROR',
                errorMessage: err.message,
                lighthouseResult: { categories: {}, audits: {} },
                loadingExperience: { metrics: {} }
            }
        } finally {
            clearTimeout(timeoutId)
        }
    }

    const fetchWithRetry = async (strategy: 'mobile' | 'desktop', maxRetries = 1) => {
        let lastResult = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            if (attempt > 0) {
                const delay = 3000; // flat 3s retry delay to save time budget
                console.log(`Retrying PageSpeed ${strategy} (attempt ${attempt}/${maxRetries}) for ${url} in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
            }

            lastResult = await fetchStrategy(strategy);
            if (lastResult.success) return lastResult;

            // If it's a 4xx error (other than maybe 429), don't retry as it's likely a permanent failure
            if (lastResult.status && lastResult.status >= 400 && lastResult.status < 500 && lastResult.status !== 429) {
                break;
            }
        }
        return lastResult;
    }

    // Only fetch desktop strategy as requested
    const desktop = await fetchWithRetry('desktop');

    const extract = (data: any) => {
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
            cls: loading.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile / 100 || lighthouse['cumulative-layout-shift']?.numericValue || 0,
            inp: loading.INTERACTION_TO_NEXT_PAINT?.percentile || lighthouse['total-blocking-time']?.numericValue || 0,
            errorType: data.errorType,
            status: data.status
        };
    }

    const desktopResults = extract(desktop);

    return {
        desktop: desktopResults,
        mobile: { available: false, score: 0, seo_score: 0, accessibility_score: 0, best_practices_score: 0, lcp: 0, cls: 0, inp: 0 },
        available: desktopResults.available,
        diag: desktopResults.available ? 'desktop_ok' : `desktop_fail_${desktopResults.errorType || desktopResults.status}`
    }
}
