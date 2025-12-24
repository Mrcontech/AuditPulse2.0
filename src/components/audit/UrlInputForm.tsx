import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const UrlInputForm = ({ className }: { className?: string }) => {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        let formattedUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            formattedUrl = `https://${url}`;
        }

        try {
            new URL(formattedUrl);
        } catch (e) {
            toast.error("Please enter a valid URL (e.g., example.com)");
            return;
        }

        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.info("Please sign in to start your audit");
                navigate("/auth/login", { state: { returnTo: "/", url: formattedUrl } });
                return;
            }

            const domain = new URL(formattedUrl).hostname;
            const { data: auditId, error: rpcError } = await supabase.rpc('enqueue_audit', {
                p_url: formattedUrl,
                p_domain: domain
            });

            if (rpcError) throw rpcError;

            toast.success("Audit queued! Redirecting to dashboard...");
            navigate(`/audit/${auditId}`);

        } catch (error: any) {
            console.error("Error starting audit:", error);
            toast.error(error.message || "Failed to start audit");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`flex w-full max-w-lg items-center gap-2 ${className}`}>
            <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Enter website URL (e.g., mysite.com)"
                    className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border focus:ring-primary"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6 group" disabled={isLoading || !url}>
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        Run Audit
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                )}
            </Button>
        </form>
    );
};
