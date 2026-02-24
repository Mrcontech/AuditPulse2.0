// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

export async function getPageSpeedMetrics(url: string, apiKey: string) {
    console.log(`Getting PageSpeed metrics for ${url}...`)

    const fetchStrategy = async (strategy: 'mobile' | 'desktop') => {
        const controller = new AbortController()
        const timeoutMs = 90000; // 90s — Google PageSpeed can take up to 120s, but 90s hits the sweet spot for most sites
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
        const start = Date.now();

        if (!apiKey) {
            console.error(`PageSpeed API key is missing for ${strategy}`)
            return { success: false, errorType: 'MISSING_KEY', lighthouseResult: { categories: {}, audits: {} }, loadingExperience: { metrics: {} } }
        }

        try {
            console.log(`[PageSpeed] Starting ${strategy} fetch for ${url}...`)
            const categories = 'category=performance&category=seo&category=accessibility&category=best-practices';
            const apiUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&${categories}&key=${apiKey}`;

            const response = await fetch(apiUrl, { signal: controller.signal })
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);

            if (!response.ok) {
                const errorText = await response.text();
                let parsedError = {};
                try { parsedError = JSON.parse(errorText); } catch (e) { }

                console.warn(`[PageSpeed] API error (${strategy}) [${response.status}] after ${elapsed}s: ${errorText}`);
                return {
                    success: false,
                    status: response.status,
                    errorType: 'API_ERROR',
                    errorDetails: parsedError,
                    lighthouseResult: { categories: {}, audits: {} },
                    loadingExperience: { metrics: {} }
                }
            }

            console.log(`[PageSpeed] ${strategy} successful in ${elapsed}s`)
            const data = await response.json();
            return { success: true, ...data };
        } catch (err: any) {
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);
            const isTimeout = err.name === 'AbortError';
            console.warn(`[PageSpeed] ${strategy} ${isTimeout ? 'TIMED OUT' : 'FAILED'} for ${url} after ${elapsed}s:`, err.message)
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

    // Single attempt with 90s budget is more effective than multiple short attempts
    const desktop = await fetchStrategy('desktop');

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
