import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Clock, History } from "lucide-react";
import { format } from "date-fns";

interface HistoryTabProps {
    history: any[];
}

export const HistoryTab = ({ history }: HistoryTabProps) => {
    if (!history || history.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-white/[0.06] rounded-lg">
                <History className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-white mb-2">Not enough data for trends</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    We need at least two audits of this domain to generate a progress chart.
                    Run another audit to see your improvement!
                </p>
            </div>
        );
    }

    const chartData = history.map((item) => ({
        date: format(new Date(item.audits.created_at), "MMM d, HH:mm"),
        Performance: item.performance_score || 0,
        SEO: item.seo_score || 0,
        Security: item.security_score || 0,
    }));

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];

    const calculateChange = (current: number, prev: number) => {
        const diff = current - prev;
        return {
            value: Math.abs(diff),
            isPositive: diff >= 0
        };
    };

    const performanceChange = calculateChange(latest.performance_score, previous.performance_score);
    const seoChange = calculateChange(latest.seo_score, previous.seo_score);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-white/[0.06] rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Performance Growth</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-white">{latest.performance_score}</span>
                            <span className={`text-xs font-medium flex items-center gap-0.5 ${performanceChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {performanceChange.isPositive ? '+' : '-'}{performanceChange.value} pts
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                </div>

                <div className="bg-card border border-white/[0.06] rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">SEO Improvement</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-white">{latest.seo_score}</span>
                            <span className={`text-xs font-medium flex items-center gap-0.5 ${seoChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {seoChange.isPositive ? '+' : '-'}{seoChange.value} pts
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-card border border-white/[0.06] rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />

                <div className="flex items-center gap-2 mb-8 relative z-10">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-medium text-white">Historical Performance Trend</h3>
                </div>

                <div className="h-[350px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="date"
                                stroke="rgba(255,255,255,0.3)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.3)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0A0A0A',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}
                                itemStyle={{ padding: '2px 0' }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Line
                                type="monotone"
                                dataKey="Performance"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#000' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="SEO"
                                stroke="#a855f7"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#000' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Security"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#000' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
