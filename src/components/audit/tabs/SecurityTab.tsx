import { Lock, Unlock, CheckCircle, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

export const SecurityTab = ({ results }: { results: any }) => {
    if (!results) return <div className="text-sm text-muted-foreground">No security data available.</div>;

    const activeHeaders = results.security_headers ? Object.values(results.security_headers).filter(Boolean).length : 0;
    const totalHeaders = results.security_headers ? Object.keys(results.security_headers).length : 0;
    const missingHeaders = totalHeaders - activeHeaders;

    // Pie chart data for header health
    const headerChartData = [
        { name: 'Active', value: activeHeaders, fill: '#22c55e' },
        { name: 'Missing', value: missingHeaders, fill: '#ef4444' }
    ].filter(d => d.value > 0);

    // Score gauge data
    const scoreData = [{ name: 'Score', value: results.security_score || 0, fill: (results.security_score || 0) >= 80 ? '#22c55e' : (results.security_score || 0) >= 50 ? '#eab308' : '#ef4444' }];

    return (
        <div className="space-y-6">
            {/* Score Gauge and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Security Score Gauge */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <span className="text-xs text-muted-foreground block mb-2">Security Score</span>
                    <div className="h-32 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="70%"
                                outerRadius="100%"
                                barSize={10}
                                data={scoreData}
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
                            <span className={`text-3xl font-semibold ${(results.security_score ?? 0) >= 80 ? 'text-green-400' :
                                (results.security_score ?? 0) >= 50 ? 'text-yellow-400' : 'text-red-400'
                                }`}>{results.security_score ?? "-"}</span>
                            <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                    </div>
                </div>

                {/* SSL Status */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5 flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground block mb-3">SSL Status</span>
                    <div className="flex items-center gap-3">
                        {results.ssl_valid ? (
                            <>
                                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-green-400">Secure</p>
                                    <p className="text-xs text-muted-foreground">Valid SSL certificate</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <Unlock className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-red-400">Insecure</p>
                                    <p className="text-xs text-muted-foreground">Missing SSL certificate</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Header Health Pie */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <span className="text-xs text-muted-foreground block mb-2">Header Health</span>
                    <div className="h-32 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={headerChartData}
                                    innerRadius={35}
                                    outerRadius={50}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {headerChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-semibold text-white">{activeHeaders}</span>
                            <span className="text-xs text-muted-foreground">/{totalHeaders}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Security Headers */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Security Headers</h3>
                    <div className="space-y-2">
                        {results.security_headers && Object.entries(results.security_headers).map(([header, active]: [string, any]) => (
                            <div key={header} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                                <span className="text-xs font-mono text-muted-foreground">{header}</span>
                                {active ? (
                                    <div className="flex items-center gap-1 text-green-400">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span className="text-xs">Active</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span className="text-xs">Missing</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Broken Links */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Broken Links ({results.broken_links?.length ?? 0})</h3>
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {results.broken_links?.map((link: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 px-3 rounded bg-red-500/5 border border-red-500/10">
                                <span className="text-xs text-muted-foreground truncate flex-1">{link.url}</span>
                                <span className="text-xs text-red-400 ml-2">{link.status}</span>
                            </div>
                        ))}
                        {(!results.broken_links || results.broken_links.length === 0) && (
                            <div className="text-center py-6">
                                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No broken links detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
