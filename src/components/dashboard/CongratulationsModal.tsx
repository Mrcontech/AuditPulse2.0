import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Swords,
    Zap,
    LineChart,
    X,
    ChevronRight,
    Sparkles,
    Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CongratulationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier?: 'pro' | 'max';
}

const slides = [
    {
        title: "Welcome to the Pro Tier!",
        description: "You've successfully upgraded your account. Get ready to experience the full power of AuditPulse.",
        icon: <Trophy className="w-12 h-12 text-yellow-400" />,
        color: "from-yellow-400/20 to-transparent"
    },
    {
        title: "Battle Mode Unlocked",
        description: "Compare your site against competitors side-by-side. See exactly where you win and where you can improve.",
        icon: <Swords className="w-12 h-12 text-blue-400" />,
        color: "from-blue-400/20 to-transparent"
    },
    {
        title: "Strategic Intelligence",
        description: "Unlock advanced AI frameworks like RACE and SWOT to turn raw data into actionable business strategy.",
        icon: <LineChart className="w-12 h-12 text-purple-400" />,
        color: "from-purple-400/20 to-transparent"
    },
    {
        title: "Priority Audit Lane",
        description: "Your audits now jump to the front of the queue. Get your results faster with our dedicated premium servers.",
        icon: <Zap className="w-12 h-12 text-green-400" />,
        color: "from-green-400/20 to-transparent"
    }
];

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({ isOpen, onClose, tier = 'pro' }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(s => s + 1);
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0A0A0B] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors z-20 text-muted-foreground hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 flex gap-px px-1">
                        {slides.map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-full transition-colors duration-500 rounded-full ${i <= currentSlide ? 'bg-blue-500' : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Background Glow */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`absolute inset-0 bg-gradient-to-b ${slides[currentSlide].color} pointer-events-none opacity-40`}
                        />
                    </AnimatePresence>

                    <div className="relative z-10 p-8 pt-12 flex flex-col items-center text-center">
                        {/* Animated Icon Container */}
                        <motion.div
                            key={`icon-${currentSlide}`}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] shadow-inner"
                        >
                            {slides[currentSlide].icon}
                        </motion.div>

                        {/* Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`content-${currentSlide}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center justify-center gap-2">
                                        {currentSlide === 0 && <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />}
                                        {slides[currentSlide].title}
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed px-4">
                                        {slides[currentSlide].description}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="mt-8 w-full">
                            <Button
                                onClick={nextSlide}
                                className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium text-base rounded-xl group transition-all"
                            >
                                {currentSlide === slides.length - 1 ? (
                                    <>
                                        <Rocket className="w-4 h-4 mr-2" />
                                        Launch Dashboard
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </Button>

                            <div className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest font-medium opacity-50">
                                Slide {currentSlide + 1} of {slides.length}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
