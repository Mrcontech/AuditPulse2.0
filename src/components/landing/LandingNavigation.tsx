import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function LandingNavigation() {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header className={`fixed top-0 right-0 left-0 z-50 transition-all duration-200 ${isScrolled ? 'bg-background/95 border-b border-white/[0.06] backdrop-blur-md' : 'bg-transparent'}`}>
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex h-14 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-semibold text-sm">A</div>
                            <span className="font-semibold text-foreground">AuditPulse</span>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
                            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            {session ? (
                                <>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
                                        className="text-sm px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-foreground transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/auth/login')}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => navigate('/auth/register')}
                                        className="text-sm px-3 py-1.5 rounded-md bg-white text-black font-medium hover:bg-white/90 transition-colors flex items-center gap-1"
                                    >
                                        Get Started <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2 text-muted-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden pt-14">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="relative bg-card border-b border-white/[0.06] p-4 space-y-4">
                        <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>How it works</a>
                        <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                        <hr className="border-white/[0.06]" />
                        {session ? (
                            <>
                                <button onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-sm text-foreground">Dashboard</button>
                                <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-sm text-muted-foreground">Sign Out</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { navigate('/auth/login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-sm text-muted-foreground">Sign In</button>
                                <button onClick={() => { navigate('/auth/register'); setIsMobileMenuOpen(false); }} className="block w-full text-sm px-3 py-2 rounded-md bg-white text-black font-medium text-center">Get Started</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
