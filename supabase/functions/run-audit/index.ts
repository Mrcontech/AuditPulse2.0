// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crawlSite } from './crawler.ts'
import { getPageSpeedMetrics } from './pagespeed.ts'
import { getSerpData } from './serp.ts'
import { getMarketInsights, getCompetitors } from './tavily.ts'
import { analyzeWithGemini, discoverNiche } from './gemini.ts'
import { checkSecurity } from './security.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    let currentAuditId: string | null = null;
    let currentMsgId: number | null = null;

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const body = await req.json()
        // Handle payload from both direct call and pgmq worker
        const payload = body.record?.message || body
        const { url, auditId, stage = 'collection', msg_id } = payload

        currentAuditId = auditId;
        currentMsgId = msg_id;
        const domain = new URL(url).hostname

        console.log(`[${auditId}] Processing stage: ${stage} for ${url}`)

        // State machine for stages
        if (stage === 'collection') {
            await supabase.from('audits').update({
                status: 'crawling',
                progress: 10,
                progress_label: 'Stage 1/3: Collecting site content and performance metrics...'
            }).eq('id', auditId)

            console.log(`[${auditId}] Running Stage 1: Crawl + Metrics...`)
            const [crawlData, performance] = await Promise.all([
                crawlSite(url),
                getPageSpeedMetrics(url, Deno.env.get('PAGESPEED_API_KEY') ?? '')
            ])

            // Persist to raw_data
            await supabase.from('audits').update({
                progress: 35,
                progress_label: 'Collection complete. Moving to market research...',
                raw_data: { crawlData, performance }
            }).eq('id', auditId)

            // Queue Stage 2
            await supabase.rpc('enqueue_audit_stage', { p_audit_id: auditId, p_url: url, p_stage: 'research' })

        } else if (stage === 'research') {
            const { data: auditData } = await supabase.from('audits').select('raw_data').eq('id', auditId).single()
            const rawData = auditData?.raw_data || {}

            await supabase.from('audits').update({
                status: 'analyzing',
                progress: 45,
                progress_label: 'Stage 2/3: Researching industry trends and competitors...'
            }).eq('id', auditId)

            console.log(`[${auditId}] Running Stage 2: Niche + Research...`)
            const niche = await discoverNiche(rawData.crawlData, Deno.env.get('GEMINI_API_KEY') ?? '')

            const [seo, insights, competitors, security] = await Promise.all([
                getSerpData(domain, Deno.env.get('SERP_API_KEY') ?? ''),
                getMarketInsights(niche, Deno.env.get('TAVILY_API_KEY') ?? ''),
                getCompetitors(niche, Deno.env.get('TAVILY_API_KEY') ?? ''),
                checkSecurity(url, rawData.crawlData)
            ])

            // Update raw_data
            await supabase.from('audits').update({
                progress: 70,
                progress_label: 'Research complete. Starting deep AI synthesis...',
                raw_data: { ...rawData, niche, seo, insights, competitors, security }
            }).eq('id', auditId)

            // Queue Stage 3
            await supabase.rpc('enqueue_audit_stage', { p_audit_id: auditId, p_url: url, p_stage: 'synthesis' })

        } else if (stage === 'synthesis') {
            const { data: auditData } = await supabase.from('audits').select('raw_data').eq('id', auditId).single()
            const rawData = auditData?.raw_data || {}

            await supabase.from('audits').update({
                progress: 80,
                progress_label: 'Stage 3/3: Finalizing strategic synthesis...'
            }).eq('id', auditId)

            console.log(`[${auditId}] Running Stage 3: Gemini Synthesis...`)
            const aiAnalysis = await analyzeWithGemini(
                rawData.crawlData,
                rawData.performance,
                rawData.insights,
                rawData.competitors,
                Deno.env.get('GEMINI_API_KEY') ?? ''
            )

            // Store Results
            await supabase.from('audit_results').insert({
                audit_id: auditId,
                performance_score: rawData.performance.desktop.score,
                performance_score_mobile: rawData.performance.mobile.score,
                seo_score: rawData.performance.desktop.seo_score,
                accessibility_score: rawData.performance.desktop.accessibility_score,
                best_practices_score: rawData.performance.desktop.best_practices_score,
                lcp_desktop: rawData.performance.desktop.lcp,
                cls_desktop: rawData.performance.desktop.cls,
                inp_desktop: rawData.performance.desktop.inp,
                lcp_mobile: rawData.performance.mobile.lcp,
                cls_mobile: rawData.performance.mobile.cls,
                inp_mobile: rawData.performance.mobile.inp,
                keywords: rawData.seo.organic_results,
                total_results: rawData.seo.total_results,
                industry_trends: rawData.insights.sources,
                market_insights: rawData.insights.answer,
                competitor_analysis: rawData.competitors,
                competitive_gap: aiAnalysis.competitive_edge.vulnerability_analysis,
                content_gaps: aiAnalysis.seo_analysis.content_gaps,
                market_gap: aiAnalysis.competitive_edge.asymmetric_advantage,
                swot_analysis: aiAnalysis.competitive_edge.swot,
                strategic_keywords: aiAnalysis.seo_analysis.strategic_keywords,
                security_score: rawData.security.security_score,
                ssl_valid: rawData.security.ssl_valid,
                security_headers: rawData.security.security_headers,
                broken_links: rawData.security.broken_links,
                executive_summary: aiAnalysis.executive_summary,
                brand_voice_analysis: aiAnalysis?.market_positioning?.positioning_statement,
                cta_analysis: aiAnalysis?.conversion_psychology?.persuasion_hooks?.map((h: any) => h.hook).join(", ") || "",
                ux_friction_points: aiAnalysis?.conversion_psychology?.psychological_barriers,
                jobs_to_be_done: aiAnalysis?.conversion_psychology?.jobs_to_be_done,
                strategic_recommendations: aiAnalysis?.strategic_recommendations,
                strategy_score: aiAnalysis.strategy_score,
                ecosystem_recommendations: aiAnalysis?.ecosystem_strategy,
                growth_roadmap: aiAnalysis?.growth_roadmap,
                timeframe_note: aiAnalysis?.timeframe_note,
                market_positioning: aiAnalysis?.market_positioning,
                conversion_psychology: aiAnalysis?.conversion_psychology,
                competitive_edge: aiAnalysis?.competitive_edge,
                seo_analysis: aiAnalysis?.seo_analysis,
                crawl_data: rawData.crawlData,
                pages_crawled: rawData.crawlData.length
            })

            await supabase.from('audits').update({
                status: 'complete',
                progress: 100,
                progress_label: 'Audit completed successfully!',
                completed_at: new Date().toISOString()
            }).eq('id', auditId)

            console.log(`[${auditId}] Audit completed successfully`)
        }

        // Acknowledge (archive) the message upon success
        if (currentMsgId) {
            await supabase.rpc('acknowledge_audit_message', { p_msg_id: currentMsgId })
        }

        return new Response(JSON.stringify({ success: true, stage }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (err: any) {
        console.error(`Audit failed at stage: ${err.message}`)

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (currentAuditId) {
            await supabase.from('audits').update({
                status: 'failed',
                error_message: err.message,
                progress_label: 'Audit failed during processing',
                progress: 0
            }).eq('id', currentAuditId)
        }

        // If we failed, the message will eventually become visible again in PGMQ 
        // due to VT expiration, unless we specifically archive it on error.
        // For now, we let it retry naturally or the user can manual-retry.

        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})
