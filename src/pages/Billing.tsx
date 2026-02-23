import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    Check,
    Zap,
    ShieldCheck,
    History,
    ExternalLink,
    HelpCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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

    const { data: payments } = useQuery({
        queryKey: ["payments-history"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data } = await supabase
                .from("payments")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            return data || [];
        },
    });

    const getLimit = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case 'pro': return 50;
            case 'max': return 230;
            default: return 2;
        }
    };

    const tier = profile?.subscription_tier || 'free';
    const limit = getLimit(tier);
    const isActive = profile?.subscription_status === 'active';

    const features = {
        free: [
            "2 Detailed Audits per month",
            "Core performance metrics",
            "Basic SEO recommendations",
            "Dashboard access"
        ],
        pro: [
            "50 High-priority Audits per month",
            "Advanced technical analysis",
            "Competitor benchmarking",
            "Priority support",
            "Export reports as PDF"
        ],
        max: [
            "230 Enterprise Audits per month",
            "Dedicated account manager",
            "White-label reporting",
            "API access",
            "Custom integrations"
        ]
    };

    return (
        <DashboardLayout>
            <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Billing & Plans</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            Manage your subscription and view usage
                            <ShieldCheck className="w-4 h-4 text-primary/60" />
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Current Plan Hero Card */}
                        <div className="relative overflow-hidden bg-card border border-white/[0.06] rounded-2xl p-8">
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

                            <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-primary">
                                            <Zap className="w-6 h-6 fill-primary/20" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Plan</p>
                                            <h2 className="text-2xl font-bold text-white capitalize">{tier} Plan</h2>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full animate-pulse",
                                            isActive ? "bg-green-500" : "bg-yellow-500"
                                        )} />
                                        <span className="text-sm font-medium text-white">
                                            Status: {isActive ? "Active" : "Pending / Inactive"}
                                        </span>
                                    </div>

                                    <p className="text-muted-foreground max-w-md">
                                        {tier === 'free'
                                            ? "You're currently on the free tier. Upgrade to unlock bulk audits, advanced analytics, and priority support."
                                            : `You're enjoying the ${tier} features. Your plan includes up to ${limit} audits per month.`}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {tier === 'free' ? (
                                        <Link to="/pricing">
                                            <Button className="w-full md:w-auto shadow-lg shadow-primary/20">
                                                Upgrade Now
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button variant="outline" className="w-full md:w-auto border-white/10 hover:bg-white/5">
                                            Manage Subscription
                                        </Button>
                                    )}
                                    <Link to="/settings" className="text-xs text-center text-muted-foreground hover:text-white transition-colors">
                                        Update billing details
                                    </Link>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="mt-10 pt-8 border-t border-white/[0.06]">
                                <h4 className="text-sm font-semibold text-white mb-4">Included in your plan:</h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {features[tier as keyof typeof features]?.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                            <div className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-primary" />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Usage Quick View */}
                        <div className="bg-card/50 border border-white/[0.06] rounded-xl p-6 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white">Audit Usage</p>
                                <p className="text-xs text-muted-foreground">Usage resets on your next billing date.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-white">{profile?.audits_this_month || 0} / {limit}</p>
                                <div className="w-32 h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${Math.min(((profile?.audits_this_month || 0) / limit) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Billing History Section */}
                        <div className="bg-card border border-white/[0.06] rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
                                <History className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold text-white">Billing History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-white/[0.02] text-muted-foreground">
                                            <th className="px-6 py-3 font-medium">Date</th>
                                            <th className="px-6 py-3 font-medium">Description</th>
                                            <th className="px-6 py-3 font-medium">Amount</th>
                                            <th className="px-6 py-3 font-medium text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.06]">
                                        {payments && payments.length > 0 ? (
                                            payments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4 text-white">
                                                        {new Date(payment.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-medium">{payment.product_name || "AuditPulse Subscription"}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{payment.dodo_payment_id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-white font-medium">
                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-400">
                                                            Paid
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground italic">
                                                    No transactions found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <div className="bg-card border border-white/[0.06] rounded-xl p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-white">Need Help?</h3>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Questions about your subscription or billing? Our team is here to help you get the most out of AuditPulse.
                            </p>
                            <Button variant="outline" size="sm" className="w-full border-white/10 hover:bg-white/5 gap-2 text-xs">
                                Contact Support
                                <ExternalLink className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
