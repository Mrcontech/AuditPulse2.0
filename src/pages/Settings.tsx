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
    Bell,
    Key,
    Shield,
    Mail,
    Globe,
    ExternalLink,
    ShieldCheck,
    Fingerprint,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "profile" | "notifications" | "api" | "security";

export default function Settings() {
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
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

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast.success("API Key copied to clipboard");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy");
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "api", label: "API Keys", icon: Key },
        { id: "security", label: "Security", icon: Shield },
    ];

    return (
        <DashboardLayout>
            <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        Manage your account settings and preferences.
                        <ShieldCheck className="w-4 h-4 text-primary/60" />
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Navigation Sidebar */}
                    <div className="w-full md:w-64 shrink-0 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    activeTab === tab.id
                                        ? "bg-white/10 text-white shadow-lg shadow-black/20"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <tab.icon className={cn(
                                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                                    activeTab === tab.id ? "text-primary" : "text-muted-foreground/60"
                                )} />
                                <span className="text-sm font-medium">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 w-full min-h-[500px]">
                        {activeTab === "profile" && (
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
                        )}

                        {activeTab === "notifications" && (
                            <div className="bg-card border border-white/[0.06] rounded-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
                                    <p className="text-sm text-muted-foreground">Choose how and when you want to be notified.</p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { title: "Audit Completion", desc: "Get notified when your performance audit is ready.", icon: Globe },
                                        { title: "Security Alerts", desc: "Important updates regarding your account security.", icon: Shield },
                                        { title: "Marketing & News", desc: "New features and occasional tips to boost your SEO.", icon: Bell }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                                                    <item.icon className="w-5 h-5 text-primary/80" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className="text-sm font-medium text-white">{item.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                                </div>
                                            </div>
                                            <div className="w-12 h-6 bg-primary/20 border border-primary/30 rounded-full relative cursor-pointer flex items-center px-1">
                                                <div className="w-4 h-4 bg-primary rounded-full ml-auto shadow-sm" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-white/[0.06]">
                                    <Button className="shadow-lg shadow-primary/20">
                                        Save Preferences
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === "api" && (
                            <div className="bg-card border border-white/[0.06] rounded-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-white">API Management</h3>
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold tracking-tight uppercase">BETA</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Integrate AuditPulse into your own workflow using our API.</p>
                                </div>

                                <div className="p-6 rounded-xl bg-primary/5 border border-primary/10 space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Fingerprint className="w-5 h-5" />
                                        <h4 className="text-sm font-semibold italic">Production API Key</h4>
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            readOnly
                                            value={showApiKey ? "ap_live_7294_j82k_92ns_8201_kl2m" : "••••••••••••••••••••••••••••••••"}
                                            className="bg-black/40 border-white/10 font-mono text-xs pr-24 h-11"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 px-2 hover:bg-white/10 text-muted-foreground"
                                                onClick={() => setShowApiKey(!showApiKey)}
                                            >
                                                {showApiKey ? "Hide" : "Reveal"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 gap-2"
                                                onClick={() => copyToClipboard("ap_live_7294_j82k_92ns_8201_kl2m")}
                                            >
                                                {isCopied ? <Check className="w-3 h-3" /> : "Copy"}
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Your API keys are private. Never share them or commit them to public repositories.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-white">Quick Links</h4>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <a href="#" className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors group">
                                            <span className="text-xs text-muted-foreground group-hover:text-white">API Documentation</span>
                                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                        </a>
                                        <a href="#" className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors group">
                                            <span className="text-xs text-muted-foreground group-hover:text-white">SDK Repositories</span>
                                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="bg-card border border-white/[0.06] rounded-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-white">Security & Access</h3>
                                    <p className="text-sm text-muted-foreground">Secure your account and manage active sessions.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-primary" />
                                            <h4 className="text-sm font-medium text-white">Two-Factor Authentication</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground max-w-md">
                                            Add an extra layer of security to your account by requiring more than just a password to log in.
                                        </p>
                                        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                                            Enable 2FA
                                        </Button>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                                        <h4 className="text-sm font-medium text-white">Password Management</h4>
                                        <p className="text-xs text-muted-foreground">Change your password regularly to keep your account safe.</p>
                                        <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0 h-9 px-4">
                                            Reset Password via Email
                                        </Button>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                                        <h4 className="text-sm font-medium text-white">Connected Devices</h4>
                                        <div className="text-xs p-4 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-white font-medium">Clear all sessions</p>
                                                <p className="text-muted-foreground">Log out from all devices except this one.</p>
                                            </div>
                                            <Button variant="destructive" size="sm" className="h-8 bg-red-600/80 hover:bg-red-600">
                                                Log Out All
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
