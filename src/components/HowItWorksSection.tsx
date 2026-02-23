import { Globe, Brain, FileText, Rocket } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Globe,
      title: "Enter Your URL",
      description: "Paste your website URL (or a competitor's) and let our AI start the comprehensive analysis process."
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our AI assistant scans every page, analyzes content, checks Core Web Vitals, and researches your market."
    },
    {
      icon: FileText,
      title: "Detailed Report & Checklist",
      description: "Receive a comprehensive audit with a prioritized Fix-It Checklist to track your implementation progress."
    },
    {
      icon: Rocket,
      title: "Track, Compare & Grow",
      description: "Use Historical Trend Charts and Competitor Battle Mode to see your progress and stay ahead of the competition."
    }
  ];

  return (
    <section className="py-24 px-6 bg-background border-t border-white/[0.06] relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(59,130,246,0.08),transparent)] pointer-events-none" />
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get comprehensive website insights in just 4 simple steps. No technical expertise required.
          </p>
        </div>

        {/* Steps - Linear style horizontal layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative bg-card border border-white/[0.06] rounded-lg p-6 hover:bg-white/[0.02] transition-colors"
              >
                {/* Step number */}
                <span className="absolute top-4 right-4 text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="text-base font-medium text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
