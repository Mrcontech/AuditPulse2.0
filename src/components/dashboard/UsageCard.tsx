import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UsageCardProps {
    used: number;
    limit: number;
    tier: string;
    className?: string;
}

export const UsageCard = ({ used, limit, tier, className }: UsageCardProps) => {
    const percentage = Math.min((used / limit) * 100, 100);
    const isNearLimit = percentage > 80;
    const isAtLimit = percentage >= 100;

    return (
        <div className={cn("p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-3", className)}>
            <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground uppercase tracking-wider">{tier} Plan</span>
                <span className={cn(
                    "font-semibold",
                    isAtLimit ? "text-red-400" : isNearLimit ? "text-yellow-400" : "text-white"
                )}>
                    {used} / {limit}
                </span>
            </div>

            <Progress
                value={percentage}
                className="h-1.5 bg-white/[0.06]"
            // Note: The UI library Progress component might need custom colors handled via CSS or shadcn props
            />

            <p className="text-[10px] text-muted-foreground leading-relaxed">
                {isAtLimit
                    ? "Limit reached. Upgrade for more audits."
                    : `${limit - used} audits remaining this month.`}
            </p>
        </div>
    );
};
