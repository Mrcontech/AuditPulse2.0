// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

/**
 * Native fetch-based crawler that replaces Firecrawl.
 * Uses BFS link discovery + HTML-to-Markdown conversion.
 * No external API key required — zero cost.
 */

const MAX_PAGES = 6
const CRAWL_TIMEOUT_MS = 30000 // 30s safety cap — leaves time for PageSpeed in parallel
const PAGE_FETCH_TIMEOUT_MS = 5000 // 5s per page — fail fast on slow pages
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Paths to skip during link discovery
const SKIP_PATTERNS = [
    /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot|pdf|zip|mp4|mp3)$/i,
    /\/(wp-admin|wp-json|feed|xmlrpc|api\/|_next\/|static\/|assets\/)\//i,
    /\/(privacy-policy|terms-of-service|cookie-policy|legal|sitemap\.xml|robots\.txt)\b/i,
    /#/,
    /^mailto:/i,
    /^tel:/i,
    /^javascript:/i,
]

/**
 * Convert raw HTML to clean Markdown-like text.
 * Strips tags, scripts, styles, and normalizes whitespace.
 */
function htmlToMarkdown(html: string): string {
    let text = html

    // Remove script, style, noscript, svg, and head blocks
    text = text.replace(/<(script|style|noscript|svg|head)[^>]*>[\s\S]*?<\/\1>/gi, '')

    // Convert headings
    text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
    text = text.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n')
    text = text.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n')

    // Convert links
    text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')

    // Convert images to alt text
    text = text.replace(/<img[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$1]')

    // Convert lists
    text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')

    // Convert paragraphs and line breaks
    text = text.replace(/<br\s*\/?>/gi, '\n')
    text = text.replace(/<\/p>/gi, '\n\n')
    text = text.replace(/<p[^>]*>/gi, '')

    // Convert bold and italic
    text = text.replace(/<(b|strong)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    text = text.replace(/<(i|em)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')

    // Strip remaining HTML tags
    text = text.replace(/<[^>]+>/g, '')

    // Decode common HTML entities
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/&lt;/g, '<')
    text = text.replace(/&gt;/g, '>')
    text = text.replace(/&quot;/g, '"')
    text = text.replace(/&#39;/g, "'")
    text = text.replace(/&nbsp;/g, ' ')

    // Normalize whitespace
    text = text.replace(/[ \t]+/g, ' ')
    text = text.replace(/\n{3,}/g, '\n\n')
    text = text.trim()

    return text
}

/**
 * Extract all internal links from HTML.
 */
function extractLinks(html: string, baseUrl: URL): string[] {
    const links: string[] = []
    const regex = /<a[^>]*href="([^"#]*)"[^>]*>/gi
    let match

    while ((match = regex.exec(html)) !== null) {
        try {
            const href = match[1].trim()
            if (!href || href === '/') continue

            const resolved = new URL(href, baseUrl)

            // Only follow same-domain links
            if (resolved.hostname !== baseUrl.hostname) continue

            // Skip noisy paths
            if (SKIP_PATTERNS.some(p => p.test(resolved.href))) continue

            // Normalize: remove trailing slash and query params
            const normalized = resolved.origin + resolved.pathname.replace(/\/$/, '')
            if (!links.includes(normalized)) {
                links.push(normalized)
            }
        } catch {
            // Ignore malformed URLs
        }
    }

    return links
}

/**
 * Fetch a single page: returns HTML, status, title, and markdown in one pass.
 */
async function fetchPage(url: string): Promise<{
    url: string;
    status: number;
    markdown: string;
    title: string;
    description: string;
    keywords: string;
    rawHtml: string;
}> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PAGE_FETCH_TIMEOUT_MS)

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            signal: controller.signal,
            redirect: 'follow',
        })

        clearTimeout(timeoutId)

        const status = response.status
        if (status >= 400) {
            return { url, status, markdown: '', title: '', rawHtml: '' }
        }

        const html = await response.text()

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
        const title = titleMatch ? titleMatch[1].trim() : ''

        // Extract meta description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
            html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i)
        const description = descMatch ? descMatch[1].trim() : ''

        // Extract meta keywords
        const keyMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
            html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']keywords["'][^>]*>/i)
        const keywords = keyMatch ? keyMatch[1].trim() : ''

        // Convert to markdown
        const markdown = htmlToMarkdown(html)

        return { url, status, markdown, title, description, keywords, rawHtml: html }
    } catch (err) {
        clearTimeout(timeoutId)
        console.warn(`[Crawler] Failed to fetch ${url}: ${err.message}`)
        return { url, status: 0, markdown: '', title: '', description: '', keywords: '', rawHtml: '' }
    }
}

/**
 * Crawl a website using BFS link discovery.
 * Returns an array matching Firecrawl's output format:
 * [{ url, status, markdown, title }, ...]
 * 
 * No API key needed — this is a zero-cost replacement for Firecrawl.
 */
export async function crawlSite(url: string): Promise<any[]> {
    console.log(`[Crawler] Starting native crawl of ${url} (max ${MAX_PAGES} pages)...`)

    const startTime = Date.now()
    const baseUrl = new URL(url)
    const visited = new Set<string>()
    const results: any[] = []

    // Normalize the seed URL
    const seedUrl = baseUrl.origin + baseUrl.pathname.replace(/\/$/, '')
    const queue: string[] = [seedUrl]

    while (queue.length > 0 && results.length < MAX_PAGES) {
        // Safety timeout
        if (Date.now() - startTime > CRAWL_TIMEOUT_MS) {
            console.warn(`[Crawler] Crawl timeout reached after ${results.length} pages.`)
            break
        }

        // Take a batch of up to 4 URLs
        const batchSize = Math.min(4, MAX_PAGES - results.length, queue.length)
        const currentBatch = queue.splice(0, batchSize)

        console.log(`[Crawler] Fetching batch of ${currentBatch.length} pages. Total results so far: ${results.length}`)

        // Fetch the entire batch in parallel
        const pageResults = await Promise.all(currentBatch.map(url => fetchPage(url)))

        for (const page of pageResults) {
            if (visited.has(page.url.replace(/\/$/, ''))) continue
            visited.add(page.url.replace(/\/$/, ''))

            // Extract links from the raw HTML
            if (page.rawHtml && page.status >= 200 && page.status < 400) {
                const links = extractLinks(page.rawHtml, new URL(page.url))
                for (const link of links) {
                    if (!visited.has(link) && !queue.includes(link)) {
                        queue.push(link)
                    }
                }
            }

            // Store result
            results.push({
                url: page.url,
                status: page.status,
                markdown: page.markdown,
                title: page.title,
                description: page.description,
                keywords: page.keywords,
            })

            if (results.length >= MAX_PAGES) break
        }
    }

    console.log(`[Crawler] Crawl complete. ${results.length} pages in ${((Date.now() - startTime) / 1000).toFixed(1)}s`)
    return results
}
