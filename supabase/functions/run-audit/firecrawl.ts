// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

export async function crawlSite(url: string, apiKey: string) {
    console.log(`Crawling ${url} with Firecrawl...`)

    const response = await fetch('https://api.firecrawl.dev/v1/crawl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            url,
            limit: 12,
            scrapeOptions: {
                formats: ['markdown']
            }
        })
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(`Firecrawl error: ${error.message || response.statusText}`)
    }

    const { id: jobId } = await response.json()

    // Polling for crawl completion
    let status = 'active'
    let data = null
    const startTime = Date.now()
    const TIMEOUT_MS = 90000 // 90 seconds safety cap for crawling

    while (status === 'active' || status === 'waiting' || status === 'scraping') {
        // Safety timeout check
        if (Date.now() - startTime > TIMEOUT_MS) {
            throw new Error('Crawl exceeded 90 second limit. Aborting to prevent full timeout.')
        }

        await new Promise(resolve => setTimeout(resolve, 3000)) // Faster polling
        const check = await fetch(`https://api.firecrawl.dev/v1/crawl/${jobId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        })
        const result = await check.json()
        status = result.status
        if (status === 'completed') {
            data = result.data
        } else if (status === 'failed') {
            throw new Error(`Firecrawl job failed: ${result.error}`)
        }
    }

    return data
}
