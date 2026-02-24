// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />
function cleanJson(text: string) {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

  // Find first { and last }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }

  // Repair trailing commas
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  return cleaned;
}

export async function analyzeWithGemini(crawlData: any[], performanceMetrics: any, marketData: any, competitors: any, apiKey: string) {
  console.log('Performing deep AI synthesis with Gemini...')
  const prompt = `You are a world-class strategic business consultant and website auditor. Analyze the following data and provide a comprehensive market-ready report in STRICT JSON format.

WEBSITE CONTENT (Markdown):
${JSON.stringify(crawlData.slice(0, 3).map(p => ({ url: p.url, content: p.markdown?.substring(0, 2000) || '' })))}

PERFORMANCE METRICS:
${JSON.stringify(performanceMetrics)}

MARKET DATA & TRENDS:
${JSON.stringify(marketData)}

TOP COMPETITORS:
${JSON.stringify(competitors)}

Output a valid JSON object with these keys:
1. executive_summary: (string) 2-3 sentence overview.
2. brand_voice_analysis: (string) Assessment of tone and positioning.
3. cta_analysis: (string) Evaluation of conversion paths.
4. market_intelligence: (object) { competitive_gap, winning_strategies, swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] } }
5. ux_friction_points: (string[]) List of issues.
6. content_gaps: (array of objects) [{ topic, advice }]
7. strategic_recommendations: (array of objects) [{ title, description }]

IMPORTANT: Ensure all strings are correctly escaped for JSON. Output ONLY the JSON object.`

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: 'application/json' }
    })
  })

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.message || response.statusText}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanedText = cleanJson(rawText);

  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error('Failed to parse Gemini JSON:', e.message);
    console.debug('Raw response:', rawText);
    // Final emergency fallback if even cleanJson fails
    throw new Error(`AI generated invalid JSON: ${e.message}`);
  }
}


export async function discoverNiche(crawlData: any, apiKey: string): Promise<string> {
  console.log(`Performing deep niche discovery with Gemini...`)

  // Check if we have any actual text content
  const hasContent = crawlData.some((p: any) => p.markdown && p.markdown.trim().length > 50);
  const homePage = crawlData[0] || {};

  // If no markdown but we have meta tags, we use those as primary signals
  const metaContext = `
      TITLE: ${homePage.title || 'N/A'}
      DESCRIPTION: ${homePage.description || 'N/A'}
      KEYWORDS: ${homePage.keywords || 'N/A'}
    `.trim();

  const prompt = `
    Analyze this website's content and provide a highly specific research phrase for market analysis.
    Identify: 
    1. Primary service/product 
    2. Target audience 
    3. Geographic location (if local) 
    4. Brand positioning (e.g. Luxury vs Budget)

    RULES:
    - Output ONLY the 10-word research phrase. 
    - DO NOT include apologies, explanations, or meta-talk.
    - If the website is empty or unclear, output exactly: "General business and industry trends"
    - MAX 30 words.

    Example Output: "High-end residential plumbing services in Birmingham, UK for homeowners"

    METADATA:
    ${metaContext}

    CONTENT:
    ${JSON.stringify(crawlData.slice(0, 2).map((p: any) => p.markdown?.substring(0, 1500) || ''))}
  `

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gemini niche discovery failed: ${error.message || response.statusText}`)
  }

  const result = await response.json()
  const niche = result.candidates[0].content.parts[0].text.trim()

  // Guard against AI ignoring the "General" fallback instruction
  if (!hasContent && (!homePage.description || homePage.description.length < 10)) {
    console.log("[Gemini] Content is sparse and no meta description found. Forcing generic fallback.");
    return "General business and industry trends";
  }

  // Safety truncation
  return niche.length > 0 ? niche.substring(0, 300) : "General business and industry trends";
}
