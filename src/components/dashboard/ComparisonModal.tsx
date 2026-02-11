import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Swords, Check, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ComparisonModal = ({ isOpen, onClose }: ComparisonModalProps) => {
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState("");

    const { data: audits, isLoading } = useQuery({
        queryKey: ["completed-audits"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audits")
                .select("id, domain, url, created_at")
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

    const handleCompare = () => {
        if (selectedIds.length === 2) {
            navigate(`/compare/${selectedIds[0]}/${selectedIds[1]}`);
            onClose();
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
                            return (
                                <button
                                    key={audit.id}
                                    onClick={() => toggleSelection(audit.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected
                                            ? 'bg-blue-500/10 border-blue-500/40 text-white'
                                            : 'bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:border-white/20 hover:text-white'
                                        }`}
                                >
                                    <div className="text-left overflow-hidden">
                                        <p className="text-sm font-medium truncate">{audit.domain}</p>
                                        <p className="text-[10px] opacity-60">
                                            {new Date(audit.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="bg-blue-500 rounded-full p-0.5">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })
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
