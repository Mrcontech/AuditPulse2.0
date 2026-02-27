// @ts-nocheck
export async function runCompetitorXRay(competitorDomain: string, serpApiKey: string, tavilyApiKey: string, geminiApiKey: string) {
    if (!competitorDomain) return {};

    try {
        // 1. Get Top Pages via SerpApi
        let topPages = [];
        if (serpApiKey) {
            const serpResp = await fetch(`https://serpapi.com/search.json?q=site:${competitorDomain}&api_key=${serpApiKey}`);
            const serpData = await serpResp.json();
            topPages = (serpData.organic_results || []).slice(0, 3).map((r: any) => ({
                title: r.title,
                url: r.link
            }));
        }

        // 2. Deep Research via Tavily
        let vp = "Competitor in your space.";
        let strengths = ["Established presence"];
        let weaknesses = ["Generic positioning"];

        if (tavilyApiKey && geminiApiKey) {
            const tavilyResp = await fetch('https://api.tavily.com/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: tavilyApiKey,
                    query: `${competitorDomain} company value proposition and recent news`,
                    search_depth: "basic",
                    include_answer: true
                })
            });
            const tavilyData = await tavilyResp.json();
            const researchContext = tavilyData.answer || (tavilyData.results || []).map((r: any) => r.content).join("\n");

            // 3. Synthesize Attack Plan with Gemini
            const prompt = `Analyze this competitor research for ${competitorDomain}:
            ${researchContext}
            
            Return ONLY a valid JSON object with:
            {
                "value_proposition": "1 sentence describing what they really do",
                "strengths": ["list of 2 specific strengths"],
                "weaknesses": ["list of 2 specific weaknesses or strategic vulnerabilities"]
            }`;

            const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: 'application/json' }
                })
            });

            const geminiResult = await geminiResp.json();
            const rawText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
            vp = parsed.value_proposition || vp;
            strengths = parsed.strengths || strengths;
            weaknesses = parsed.weaknesses || weaknesses;
        }

        return {
            value_proposition: vp,
            strengths: strengths,
            weaknesses: weaknesses,
            top_pages: topPages,
            outreach_targets: [] // Leaving empty for now as emails are hard to get reliably for free
        };
    } catch (e: any) {
        console.error("Competitor X-Ray failed:", e.message);
        return { error: e.message };
    }
}

export async function runContentEngine(domain: string, tavilyApiKey: string, geminiApiKey: string, crawlData: any[]) {
    if (!domain) return {};

    try {
        let articleTopic = "Industry trends";
        let targetKeyword = domain;
        let socialPost = "";
        let blogDraft = "";

        if (tavilyApiKey && geminiApiKey) {
            // 1. Get Trending Topics mapping to the domain's context
            const homeContent = crawlData?.[0]?.markdown?.substring(0, 500) || "";

            const tavResp = await fetch('https://api.tavily.com/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: tavilyApiKey,
                    query: `latest trends and highly searched topics related to: ${homeContent.substring(0, 100) || domain}`,
                    search_depth: "basic"
                })
            });
            const tavData = await tavResp.json();
            const trends = tavData.answer || (tavData.results || []).map((r: any) => r.title).join(", ");

            // 2. Synthesize with Gemini
            const prompt = `You are a world-class SEO strategist. Based on this website snippet: "${homeContent}" and these current industry trends: "${trends}".
            
            Generate a high-converting content marketing plan.
            Output ONLY a valid JSON object:
            {
                "target_keyword": "A highly specific 3-4 word long-tail keyword you estimate has good search demand",
                "article_title_idea": "Catchy headline for the blog post",
                "linkedin_post": "A drafted professional social media post (1 paragraph) teasing the blog",
                "blog_outline": "A brief 3-point bulleted outline for the article"
            }`;

            const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: 'application/json' }
                })
            });

            const geminiResult = await geminiResp.json();
            const rawText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

            targetKeyword = parsed.target_keyword || targetKeyword;
            articleTopic = parsed.article_title_idea || articleTopic;
            socialPost = parsed.linkedin_post || "";
            blogDraft = parsed.blog_outline || "";
        }

        return {
            target_keyword: targetKeyword,
            long_tail_topic: articleTopic,
            social_post: socialPost,
            blog_draft: blogDraft
        };

    } catch (e: any) {
        console.error("Content Engine failed:", e.message);
        return { error: e.message };
    }
}

export async function runMissingMoneyScanner(domain: string, urls_to_check: string[], serpApiKey: string, geminiApiKey: string) {
    if (!domain || urls_to_check.length === 0) return {};

    try {
        const results = [];

        for (let i = 0; i < Math.min(3, urls_to_check.length); i++) {
            let urlObj;
            try {
                urlObj = new URL(urls_to_check[i]);
            } catch (e) {
                continue;
            }

            const pathSegments = urlObj.pathname.split('/').filter(Boolean);
            const keyword = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ') : domain;

            let isIndexed = true; // Assume indexed by default to avoid false flags

            if (serpApiKey) {
                const serpResp = await fetch(`https://serpapi.com/search.json?q=site:${urls_to_check[i]}&api_key=${serpApiKey}`);
                const serpData = await serpResp.json();
                const totalResults = serpData.search_information?.total_results || 0;

                // If 0 results, it's not indexed
                isIndexed = totalResults > 0;
            }

            if (!isIndexed) {
                results.push({
                    url: urls_to_check[i],
                    keyword: keyword
                });
            }
        }

        return {
            unindexed_pages: results
        };

    } catch (e: any) {
        console.error("Missing Money Scanner failed:", e.message);
        return { error: e.message };
    }
}
