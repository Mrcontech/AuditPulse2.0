import { CheckCircle2, Circle, ListTodo } from "lucide-react";

interface ChecklistTabProps {
    recommendations: any[];
    completedTasks: string[];
    onToggleTask: (taskTitle: string) => void;
}

export const ChecklistTab = ({ recommendations, completedTasks, onToggleTask }: ChecklistTabProps) => {
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

    const progress = Math.round((completedTasks.length / recommendations.length) * 100);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Progress Header */}
            <div className="bg-card border border-white/[0.06] rounded-xl p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full" />

                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Execution Roadmap</h3>
                        <p className="text-sm text-muted-foreground">Track your progress in implementing these fixes</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-blue-400">{progress}%</span>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Completed</p>
                    </div>
                </div>

                <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden relative z-10">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Checklist Items */}
            <div className="grid gap-4">
                {recommendations.map((rec, i) => {
                    const isCompleted = completedTasks.includes(rec.title);

                    return (
                        <button
                            key={i}
                            onClick={() => onToggleTask(rec.title)}
                            className={`group flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 text-left ${isCompleted
                                    ? 'bg-blue-500/5 border-blue-500/30'
                                    : 'bg-card border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02]'
                                }`}
                        >
                            <div className="mt-0.5 shrink-0">
                                {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6 text-blue-400 fill-blue-400/10" />
                                ) : (
                                    <Circle className="w-6 h-6 text-muted-foreground group-hover:text-white transition-colors" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-base font-medium transition-colors ${isCompleted ? 'text-white/50 line-through' : 'text-white'
                                    }`}>
                                    {rec.title}
                                </h4>
                                <p className={`text-sm mt-1 leading-relaxed transition-colors ${isCompleted ? 'text-muted-foreground/50' : 'text-muted-foreground'
                                    }`}>
                                    {rec.description}
                                </p>
                            </div>
                            {!isCompleted && (
                                <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold px-2 py-1 rounded bg-blue-500/10">
                                        Actionable
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {progress === 100 && (
                <div className="p-8 rounded-xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Audit Fully Implemented!</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        You've completed all recommended optimizations. Run a new audit to see your improved scores.
                    </p>
                </div>
            )}
        </div>
    );
};
