import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const plans = [
    {
        name: "Starter",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        description: "Perfect for exploring niche opportunities.",
        features: ["2 Full Website Audits", "Basic Performance Data", "Security Status Check", "AI Executive Summary"],
        priceId: "price_starter_id",
        buttonText: "Start Free",
    },
    {
        name: "Pro",
        monthlyPrice: "$19",
        yearlyPrice: "$190",
        description: "For agencies and growing brands.",
        features: ["50 Website Audits/mo", "Fix-It Checklist Manager", "Historical Trend Charts", "Competitor Battle Mode", "Premium PDF Exports"],
        priceId: "price_pro_id",
        yearlyId: "price_pro_yearly_id",
        buttonText: "Get Pro",
        popular: true,
    },
    {
        name: "Enterprise",
        monthlyPrice: "$79",
        yearlyPrice: "$790",
        description: "Bespoke solutions for large-scale operations.",
        features: ["230 Website Audits/mo", "White-label Reports", "API Access", "Custom Audit Rules", "Dedicated Strategist"],
        priceId: "price_enterprise_id",
        yearlyId: "price_enterprise_yearly_id",
        buttonText: "Contact Us",
    },
];

export const PricingSection = () => {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [isYearly, setIsYearly] = useState(false);

    const handleSubscribe = async (plan: typeof plans[0]) => {
        const priceId = isYearly && plan.yearlyId ? plan.yearlyId : plan.priceId;

        if (plan.name === 'Starter') return;

        setLoadingPlan(priceId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Please sign in to subscribe");
                return;
            }

            const response = await supabase.functions.invoke('create-checkout', {
                body: {
                    priceId,
                    customerEmail: session.user.email,
                    userId: session.user.id
                }
            });

            if (response.error) throw response.error;

            if (response.data?.url) {
                window.location.href = response.data.url;
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <section className="py-24 px-6 bg-background border-t border-white/[0.06] relative overflow-hidden">
            {/* Subtle gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_20%_50%,rgba(59,130,246,0.06),transparent)] pointer-events-none" />
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                        Choose the plan that fits your growth ambitions.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <Label htmlFor="billing-toggle" className={`text-sm ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</Label>
                        <Switch
                            id="billing-toggle"
                            checked={isYearly}
                            onCheckedChange={setIsYearly}
                        />
                        <div className="flex items-center gap-2">
                            <Label htmlFor="billing-toggle" className={`text-sm ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Yearly</Label>
                            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                                2 Months Free
                            </span>
                        </div>
                    </div>
                </div>

                {/* Plans Grid - Linear style */}
                <div className="grid gap-px bg-white/[0.04] rounded-lg overflow-hidden border border-white/[0.06] md:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-card p-6 flex flex-col ${plan.popular ? 'bg-white/[0.02]' : ''}`}
                        >
                            {plan.popular && (
                                <span className="absolute top-4 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                                    Popular
                                </span>
                            )}

                            <div className="mb-6">
                                <h3 className="text-base font-medium text-foreground mb-1">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-3xl font-semibold text-foreground">
                                        {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                    </span>
                                    <span className="text-sm text-muted-foreground">/{isYearly ? 'year' : 'mo'}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </div>

                            <ul className="space-y-3 mb-6 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="w-full"
                                variant={plan.popular ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleSubscribe(plan)}
                                disabled={(loadingPlan === plan.priceId || loadingPlan === plan.yearlyId)}
                            >
                                {((loadingPlan === plan.priceId || loadingPlan === plan.yearlyId) && plan.name !== 'Starter') ? <Loader2 className="w-4 h-4 animate-spin" /> : plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
