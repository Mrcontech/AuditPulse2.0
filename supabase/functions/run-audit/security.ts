// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

export async function checkSecurity(url: string, crawlData: any[]) {
    console.log(`Checking security and links for ${url}...`)

    // 1. SSL & Header Check (Fetch the root page)
    const response = await fetch(url, { method: 'HEAD' })
    const headers = response.headers

    const securityHeaders = {
        'Content-Security-Policy': headers.has('content-security-policy'),
        'Strict-Transport-Security': headers.has('strict-transport-security'),
        'X-Frame-Options': headers.has('x-frame-options'),
        'X-Content-Type-Options': headers.has('x-content-type-options'),
        'Referrer-Policy': headers.has('referrer-policy')
    }

    // 2. Broken Links Check (from crawl data)
    const brokenLinks = crawlData
        ? crawlData
            .filter(page => page.status === 404 || page.status >= 500)
            .map(page => ({ url: page.url, status: page.status }))
        : []

    // 3. Simple Risk Score calculation
    let score = 100
    if (!url.startsWith('https')) score -= 50
    Object.values(securityHeaders).forEach(active => {
        if (!active) score -= 10
    })
    if (brokenLinks.length > 0) score -= Math.min(20, brokenLinks.length * 2)

    return {
        security_score: Math.max(0, score),
        ssl_valid: url.startsWith('https'),
        security_headers: securityHeaders,
        broken_links: brokenLinks
    }
}
