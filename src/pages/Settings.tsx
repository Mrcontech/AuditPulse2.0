import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Loader2,
    User,
    Mail,
    ShieldCheck
} from "lucide-react";

export default function Settings() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
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
            setBio(profile.bio || "");
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
                .update({
                    full_name: fullName,
                    bio: bio
                })
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
            <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        Manage your account settings and preferences.
                        <ShieldCheck className="w-4 h-4 text-primary/60" />
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Content Area */}
                    <div className="w-full">
                        <div className="bg-card border border-white/[0.06] rounded-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                                <p className="text-sm text-muted-foreground">Update your personal details and how others see you.</p>
                            </div>

                            <div className="flex items-center gap-6 pb-8 border-b border-white/[0.06]">
                                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary">
                                    <User className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-white">Your Avatar</h4>
                                    <p className="text-xs text-muted-foreground">Click to upload a new photo. SVG, PNG, JPG (max 2MB).</p>
                                    <Button variant="outline" size="sm" className="h-8 border-white/10 hover:bg-white/5 text-xs">
                                        Change Photo
                                    </Button>
                                </div>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground uppercase opacity-70">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="bg-white/[0.02] border-white/[0.06] focus:border-primary/50 h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase opacity-70">Email Address</Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                value={email}
                                                disabled
                                                className="bg-white/[0.01] border-white/[0.04] text-muted-foreground cursor-not-allowed h-11 pr-10"
                                            />
                                            <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-xs font-medium text-muted-foreground uppercase opacity-70">Short Bio</Label>
                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us a bit about yourself or your goals..."
                                        className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-primary/50 rounded-lg p-3 text-sm min-h-[100px] outline-none transition-colors"
                                    />
                                </div>

                                <div className="space-y-2 pt-4 border-t border-white/[0.06]">
                                    <Button type="submit" disabled={isLoading} className="shadow-lg shadow-primary/20">
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                        Update Profile
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
