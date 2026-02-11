import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuditList } from "@/components/dashboard/AuditList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Globe, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useState } from "react";
import { toast } from "sonner";
import { ComparisonModal } from "@/components/dashboard/ComparisonModal";
import { Swords } from "lucide-react";

export default function Dashboard() {
    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

    const { data: stats, isLoading } = useQuery({
        queryKey: ["audits-stats"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audits")
                .select('status');

            if (error) throw error;

            const total = data?.length || 0;
            const complete = data?.filter(a => a.status === 'complete').length || 0;
            const failed = data?.filter(a => a.status === 'failed').length || 0;
            const pending = total - complete - failed;

            return {
                total,
                complete,
                pending,
                failed,
                chartData: [
                    { name: 'Successful', value: complete, color: 'rgba(255,255,255,0.8)' },
                    { name: 'Pending', value: pending, color: 'rgba(255,255,255,0.3)' },
                    { name: 'Failed', value: failed, color: 'rgba(239,68,68,0.7)' }
                ].filter(d => d.value > 0)
            };
        },
        refetchInterval: (query) => {
            const data = query.state.data as any;
            if (data && data.pending > 0) {
                return 5000;
            }
            return false;
        }
    });

    const handleStartAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        let formattedUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            formattedUrl = `https://${url}`;
        }

        try {
            new URL(formattedUrl);
        } catch (e) {
            toast.error("Please enter a valid URL (e.g., example.com)");
            return;
        }

        setIsSubmitting(true);

        try {
            const domain = new URL(formattedUrl).hostname;
            const { data: auditId, error: rpcError } = await supabase.rpc('enqueue_audit', {
                p_url: formattedUrl,
                p_domain: domain
            });

            if (rpcError) throw rpcError;

            toast.success("Audit started!");
            setUrl("");
            navigate(`/audit/${auditId}`);
        } catch (error: any) {
            console.error("Error starting audit:", error);
            toast.error(error.message || "Failed to start audit");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="relative min-h-screen">
                {/* Subtle Background Gradient */}
                <div className="absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.06),transparent)] pointer-events-none" />

                <div className="relative z-10 p-6 md:p-8 space-y-8 max-w-6xl">
                    {/* Header - Linear style */}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Monitor your site audits and performance metrics.</p>
                    </div>

                    {/* New Audit Form */}
                    <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                        <h3 className="text-sm font-medium text-white mb-3">Start New Audit</h3>
                        <form onSubmit={handleStartAudit} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                {faviconUrl ? (
                                    <img
                                        src={faviconUrl}
                                        alt=""
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm"
                                        onError={() => setFaviconUrl(null)}
                                    />
                                ) : (
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                )}
                                <Input
                                    type="text"
                                    placeholder="Enter website URL (e.g., example.com)"
                                    className="pl-9 bg-white/[0.02] border-white/[0.06]"
                                    value={url}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setUrl(val);
                                        // Simple domain extraction for favicon preview
                                        if (val.includes('.')) {
                                            try {
                                                const urlToParse = val.startsWith('http') ? val : `https://${val}`;
                                                const hostname = new URL(urlToParse).hostname;
                                                if (hostname && hostname.includes('.')) {
                                                    setFaviconUrl(`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`);
                                                }
                                            } catch (err) {
                                                // Invalid URL while typing, keep previous or clear
                                            }
                                        } else if (!val) {
                                            setFaviconUrl(null);
                                        }
                                    }}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <Button type="submit" disabled={isSubmitting || !url}>
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Run Audit <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                            <div className="hidden sm:block border-l border-white/[0.06] mx-1" />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCompareModalOpen(true)}
                                className="border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5"
                            >
                                <Swords className="w-4 h-4 mr-2 text-blue-400" />
                                Battle Mode
                            </Button>
                        </form>
                    </div>

                    <ComparisonModal
                        isOpen={isCompareModalOpen}
                        onClose={() => setIsCompareModalOpen(false)}
                    />

                    {/* Stats Grid - Linear style with gap-px */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden border border-white/[0.06]">
                        {[
                            { label: "Total Audits", value: stats?.total },
                            { label: "Completed", value: stats?.complete },
                            { label: "Pending", value: stats?.pending },
                            { label: "Failed", value: stats?.failed }
                        ].map((metric, i) => (
                            <div key={i} className="bg-card p-5 flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">{metric.label}</span>
                                <span className="text-2xl font-semibold text-white tabular-nums">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (metric.value ?? 0)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                        <h3 className="text-sm font-medium text-white mb-4">Report Distribution</h3>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {/* Donut Chart with center label */}
                            <div className="h-[120px] w-[120px] relative shrink-0">
                                {isLoading ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats?.chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={35}
                                                    outerRadius={50}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {stats?.chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(0,0,0,0.9)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '6px',
                                                        fontSize: '12px'
                                                    }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center percentage */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <span className="text-xl font-semibold text-white">
                                                    {stats?.total ? Math.round((stats.complete / stats.total) * 100) : 0}%
                                                </span>
                                                <span className="block text-[10px] text-muted-foreground">Success</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right side content */}
                            <div className="flex-1 space-y-4">
                                {/* Legend */}
                                <div className="space-y-2">
                                    {stats?.chartData.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                                <span className="text-sm text-muted-foreground">{d.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white">{d.value}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({stats?.total ? Math.round((d.value / stats.total) * 100) : 0}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-white/[0.06]" />

                                {/* Insights */}
                                <div className="space-y-2">
                                    <span className="text-xs text-muted-foreground">Insights</span>
                                    {stats?.pending && stats.pending > 0 ? (
                                        <p className="text-xs text-muted-foreground">
                                            <span className="text-yellow-400">{stats.pending}</span> audits are still processing. Results will be ready soon.
                                        </p>
                                    ) : stats?.complete && stats.complete > 0 ? (
                                        <p className="text-xs text-muted-foreground">
                                            All audits completed! View your reports in the list below.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            Start your first audit to see insights here.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audit History */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-white">Recent Audits</h2>
                        <AuditList />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
