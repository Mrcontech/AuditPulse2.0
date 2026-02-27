import { ListTodo, Copy, Check, Sparkles, Zap, Search, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChecklistItem {
    title: string;
    description: string;
    category: 'performance' | 'seo' | 'technical' | 'security';
    priority: 'high' | 'medium' | 'low';
}

export const ChecklistTab = ({ results }: { results: any }) => {
    const [isCopied, setIsCopied] = useState<string | null>(null);
    const [isAllCopied, setIsAllCopied] = useState(false);

    if (!results) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-white/[0.06] rounded-lg">
                <ListTodo className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-white mb-2">No recommendations found</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Wait for the AI analysis to complete to see your actionable checklist.
                </p>
            </div>
        );
    }

    // 1. AGGREGATE FINDINGS
    const checklist: ChecklistItem[] = [];

    // Performance Findings
    if (results.strategic_recommendations) {
        results.strategic_recommendations.forEach((rec: any) => {
            checklist.push({
                title: rec.title,
                description: rec.description,
                category: 'performance',
                priority: 'high'
            });
        });
    }

    // SEO Gaps
    const seoGaps = results.seo_analysis?.content_gaps || results.content_gaps || [];
    seoGaps.forEach((gap: any) => {
        checklist.push({
            title: typeof gap === 'string' ? "Content Strategy Gap" : `Target Topic: ${gap.topic}`,
            description: typeof gap === 'string' ? gap : gap.advice,
            category: 'seo',
            priority: 'medium'
        });
    });

    // Technical SEO Checks
    const tech = results.technical_seo;
    if (tech) {
        if (!tech.hasOgTags) checklist.push({ title: "Implement Open Graph Tags", description: "Missing OG tags. These are essential for how your links appear on social media (Facebook, LinkedIn).", category: 'technical', priority: 'medium' });
        if (!tech.hasTwitterTags) checklist.push({ title: "Add Twitter Card Metadata", description: "Missing Twitter specific tags. Enhance your site's visibility on X/Twitter.", category: 'technical', priority: 'low' });
        if (!tech.canonical) checklist.push({ title: "Define Canonical URL", description: "No canonical link detected. This prevents duplicate content issues in search engines.", category: 'technical', priority: 'high' });
        if (tech.h1Count === 0) checklist.push({ title: "Add H1 Tag", description: "No H1 tag found. Each page should have exactly one H1 for SEO hierarchy.", category: 'technical', priority: 'high' });
        else if (tech.h1Count > 1) checklist.push({ title: "Fix Multiple H1 Tags", description: "Multiple H1 tags detected. Reduce to one to clarify the primary topic for crawlers.", category: 'technical', priority: 'medium' });
        if (tech.imgAltCount === 0 && (results.technical_performance?.imageCount > 0)) {
            checklist.push({ title: "Add Image Alt Text", description: "None of your images have alt tags. This is critical for accessibility and image SEO.", category: 'technical', priority: 'high' });
        }
        if (!tech.hasJSONLD) checklist.push({ title: "Implement JSON-LD Schema", description: "Structured data helps search engines understand your content better and can enable rich snippets.", category: 'technical', priority: 'medium' });
    }

    // Security
    if (results.security_score < 100) {
        checklist.push({
            title: "Harden Security Headers",
            description: "Some security best-practice headers are missing or improperly configured.",
            category: 'security',
            priority: 'medium'
        });
    }

    const copyFixPrompt = (item: ChecklistItem) => {
        const prompt = `I am working on my website (${results.audits?.domain || 'my site'}). 
Category: ${item.category.toUpperCase()}
Issue: ${item.title}
Details: ${item.description}

Please provide a detailed, step-by-step guide to fix this. Include code snippets where applicable and explain the best practices I should follow.`.trim();

        navigator.clipboard.writeText(prompt);
        setIsCopied(item.title);
        toast.success("Fix prompt copied for AI!");
        setTimeout(() => setIsCopied(null), 2000);
    };

    const copyAllForAI = () => {
        const text = `
# WEBSITE OPTIMIZATION CHECKLIST: ${results.audits?.domain || 'Analysis'}

Below are the identified issues and optimization opportunities from my recent audit. 
Please analyze these and provide an implementation roadmap.

${checklist.map((item, i) => `[${item.category.toUpperCase()}] ${i + 1}. ${item.title}\n   Context: ${item.description}`).join('\n\n')}
        `.trim();

        navigator.clipboard.writeText(text);
        setIsAllCopied(true);
        toast.success("Master checklist copied!");
        setTimeout(() => setIsAllCopied(false), 2000);
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'performance': return <Zap className="w-3.5 h-3.5" />;
            case 'seo': return <Search className="w-3.5 h-3.5" />;
            case 'technical': return <Globe className="w-3.5 h-3.5" />;
            case 'security': return <Shield className="w-3.5 h-3.5" />;
            default: return <Sparkles className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-white/[0.06] p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full" />

                <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        Master Action Checklist
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Unified fixes for Performance, SEO, and Technical health.
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllForAI}
                    className="relative z-10 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all gap-2 h-10 px-4"
                >
                    {isAllCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy Master List for AI
                </Button>
            </div>

            {/* Checklist Items */}
            <div className="grid gap-3">
                {checklist.map((item, i) => (
                    <div
                        key={i}
                        className="group flex flex-col sm:flex-row sm:items-start gap-4 p-5 rounded-xl border bg-card border-white/[0.06] hover:border-white/20 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 sm:block">
                            <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-lg border text-[11px] font-bold shrink-0",
                                item.category === 'performance' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                                    item.category === 'seo' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                        item.category === 'security' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                                            "bg-orange-500/10 border-orange-500/20 text-orange-400"
                            )}>
                                {i + 1}
                            </div>
                            <span className="sm:hidden text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                {item.category}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-base font-medium text-white group-hover:text-blue-400 transition-colors">
                                    {item.title}
                                </h4>
                                <div className={cn(
                                    "px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-tighter sm:flex items-center gap-1 hidden",
                                    item.category === 'performance' ? "bg-green-500/5 text-green-400/60" :
                                        item.category === 'seo' ? "bg-blue-500/5 text-blue-400/60" :
                                            "bg-orange-500/5 text-orange-400/60"
                                )}>
                                    {getCategoryIcon(item.category)}
                                    {item.category}
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {item.description}
                            </p>
                        </div>

                        <div className="sm:ml-auto pt-2 sm:pt-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyFixPrompt(item)}
                                className="w-full sm:w-auto text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 gap-2 h-9 px-4"
                            >
                                {isCopied === item.title ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                                {isCopied === item.title ? "Copied!" : "Copy Fix Prompt"}
                            </Button>
                        </div>
                    </div>
                ))}

                {checklist.length === 0 && (
                    <div className="p-12 text-center border border-dashed border-white/10 rounded-xl">
                        <p className="text-muted-foreground text-sm">No issues detected. Your site is optimal!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
