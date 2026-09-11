import "../styles/landing.css";

import HeroSection from "../components/landing/HeroSection";
import FeatureSection from "../components/landing/FeatureSection";
import AudienceSection from "../components/landing/AudienceSection";
import LandingCTA from "../components/landing/LandingCTA";
import Footer from "../components/common/Footer";

export default function Home() {
  return (
    <main className="landing-page">
      <HeroSection />
      <FeatureSection />
      <AudienceSection />
      <LandingCTA />
      <Footer />
    </main>
  );
}