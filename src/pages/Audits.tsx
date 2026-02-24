import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    FileText,
    Swords,
    Clock,
    CheckCircle,
    XCircle,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Audits() {
    const [search, setSearch] = useState("");

    const { data: audits, isLoading: isLoadingAudits } = useQuery({
        queryKey: ["all-audits"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audits")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    const { data: battles, isLoading: isLoadingBattles } = useQuery({
        queryKey: ["battle-history"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("battles")
                .select(`
                    id,
                    created_at,
                    audit_1:audits!audit_id_1(id, domain, url, status),
                    audit_2:audits!audit_id_2(id, domain, url, status)
                `)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as any[];
        }
    });

    const filteredAudits = audits?.filter(a =>
        a.domain.toLowerCase().includes(search.toLowerCase()) ||
        a.url.toLowerCase().includes(search.toLowerCase())
    );

    const filteredBattles = battles?.filter(b =>
        b.audit_1.domain.toLowerCase().includes(search.toLowerCase()) ||
        b.audit_2.domain.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "complete": return <CheckCircle className="w-4 h-4 text-green-400" />;
            case "failed": return <XCircle className="w-4 h-4 text-red-400" />;
            default: return <Clock className="w-4 h-4 text-yellow-400" />;
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-white tracking-tight">Report History</h1>
                        <p className="text-sm text-muted-foreground">Detailed history of all your site audits and comparisons.</p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search reports..."
                            className="pl-9 bg-white/[0.02] border-white/[0.06]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs defaultValue="audits" className="w-full">
                    <TabsList className="bg-white/[0.02] border border-white/[0.06] p-1 h-11 mb-6">
                        <TabsTrigger value="audits" className="gap-2 px-6 data-[state=active]:bg-white/[0.06] data-[state=active]:text-white">
                            <FileText className="w-4 h-4" />
                            Site Audits
                        </TabsTrigger>
                        <TabsTrigger value="battles" className="gap-2 px-6 data-[state=active]:bg-white/[0.06] data-[state=active]:text-white">
                            <Swords className="w-4 h-4" />
                            Competitor Battles
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="audits" className="space-y-4">
                        {isLoadingAudits ? (
                            <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                        ) : filteredAudits?.length === 0 ? (
                            <div className="py-24 text-center border border-dashed border-white/[0.1] rounded-lg">
                                <p className="text-muted-foreground">No audits found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {filteredAudits?.map((audit) => (
                                    <Link
                                        key={audit.id}
                                        to={`/audit/${audit.id}`}
                                        className="bg-card border border-white/[0.06] p-4 rounded-lg flex items-center justify-between hover:border-white/20 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0 border border-white/[0.06]">
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${audit.domain}&sz=64`}
                                                    alt=""
                                                    className="w-5 h-5"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{audit.domain}</p>
                                                <p className="text-xs text-muted-foreground truncate opacity-60 mb-1">{audit.url}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        {format(new Date(audit.created_at), "MMM d, yyyy · HH:mm")}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(audit.status)}
                                                        <span className="text-[10px] capitalize text-muted-foreground">{audit.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="battles" className="space-y-4">
                        {isLoadingBattles ? (
                            <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                        ) : filteredBattles?.length === 0 ? (
                            <div className="py-24 text-center border border-dashed border-white/[0.1] rounded-lg">
                                <p className="text-muted-foreground">No battles found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredBattles?.map((battle) => (
                                    <Link
                                        key={battle.id}
                                        to={`/compare/${battle.audit_1.id}/${battle.audit_2.id}`}
                                        className="bg-card border border-white/[0.06] p-5 rounded-lg flex items-center justify-between hover:border-white/20 transition-all group"
                                    >
                                        <div className="flex items-center gap-6 min-w-0">
                                            {/* Battle Pairing Visual */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${battle.audit_1.domain}&sz=64`}
                                                        className="w-5 h-5"
                                                        alt=""
                                                    />
                                                </div>
                                                <Swords className="w-4 h-4 text-muted-foreground/30" />
                                                <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${battle.audit_2.domain}&sz=64`}
                                                        className="w-5 h-5"
                                                        alt=""
                                                    />
                                                </div>
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-bold text-white truncate max-w-[150px]">{battle.audit_1.domain}</p>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-30 italic">vs</span>
                                                    <p className="text-sm font-bold text-white truncate max-w-[150px]">{battle.audit_2.domain}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        {format(new Date(battle.created_at), "MMM d, yyyy · HH:mm")}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {battle.audit_1.status === 'complete' && battle.audit_2.status === 'complete' ? (
                                                            <div className="flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3 text-green-400" />
                                                                <span className="text-[9px] uppercase tracking-widest text-green-400/70 font-bold">Analysis Ready</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1">
                                                                <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                                                                <span className="text-[9px] uppercase tracking-widest text-blue-400/70 font-bold">In Progress</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
