// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

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

// Log graceful shutdowns so we can diagnose if Supabase kills us
addEventListener('beforeunload', (ev) => {
    console.log(`[EdgeFunction] Shutting down: ${ev.detail?.reason || 'unknown'}`)
})

async function processAuditStage(supabase: any, url: string, auditId: string, stage: string, domain: string, msgId: number | null) {
    try {
        if (stage === 'collection') {
            await supabase.from('audits').update({
                status: 'crawling',
                progress: 10,
                progress_label: 'Stage 1/3: Collecting site content and performance metrics...'
            }).eq('id', auditId)

            const [crawlData, performance] = await Promise.all([
                crawlSite(url),
                getPageSpeedMetrics(url, Deno.env.get('PAGESPEED_API_KEY') ?? '')
            ])

            await supabase.from('audits').update({
                progress: 35,
                progress_label: 'Collection complete. Moving to market research...',
                raw_data: { crawlData, performance, pagespeed_available: performance.available }
            }).eq('id', auditId)

            await supabase.rpc('enqueue_audit_stage', { p_audit_id: auditId, p_url: url, p_stage: 'research' })

        } else if (stage === 'research') {
            const { data: auditData, error: fetchErr } = await supabase.from('audits').select('raw_data').eq('id', auditId).single()
            if (fetchErr) throw new Error(`Failed to fetch audit data for research: ${fetchErr.message}`)

            const rawData = auditData?.raw_data || {}

            await supabase.from('audits').update({
                status: 'analyzing',
                progress: 45,
                progress_label: 'Stage 2/3: Researching industry trends and competitors...'
            }).eq('id', auditId)

            const [niche, seo] = await Promise.all([
                discoverNiche(rawData.crawlData, Deno.env.get('GEMINI_API_KEY') ?? ''),
                getSerpData(domain, Deno.env.get('SERP_API_KEY') ?? '')
            ])

            const [insights, competitors, security] = await Promise.all([
                getMarketInsights(niche, Deno.env.get('TAVILY_API_KEY') ?? ''),
                getCompetitors(niche, Deno.env.get('TAVILY_API_KEY') ?? ''),
                checkSecurity(url, rawData.crawlData)
            ])

            await supabase.from('audits').update({
                progress: 70,
                progress_label: 'Research complete. Starting deep AI synthesis...',
                raw_data: { ...rawData, niche, seo, insights, competitors, security }
            }).eq('id', auditId)

            await supabase.rpc('enqueue_audit_stage', { p_audit_id: auditId, p_url: url, p_stage: 'synthesis' })

        } else if (stage === 'synthesis') {
            const { data: auditData, error: fetchErr } = await supabase.from('audits').select('raw_data').eq('id', auditId).single()
            if (fetchErr) throw new Error(`Failed to fetch audit data for synthesis: ${fetchErr.message}`)

            const rawData = auditData?.raw_data || {}

            await supabase.from('audits').update({
                progress: 80,
                progress_label: 'Stage 3/3: Finalizing strategic synthesis...'
            }).eq('id', auditId)

            const aiAnalysis = await analyzeWithGemini(
                rawData.crawlData,
                rawData.performance,
                rawData.insights,
                rawData.competitors,
                Deno.env.get('GEMINI_API_KEY') ?? ''
            )

            console.log(`[${auditId}] Gemini synthesis complete.`)

            console.log(`[${auditId}] Gemini synthesis complete.`)

            const mobile = rawData.performance?.mobile || {}

            const resultsPayload = {
                audit_id: auditId,
                performance_score: mobile.score || 0,
                performance_score_mobile: mobile.score || 0,
                seo_score: mobile.seo_score || 0,
                accessibility_score: mobile.accessibility_score || 0,
                best_practices_score: mobile.best_practices_score || 0,
                lcp_desktop: mobile.lcp || 0, // Map mobile to desktop fields for frontend compatibility
                cls_desktop: mobile.cls || 0,
                inp_desktop: mobile.inp || 0,
                lcp_mobile: mobile.lcp || 0,
                cls_mobile: mobile.cls || 0,
                inp_mobile: mobile.inp || 0,
                keywords: rawData.seo?.organic_results || [],
                total_results: rawData.seo?.total_results || 0,
                industry_trends: rawData.insights?.sources || [],
                market_insights: rawData.insights?.answer || '',
                competitor_analysis: rawData.competitors || [],
                executive_summary: aiAnalysis.executive_summary,
                brand_voice_analysis: aiAnalysis.brand_voice_analysis,
                cta_analysis: aiAnalysis.cta_analysis,
                swot_analysis: aiAnalysis.market_intelligence?.swot,
                competitive_gap: aiAnalysis.market_intelligence?.competitive_gap,
                competitive_edge: aiAnalysis.market_intelligence?.winning_strategies,
                ux_friction_points: aiAnalysis.ux_friction_points,
                content_gaps: aiAnalysis.content_gaps,
                strategic_recommendations: aiAnalysis.strategic_recommendations,
                security_score: rawData.security?.security_score || 0,
                ssl_valid: rawData.security?.ssl_valid || false,
                security_headers: rawData.security?.security_headers || {},
                broken_links: rawData.security?.broken_links || [],
                crawl_data: rawData.crawlData || [],
                pages_crawled: rawData.crawlData?.length || 0,
                pagespeed_available: desktop.available ?? false
            }

            const { error: insertError } = await supabase.from('audit_results').insert(resultsPayload).select()
            if (insertError) throw new Error(`Failed to store audit results: ${insertError.message}`)

            console.log(`[${auditId}] Successfully inserted results.`)

            await supabase.from('audits').update({
                status: 'complete',
                progress: 100,
                progress_label: 'Audit completed successfully!',
                completed_at: new Date().toISOString()
            }).eq('id', auditId)
        }

        if (msgId) {
            await supabase.rpc('acknowledge_audit_message', { p_msg_id: msgId })
        }
        console.log(`[${auditId}] Stage ${stage} completed successfully.`)

    } catch (err: any) {
        console.error(`[${auditId}] Audit stage ${stage} failed: ${err.message}`)
        try {
            await supabase.from('audits').update({
                status: 'failed',
                error_message: err.message,
                progress_label: 'Audit failed',
                progress: 0
            }).eq('id', auditId)
        } catch (updateErr) {
            console.error(`[${auditId}] Failed to update audit status:`, updateErr)
        }
    }
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const body = await req.json()
        const payload = body.record?.message || body
        const { url, auditId, stage = 'collection', msg_id } = payload
        const domain = new URL(url).hostname

        console.log(`[${auditId}] Received stage: ${stage} for ${url}`)

        EdgeRuntime.waitUntil(processAuditStage(supabase, url, auditId, stage, domain, msg_id || null))

        return new Response(JSON.stringify({ success: true, stage }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (err: any) {
        console.error(`Audit request parse failed: ${err.message}`)
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})
