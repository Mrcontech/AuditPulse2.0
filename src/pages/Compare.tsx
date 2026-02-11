import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2, ArrowLeft, Swords, Trophy, Minus, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Compare() {
    const { id1, id2 } = useParams();

    const fetchResults = async (auditId: string) => {
        const { data: audit, error: auditErr } = await supabase
            .from("audits")
            .select("*")
            .eq("id", auditId)
            .single();
        if (auditErr) throw auditErr;

        const { data: results, error: resultsErr } = await supabase
            .from("audit_results")
            .select("*")
            .eq("audit_id", auditId)
            .single();
        if (resultsErr) throw resultsErr;

        return { ...audit, results };
    };

    const { data: audit1, isLoading: isLoading1 } = useQuery({
        queryKey: ["audit-full", id1],
        queryFn: () => fetchResults(id1!),
        enabled: !!id1,
    });

    const { data: audit2, isLoading: isLoading2 } = useQuery({
        queryKey: ["audit-full", id2],
        queryFn: () => fetchResults(id2!),
        enabled: !!id2,
    });

    if (isLoading1 || isLoading2) {
        return (
            <DashboardLayout>
                <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        );
    }

    if (!audit1 || !audit2) {
        return (
            <DashboardLayout>
                <div className="p-12 text-center">
                    <p className="text-muted-foreground">Could not load one or both audits for comparison.</p>
                    <Button asChild className="mt-4"><Link to="/dashboard">Back to Dashboard</Link></Button>
                </div>
            </DashboardLayout>
        );
    }

    const ComparisonRow = ({ label, val1, val2, inverse = false }: { label: string, val1: any, val2: any, inverse?: boolean }) => {
        const isWinner1 = inverse ? val1 < val2 : val1 > val2;
        const isWinner2 = inverse ? val2 < val1 : val2 > val1;
        const isDraw = val1 === val2;

        return (
            <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-b border-white/[0.06] last:border-0 group">
                <div className="bg-card p-4 flex items-center text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {label}
                </div>
                <div className={`bg-card p-4 text-center transition-colors group-hover:bg-white/[0.01] ${isWinner1 ? 'text-blue-400 font-bold' : 'text-white/60'}`}>
                    <div className="flex items-center justify-center gap-2">
                        {val1 !== null ? val1 : "-"}
                        {isWinner1 && <Trophy className="w-3 h-3" />}
                    </div>
                </div>
                <div className={`bg-card p-4 text-center transition-colors group-hover:bg-white/[0.01] ${isWinner2 ? 'text-blue-400 font-bold' : 'text-white/60'}`}>
                    <div className="flex items-center justify-center gap-2">
                        {val2 !== null ? val2 : "-"}
                        {isWinner2 && <Trophy className="w-3 h-3" />}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="relative min-h-screen">
                <div className="absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.08),transparent)] pointer-events-none" />

                <div className="relative z-10 p-6 md:p-8 space-y-8 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-white transition-colors text-sm">
                                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
                                <Swords className="w-6 h-6 text-blue-400" />
                                Battle Mode
                            </h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 items-center">
                        <div className="bg-card p-6 rounded-2xl border border-white/[0.06] text-center space-y-2 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Challenger 1</p>
                            <h3 className="text-xl font-bold text-white truncate">{audit1.domain}</h3>
                            <div className="text-4xl font-black text-blue-400 pt-2">{audit1.results?.performance_score || 0}</div>
                        </div>

                        <div className="flex flex-col items-center justify-center opacity-40">
                            <span className="text-2xl font-black italic tracking-tighter">VS</span>
                        </div>

                        <div className="bg-card p-6 rounded-2xl border border-white/[0.06] text-center space-y-2 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Challenger 2</p>
                            <h3 className="text-xl font-bold text-white truncate">{audit2.domain}</h3>
                            <div className="text-4xl font-black text-blue-400 pt-2">{audit2.results?.performance_score || 0}</div>
                        </div>
                    </div>

                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
                        <div className="grid grid-cols-3 gap-px bg-white/[0.08] border-b border-white/[0.06]">
                            <div className="bg-white/[0.02] p-4 text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Metric</div>
                            <div className="bg-white/[0.02] p-4 text-center text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Results One</div>
                            <div className="bg-white/[0.02] p-4 text-center text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Results Two</div>
                        </div>

                        <ComparisonRow label="Performance Score" val1={audit1.results?.performance_score} val2={audit2.results?.performance_score} />
                        <ComparisonRow label="SEO Score" val1={audit1.results?.seo_score} val2={audit2.results?.seo_score} />
                        <ComparisonRow label="Security Score" val1={audit1.results?.security_score} val2={audit2.results?.security_score} />
                        <ComparisonRow label="Load Time (LCP)" val1={audit1.results?.lcp_desktop} val2={audit2.results?.lcp_desktop} inverse />
                        <ComparisonRow label="Visual Stability (CLS)" val1={audit1.results?.cls_desktop} val2={audit2.results?.cls_desktop} inverse />
                        <ComparisonRow label="Pages Crawled" val1={audit1.results?.pages_crawled} val2={audit2.results?.pages_crawled} />

                        <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
                            <div className="bg-card p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">SSL Security</div>
                            <div className="bg-card p-4 flex justify-center">
                                {audit1.results?.ssl_valid ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                            </div>
                            <div className="bg-card p-4 flex justify-center">
                                {audit2.results?.ssl_valid ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-card border border-white/[0.06] space-y-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest text-center">Top Keywords ({audit1.domain})</h4>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {audit1.results?.keywords?.slice(0, 5).map((kw: any, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-muted-foreground">
                                        {kw.title}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-card border border-white/[0.06] space-y-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest text-center">Top Keywords ({audit2.domain})</h4>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {audit2.results?.keywords?.slice(0, 5).map((kw: any, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-muted-foreground">
                                        {kw.title}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
