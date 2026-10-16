'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-5">
          <Link
            href="/"
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-400" />
              <span>Terms of Service</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">Last updated: October 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 text-xs sm:text-sm leading-relaxed text-neutral-300">
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <strong>Important Summary:</strong> Curiolot Link provides bio-link technical infrastructure only. Each user bears full legal and personal liability for all links, media, and interactions created on their profile. Illegal activities will result in immediate permanent termination without compensation.
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By creating an account, clicking verification links, or using Curiolot Link (link.curiolot.com), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service. If you disagree with any portion of these terms, you must not use our service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">2. Passive Host &amp; Content Disclaimer</h2>
            <p>
              Curiolot Link acts solely as an intermediary technical host. We do not author, verify, or endorse content uploaded by users (including external links, titles, images, videos, audio soundtracks, or incoming messages). Users are strictly prohibited from publishing materials violating copyright, pornography, illegal gambling, fraud/phishing, hate speech, or narcotics.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">3. Absolute Indemnification Clause</h2>
            <p>
              You agree to defend, indemnify, and hold harmless the owners, developers, and administrators of Curiolot Link against any and all legal claims, damages, liabilities, governmental fines, or legal fees arising from content you post, third-party copyright infringements, or transactions conducted through your bio hub.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">4. Administrative Monitoring &amp; System Rights</h2>
            <p>
              To protect network integrity and prevent criminal or malicious abuse, administrators retain the legitimate right to inspect traffic metrics, audit public profile data, monitor inbox patterns for spam/phishing, and investigate abuse reports. Users waive any claim against administrators regarding standard system maintenance access.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">5. Termination at Will</h2>
            <p>
              We reserve the absolute right to suspend, terminate, or remove any user account or PRO subscription tier at any time without prior notice if fraudulent activity, legal violations, or harmful actions are detected, without any obligation of refund or compensation.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">6. Limitation of Liability &amp; "As-Is" Service</h2>
            <p>
              Curiolot Link is provided on an "as-is" and "as-available" basis without uptime warranties. Under no circumstances shall the platform owner be liable for lost profits, business interruptions, or data loss caused by third-party edge outages or cyber incidents.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">7. Copyright &amp; DMCA Takedown Notice</h2>
            <p>
              If you believe any content on a Curiolot profile infringes your intellectual property, please submit a formal takedown request with proof of ownership to our administrator support. We will review and remove infringing content within 1–3 business days.
            </p>
          </section>

        </div>

        {/* Footer Link */}
        <div className="pt-6 border-t border-neutral-800 text-xs text-neutral-500 flex justify-between">
          <Link href="/privacy" className="hover:text-emerald-400 transition underline">
            Read Privacy Policy
          </Link>
          <Link href="/" className="hover:text-white transition">
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}