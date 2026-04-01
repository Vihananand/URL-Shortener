import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-16">
        <div className="gradient-border-card p-8 sm:p-10 shadow-card">
          <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-white mb-3">Terms of Service</h1>
          <p className="text-sm text-white/45 mb-8">Last updated: April 1, 2026</p>

          <section className="space-y-7 text-sm text-white/70 leading-relaxed">
            <div>
              <h2 className="text-white font-semibold mb-2">1. Acceptance of Terms</h2>
              <p>
                By creating an account or using this service, you agree to these terms and all applicable
                laws and regulations.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">2. Permitted Use</h2>
              <p>
                You agree not to use the service for unlawful, deceptive, abusive, or harmful activity,
                including phishing, malware distribution, or spam.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">3. Account Responsibility</h2>
              <p>
                You are responsible for maintaining account security and for all actions taken under your
                account credentials.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">4. Service Availability</h2>
              <p>
                We may modify, suspend, or discontinue features at any time, with or without notice,
                including for maintenance, security, or operational reasons.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">5. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, the service is provided as-is without warranties.
                We are not liable for indirect, incidental, or consequential damages arising from use.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
