export async function getSerpData(domain: string, apiKey: string) {
    console.log(`Getting SEO data for ${domain} via SERP API...`)

    const response = await fetch(
        `https://serpapi.com/search.json?q=site:${domain}&api_key=${apiKey}`
    )

    if (!response.ok) throw new Error(`SERP API error: ${response.statusText}`)

    const data = await response.json()

    // Extract keywords and total results
    return {
        total_results: data.search_information?.total_results || 0,
        organic_results: data.organic_results?.slice(0, 10).map((r: any) => ({
            title: r.title,
            link: r.link,
            snippet: r.snippet
        })) || []
    }
}
