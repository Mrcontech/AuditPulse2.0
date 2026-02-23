// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

export async function getPageSpeedMetrics(url: string, apiKey: string) {
    console.log(`Getting PageSpeed metrics for ${url}...`)

    const fetchStrategy = async (strategy: 'mobile' | 'desktop') => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 180000) // Increased to 180s for slow sites

        if (!apiKey) {
            console.error(`PageSpeed API key is missing for ${strategy}`)
            return { lighthouseResult: { categories: { performance: { score: 0 }, seo: { score: 0 }, accessibility: { score: 0 }, 'best-practices': { score: 0 } }, audits: {} }, loadingExperience: { metrics: {} } }
        }

        try {
            const categories = 'category=performance&category=seo&category=accessibility&category=best-practices';
            const response = await fetch(
                `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&${categories}&key=${apiKey}`,
                { signal: controller.signal }
            )

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`PageSpeed API error (${strategy}) [${response.status}]: ${errorText}`);
                throw new Error(`PageSpeed API error (${strategy}): ${response.statusText}`)
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error(`PageSpeed ${strategy} failed for ${url}:`, err.message)
            // Re-throw so the error propagates instead of silently returning zeros
            throw new Error(`PageSpeed_${strategy}_FAILED: ${err.message}`)
        } finally {
            clearTimeout(timeoutId)
        }
    }

    const [mobile, desktop] = await Promise.all([
        fetchStrategy('mobile'),
        fetchStrategy('desktop')
    ])

    const extract = (data: any, strategy: string) => {
        const lighthouse = data.lighthouseResult?.audits || {};
        const categories = data.lighthouseResult?.categories || {};
        const loading = data.loadingExperience?.metrics || {};


        return {
            score: Math.round((categories.performance?.score ?? 0) * 100),
            seo_score: Math.round((categories.seo?.score ?? 0) * 100),
            accessibility_score: Math.round((categories.accessibility?.score ?? 0) * 100),
            best_practices_score: Math.round((categories['best-practices']?.score ?? 0) * 100),
            // Fallback: Field LCP -> Lab LCP (ms to s)
            lcp: (loading.LARGEST_CONTENTFUL_PAINT_MS?.percentile || lighthouse['largest-contentful-paint']?.numericValue || 0) / 1000,
            // Fallback: Field CLS -> Lab CLS
            cls: loading.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile / 100 || lighthouse['cumulative-layout-shift']?.numericValue || 0,
            // Fallback: Field INP -> Lab TBT (Total Blocking Time)
            inp: loading.INTERACTION_TO_NEXT_PAINT?.percentile || lighthouse['total-blocking-time']?.numericValue || 0,
        };
    }

    const mobileResults = extract(mobile, 'mobile');
    const desktopResults = extract(desktop, 'desktop');

    return {
        mobile: mobileResults,
        desktop: desktopResults,
        diag: Object.keys(desktop.lighthouseResult?.categories || {}).join(',')
    }
}
