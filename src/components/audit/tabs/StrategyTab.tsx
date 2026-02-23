import {
    Target,
    Zap,
    Globe,
    ArrowRight,
    Lightbulb,
    ExternalLink,
    Rocket,
    TrendingUp,
    Sparkles,
    ShieldAlert,
    Crown,
    ChevronRight,
    Layers,
    Copy,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

export const StrategyTab = ({ results }: { results: any }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (!results) return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
            <p className="text-sm text-muted-foreground">Strategizing your bespoke digital blueprint...</p>
        </div>
    );

    const roadmap = results.growth_roadmap || {
        reach: { title: "Visibility", goal: "", steps: [] },
        act: { title: "Interaction", goal: "", steps: [] },
        convert: { title: "Revenue", goal: "", steps: [] },
        engage: { title: "Retention", goal: "", steps: [] }
    };
    const ecosystem = results.ecosystem_recommendations || [];
    const recommendations = results.strategic_recommendations || [];

    const strategyScore = typeof results.strategy_score === 'object'
        ? results.strategy_score?.overall || 0
        : results.strategy_score || 0;

    const scoreRationale = typeof results.strategy_score === 'object'
        ? results.strategy_score?.score_rationale
        : null;

    const positioning = results.market_positioning || {};
    const psychology = results.conversion_psychology || {};

    const raceStages = [
        { key: 'reach', icon: <Globe className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
        { key: 'act', icon: <Zap className="w-4 h-4" />, color: 'text-indigo-400', bg: 'bg-indigo-500/5', border: 'border-indigo-500/20' },
        { key: 'convert', icon: <Target className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/20' },
        { key: 'engage', icon: <Crown className="w-4 h-4" />, color: 'text-pink-400', bg: 'bg-pink-500/5', border: 'border-pink-500/20' }
    ];

    const copyStrategyForAI = () => {
        const text = `
# STRATEGIC AUDIT BLUEPRINT: ${results.domain || 'AuditPulse Report'}

## 1. MARKET POSITIONING
Positioning Statement: ${results.brand_voice_analysis || positioning.positioning_statement}
Narrative Moat: ${positioning.narrative_moat}
Archetype: ${positioning.brand_archetype?.primary}
Category Design: ${positioning.category_design}

## 2. CONVERSION PSYCHOLOGY
Jobs to be Done:
- Functional: ${psychology.jobs_to_be_done?.functional}
- Emotional: ${psychology.jobs_to_be_done?.emotional}
- Social: ${psychology.jobs_to_be_done?.social}

Barriers: ${(psychology.psychological_barriers || []).map((b: any) => typeof b === 'string' ? b : b.barrier).join(', ')}
Hooks: ${(psychology.persuasion_hooks || []).map((h: any) => typeof h === 'string' ? h : h.hook).join(', ')}

## 3. GROWTH ROADMAP (RACE)
- REACH: ${roadmap.reach?.goal}. Steps: ${roadmap.reach?.steps?.join('; ')}
- ACT: ${roadmap.act?.goal}. Steps: ${roadmap.act?.steps?.join('; ')}
- CONVERT: ${roadmap.convert?.goal}. Steps: ${roadmap.convert?.steps?.join('; ')}
- ENGAGE: ${roadmap.engage?.goal}. Steps: ${roadmap.engage?.steps?.join('; ')}

## 4. STRATEGIC PIVOTS
${recommendations.map((r: any) => `- ${r.title}: ${r.description}`).join('\n')}
        `.trim();

        navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast.success("Strategic blueprint copied for LLM!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 pb-10"
        >
            {/* Action Bar */}
            <div className="flex justify-end mb-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyStrategyForAI}
                    className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all gap-2"
                >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy Strategy for AI
                </Button>
            </div>
            {/* Top Row: Consolidated Strategy Header */}
            <motion.div variants={itemVariants} className="bg-card border border-white/[0.06] rounded-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
                    {/* Strategy Index Sidebar */}
                    <div className="lg:w-[280px] p-6 flex flex-col items-center justify-center bg-white/[0.01]">
                        <div className="flex items-center gap-2 mb-6 self-start">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <h3 className="text-sm font-medium text-white">Strategy Index</h3>
                        </div>
                        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/[0.03]" />
                                <motion.circle
                                    cx="56"
                                    cy="56"
                                    r="50"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="5"
                                    strokeDasharray={314}
                                    initial={{ strokeDashoffset: 314 }}
                                    animate={{ strokeDashoffset: 314 - (314 * strategyScore) / 100 }}
                                    className="text-blue-400"
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold text-white tracking-tight">{strategyScore}</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center leading-relaxed">
                            {scoreRationale || "Proprietary blueprint score based on market fit."}
                        </p>
                    </div>

                    {/* Market Positioning Main Content */}
                    <div className="flex-1 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <h3 className="text-sm font-medium text-white">Market Positioning Statement</h3>
                        </div>

                        <div className="space-y-8">
                            <p className="text-xl font-medium text-white/90 leading-snug italic border-l-2 border-blue-500/30 pl-6 py-1">
                                "{results.brand_voice_analysis || positioning.positioning_statement || "Developing your core positioning statement..."}"
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 pt-8 border-t border-white/[0.04]">
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2 font-semibold">Narrative Moat</span>
                                    <p className="text-xs text-white/70 leading-relaxed">{positioning.narrative_moat || "Analyzing..."}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2 font-semibold">Category Design</span>
                                    <p className="text-xs text-white/70 leading-relaxed">{positioning.category_design || "Market fit..."}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2 font-semibold">Archetype</span>
                                    <p className="text-xs text-white/70 leading-relaxed">{positioning.brand_archetype?.primary || "N/A"}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2 font-semibold">Growth Note</span>
                                    <p className="text-xs text-white/70 leading-relaxed">{results.timeframe_note || "Strategic focus..."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Second Row: Conversion Psychology & Moats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Psychology */}
                <motion.div variants={itemVariants} className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-medium text-white">Conversion Psychology</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 block">Jobs to be Done (JTBD)</span>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <span className="text-[9px] text-muted-foreground uppercase block mb-1 opacity-60">Functional</span>
                                    <p className="text-xs text-white/80 leading-relaxed">{psychology.jobs_to_be_done?.functional || "..."}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] text-muted-foreground uppercase block mb-1 opacity-60">Emotional</span>
                                    <p className="text-xs text-white/80 leading-relaxed">{psychology.jobs_to_be_done?.emotional || "..."}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] text-muted-foreground uppercase block mb-1 opacity-60">Social</span>
                                    <p className="text-xs text-white/80 leading-relaxed">{psychology.jobs_to_be_done?.social || "..."}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.01] p-4 rounded-lg border border-white/[0.04]">
                                <span className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-widest block mb-3">Barriers</span>
                                <ul className="space-y-2">
                                    {(psychology.psychological_barriers || []).map((item: any, i: number) => (
                                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                            <div className="w-1 h-1 rounded-full bg-red-500/40 mt-1.5 shrink-0" />
                                            <span>{typeof item === 'string' ? item : item.barrier}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-blue-500/[0.02] p-4 rounded-lg border border-blue-500/10">
                                <span className="text-[10px] font-medium text-blue-400/80 uppercase tracking-widest block mb-3">Persuasion Hooks</span>
                                <ul className="space-y-2">
                                    {(psychology.persuasion_hooks || []).map((item: any, i: number) => (
                                        <li key={i} className="text-xs text-blue-50/70 flex items-start gap-2">
                                            <ArrowRight className="w-3 h-3 text-blue-400/50 mt-0.5 shrink-0" />
                                            <span>{typeof item === 'string' ? item : item.hook}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Strategic Moats */}
                <motion.div variants={itemVariants} className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Rocket className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-medium text-white">Strategic Moats</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Competitive Vulnerability</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {results.competitive_gap || "Analyzing market risks..."}
                            </p>
                        </div>
                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg relative overflow-hidden group">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Asymmetric Advantage</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {results.market_gap || "Searching for leverage points..."}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* RACE Digital Growth Roadmap */}
            <motion.div variants={itemVariants} className="bg-card border border-white/[0.06] rounded-lg p-6">
                <div className="mb-8 text-center sm:text-left">
                    <Badge className="bg-blue-500/10 text-blue-400 text-[9px] uppercase font-bold tracking-[0.2em] px-3 py-0.5 border-blue-500/20 mb-2">RACE Growth Framework</Badge>
                    <h2 className="text-lg font-semibold text-white">Digital Domination Roadmap</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {raceStages.map((stage, i) => {
                        const data = roadmap[stage.key] || { title: stage.key, steps: [] };
                        return (
                            <div key={stage.key} className="space-y-4">
                                <div className={cn("p-4 rounded-lg border", stage.bg, stage.border)}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={cn("p-1.5 rounded bg-white/5", stage.color)}>{stage.icon}</div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white uppercase tracking-tight">{data.title}</h4>
                                            <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Phase 0{i + 1}</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-white/90 leading-relaxed font-medium italic mb-2">"{data.goal || "Growth optimization..."}"</p>
                                    <div className="space-y-2">
                                        {(data.steps || []).map((step: string, idx: number) => (
                                            <div key={idx} className="bg-white/[0.03] border border-white/[0.04] p-2 rounded-md">
                                                <p className="text-[10px] text-muted-foreground leading-tight">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Pivot Recommendations & Ecosystem */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-card border border-white/[0.06] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-medium text-white">Strategic Pivots</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.map((rec: any, i: number) => (
                            <div key={i} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                                    <Badge className={cn(
                                        "text-[8px] font-bold uppercase px-1.5 py-0",
                                        rec.priority === 'Extreme' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    )}>
                                        {rec.priority}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-card border border-white/[0.06] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-medium text-white">Growth Ecosystem</h3>
                    </div>
                    <div className="space-y-3">
                        {ecosystem.map((platform: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/30 transition-all">
                                <div className="p-2 rounded-md bg-indigo-500/10">
                                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white mb-0.5">{platform.platform || platform.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{platform.playbook || "Strategic playbook..."}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
