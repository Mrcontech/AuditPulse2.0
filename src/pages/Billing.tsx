import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Billing() {
    const { data: profile, isLoading } = useQuery({
        queryKey: ["profile-billing"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();
            return data;
        },
    });

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-3xl space-y-8">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Billing</h1>
                    <p className="text-sm text-muted-foreground">Manage your subscription and payment methods.</p>
                </div>

                {/* Plan Status */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                        <h3 className="text-sm font-medium text-white mb-4">Current Plan</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-semibold text-white capitalize">
                                    {profile?.subscription_tier || "Free"}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${profile?.subscription_status === 'active'
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-white/5 text-muted-foreground'
                                    }`}>
                                    {profile?.subscription_status || "Active"}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {profile?.subscription_tier === 'pro'
                                    ? "Full access to all features and unlimited audits."
                                    : "Upgrade to unlock bulk audits and advanced analytics."}
                            </p>
                            {profile?.subscription_tier !== 'pro' && (
                                <Link to="/pricing">
                                    <Button size="sm" className="mt-2">Upgrade to Pro</Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                        <h3 className="text-sm font-medium text-white mb-4">Payment Method</h3>
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <CreditCard className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground mb-3">No payment method on file</p>
                            <Button variant="outline" size="sm">Add Payment Method</Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
