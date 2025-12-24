import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const CTASection = () => {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <section className="py-24 px-6 bg-card border-t border-white/[0.06] relative overflow-hidden">
            {/* Subtle gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_0%,rgba(59,130,246,0.1),transparent)] pointer-events-none" />
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
                    Ready to optimize your website?
                </h2>
                <p className="text-muted-foreground mb-8">
                    Join 500+ businesses using AuditPulse to uncover hidden growth opportunities.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {session ? (
                        <Button asChild>
                            <Link to="/dashboard">
                                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild>
                                <Link to="/auth/register">
                                    Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/auth/login">Sign In</Link>
                            </Button>
                        </>
                    )}
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                    No credit card required for your first audit.
                </p>
            </div>
        </section>
    );
};
