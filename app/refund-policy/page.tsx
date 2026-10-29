import Link from 'next/link';

export const metadata = {
  title: 'Refund Policy - Curiolot Link',
  description: 'Refund and cancellation policy for Curiolot Link subscriptions',
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex items-center space-x-2 text-emerald-400 text-lg font-semibold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Refund Policy</h1>
          </div>
        </div>

        <p className="text-sm text-gray-400">Last updated: October 2026</p>

        {/* Notice Banner */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm leading-relaxed">
          <strong className="text-amber-400">Important Summary:</strong> Curiolot Link values creator satisfaction. We offer a 14-day refund guarantee for new PRO subscriptions if the platform fails to function as advertised or does not suit your technical workflow.
        </div>

        {/* Policy Content */}
        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">1. Nature of Digital Service</h2>
            <p>
              Curiolot Link PRO is a cloud-hosted Software-as-a-Service (SaaS) subscription providing instant access to advanced biolink features, custom sound playback, video embeds, and elevated account privileges upon payment confirmation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">2. 14-Day Money-Back Guarantee</h2>
            <p>
              If you purchase a Curiolot Link PRO subscription ($5.00/month) and find that the service does not meet your expectations, you are entitled to request a full refund within <strong>14 calendar days</strong> of your initial billing date.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">3. Subscription Cancellation</h2>
            <p>
              You can cancel your PRO subscription at any time directly through your account dashboard or via the billing management link provided in your invoice email. Once canceled, you will retain access to PRO features until the end of your paid billing cycle, and no further automatic charges will occur.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">4. Refund Request Process</h2>
            <p>
              To claim a refund within the eligible 14-day window, send an email to our support team at <a href="mailto:mocharies85@gmail.com" className="text-emerald-400 underline">mocharies85@gmail.com</a> with the subject line <em>"Refund Request - [Your Username]"</em>. Please include your registered account email and checkout order ID.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">5. Payout & Chargeback Compliance</h2>
            <p>
              Approved refunds are credited back to the original payment method (Credit Card or PayPal) via our Merchant of Record partner (Paddle) within 5 to 10 business days, depending on your bank issuer. Fraudulent chargeback disputes initiated without contacting support may lead to immediate account suspension.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-white/10 flex justify-between text-xs text-gray-500">
          <Link href="/terms" className="hover:text-emerald-400 transition">Read Terms of Service</Link>
          <Link href="/" className="hover:text-emerald-400 transition">Back to Home</Link>
        </div>

      </div>
    </main>
  );
}