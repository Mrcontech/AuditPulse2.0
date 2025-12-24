import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            toast.success("Check your email to verify your account");
            navigate("/auth/login");
        } catch (error: any) {
            toast.error(error.message || "Failed to register");
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
                        <h1 className="text-2xl font-semibold text-foreground">Create an account</h1>
                        <p className="text-sm text-muted-foreground">Get started with your free account</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                className="bg-white/[0.02] border-white/[0.06]"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
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
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                        </Button>
                    </form>

                    <p className="text-sm text-center text-muted-foreground mt-6">
                        Already have an account?{" "}
                        <Link to="/auth/login" className="text-foreground hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right side - Branding (60%) */}
            <div className="hidden lg:flex lg:w-[60%] bg-card border-l border-white/[0.06] relative overflow-hidden">
                {/* Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />

                <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
                    <div className="max-w-lg space-y-6">
                        <h2 className="text-3xl font-semibold text-foreground">
                            Start optimizing your website today
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Join 500+ businesses using AuditPulse to uncover performance issues, SEO opportunities, and security vulnerabilities.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                                <div className="text-2xl font-semibold text-foreground">50k+</div>
                                <div className="text-xs text-muted-foreground">Audits completed</div>
                            </div>
                            <div className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                                <div className="text-2xl font-semibold text-foreground">99%</div>
                                <div className="text-xs text-muted-foreground">Satisfaction rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
