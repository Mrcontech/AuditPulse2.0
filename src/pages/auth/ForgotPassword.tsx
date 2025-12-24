import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            setIsSuccess(true);
            toast.success("Check your email for the reset link");
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset email");
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

                    {isSuccess ? (
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                            <h1 className="text-2xl font-semibold text-foreground mb-2">Check your email</h1>
                            <p className="text-sm text-muted-foreground mb-6">
                                We've sent a password reset link to <span className="text-foreground">{email}</span>
                            </p>
                            <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                                <ArrowLeft className="w-4 h-4" /> Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2 mb-8">
                                <h1 className="text-2xl font-semibold text-foreground">Forgot password?</h1>
                                <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                <Button className="w-full" type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                                </Button>
                            </form>

                            <p className="text-sm text-center text-muted-foreground mt-6">
                                <Link to="/auth/login" className="flex items-center justify-center gap-1 hover:text-foreground">
                                    <ArrowLeft className="w-4 h-4" /> Back to sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Right side - Branding (60%) */}
            <div className="hidden lg:flex lg:w-[60%] bg-card border-l border-white/[0.06] relative overflow-hidden">
                {/* Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />

                <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
                    <div className="max-w-lg space-y-6">
                        <h2 className="text-3xl font-semibold text-foreground">
                            Don't worry, we've got you covered
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Enter your email address and we'll send you a secure link to reset your password. The link will expire in 24 hours.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
