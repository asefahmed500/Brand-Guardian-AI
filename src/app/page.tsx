
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { LandingHowItWorks } from "@/components/landing-how-it-works";
import { LandingFeatures } from "@/components/landing-features";
import { LandingFooter } from "@/components/landing-footer";

export default function LandingPage() {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <LandingNavbar />
        <main className="flex-grow">
          <LandingHero />
          <LandingHowItWorks />
          <LandingFeatures />
        </main>
        <LandingFooter />
      </div>
    );
}
