import Link from 'next/link';

export const metadata = {
  title: 'Pricing Plans - Curiolot Link',
  description: 'Transparent pricing for creators on Curiolot Link',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] py-14 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Navigation & Header */}
        <div className="text-center space-y-4">
          <Link
            href="/"
            className="inline-flex items-center text-xs text-gray-400 hover:text-emerald-400 transition mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
            Build your personalized creator hub with complete freedom. Start free or upgrade to PRO for full multimedia and identity controls.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* FREE TIER */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Starter Free</h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-gray-300">Basic</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Essential tools for creators establishing their online presence.</p>
              <div className="text-3xl font-extrabold text-white mb-6">
                $0 <span className="text-sm font-normal text-gray-400">/ forever</span>
              </div>

              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Unlimited standard bio links</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Direct message inbox module</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Standard dark theme interface</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-400">
                  <span className="text-gray-500">•</span>
                  <span>Username change: 48h cooldown</span>
                </li>
              </ul>
            </div>

            <Link
              href="/admin"
              className="w-full block text-center py-3 px-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition text-sm"
            >
              Get Started Free
            </Link>
          </div>

          {/* PRO TIER */}
          <div className="rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-b from-emerald-950/20 to-transparent p-8 flex flex-col justify-between space-y-6 relative shadow-lg shadow-emerald-950/40">
            <div className="absolute -top-3.5 right-6 px-3 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full uppercase tracking-wider">
              Most Popular
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Creator PRO</h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Full Access</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Complete multimedia power, branding, and instant customization.</p>
              <div className="text-3xl font-extrabold text-white mb-6">
                $5.00 <span className="text-sm font-normal text-gray-400">/ month</span>
              </div>

              <ul className="space-y-3 text-sm text-gray-200">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Instant username updates</strong> (no cooldown)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Background soundtrack & audio player</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Embedded video showcase modules</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>24-Hour creator stories</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>PIN-protected private links</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Priority email & developer support</span>
                </li>
              </ul>
            </div>

            <Link
              href="/admin"
              className="w-full block text-center py-3 px-4 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition text-sm shadow-md"
            >
              Upgrade to PRO
            </Link>
          </div>

        </div>

        {/* Compliance FAQ Section for Paddle */}
        <div className="pt-8 border-t border-white/10 space-y-4 text-xs text-gray-400">
          <p>
            <strong>Billing & Security:</strong> Payments are processed securely via our Merchant of Record partner, Paddle. We support major Credit Cards and PayPal.
          </p>
          <p>
            <strong>Refund Guarantee:</strong> All initial PRO plans come with a 14-day satisfaction refund policy. View our <Link href="/refund-policy" className="text-emerald-400 underline">Refund Policy</Link> for details.
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between text-xs text-gray-500 pt-4 border-t border-white/5">
          <div className="space-x-4">
            <Link href="/terms" className="hover:text-emerald-400 transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-emerald-400 transition">Refund Policy</Link>
          </div>
          <p>© 2026 Curiolot Link</p>
        </div>

      </div>
    </main>
  );
}