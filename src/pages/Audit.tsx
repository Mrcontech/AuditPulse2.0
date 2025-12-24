import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Download,
    ExternalLink,
    Loader2,
    AlertCircle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PerformanceTab } from "@/components/audit/tabs/PerformanceTab";
import { SeoTab } from "@/components/audit/tabs/SeoTab";
import { SecurityTab } from "@/components/audit/tabs/SecurityTab";
import { IntelligenceTab } from "@/components/audit/tabs/IntelligenceTab";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AuditPDFReport } from "@/components/audit/AuditPDFReport";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function Audit() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const [isRetrying, setIsRetrying] = useState(false);

    const { data: audit, isLoading: isAuditLoading } = useQuery({
        queryKey: ["audit", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audits")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        refetchInterval: (data) => {
            if (data && (data.status === 'pending' || data.status === 'crawling' || data.status === 'analyzing')) {
                return 5000;
            }
            return false;
        }
    });

    const { data: results, isLoading: isResultsLoading } = useQuery({
        queryKey: ["audit-results", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audit_results")
                .select("*")
                .eq("audit_id", id)
                .single();
            return data || null;
        },
        enabled: !!audit && audit.status === "complete",
    });

    const handleRetry = async () => {
        if (!audit) return;
        setIsRetrying(true);
        try {
            const { error: updateError } = await supabase
                .from('audits')
                .update({ status: 'pending', progress: 0, error_message: null })
                .eq('id', id);

            if (updateError) throw updateError;

            const { error: rpcError } = await supabase.rpc('enqueue_audit', {
                p_url: audit.url,
                p_domain: audit.domain
            });

            if (rpcError) throw rpcError;
        } catch (error: any) {
            console.error("Retry failed:", error);
        } finally {
            setIsRetrying(false);
        }
    };

    if (isAuditLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        );
    }

    if (!audit) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                    <h1 className="text-xl font-semibold">Audit not found</h1>
                    <p className="text-muted-foreground mb-6 text-sm">The audit you're looking for doesn't exist or you don't have access.</p>
                    <Button asChild variant="outline"><Link to="/dashboard">Back to Dashboard</Link></Button>
                </div>
            </DashboardLayout>
        );
    }

    const isPending = audit.status !== "complete" && audit.status !== "failed";

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 space-y-8 max-w-6xl">
                {/* Header - Linear style minimal */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-white transition-colors text-sm">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-white tracking-tight">{audit.domain}</h1>
                            <span className={cn(
                                "px-2 py-0.5 rounded text-xs font-medium",
                                audit.status === "complete"
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-white/5 text-muted-foreground"
                            )}>
                                {audit.status}
                            </span>
                        </div>
                        <a href={audit.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                            {audit.url}
                        </a>
                    </div>

                    {results && (
                        <PDFDownloadLink
                            document={<AuditPDFReport audit={audit} results={results} />}
                            fileName={`audit-${audit.domain}.pdf`}
                        >
                            {({ loading }) => (
                                <Button variant="outline" size="sm" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                    Export PDF
                                </Button>
                            )}
                        </PDFDownloadLink>
                    )}
                </div>

                {isPending ? (
                    <div className="border border-white/[0.06] rounded-lg p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Analyzing...</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            Crawling your site and calculating metrics. This usually takes 1-2 minutes.
                        </p>
                        <div className="mt-6 max-w-xs mx-auto bg-white/[0.04] h-1 rounded-full overflow-hidden">
                            <div className="bg-white/40 h-full transition-all duration-500" style={{ width: `${audit.progress || 10}%` }} />
                        </div>
                    </div>
                ) : audit.status === 'failed' ? (
                    <div className="border border-destructive/20 rounded-lg p-12 text-center">
                        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Analysis Failed</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{audit.error_message || "An unexpected error occurred."}</p>
                        <Button variant="outline" onClick={handleRetry} disabled={isRetrying}>
                            {isRetrying && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Retry
                        </Button>
                    </div>
                ) : (
                    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        {/* Linear-style underline tabs - scrollable on mobile */}
                        <TabsList className="bg-transparent p-0 h-auto border-b border-white/[0.06] w-full flex gap-0 overflow-x-auto">
                            <TabsTrigger value="overview" className="px-3 sm:px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:text-white text-muted-foreground text-xs sm:text-sm font-medium transition-colors hover:text-white/80 -mb-px whitespace-nowrap">Overview</TabsTrigger>
                            <TabsTrigger value="performance" className="px-3 sm:px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:text-white text-muted-foreground text-xs sm:text-sm font-medium transition-colors hover:text-white/80 -mb-px whitespace-nowrap">Performance</TabsTrigger>
                            <TabsTrigger value="seo" className="px-3 sm:px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:text-white text-muted-foreground text-xs sm:text-sm font-medium transition-colors hover:text-white/80 -mb-px whitespace-nowrap">SEO</TabsTrigger>
                            <TabsTrigger value="security" className="px-3 sm:px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:text-white text-muted-foreground text-xs sm:text-sm font-medium transition-colors hover:text-white/80 -mb-px whitespace-nowrap">Security</TabsTrigger>
                            <TabsTrigger value="intelligence" className="px-3 sm:px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:text-white text-muted-foreground text-xs sm:text-sm font-medium transition-colors hover:text-white/80 -mb-px whitespace-nowrap">Intelligence</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 outline-none">
                            {/* Scores Grid - Linear style */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden border border-white/[0.06]">
                                {[
                                    { label: "Performance", value: results?.performance_score },
                                    { label: "SEO", value: results?.seo_score },
                                    { label: "Security", value: results?.security_score },
                                    { label: "Pages Crawled", value: results?.pages_crawled }
                                ].map((metric, i) => (
                                    <div key={i} className="bg-card p-5 flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">{metric.label}</span>
                                        <span className="text-2xl font-semibold text-white tabular-nums">{metric.value ?? "—"}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Score Bars + Radar Chart */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Score Bars */}
                                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                                    <h3 className="text-sm font-medium text-white mb-4">Score Breakdown</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Performance", value: results?.performance_score || 0, color: "bg-green-500" },
                                            { label: "SEO", value: results?.seo_score || 0, color: "bg-blue-500" },
                                            { label: "Security", value: results?.security_score || 0, color: "bg-purple-500" }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-1.5">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{item.label}</span>
                                                    <span className="font-medium text-white">{item.value}/100</span>
                                                </div>
                                                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                                        style={{ width: `${item.value}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">Load Time</span>
                                            <span className="text-lg font-semibold text-white">{results?.load_time ? `${results.load_time}s` : "—"}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">Blocking</span>
                                            <span className="text-lg font-semibold text-white">{results?.total_blocking_time ? `${results.total_blocking_time}ms` : "—"}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">CLS</span>
                                            <span className="text-lg font-semibold text-white">{results?.cumulative_layout_shift ?? "—"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Radar Chart */}
                                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                                    <h3 className="text-sm font-medium text-white mb-4">Score Distribution</h3>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                                { subject: 'Performance', A: results?.performance_score || 0 },
                                                { subject: 'SEO', A: results?.seo_score || 0 },
                                                { subject: 'Security', A: results?.security_score || 0 },
                                            ]}>
                                                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                                                <Radar dataKey="A" stroke="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.1)" strokeWidth={2} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Executive Summary */}
                            <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                                <h3 className="text-sm font-medium text-white mb-3">Executive Summary</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {results?.executive_summary || "Analysis complete. Review the individual tabs for detailed insights on performance metrics, SEO opportunities, security posture, and AI-powered recommendations."}
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="performance" className="outline-none">
                            <PerformanceTab results={results} />
                        </TabsContent>

                        <TabsContent value="seo" className="outline-none">
                            <SeoTab results={results} />
                        </TabsContent>

                        <TabsContent value="security" className="outline-none">
                            <SecurityTab results={results} />
                        </TabsContent>

                        <TabsContent value="intelligence" className="outline-none">
                            <IntelligenceTab results={results} />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </DashboardLayout>
    );
}
