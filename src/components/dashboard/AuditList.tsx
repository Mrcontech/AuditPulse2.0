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
                <Link to="/">
                    <Button size="sm">Start Your First Audit</Button>
                </Link>
            </div>
        );
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "complete":
                return { icon: CheckCircle, color: "text-green-400", label: "Complete" };
            case "failed":
                return { icon: XCircle, color: "text-red-400", label: "Failed" };
            default:
                return { icon: Clock, color: "text-yellow-400", label: status };
        }
    };

    return (
        <div className="border border-white/[0.06] rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] text-xs text-muted-foreground font-medium">
                <div className="col-span-5">Domain</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2"></div>
            </div>

            {/* Table Body */}
            {audits.map((audit) => {
                const status = getStatusInfo(audit.status);
                const StatusIcon = status.icon;
                return (
                    <div
                        key={audit.id}
                        className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors items-center"
                    >
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
                );
            })}
        </div>
    );
};
