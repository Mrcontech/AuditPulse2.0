// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

export async function getPageSpeedMetrics(url: string, apiKey: string) {
    console.log(`Getting PageSpeed metrics for ${url}...`)

    const fetchStrategy = async (strategy: 'mobile' | 'desktop') => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000)

        try {
            const response = await fetch(
                `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`,
                { signal: controller.signal }
            )
            if (!response.ok) throw new Error(`PageSpeed API error (${strategy}): ${response.statusText}`)
            return await response.json()
        } catch (err) {
            console.error(`PageSpeed ${strategy} failed:`, err.message)
            return { lighthouseResult: { categories: { performance: { score: 0 } }, audits: {} }, loadingExperience: { metrics: {} } }
        } finally {
            clearTimeout(timeoutId)
        }
    }

    const [mobile, desktop] = await Promise.all([
        fetchStrategy('mobile'),
        fetchStrategy('desktop')
    ])

    const extract = (data: any) => {
        const lighthouse = data.lighthouseResult?.audits || {};
        const loading = data.loadingExperience?.metrics || {};

        return {
            score: Math.round(data.lighthouseResult?.categories?.performance?.score * 100) || 0,
            // Fallback: Field LCP -> Lab LCP (ms to s)
            lcp: (loading.LARGEST_CONTENTFUL_PAINT_MS?.percentile || lighthouse['largest-contentful-paint']?.numericValue || 0) / 1000,
            // Fallback: Field CLS -> Lab CLS
            cls: loading.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile / 100 || lighthouse['cumulative-layout-shift']?.numericValue || 0,
            // Fallback: Field INP -> Lab TBT (Total Blocking Time)
            inp: loading.INTERACTION_TO_NEXT_PAINT?.percentile || lighthouse['total-blocking-time']?.numericValue || 0,
        };
    }

    return {
        mobile: extract(mobile),
        desktop: extract(desktop)
    }
}
