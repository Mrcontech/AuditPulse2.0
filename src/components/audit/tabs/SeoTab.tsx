import { ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

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
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden border border-white/[0.06]">
                <div className="bg-card p-5">
                    <span className="text-xs text-muted-foreground block mb-1">SEO Score</span>
                    <span className="text-2xl font-semibold text-white tabular-nums">{results.seo_score ?? "—"}</span>
                </div>
                <div className="bg-card p-5">
                    <span className="text-xs text-muted-foreground block mb-1">Total Results</span>
                    <span className="text-2xl font-semibold text-white tabular-nums">{results.total_results?.toLocaleString() ?? "—"}</span>
                </div>
                <div className="bg-card p-5">
                    <span className="text-xs text-muted-foreground block mb-1">Keywords Found</span>
                    <span className="text-2xl font-semibold text-white tabular-nums">{results.keywords?.length ?? 0}</span>
                </div>
                <div className="bg-card p-5">
                    <span className="text-xs text-muted-foreground block mb-1">Content Gaps</span>
                    <span className="text-2xl font-semibold text-white tabular-nums">{results.content_gaps?.length ?? 0}</span>
                </div>
            </div>

            {/* Visibility Chart */}
            {keywordData.length > 0 && (
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Keyword Visibility</h3>
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
                                                    <p className="text-muted-foreground">Rank: #{payload[0].payload.actualRank}</p>
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
                {/* Keyword Rankings */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Keyword Rankings</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {results.keywords?.map((k: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white truncate">{k.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{k.link}</p>
                                </div>
                                <span className="text-xs bg-white/[0.06] px-2 py-1 rounded text-muted-foreground ml-3">#{i + 1}</span>
                            </div>
                        ))}
                        {!results.keywords?.length && (
                            <p className="text-sm text-muted-foreground">No keyword data found.</p>
                        )}
                    </div>
                </div>

                {/* Content Gaps */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Content Gaps</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {results.content_gaps?.map((gap: any, i: number) => (
                            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                <p className="text-sm font-medium text-white">{gap.topic}</p>
                                <p className="text-xs text-muted-foreground mt-1">{gap.advice}</p>
                            </div>
                        ))}
                        {(!results.content_gaps || results.content_gaps.length === 0) && (
                            <p className="text-sm text-muted-foreground">Analyzing competitive landscape...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
