import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-16">
        <div className="gradient-border-card p-8 sm:p-10 shadow-card">
          <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-white mb-3">Cookie Policy</h1>
          <p className="text-sm text-white/45 mb-8">Last updated: April 1, 2026</p>

          <section className="space-y-7 text-sm text-white/70 leading-relaxed">
            <div>
              <h2 className="text-white font-semibold mb-2">1. What Are Cookies</h2>
              <p>
                Cookies are small text files stored in your browser to support authentication,
                preferences, and session continuity.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">2. Cookies We Use</h2>
              <p>
                We use essential cookies for secure login and session management. Without these,
                key account features may not function correctly.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">3. Third-Party Services</h2>
              <p>
                We may use third-party tools for analytics and infrastructure. These providers can set
                cookies or similar technologies according to their own policies.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">4. Managing Cookies</h2>
              <p>
                You can control or delete cookies through browser settings. Blocking essential cookies
                may affect authentication and dashboard access.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
