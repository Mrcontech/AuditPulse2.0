import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export const AuditList = () => {
    const { data: audits, isLoading, error } = useQuery({
        queryKey: ["audits"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audits")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        refetchInterval: (query) => {
            const data = query.state.data as any[];
            if (data && data.some(a => a.status !== 'complete' && a.status !== 'failed')) {
                return 5000;
            }
            return false;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                Error loading audits: {(error as any).message}
            </div>
        );
    }

    if (!audits?.length) {
        return (
            <div className="text-center py-12 border border-white/[0.06] border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">No audits yet</p>
                <p className="text-xs text-muted-foreground">Use the form above to start your first audit</p>
            </div>
        );
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "complete":
                return { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", label: "Complete" };
            case "failed":
                return { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Failed" };
            default:
                return { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", label: status };
        }
    };

    return (
        <div className="border border-white/[0.06] rounded-lg overflow-hidden">
            {/* Desktop Table Header - hidden on mobile */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] text-xs text-muted-foreground font-medium">
                <div className="col-span-5">Domain</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2"></div>
            </div>

            {/* Audit Items */}
            {audits.map((audit) => {
                const status = getStatusInfo(audit.status);
                const StatusIcon = status.icon;
                return (
                    <div
                        key={audit.id}
                        className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                        {/* Mobile Layout */}
                        <div className="sm:hidden p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white truncate">{audit.domain}</p>
                                    <p className="text-xs text-muted-foreground truncate">{audit.url}</p>
                                </div>
                                {(audit.status === "complete" || audit.status === "failed") && (
                                    <Link to={`/audit/${audit.id}`}>
                                        <Button variant="outline" size="sm" className="h-8 text-xs shrink-0">
                                            View <ArrowUpRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${status.bg} ${status.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    <span className="text-xs capitalize">{status.label}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(audit.created_at), "MMM d, yyyy")}
                                </span>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 items-center">
                            <div className="col-span-5 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{audit.domain}</p>
                                <p className="text-xs text-muted-foreground truncate">{audit.url}</p>
                            </div>
                            <div className="col-span-2">
                                <div className={`flex items-center gap-1.5 ${status.color}`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    <span className="text-xs capitalize">{status.label}</span>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(audit.created_at), "MMM d, yyyy")}
                                </span>
                            </div>
                            <div className="col-span-2 flex justify-end">
                                {(audit.status === "complete" || audit.status === "failed") && (
                                    <Link to={`/audit/${audit.id}`}>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                                            View <ArrowUpRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
