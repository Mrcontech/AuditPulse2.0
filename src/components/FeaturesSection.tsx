import {
  Search, Link, Target, TrendingUp, Shield, Zap,
  ListTodo, History, Swords, FileText, Brain, BarChart3,
  Sparkles, Globe
} from 'lucide-react';

const FeaturesSection = () => {
  const coreFeatures = [
    {
      icon: Search,
      title: 'AI-Powered Site Scanning',
      description: 'Comprehensive analysis of your entire website structure, performance, and user experience in minutes.'
    },
    {
      icon: Brain,
      title: 'AI Strategic Assistant',
      description: 'Advanced AI for real-time market research, content analysis, and strategic growth ideas.'
    },
    {
      icon: Zap,
      title: 'Core Web Vitals',
      description: 'Get actionable insights on LCP, CLS, and other metrics to improve site speed and search rankings.'
    },
    {
      icon: Shield,
      title: 'Security Audit',
      description: 'Comprehensive SSL validation, security header analysis, and vulnerability scanning.'
    },
    {
      icon: Target,
      title: 'Content Gap Analysis',
      description: 'Discover missing content opportunities and gaps in your strategy compared to competitors.'
    },
    {
      icon: Link,
      title: 'Broken Link Detection',
      description: 'Instantly identify all broken internal and external links hurting your SEO.'
    },
  ];

  const premiumFeatures = [
    {
      icon: ListTodo,
      title: 'Fix-It Checklist',
      description: 'Turn audit findings into an actionable task list. Track your progress as you implement each fix.',
      isNew: true
    },
    {
      icon: History,
      title: 'Historical Trend Charts',
      description: 'See how your Performance, SEO, and Security scores improve over multiple audits.',
      isNew: true
    },
    {
      icon: Swords,
      title: 'Competitor Battle Mode',
      description: 'Compare any two audits side-by-side with a "Winner" trophy system for each metric.',
      isNew: true
    },
    {
      icon: FileText,
      title: 'Premium PDF Reports',
      description: 'Generate polished, multi-page executive reports for stakeholders or clients.',
      isNew: true
    },
    {
      icon: BarChart3,
      title: 'SWOT Analysis',
      description: 'AI-generated Strengths, Weaknesses, Opportunities, and Threats for your digital presence.'
    },
    {
      icon: Globe,
      title: 'Growth Insights',
      description: 'Deep market insights, industry trend analysis, and strategic recommendations tailored to your business.'
    },
  ];

  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.1),transparent)] pointer-events-none" />
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Everything you need to dominate your market
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI assistant provides comprehensive website analysis and actionable insights to improve your online presence.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid gap-px bg-white/[0.04] rounded-lg overflow-hidden border border-white/[0.06] sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {coreFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Premium Features Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Advanced Analysis</span>
          </div>
          <h3 className="text-2xl font-semibold text-foreground">
            Go beyond basic audits
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-2">
            Advanced features to turn insights into action and track your progress over time.
          </p>
        </div>

        {/* Premium Features Grid */}
        <div className="grid gap-px bg-white/[0.04] rounded-lg overflow-hidden border border-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          {premiumFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 hover:bg-white/[0.02] transition-colors relative group"
            >
              {feature.isNew && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  New
                </span>
              )}
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <feature.icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;