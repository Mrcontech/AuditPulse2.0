import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crawlSite } from './firecrawl.ts'
import { getPageSpeedMetrics } from './pagespeed.ts'
import { getSerpData } from './serp.ts'
import { getMarketInsights } from './tavily.ts'
import { analyzeWithGemini } from './gemini.ts'
import { checkSecurity } from './security.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    let currentAuditId: string | null = null;
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const body = await req.json()
        const { url, auditId } = body.record?.message || body
        currentAuditId = auditId;
        const domain = new URL(url).hostname

        // 1. Update status
        await supabase.from('audits').update({ status: 'crawling', progress: 10 }).eq('id', auditId)

        // 2. Run all data collection in PARALLEL to prevent 150s timeout
        const [crawlData, performance, seo, insights] = await Promise.all([
            crawlSite(url, Deno.env.get('FIRECRAWL_API_KEY') ?? ''),
            getPageSpeedMetrics(url, Deno.env.get('PAGESPEED_API_KEY') ?? ''),
            getSerpData(domain, Deno.env.get('SERP_API_KEY') ?? ''),
            getMarketInsights(domain, Deno.env.get('TAVILY_API_KEY') ?? '')
        ])

        await supabase.from('audits').update({ status: 'analyzing', progress: 70 }).eq('id', auditId)

        // 3. AI Synthesis & Security Check (Parallel)
        const [aiAnalysis, security] = await Promise.all([
            analyzeWithGemini(crawlData, performance, Deno.env.get('GEMINI_API_KEY') ?? ''),
            checkSecurity(url, crawlData)
        ])

        // 3. Store Results
        const { error: resultError } = await supabase.from('audit_results').insert({
            audit_id: auditId,
            performance_score: performance.desktop.score,
            lcp_desktop: performance.desktop.lcp,
            cls_desktop: performance.desktop.cls,
            inp_desktop: performance.desktop.inp,
            lcp_mobile: performance.mobile.lcp,
            cls_mobile: performance.mobile.cls,
            inp_mobile: performance.mobile.inp,
            seo_score: 85,
            keywords: seo.organic_results,
            industry_trends: insights.sources,
            market_insights: insights.answer,
            security_score: security.security_score,
            ssl_valid: security.ssl_valid,
            security_headers: security.security_headers,
            broken_links: security.broken_links,
            executive_summary: aiAnalysis.executive_summary,
            brand_voice_analysis: aiAnalysis.brand_voice_analysis,
            cta_analysis: aiAnalysis.cta_analysis,
            ux_friction_points: aiAnalysis.ux_friction_points,
            strategic_recommendations: aiAnalysis.strategic_recommendations,
            crawl_data: crawlData,
            pages_crawled: crawlData.length
        })

        if (resultError) throw resultError

        // 4. Mark Complete
        await supabase.from('audits').update({
            status: 'complete',
            progress: 100,
            completed_at: new Date().toISOString()
        }).eq('id', auditId)

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error) {
        console.error('Audit task failed:', error)

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        if (currentAuditId) {
            await supabase.from('audits').update({
                status: 'failed',
                error_message: error.message,
                progress: 0
            }).eq('id', currentAuditId)
        }

        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})
