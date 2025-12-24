import { ExternalLink } from "lucide-react";

export const IntelligenceTab = ({ results }: { results: any }) => {
    if (!results) return <div className="text-sm text-muted-foreground">No intelligence data available.</div>;

    return (
        <div className="space-y-6">
            {/* Market Intelligence Summary */}
            <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                <h3 className="text-sm font-medium text-white mb-3">Market Intelligence</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {results.market_insights || "Generating niche-specific insights..."}
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Brand Voice & CTA */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Brand Voice & CTA</h3>
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">Brand Consistency</span>
                            <p className="text-sm text-white/80">{results.brand_voice_analysis || "Analyzing tone and voice..."}</p>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">Conversion Check</span>
                            <p className="text-sm text-white/80">{results.cta_analysis || "Evaluating calls to action..."}</p>
                        </div>
                    </div>
                </div>

                {/* Industry Trends */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Industry Trends</h3>
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
