import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, Cell } from 'recharts';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const PerformanceTab = ({ results }: { results: any }) => {
    if (!results) return <div className="text-sm text-muted-foreground">No performance data available.</div>;

    const getStatus = (metric: string, value: number) => {
        const thresholds: Record<string, { good: number; poor: number }> = {
            lcp: { good: 2.5, poor: 4 },
            cls: { good: 0.1, poor: 0.25 },
            inp: { good: 200, poor: 500 }
        };
        const t = thresholds[metric];
        if (!t) return { status: 'good', color: '#22c55e', percent: 100 };
        if (value <= t.good) return { status: 'good', color: '#22c55e', percent: 100 - (value / t.poor * 50) };
        if (value <= t.poor) return { status: 'needs-improvement', color: '#eab308', percent: 50 };
        return { status: 'poor', color: '#ef4444', percent: 20 };
    };

    const metrics = [
        {
            key: 'lcp',
            label: 'LCP',
            fullLabel: 'Largest Contentful Paint',
            value: results.lcp_desktop,
            unit: 's',
            description: 'Largest Contentful Paint measures when the largest content element becomes visible. Target: Under 2.5s.'
        },
        {
            key: 'cls',
            label: 'CLS',
            fullLabel: 'Cumulative Layout Shift',
            value: results.cls_desktop,
            unit: '',
            description: 'Cumulative Layout Shift measures visual stability. It quantifies how much content unexpectedly shifts.'
        },
        {
            key: 'inp',
            label: 'INP',
            fullLabel: 'Interaction to Next Paint',
            value: results.inp_desktop,
            unit: 'ms',
            description: 'Interaction to Next Paint measures how quickly the page responds to user interactions like clicks.'
        }
    ];

    // Score breakdown data
    const scoreData = [
        { name: 'Performance', value: results.performance_score || 0 },
        { name: 'Accessibility', value: results.accessibility_score || 0 },
        { name: 'Best Practices', value: results.best_practices_score || 0 }
    ];

    return (
        <div className="space-y-6">
            {results.used_heuristic && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-200">On-Page Heuristic Analysis</p>
                        <p className="text-xs text-blue-200/60 leading-relaxed">
                            Google PageSpeed Insights could not be reached. We've performed a deep on-page technical analysis to provide these estimated scores based on your site's structure and assets.
                        </p>
                    </div>
                </div>
            )}

            {!results.used_heuristic && results.pagespeed_available === false && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-yellow-200">PageSpeed Data Unavailable</p>
                        <p className="text-xs text-yellow-200/60 leading-relaxed">
                            Google PageSpeed Insights could not retrieve metrics for this site. This often happens if the site is behind a firewall, blocks Google's crawlers, or is extremely slow to respond.
                        </p>
                    </div>
                </div>
            )}

            {/* Core Web Vitals with Radial Charts */}
            <TooltipProvider>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {metrics.map((m, i) => {
                        const { color, percent } = getStatus(m.key, m.value);
                        const chartData = [{ name: m.label, value: percent, fill: color }];

                        return (
                            <div key={i} className="bg-card border border-white/[0.06] rounded-lg p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                                                {m.fullLabel}
                                                <Info className="w-3 h-3 opacity-50" />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[200px] text-[11px]">
                                            {m.description}
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="h-32 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="70%"
                                            outerRadius="100%"
                                            barSize={8}
                                            data={chartData}
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            <RadialBar
                                                background={{ fill: 'rgba(255,255,255,0.06)' }}
                                                dataKey="value"
                                                cornerRadius={10}
                                            />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-semibold text-white tabular-nums">
                                            {m.value ? (
                                                m.key === 'inp' ? Number(m.value).toFixed(0) :
                                                    m.key === 'cls' ? Number(m.value).toFixed(3) :
                                                        Number(m.value).toFixed(2)
                                            ) : "-"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{m.unit}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </TooltipProvider>

            {/* Score Breakdown Bar Chart */}
            <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                <h3 className="text-sm font-medium text-white mb-4">Score Breakdown</h3>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreData} layout="vertical">
                            <XAxis type="number" domain={[0, 100]} hide />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                {scoreData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.value >= 90 ? '#22c55e' : entry.value >= 50 ? '#eab308' : '#ef4444'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                    {scoreData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{item.name}</span>
                                {results.used_heuristic && (item.name === 'Performance' || item.name === 'SEO') && (
                                    <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Estimated</span>
                                )}
                            </div>
                            <span className="font-medium text-white">{Math.round(Number(item.value))}/100</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Optimization Opportunities</h3>
                    <div className="space-y-3">
                        {results.strategic_recommendations?.slice(0, 3).map((rec: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-white">{rec.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                                </div>
                            </div>
                        ))}
                        {(!results.strategic_recommendations || results.strategic_recommendations.length === 0) && (
                            <p className="text-sm text-muted-foreground">No specific recommendations. Your site is performing well.</p>
                        )}
                    </div>
                </div>

                {/* Technical Inventory */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Technical Inventory</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Payload Size</p>
                            <p className="text-lg font-semibold text-white">{results.technical_performance?.htmlSizeKb || "?"} KB <span className="text-[10px] font-normal text-muted-foreground">HTML</span></p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Server Response</p>
                            <p className="text-lg font-semibold text-white">{(results.technical_performance?.ttfb || 0).toFixed(2)}s <span className="text-[10px] font-normal text-muted-foreground">TTFB</span></p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Assets</p>
                            <div className="flex gap-3 mt-1">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-white">{results.technical_performance?.scriptCount || 0}</p>
                                    <p className="text-[8px] text-muted-foreground uppercase">JS</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-white">{results.technical_performance?.styleCount || 0}</p>
                                    <p className="text-[8px] text-muted-foreground uppercase">CSS</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-white">{results.technical_performance?.imageCount || 0}</p>
                                    <p className="text-[8px] text-muted-foreground uppercase">IMG</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Modern Standards</p>
                            <div className="flex flex-col gap-1.5 mt-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${results.technical_performance?.hasCompression ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-[10px] text-white/80">Compression</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${results.technical_performance?.hasModernImages ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-[10px] text-white/80">WebP/AVIF</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
