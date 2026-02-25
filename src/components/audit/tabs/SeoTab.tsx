import { ExternalLink, Info } from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { cn } from "@/lib/utils";

export const SeoTab = ({ results }: { results: any }) => {
    if (!results) return <div className="text-sm text-muted-foreground">No SEO data available.</div>;

    // Keyword visibility data for chart
    const keywordData = results.keywords?.slice(0, 8).map((k: any, i: number) => ({
        name: k.title.split(' ').slice(0, 2).join(' '),
        rank: 10 - i,
        actualRank: i + 1
    })) || [];

    return (
        <div className="space-y-6">
            {results.used_heuristic && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-200">On-Page SEO Analysis</p>
                        <p className="text-xs text-blue-200/60 leading-relaxed">
                            Complete SERP data was unavailable. This score is an estimate based on our internal technical analysis of on-page factors like meta tags, content depth, and semantic structure.
                        </p>
                    </div>
                </div>
            )}
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden border border-white/[0.06]">
                <div className="bg-card p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground block">SEO Score</span>
                        {results.used_heuristic && (
                            <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Estimated</span>
                        )}
                    </div>
                    <span className="text-2xl font-semibold text-white tabular-nums">{results.seo_score ?? "-"}</span>
                </div>
                <div className="bg-card p-5">
                    <span className="text-xs text-muted-foreground block mb-1">Indexed Pages</span>
                    <span className="text-2xl font-semibold text-white tabular-nums">{results.total_results || results.keywords?.length || 0}</span>
                </div>
                <div className="bg-card p-5">
                    <span className="text-xs text-muted-foreground block mb-1">Target Keywords</span>
                    <span className="text-2xl font-semibold text-white tabular-nums">{results.strategic_keywords?.length || 0}</span>
                </div>
                <div className="bg-card p-5">
                    <span className="text-xs text-muted-foreground block mb-1">Content Gaps</span>
                    <span className="text-2xl font-semibold text-white tabular-nums">{results.content_gaps?.length || 0}</span>
                </div>
            </div>

            {/* Visibility Chart */}
            {keywordData.length > 0 && (
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white">Search Presence Visibility</h3>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium bg-white/[0.03] px-2 py-0.5 rounded">Based on site index</span>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={keywordData}>
                                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-card border border-white/[0.1] p-2 rounded text-xs">
                                                    <p className="font-medium text-white">{payload[0].payload.name}</p>
                                                    <p className="text-muted-foreground">Global Rank: #{payload[0].payload.actualRank}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="rank" radius={[4, 4, 0, 0]}>
                                    {keywordData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={`rgba(255,255,255,${0.2 + (entry.rank / 10) * 0.6})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Index Presence */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Index Presence</h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                        {results.keywords?.map((k: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white">{k.title}</p>
                                    <p className="text-[10px] text-muted-foreground">{k.link}</p>
                                </div>
                                <span className="text-[10px] bg-white/[0.06] px-2 py-1 rounded text-muted-foreground ml-3 shrink-0">#{i + 1}</span>
                            </div>
                        ))}
                        {!results.keywords?.length && (
                            <p className="text-sm text-muted-foreground">No indexing data found.</p>
                        )}
                    </div>
                </div>

                {/* Technical SEO & Structure */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white">Technical SEO & Structure</h3>
                        <div className="flex gap-2">
                            <span className="text-[9px] bg-white/[0.04] px-1.5 py-0.5 rounded text-muted-foreground uppercase">{results.technical_seo?.lang || "N/A"}</span>
                            <span className="text-[9px] bg-white/[0.04] px-1.5 py-0.5 rounded text-muted-foreground uppercase">{results.technical_seo?.charset || "UTF-8"}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Content Depth</p>
                            <p className="text-lg font-semibold text-white">{results.technical_seo?.wordCount?.toLocaleString() || 0} <span className="text-[10px] font-normal text-muted-foreground">WORDS</span></p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Headings</p>
                            <div className="flex gap-4 mt-1">
                                <div className="text-center">
                                    <p className={`text-xs font-bold ${results.technical_seo?.h1Count === 1 ? 'text-green-400' : 'text-yellow-500'}`}>{results.technical_seo?.h1Count || 0}</p>
                                    <p className="text-[8px] text-muted-foreground uppercase">H1</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-white">{results.technical_seo?.imgAltCount || 0}</p>
                                    <p className="text-[8px] text-muted-foreground uppercase">Alt Tags</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {[
                            { label: "OG Tags", value: results.technical_seo?.hasOgTags },
                            { label: "Twitter Cards", value: results.technical_seo?.hasTwitterTags },
                            { label: "Canonical URL", value: !!results.technical_seo?.canonical },
                            { label: "Favicon", value: results.technical_seo?.hasFavicon },
                            { label: "Viewport Meta", value: results.technical_seo?.hasViewport },
                            { label: "Schema (JSON-LD)", value: results.technical_seo?.hasJSONLD },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.02] last:border-0">
                                <span className="text-muted-foreground">{item.label}</span>
                                <div className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight",
                                    item.value ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                )}>
                                    {item.value ? "Detect" : "Missing"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Target Keywords (AI Recommendations) */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Target Keywords</h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                        {(results.seo_analysis?.strategic_keywords || results.strategic_keywords)?.map((item: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1 py-2 border-b border-white/[0.04] last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium text-white/90">{typeof item === 'string' ? item : item.keyword}</p>
                                </div>
                                {item.intent && (
                                    <div className="flex gap-2 pl-4">
                                        <span className="text-[9px] text-blue-400/60 uppercase font-bold tracking-widest">{item.intent}</span>
                                        {item.rationale && <span className="text-[9px] text-muted-foreground italic">— {item.rationale}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                        {(!results.strategic_keywords?.length && !results.seo_analysis?.strategic_keywords?.length) && (
                            <p className="text-sm text-muted-foreground">Generating high-leverage keywords...</p>
                        )}
                    </div>
                </div>

                {/* Content Gaps */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Content Strategy Gaps</h3>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto">
                        {(results.seo_analysis?.content_gaps || results.content_gaps || []).map((gap: any, i: number) => (
                            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] group hover:bg-white/[0.04] transition-all">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-medium text-white">{typeof gap === 'string' ? 'Observation' : gap.topic}</p>
                                    {gap.estimated_difficulty && (
                                        <span className={cn(
                                            "text-[8px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded",
                                            gap.estimated_difficulty === 'Low' ? "bg-green-500/10 text-green-400" :
                                                gap.estimated_difficulty === 'Medium' ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-400"
                                        )}>
                                            {gap.estimated_difficulty}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {typeof gap === 'string' ? gap : gap.advice}
                                </p>
                                {gap.search_intent && (
                                    <p className="text-[9px] text-blue-400/50 font-bold uppercase tracking-widest mt-2">{gap.search_intent}</p>
                                )}
                            </div>
                        ))}
                        {(!results.content_gaps || (results.content_gaps.length === 0 && !results.seo_analysis?.content_gaps?.length)) && (
                            <p className="text-sm text-muted-foreground">Identifying strategic content opportunities...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
