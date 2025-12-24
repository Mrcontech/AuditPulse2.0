import { Twitter, Linkedin } from 'lucide-react';

const footerColumns = [
  {
    title: 'Product',
    links: ['Website Audits', 'SEO Analysis', 'Performance', 'Security'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'Blog', 'Tutorials'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Contact'],
  },
];

const legalLinks = ['Terms', 'Privacy', 'Cookies'];

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-background border-t border-white/[0.06] relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />
      <div className="mx-auto max-w-5xl">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-semibold text-sm">A</div>
              <span className="font-semibold text-foreground">AuditPulse</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered website audits and optimization insights.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-medium text-foreground mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((text) => (
                  <li key={text}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.06] gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 AuditPulse. All rights reserved.
          </p>
          <div className="flex gap-4">
            {legalLinks.map((text) => (
              <a key={text} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}