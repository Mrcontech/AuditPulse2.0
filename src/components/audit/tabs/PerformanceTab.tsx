import { AlertTriangle, Info } from "lucide-react";
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
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="font-medium text-white">{Math.round(Number(item.value))}/100</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
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
        </div>
    );
};
