import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const plans = [
    {
        name: "Starter",
        price: "$0",
        description: "Perfect for exploring niche opportunities.",
        features: ["1 Full Website Audit", "Basic Performance Data", "Security Header Check", "AI Executive Summary"],
        priceId: "price_starter_id",
        buttonText: "Start Free",
    },
    {
        name: "Pro",
        price: "$49",
        description: "For agencies and growing brands.",
        features: ["Unlimited Audits", "Core Web Vitals Polling", "Full AI Strategic Roadmap", "Market Sentiment Analysis", "PDF Export Reports"],
        priceId: "price_pro_id",
        buttonText: "Get Pro",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "Bespoke intelligence for large-scale operations.",
        features: ["White-label Reports", "API Access", "Custom Crawl Rules", "Priority Processing", "Dedicated Account Manager"],
        priceId: "price_enterprise_id",
        buttonText: "Contact Us",
    },
];

export const PricingSection = () => {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleSubscribe = async (priceId: string) => {
        if (priceId === 'price_starter_id') return;

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
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Choose the plan that fits your growth ambitions.
                    </p>
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
                                    <span className="text-3xl font-semibold text-foreground">{plan.price}</span>
                                    {plan.price !== 'Custom' && <span className="text-sm text-muted-foreground">/mo</span>}
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
                                onClick={() => handleSubscribe(plan.priceId)}
                                disabled={loadingPlan === plan.priceId}
                            >
                                {loadingPlan === plan.priceId ? <Loader2 className="w-4 h-4 animate-spin" /> : plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
