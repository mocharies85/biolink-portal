'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
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
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>Privacy Policy</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">Last updated: October 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 text-xs sm:text-sm leading-relaxed text-neutral-300">
          
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              We collect account registration data including your chosen username, email address, securely salted/hashed passwords, and your public profile customization settings (bio text, link titles, URLs, avatars, and story media).
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">2. Public Profile Information</h2>
            <p>
              Any information you enter on your bio hub (including display name, social media handles, custom links, and story videos) is inherently public and accessible worldwide. You should never include confidential credentials, bank account passwords, or sensitive personal data on your public bio link.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">3. System Analytics &amp; Admin Audits</h2>
            <p>
              To maintain system performance, prevent malware distribution, and detect abuse, administrators may audit visitor volume, referrer logs, and public link performance. We do not sell or monetize personal creator data to third-party ad brokers.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">4. Account Deletion &amp; Data Erasure</h2>
            <p>
              Creators hold full rights to request complete account deletion and data erasure at any time by contacting administrator support.
            </p>
          </section>

        </div>

        {/* Footer Link */}
        <div className="pt-6 border-t border-neutral-800 text-xs text-neutral-500 flex justify-between">
          <Link href="/terms" className="hover:text-emerald-400 transition underline">
            Read Terms of Service
          </Link>
          <Link href="/" className="hover:text-white transition">
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}