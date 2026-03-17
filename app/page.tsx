import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import StatsBar from "@/components/landing/StatsBar";
import CTA from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <StatsBar />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
