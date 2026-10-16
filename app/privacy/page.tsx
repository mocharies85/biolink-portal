'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Top Header */}
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

        {/* Content Section */}
        <div className="flex flex-col gap-6 text-xs sm:text-sm leading-relaxed text-neutral-300">
          
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">1. Data yang Kami Kumpulkan</h2>
            <p>
              Kami mengumpulkan data akun dasar berupa alamat email, nama pengguna (username), kata sandi terenkripsi (hash), serta konfigurasi profil publik (bio, link tautan, foto, dan video story).
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">2. Sifat Data Profil Publik</h2>
            <p>
              Seluruh informasi yang Anda masukkan pada halaman profil bio (termasuk judul link, foto, sosial media) adalah data publik yang dirancang untuk diakses oleh siapa saja di internet. Jangan pernah memasukkan data rahasia perbankan atau kata sandi pribadi ke dalam tautan bio Anda.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">3. Akses Pemantauan & Analisis Pengelola</h2>
            <p>
              Untuk memastikan tidak ada tautan yang disalahgunakan untuk kegiatan melanggar hukum (seperti malware atau penipuan), administrator berhak melihat data statistik kunjungan publik, volume pesan masuk, dan memeriksa laporan masyarakat secara berkala. Kami tidak memperjualbelikan data Anda kepada pihak pengiklan pihak ketiga mana pun.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">4. Hak Penghapusan Akun</h2>
            <p>
              Pengguna memiliki hak penuh untuk meminta penghapusan akun dan seluruh berkas terkait kapan saja melalui permohonan ke admin support atau menu dashboard.
            </p>
          </section>

        </div>

        {/* Footer Link */}
        <div className="pt-6 border-t border-neutral-800 text-xs text-neutral-500 flex justify-between">
          <Link href="/terms" className="hover:text-emerald-400 transition underline">
            Baca Ketentuan Layanan
          </Link>
          <Link href="/" className="hover:text-white transition">
            Kembali ke Beranda
          </Link>
        </div>

      </div>
    </div>
  );
}