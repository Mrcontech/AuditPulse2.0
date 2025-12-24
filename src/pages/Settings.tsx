import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Settings() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { data: profile } = useQuery({
        queryKey: ["profile"],
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

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "");
            setEmail(profile.email || "");
        }
    }, [profile]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { error } = await supabase
                .from("profiles")
                .update({ full_name: fullName })
                .eq("id", user.id);

            if (error) throw error;
            toast.success("Profile updated!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-xl space-y-8">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
                </div>

                {/* Profile Card */}
                <div className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <h3 className="text-sm font-medium text-white mb-4">Profile Information</h3>

                    <form onSubmit={handleUpdate} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs text-muted-foreground">Email Address</Label>
                            <Input
                                id="email"
                                value={email}
                                disabled
                                className="bg-white/[0.02] border-white/[0.06] text-muted-foreground cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">Your registered email cannot be changed.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-xs text-muted-foreground">Full Name</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your name"
                                className="bg-white/[0.02] border-white/[0.06] focus:border-white/20"
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} size="sm">
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Save Changes
                        </Button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
