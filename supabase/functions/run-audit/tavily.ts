export async function getMarketInsights(niche: string, apiKey: string) {
    console.log(`Getting market insights for niche: ${niche} via Tavily...`)

    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: apiKey,
            query: `current industry trends and market insights for ${niche}`,
            search_depth: "advanced",
            include_answer: true,
            max_results: 5
        })
    })

    if (!response.ok) throw new Error(`Tavily error: ${response.statusText}`)

    const result = await response.json()
    return {
        answer: result.answer,
        sources: result.results.map((r: any) => ({ title: r.title, url: r.url }))
    }
}
