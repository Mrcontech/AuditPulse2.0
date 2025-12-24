import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success("Welcome back!");
            const from = location.state?.from?.pathname || "/dashboard";
            navigate(from);
        } catch (error: any) {
            toast.error(error.message || "Failed to sign in");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form (40%) */}
            <div className="w-full lg:w-[40%] flex flex-col justify-center p-8 lg:p-12 bg-background">
                <div className="max-w-sm mx-auto w-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 mb-12">
                        <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-semibold text-sm">A</div>
                        <span className="font-semibold text-foreground">AuditPulse</span>
                    </Link>

                    <div className="space-y-2 mb-8">
                        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
                        <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="bg-white/[0.02] border-white/[0.06]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className="bg-white/[0.02] border-white/[0.06]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                        </Button>
                    </form>

                    <div className="flex items-center justify-between mt-4">
                        <Link to="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                            Forgot password?
                        </Link>
                    </div>

                    <p className="text-sm text-center text-muted-foreground mt-6">
                        Don't have an account?{" "}
                        <Link to="/auth/register" className="text-foreground hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right side - Branding (60%) */}
            <div className="hidden lg:flex lg:w-[60%] bg-card border-l border-white/[0.06] relative overflow-hidden">
                {/* Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />

                <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
                    <blockquote className="max-w-lg">
                        <p className="text-xl font-medium text-foreground leading-relaxed mb-6">
                            "AuditPulse has transformed how we approach website optimization. The AI-powered insights saved us countless hours."
                        </p>
                        <footer className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center text-foreground font-medium">
                                JD
                            </div>
                            <div>
                                <div className="text-sm font-medium text-foreground">John Doe</div>
                                <div className="text-xs text-muted-foreground">CTO at TechCorp</div>
                            </div>
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
