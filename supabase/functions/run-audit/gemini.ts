export async function analyzeWithGemini(crawlData: any, performanceMetrics: any, apiKey: string) {
    console.log(`Analyzing site data with Gemini...`)

    const prompt = `
    You are a world-class website auditor. Analyze the following data for a website and provide a detailed strategic roadmap.
    
    WEBSITE CONTENT (Markdown):
    ${JSON.stringify(crawlData.slice(0, 5).map((p: any) => p.markdown))}
    
    PERFORMANCE METRICS:
    ${JSON.stringify(performanceMetrics)}
    
    Provide the following sections in JSON format:
    1. executive_summary: A 2-3 sentence overview.
    2. brand_voice_analysis: Assessment of consistency.
    3. cta_analysis: Effectiveness of calls to action.
    4. ux_friction_points: List of potential user experience issues.
    5. strategic_recommendations: Top 5 priority fixes as an array of objects with 'title' and 'description'.
  `

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        }
    )

    if (!response.ok) {
        const error = await response.json()
        throw new Error(`Gemini API error: ${error.message || response.statusText}`)
    }

    const result = await response.json()
    const content = result.candidates[0].content.parts[0].text
    return JSON.parse(content)
}
