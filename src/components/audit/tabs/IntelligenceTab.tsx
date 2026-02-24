import { ExternalLink, TrendingUp, Target, AlertTriangle, Lightbulb, Users, ShieldAlert } from "lucide-react";

export const IntelligenceTab = ({ results }: { results: any }) => {
    if (!results) return <div className="text-sm text-muted-foreground">No strategic data available.</div>;

    const swot = results.competitive_edge?.swot || results.swot_analysis || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
    const edge = results.competitive_edge || {};
    const positioning = results.market_positioning || {};

    return (
        <div className="space-y-6">
            {/* Market Intelligence Summary */}
            <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-medium text-white">Strategic Market Intelligence</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {results.market_insights || positioning.category_design || "Generating niche-specific insights..."}
                </p>
                {(edge.blue_ocean_opportunity || results.market_gap) && (
                    <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-md">
                        <span className="text-xs font-medium text-blue-400 block mb-1">Blue Ocean Opportunity</span>
                        <p className="text-xs text-white/80">{edge.blue_ocean_opportunity || results.market_gap}</p>
                    </div>
                )}
            </div>

            {/* SWOT Analysis */}
            {swot && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border border-white/[0.06] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-green-400" />
                            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Strengths</h4>
                        </div>
                        <ul className="space-y-2">
                            {swot.strengths?.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-card border border-white/[0.06] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Weaknesses</h4>
                        </div>
                        <ul className="space-y-2">
                            {swot.weaknesses?.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-card border border-white/[0.06] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-blue-400" />
                            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Opportunities</h4>
                        </div>
                        <ul className="space-y-2">
                            {swot.opportunities?.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-card border border-white/[0.06] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldAlert className="w-4 h-4 text-red-400" />
                            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Threats</h4>
                        </div>
                        <ul className="space-y-2">
                            {swot.threats?.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Competitive Landscape */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-medium text-white">Top Competitors — Intelligence Briefs</h3>
                    </div>
                    <div className="space-y-4">
                        {results.competitor_analysis?.map((comp: any, i: number) => {
                            const tierColors: Record<string, string> = {
                                budget: "bg-gray-500/20 text-gray-300 border-gray-500/30",
                                "mass-market": "bg-slate-500/20 text-slate-300 border-slate-500/30",
                                "mid-market": "bg-blue-500/20 text-blue-300 border-blue-500/30",
                                premium: "bg-purple-500/20 text-purple-300 border-purple-500/30",
                                luxury: "bg-amber-500/20 text-amber-300 border-amber-500/30",
                                enterprise: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
                            };
                            const tier = comp.positioning_tier?.toLowerCase() || "unknown";
                            const tierClass = tierColors[tier] || "bg-white/10 text-white/60 border-white/10";

                            return (
                                <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-3">
                                    {/* Header: Name + URL + Tier Badge */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-white">{comp.name}</span>
                                                {comp.positioning_tier && comp.positioning_tier !== "unknown" && (
                                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${tierClass}`}>
                                                        {comp.positioning_tier}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {comp.url && (
                                            <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors shrink-0">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Value Proposition */}
                                    {comp.value_proposition && (
                                        <div className="pl-3 border-l-2 border-blue-500/40">
                                            <p className="text-xs text-blue-200/90 italic leading-relaxed">"{comp.value_proposition}"</p>
                                        </div>
                                    )}

                                    {/* Fallback: old format description */}
                                    {!comp.value_proposition && comp.description && (
                                        <p className="text-xs text-muted-foreground">{comp.description}</p>
                                    )}

                                    {/* Intelligence Grid */}
                                    {(comp.narrative_moat || comp.exploitable_weakness || comp.target_audience) && (
                                        <div className="grid gap-2">
                                            {comp.narrative_moat && (
                                                <div className="flex items-start gap-2 p-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
                                                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-0.5">Narrative Moat</span>
                                                        <p className="text-xs text-white/75 leading-relaxed">{comp.narrative_moat}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {comp.exploitable_weakness && (
                                                <div className="flex items-start gap-2 p-2.5 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                                                    <Target className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-0.5">Exploitable Weakness</span>
                                                        <p className="text-xs text-white/75 leading-relaxed">{comp.exploitable_weakness}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {comp.target_audience && (
                                                <div className="flex items-start gap-2 p-2.5 bg-violet-500/5 border border-violet-500/15 rounded-lg">
                                                    <Users className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider block mb-0.5">Target Audience</span>
                                                        <p className="text-xs text-white/75 leading-relaxed">{comp.target_audience}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {(!results.competitor_analysis || results.competitor_analysis.length === 0) && (
                            <p className="text-sm text-muted-foreground">Researching competition landscape...</p>
                        )}
                    </div>
                    {(edge.vulnerability_analysis || results.competitive_gap) && (
                        <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded-md">
                            <span className="text-xs font-medium text-purple-400 block mb-1">Vulnerability Analysis</span>
                            <p className="text-xs text-white/80">{edge.vulnerability_analysis || results.competitive_gap}</p>
                        </div>
                    )}
                </div>

                {/* Industry Trends */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        < TrendingUp className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-medium text-white">Industry Trends</h3>
                    </div>
                    <div className="space-y-2">
                        {results.industry_trends?.map((trend: any, i: number) => (
                            <a
                                key={i}
                                href={trend.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white">{trend.title}</p>
                                    <p className="text-xs text-muted-foreground">{trend.url}</p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-2 shrink-0" />
                            </a>
                        ))}
                        {(!results.industry_trends || results.industry_trends.length === 0) && (
                            <p className="text-sm text-muted-foreground">Researching current market data...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
