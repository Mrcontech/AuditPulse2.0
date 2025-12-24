import { Search, Link, Target, TrendingUp, Shield, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: 'AI-Powered Site Scanning',
      description: 'Comprehensive analysis of your entire website structure, performance, and user experience in minutes.'
    },
    {
      icon: Link,
      title: 'Broken Link Detection',
      description: 'Instantly identify and report all broken internal and external links that hurt your SEO and user experience.'
    },
    {
      icon: Target,
      title: 'Content Gap Analysis',
      description: 'Discover missing content opportunities and gaps in your content strategy compared to competitors.'
    },
    {
      icon: TrendingUp,
      title: 'Market Research',
      description: 'Deep dive into your market landscape and uncover untapped opportunities for growth.'
    },
    {
      icon: Shield,
      title: 'Security Audit',
      description: 'Comprehensive security scanning to identify vulnerabilities and protect your digital assets.'
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Get actionable insights to improve site speed, Core Web Vitals, and overall performance.'
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
            Everything you need to optimize your website
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI copilot provides comprehensive website analysis and actionable insights to improve your online presence.
          </p>
        </div>

        {/* Features Grid - Linear style */}
        <div className="grid gap-px bg-white/[0.04] rounded-lg overflow-hidden border border-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
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
      </div>
    </section>
  );
};

export default FeaturesSection;