import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    ExternalLink,
    Loader2,
    Trophy,
    Target,
    Zap,
    ShieldCheck,
    TrendingUp,
    Share2,
    Globe,
    Lock,
    Check,
    Link2
} from "lucide-react";
import { toast } from "sonner";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar
} from 'recharts';
import { cn } from "@/lib/utils";

export default function Compare() {
    const { id1, id2 } = useParams();
    const [isPublic, setIsPublic] = useState<boolean | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUser(session?.user || null);
        };
        checkUser();
    }, []);

    const fetchResults = async (auditId: string) => {
        const { data: audit, error: auditErr } = await supabase
            .from("audits")
            .select("*")
            .eq("id", auditId)
            .single();
        if (auditErr) throw auditErr;

        if (audit.status === 'complete') {
            const { data: results, error: resultsErr } = await supabase
                .from("audit_results")
                .select("*")
                .eq("audit_id", auditId)
                .single();
            if (resultsErr) throw resultsErr;
            return { ...audit, results };
        }

        return { ...audit, results: null };
    };

    const { data: audit1, isLoading: isLoading1, refetch: refetch1 } = useQuery({
        queryKey: ["audit-full", id1],
        queryFn: () => fetchResults(id1!),
        enabled: !!id1,
        refetchInterval: (query) => {
            const data = query.state.data as any;
            return data && data.status !== 'complete' && data.status !== 'failed' ? 3000 : false;
        }
    });

    const { data: audit2, isLoading: isLoading2, refetch: refetch2 } = useQuery({
        queryKey: ["audit-full", id2],
        queryFn: () => fetchResults(id2!),
        enabled: !!id2,
        refetchInterval: (query) => {
            const data = query.state.data as any;
            return data && data.status !== 'complete' && data.status !== 'failed' ? 3000 : false;
        }
    });

    useEffect(() => {
        if (audit1?.status === 'complete' && audit2?.status === 'complete') {
            setIsPublic(audit1.is_public);
        }
    }, [audit1?.status, audit2?.status]);

    const handleTogglePublic = async () => {
        if (!audit1 || !audit2 || !currentUser || currentUser.id !== audit1.user_id) return;

        const newStatus = !isPublic;
        const { error } = await supabase
            .from("audits")
            .update({ is_public: newStatus })
            .in("id", [id1!, id2!]);

        if (error) {
            toast.error("Failed to update sharing status");
        } else {
            setIsPublic(newStatus);
            toast.success(newStatus ? "Battle is now public" : "Battle is now private");
        }
    };

    const copyShareLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Share link copied to clipboard");
    };

    if (isLoading1 || isLoading2) {
        return (
            <DashboardLayout>
                <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        );
    }

    const results1 = audit1?.results;
    const results2 = audit2?.results;

    if (!audit1 || !audit2) {
        return (
            <DashboardLayout>
                <div className="flex flex-col h-[calc(100vh-100px)] items-center justify-center space-y-4">
                    <Lock className="w-12 h-12 text-muted-foreground/20" />
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-white">Private Battle</h2>
                        <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">This benchmark is not public. Please sign in to view your private audits.</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link to="/auth/login">Sign In</Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const categories = [
        { label: "Performance", key: "performance_score" },
        { label: "SEO", key: "seo_score" },
        { label: "Security", key: "security_score" },
        { label: "Accessibility", key: "accessibility_score" },
        { label: "Best Practices", key: "best_practices_score" },
    ];

    const wins1 = categories.filter(c => (results1?.[c.key] || 0) > (results2?.[c.key] || 0)).length;
    const wins2 = categories.filter(c => (results2?.[c.key] || 0) > (results1?.[c.key] || 0)).length;

    const radarData = categories.map(c => ({
        subject: c.label,
        A: results1?.[c.key] || 0,
        B: results2?.[c.key] || 0,
    }));

    const ScoreRadial = ({ score, label, color }: { score: number, label: string, color: string }) => {
        const chartData = [{ name: 'Score', value: score, fill: color }];
        return (
            <div className="flex flex-col items-center">
                <div className="h-20 w-20 relative mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="70%"
                            outerRadius="100%"
                            barSize={6}
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
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white tabular-nums">{Math.round(score)}</span>
                    </div>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-mono">{label}</span>
            </div>
        );
    };

    const ComparisonRow = ({ label, val1, val2, unit = "", inverse = false }: { label: string, val1: any, val2: any, unit?: string, inverse?: boolean }) => {
        const v1 = val1 !== null ? Number(val1) : 0;
        const v2 = val2 !== null ? Number(val2) : 0;
        const isWinner1 = inverse ? v1 < v2 : v1 > v2;
        const isWinner2 = inverse ? v2 < v1 : v2 > v1;

        return (
            <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-b border-white/[0.06] last:border-0 group">
                <div className="bg-card p-4 flex items-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {label}
                </div>
                <div className={cn(
                    "bg-card p-4 text-center transition-colors group-hover:bg-white/[0.01]",
                    isWinner1 ? 'text-blue-400 font-bold' : 'text-white/60'
                )}>
                    <div className="flex items-center justify-center gap-2 tabular-nums text-sm">
                        {val1 !== null ? `${val1}${unit}` : "-"}
                        {isWinner1 && <Trophy className="w-3 h-3 text-blue-400" />}
                    </div>
                </div>
                <div className={cn(
                    "bg-card p-4 text-center transition-colors group-hover:bg-white/[0.01]",
                    isWinner2 ? 'text-blue-400 font-bold' : 'text-white/60'
                )}>
                    <div className="flex items-center justify-center gap-2 tabular-nums text-sm">
                        {val2 !== null ? `${val2}${unit}` : "-"}
                        {isWinner2 && <Trophy className="w-3 h-3 text-blue-400" />}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="relative min-h-screen">
                {/* Subtle Background Gradient - Matched to Audit.tsx */}
                <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.08),transparent)] pointer-events-none" />

                <div className="relative z-10 p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
                    {/* Header - Matched to Audit.tsx */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3 min-w-0">
                            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-white transition-colors text-sm">
                                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                            </Link>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight break-all">Competitor Battle</h1>
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 shrink-0">
                                    {wins1 > wins2 ? "Winner Decided" : wins1 === wins2 ? "Stalemate" : "Winner Decided"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="truncate">{audit1.domain}</span>
                                <span className="text-white/20 font-bold">VS</span>
                                <span className="truncate">{audit2.domain}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-2">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground tabular-nums">Score: {wins1} — {wins2}</span>
                        </div>
                    </div>

                    {/* Challengers Scorecards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { audit: audit1, results: results1, wins: wins1, label: "Challenger 01", color: "#3b82f6" },
                            { audit: audit2, results: results2, wins: wins2, label: "Challenger 02", color: "#60a5fa" }
                        ].map((c, i) => (
                            <div key={i} className="bg-card border border-white/[0.06] rounded-lg p-5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <Trophy className="w-20 h-20" />
                                </div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                            {c.label} {c.wins > (i === 0 ? wins2 : wins1) && <span className="text-blue-400 ml-1">• Winner</span>}
                                        </p>
                                        <h3 className="text-lg font-semibold text-white tracking-tight truncate max-w-[180px]">{c.audit.domain}</h3>
                                        <a href={c.audit.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-white transition-colors truncate">
                                            <ExternalLink className="w-3 h-3" /> Visit challenger site
                                        </a>
                                    </div>
                                    <div className="flex gap-4">
                                        {c.audit.status === 'complete' ? (
                                            <>
                                                <ScoreRadial score={c.results?.performance_score || 0} label="Perf" color={c.color} />
                                                <ScoreRadial score={c.results?.seo_score || 0} label="SEO" color={c.color} />
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center w-40">
                                                <div className="w-full bg-white/[0.03] h-1.5 rounded-full overflow-hidden border border-white/[0.06]">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                                        style={{ width: `${c.audit.progress || 0}%` }}
                                                    />
                                                </div>
                                                <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-2 animate-pulse">Running Live Audit...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Radar Comparison Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-card border border-white/[0.06] rounded-lg p-6">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-400" />
                                Performance Sphere
                            </h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 500 }} />
                                        <Radar name={audit1.domain} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                                        <Radar name={audit2.domain} dataKey="B" stroke="#ffffff" fill="#ffffff" fillOpacity={0.05} strokeWidth={2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Summary Verdict - Executive View */}
                        <div className="bg-card border border-white/[0.06] rounded-lg p-6 flex flex-col justify-center text-center space-y-4">
                            <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Battle Summary</h3>
                                <h2 className="text-xl font-semibold text-white tracking-tight">
                                    {wins1 > wins2 ? audit1.domain : wins2 > wins1 ? audit2.domain : "Both contenders"} {wins1 === wins2 ? "are tied." : "takes the lead."}
                                </h2>
                                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                                    A thorough analysis across {categories.length} core segments reveals a {wins1 === wins2 ? "balanced landscape" : "dominant technical advantage"} for the victor.
                                </p>
                            </div>
                            <div className="pt-2">
                                <Button asChild variant="outline" size="sm" className="rounded-full border-white/[0.06] hover:bg-white/[0.04] px-6 text-[11px] font-bold uppercase tracking-widest">
                                    <Link to={`/audit/${wins1 >= wins2 ? audit1.id : audit2.id}`}>View Growth Plan</Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Battle Rounds */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Detailed Battle Rounds</h3>
                            <div className="h-px flex-1 bg-white/[0.06]" />
                        </div>

                        <div className="rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.04]">
                            {/* Table Headers */}
                            <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-b border-white/[0.08]">
                                <div className="bg-card/50 p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Metric</div>
                                <div className="bg-card/50 p-4 text-center text-[10px] font-bold text-white/80 uppercase tracking-widest truncate">{audit1.domain}</div>
                                <div className="bg-card/50 p-4 text-center text-[10px] font-bold text-white/80 uppercase tracking-widest truncate">{audit2.domain}</div>
                            </div>

                            {/* Performance Section */}
                            <div className="p-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Core Web Vitals</span>
                            </div>
                            <ComparisonRow label="LCP" val1={results1?.lcp_desktop} val2={results2?.lcp_desktop} unit="s" inverse />
                            <ComparisonRow label="INP" val1={results1?.inp_desktop} val2={results2?.inp_desktop} unit="ms" inverse />
                            <ComparisonRow label="CLS" val1={results1?.cls_desktop} val2={results2?.cls_desktop} inverse />

                            {/* SEO & Security */}
                            <div className="p-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Growth & Trust</span>
                            </div>
                            <ComparisonRow label="Performance Score" val1={results1?.performance_score} val2={results2?.performance_score} />
                            <ComparisonRow label="SEO Score" val1={results1?.seo_score} val2={results2?.seo_score} />
                            <ComparisonRow label="Security Score" val1={results1?.security_score} val2={results2?.security_score} />
                            <ComparisonRow label="Accessibility" val1={results1?.accessibility_score} val2={results2?.accessibility_score} />
                            <ComparisonRow label="Best Practices" val1={results1?.best_practices_score} val2={results2?.best_practices_score} />
                        </div>
                    </div>

                    {/* Intellectual Clash - Strategic Intelligence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { audit: audit1, results: results1, color: "#3b82f6" },
                            { audit: audit2, results: results2, color: "#ffffff" }
                        ].map((c, i) => (
                            <div key={i} className="bg-card border border-white/[0.06] rounded-lg p-5 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                                        <h4 className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{c.audit.domain}</h4>
                                    </div>
                                    {c.audit.status !== 'complete' && (
                                        <span className="text-[9px] font-bold text-blue-400 animate-pulse">{c.audit.progress}%</span>
                                    )}
                                </div>

                                {c.audit.status === 'complete' ? (
                                    <>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Strategic Vision</p>
                                            <p className="text-[11px] text-white/70 italic leading-relaxed">
                                                "{(c.results?.executive_summary as any)?.vision ||
                                                    (typeof c.results?.executive_summary === 'string' ? c.results.executive_summary : "Strategic analysis complete.")}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-green-500/80 uppercase tracking-widest">Key Strength</p>
                                                <p className="text-[11px] text-muted-foreground leading-tight">
                                                    {(typeof (c.results?.swot_analysis as any)?.strengths?.[0] === 'object'
                                                        ? (c.results?.swot_analysis as any).strengths[0].title
                                                        : (c.results?.swot_analysis as any)?.strengths?.[0]) || "Analyzing..."}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest">Critical Gap</p>
                                                <p className="text-[11px] text-muted-foreground leading-tight">
                                                    {(c.results?.content_gaps as any)?.[0]?.topic ||
                                                        (typeof (c.results?.content_gaps as any)?.[0] === 'string' ? (c.results?.content_gaps as any)[0] : "Analyzing...")}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8 flex flex-col items-center justify-center space-y-3">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-500/50" />
                                        <p className="text-[10px] text-muted-foreground text-center italic">{c.audit.progress_label || "Analyzing strategist data..."}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
