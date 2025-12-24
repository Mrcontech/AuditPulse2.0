import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Settings,
    CreditCard,
    LogOut,
    Menu,
    Search,
    User,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Logged out successfully");
            navigate("/");
        }
    };

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { label: "Settings", icon: Settings, href: "/settings" },
        { label: "Billing", icon: CreditCard, href: "/billing" },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar - Linear minimal style */}
            <aside className="hidden md:flex w-56 h-full flex-col border-r border-white/[0.06] bg-card">
                {/* Logo */}
                <div className="p-5 border-b border-white/[0.06]">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-semibold text-sm">A</div>
                        <span className="font-semibold text-white">AuditPulse</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-white/[0.06] text-white"
                                        : "text-muted-foreground hover:text-white hover:bg-white/[0.03]"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Account</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/[0.03] transition-colors w-full"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-white/[0.06] flex flex-col">
                        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-semibold text-sm">A</div>
                                <span className="font-semibold text-white">AuditPulse</span>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <nav className="flex-1 p-3 space-y-0.5">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-white/[0.06] text-white"
                                                : "text-muted-foreground hover:text-white hover:bg-white/[0.03]"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-3 border-t border-white/[0.06]">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/[0.03] transition-colors w-full"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between px-6 h-14 border-b border-white/[0.06] bg-card shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </Button>
                        <div className="relative max-w-sm hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 h-8 bg-white/[0.02] border-white/[0.06] text-sm w-64"
                            />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
