import { ExternalLink, TrendingUp, Target, AlertTriangle, Lightbulb, Users, ShieldAlert } from "lucide-react";

export const IntelligenceTab = ({ results }: { results: any }) => {
    if (!results) return <div className="text-sm text-muted-foreground">No strategic data available.</div>;

    const swot = results.swot_analysis;

    return (
        <div className="space-y-6">
            {/* Market Intelligence Summary */}
            <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-medium text-white">Strategic Growth Insights</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {results.market_insights || "Generating niche-specific insights..."}
                </p>
                {results.market_gap && (
                    <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-md">
                        <span className="text-xs font-medium text-blue-400 block mb-1">Winning Strategy</span>
                        <p className="text-xs text-white/80">{results.market_gap}</p>
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
                        <h3 className="text-sm font-medium text-white">Top Competitors</h3>
                    </div>
                    <div className="space-y-3">
                        {results.competitor_analysis?.map((comp: any, i: number) => (
                            <div key={i} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-white">{comp.name}</span>
                                    <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{comp.description}</p>
                            </div>
                        ))}
                        {(!results.competitor_analysis || results.competitor_analysis.length === 0) && (
                            <p className="text-sm text-muted-foreground">Researching competition landscape...</p>
                        )}
                    </div>
                    {results.competitive_gap && (
                        <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded-md">
                            <span className="text-xs font-medium text-purple-400 block mb-1">Competitive Gap</span>
                            <p className="text-xs text-white/80">{results.competitive_gap}</p>
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
                                    <p className="text-sm font-medium text-white truncate">{trend.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{trend.url}</p>
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
