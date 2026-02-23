import { CheckCircle2, Circle, ListTodo, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const ChecklistTab = ({ recommendations }: { recommendations: any[] }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (!recommendations || recommendations.length === 0) {
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

    const copyAllTasks = () => {
        const text = `
# GROWTH CHECKLIST: ${recommendations.length} Action Items

${recommendations.map((rec, i) => `${i + 1}. ${rec.title}\n   ${rec.description}`).join('\n\n')}
        `.trim();

        navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast.success("Checklist copied for AI!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-white/[0.06] p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full" />

                <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white">Strategic Implementation</h3>
                    <p className="text-sm text-muted-foreground">Actionable improvement tasks generated for your site</p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllTasks}
                    className="relative z-10 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all gap-2"
                >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy Checklist for AI
                </Button>
            </div>

            {/* Checklist Items */}
            <div className="grid gap-3">
                {recommendations.map((rec, i) => (
                    <div
                        key={i}
                        className="group flex items-start gap-4 p-5 rounded-xl border bg-card border-white/[0.06] hover:border-white/20 transition-all duration-300"
                    >
                        <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                            {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-base font-medium text-white group-hover:text-blue-400 transition-colors">
                                {rec.title}
                            </h4>
                            <p className="text-sm mt-1 leading-relaxed text-muted-foreground">
                                {rec.description}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">
                                Priority Fix
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
