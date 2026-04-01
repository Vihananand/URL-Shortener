import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-16">
        <div className="gradient-border-card p-8 sm:p-10 shadow-card">
          <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-white mb-3">Privacy Policy</h1>
          <p className="text-sm text-white/45 mb-8">Last updated: April 1, 2026</p>

          <section className="space-y-7 text-sm text-white/70 leading-relaxed">
            <div>
              <h2 className="text-white font-semibold mb-2">1. Information We Collect</h2>
              <p>
                We collect account details you provide (such as name and email), URL data you create,
                and analytics metadata generated when shortened links are visited, including timestamp,
                referrer, user agent, and IP address.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">2. How We Use Information</h2>
              <p>
                We use your data to operate the service, authenticate users, prevent abuse, generate
                analytics, and improve reliability and product quality.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">3. Data Retention</h2>
              <p>
                We retain data while your account is active and for legitimate operational, legal, or
                security needs. You may request account deletion, after which associated user data is
                removed according to our system constraints and backup retention windows.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">4. Security</h2>
              <p>
                We apply reasonable technical and organizational safeguards, including secure cookie
                practices and access controls. No method of storage or transmission is fully secure.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">5. Your Rights</h2>
              <p>
                Depending on your region, you may have rights to access, update, export, or delete your
                personal data. Contact us through the channels listed in the product to make a request.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
