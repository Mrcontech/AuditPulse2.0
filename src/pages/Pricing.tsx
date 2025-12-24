import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";

export default function Pricing() {
    return (
        <div className="min-h-screen bg-background">
            <LandingNavigation />
            <div className="pt-20">
                <PricingSection />
                <CTASection />
            </div>
        </div>
    );
}
