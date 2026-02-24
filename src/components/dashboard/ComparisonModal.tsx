import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Swords, Check, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ComparisonModal = ({ isOpen, onClose }: ComparisonModalProps) => {
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [liveUrl, setLiveUrl] = useState("");
    const [isStartingAudit, setIsStartingAudit] = useState(false);

    const { data: audits, isLoading } = useQuery({
        queryKey: ["completed-audits"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audits")
                .select(`
                    id, 
                    domain, 
                    url, 
                    created_at,
                    audit_results (
                        performance_score
                    )
                `)
                .eq("status", "complete")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: isOpen,
    });

    const filteredAudits = audits?.filter(a =>
        a.domain.toLowerCase().includes(search.toLowerCase()) ||
        a.url.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : prev.length < 2 ? [...prev, id] : [prev[1], id]
        );
    };

    const handleCompare = async () => {
        if (selectedIds.length === 2) {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await supabase.from('battles').insert({
                        user_id: session.user.id,
                        audit_id_1: selectedIds[0],
                        audit_id_2: selectedIds[1]
                    });
                }
            } catch (err) {
                console.error("Error recording battle history:", err);
            }
            navigate(`/compare/${selectedIds[0]}/${selectedIds[1]}`);
            onClose();
        }
    };

    const handleLiveAudit = async () => {
        if (!liveUrl || selectedIds.length !== 1) return;

        setIsStartingAudit(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            let url = liveUrl.trim();
            if (!url.startsWith('http')) url = 'https://' + url;
            const domain = new URL(url).hostname;

            // 1. Create the pending audit
            const { data: audit, error: auditError } = await supabase
                .from('audits')
                .insert({
                    user_id: session.user.id,
                    url: url,
                    domain: domain,
                    status: 'pending',
                    progress: 0,
                    progress_label: 'Initializing live competitor audit...',
                    is_competitor_audit: true
                })
                .select()
                .single();

            if (auditError) throw auditError;

            // 2. Trigger the edge function
            const { error: fnError } = await supabase.functions.invoke('run-audit', {
                body: { url, auditId: audit.id }
            });

            if (fnError) throw fnError;

            // 3. Record the battle
            await supabase.from('battles').insert({
                user_id: session.user.id,
                audit_id_1: selectedIds[0],
                audit_id_2: audit.id
            });

            // 4. Navigate to battle page
            navigate(`/compare/${selectedIds[0]}/${audit.id}`);
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to start live audit");
        } finally {
            setIsStartingAudit(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-card border-white/[0.06] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Swords className="w-5 h-5 text-blue-400" />
                        Competitor Battle Mode
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Select two completed audits to compare their metrics side-by-side.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search domains..."
                        className="pl-9 bg-white/[0.02] border-white/[0.06]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid gap-2 max-h-[300px] overflow-y-auto mt-4 pr-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredAudits?.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            No completed audits found.
                        </div>
                    ) : (
                        filteredAudits?.map((audit) => {
                            const isSelected = selectedIds.includes(audit.id);
                            const score = audit.audit_results?.[0]?.performance_score ?? 0;
                            const date = new Date(audit.created_at);

                            // Simple relative time formatter
                            const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
                            const daysDiff = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            const formattedDate = daysDiff === 0
                                ? "Today"
                                : daysDiff === -1
                                    ? "Yesterday"
                                    : date.toLocaleDateString();

                            return (
                                <button
                                    key={audit.id}
                                    onClick={() => toggleSelection(audit.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected
                                        ? 'bg-blue-500/10 border-blue-500/40 text-white'
                                        : 'bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:border-white/20 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${score >= 90 ? 'border-green-500/50 text-green-400 bg-green-500/5' :
                                            score >= 50 ? 'border-orange-500/50 text-orange-400 bg-orange-500/5' :
                                                'border-red-500/50 text-red-400 bg-red-500/5'
                                            }`}>
                                            {score}
                                        </div>
                                        <div className="text-left overflow-hidden">
                                            <p className="text-sm font-medium truncate">{audit.domain}</p>
                                            <p className="text-[10px] opacity-60">
                                                {formattedDate}
                                            </p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="bg-blue-500 rounded-full p-0.5 shrink-0">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Or Audit a New Competitor</p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="https://competitor.com"
                            className="bg-white/[0.02] border-white/[0.06] h-9 text-sm"
                            value={liveUrl}
                            onChange={(e) => setLiveUrl(e.target.value)}
                        />
                        <Button
                            size="sm"
                            disabled={!liveUrl || selectedIds.length !== 1 || isStartingAudit}
                            onClick={handleLiveAudit}
                            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-widest text-[10px] h-9 px-4 shrink-0"
                        >
                            {isStartingAudit ? <Loader2 className="w-3 h-3 animate-spin" /> : "Live Audit"}
                        </Button>
                    </div>
                    {selectedIds.length === 0 && (
                        <p className="text-[9px] text-muted-foreground italic">Select one of your audits first to start a live battle.</p>
                    )}
                </div>

                <DialogFooter className="mt-6">
                    <div className="flex items-center justify-between w-full">
                        <p className="text-xs text-muted-foreground">
                            {selectedIds.length}/2 selected
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
                            <Button
                                onClick={handleCompare}
                                disabled={selectedIds.length < 2}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-500"
                            >
                                Start Battle
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
