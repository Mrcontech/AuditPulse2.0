// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

// Helper to ensure query remains within Tavily's 400 character limit
function prepareQuery(query: string, prefix: string): string {
    const limit = 390; // extra safety margin
    const baseQuery = query?.trim() || "General business trends";
    const fullQuery = `${prefix} ${baseQuery}`;
    return fullQuery.substring(0, limit);
}

export async function getMarketInsights(niche: string, apiKey: string) {
    const query = prepareQuery(niche, "current industry trends and market insights for");
    console.log(`Getting market insights via Tavily for: ${query.substring(0, 50)}...`)

    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: apiKey,
            query: query,
            search_depth: "advanced",
            include_answer: true,
            max_results: 5
        })
    })

    if (!response.ok) throw new Error(`Tavily error: ${response.statusText}`)

    const result = await response.json()
    return {
        answer: result.answer,
        sources: result.results.map((r: any) => ({ title: r.title, url: r.url, content: r.content }))
    }
}

export async function getCompetitors(niche: string, apiKey: string) {
    const query = prepareQuery(niche, "top 3 ranking competitors and their value propositions for");
    console.log(`Researching competitors via Tavily for: ${query.substring(0, 50)}...`)

    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: apiKey,
            query: query,
            search_depth: "advanced",
            max_results: 3
        })
    })

    if (!response.ok) throw new Error(`Tavily competitor error: ${response.statusText}`)

    const result = await response.json()
    return result.results.map((r: any) => ({
        name: r.title,
        url: r.url,
        description: r.content
    }))
}
