// @ts-nocheck
/**
 * Heuristic scoring logic to provide fallback scores when PageSpeed (Lighthouse) fails.
 * These scores are based on raw crawler data (HTML structure, meta tags, etc.)
 */

export function calculateHeuristicPerformance(perf: any): number {
    if (!perf) return 0;

    let score = 50; // Neutral base for a site that exists

    // 1. HTML Size (Payload weight)
    if (perf.htmlSizeKb < 100) score += 15;
    else if (perf.htmlSizeKb < 500) score += 5;
    else score -= 10;

    // 2. Resource counts (Simplicity)
    if (perf.scriptCount < 10) score += 10;
    if (perf.styleCount < 5) score += 5;
    if (perf.imageCount < 20) score += 5;

    // 3. Render Blocking
    if (perf.renderBlockingScripts === 0) score += 10;
    else score -= Math.min(10, perf.renderBlockingScripts * 2);

    // 4. Modern attributes
    if (perf.lazyImages > 0) score += 5;
    if (perf.imagesWithDimensions > 0) score += 5;

    return Math.min(95, Math.max(10, score)); // Cap at 95 to differentiate from perfect lab score
}

export function calculateHeuristicSeo(seo: any): number {
    if (!seo) return 0;

    let score = 20; // Lower base for SEO as it requires effort

    // 1. Core Meta Tags
    if (seo.hasOgTags) score += 15;
    if (seo.hasTwitterTags) score += 10;
    if (seo.hasFavicon) score += 5;
    if (seo.hasViewport) score += 10;
    if (seo.canonical) score += 10;

    // 2. Content Structure
    if (seo.h1Count === 1) score += 15;
    else if (seo.h1Count > 1) score += 5; // Negative or multiple H1s is not ideal but better than none

    // 3. Content Depth
    if (seo.wordCount > 1000) score += 15;
    else if (seo.wordCount > 300) score += 10;
    else if (seo.wordCount > 50) score += 5;

    // 4. Technical SEO
    if (seo.hasJSONLD) score += 10;
    if (seo.imgAltCount > 0) score += 5;

    return Math.min(98, Math.max(10, score));
}
