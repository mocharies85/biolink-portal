'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, Scale, Lock, FileText } from 'lucide-react';

export default function TermsPage() {
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
              <Scale className="w-6 h-6 text-emerald-400" />
              <span>Terms of Service</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">Last updated: October 2026</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-6 text-xs sm:text-sm leading-relaxed text-neutral-300">
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <strong>Ringkasan Penting:</strong> Layanan Curiolot Link disediakan semata-mata sebagai infrastruktur teknis pihak ketiga. Pengguna memegang tanggung jawab mutlak atas setiap tautan, media, dan interaksi yang dibuat. Pelanggaran hukum akan berakibat pada pemblokiran akun permanen tanpa ganti rugi.
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>1. Penerimaan Ketentuan (Acceptance of Terms)</span>
            </h2>
            <p>
              Dengan mendaftar, mengakses, atau mengaktifkan akun di Curiolot Link (link.curiolot.com), Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat secara hukum pada Ketentuan Layanan ini. Apabila Anda tidak menyetujui klausul apa pun di dalam dokumen ini, Anda tidak diperkenankan untuk menggunakan layanan kami.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>2. Pelepasan Tanggung Jawab Konten Pengguna (Safe Harbor & Content Liability)</span>
            </h2>
            <p>
              Curiolot Link bertindak sebagai perantara teknis pasif (neutral technical host). Kami tidak bertanggung jawab, memverifikasi kebenaran, atau mengesahkan konten apa pun yang diunggah oleh pengguna, termasuk tautan eksternal, bio, foto, video, berkas audio, atau pesan masuk. 
            </p>
            <p className="text-neutral-400">
              Pengguna dilarang keras mempublikasikan materi yang memuat: hak cipta pihak ketiga tanpa lisensi sah, pornografi, perjudian online, ujaran kebencian, penipuan/phishing, peretasan, obat-obatan terlarang, atau aktivitas yang melanggar hukum negara setempat maupun internasional.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>3. Klausul Ganti Rugi Mutlak (Indemnification)</span>
            </h2>
            <p>
              Anda setuju untuk membela, mengganti rugi, dan membebaskan pemilik, pengembang, administrator, dan afiliasi Curiolot Link dari dan terhadap segala klaim, tuntutan hukum, kerugian finansial, denda, investigasi pemerintah, atau biaya hukum (termasuk biaya advokat) yang timbul akibat:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-neutral-400">
              <li>Konten, tautan, atau media apa pun yang Anda publikasikan di bio hub Anda.</li>
              <li>Pelanggaran Anda terhadap hak kekayaan intelektual (HAKI) pihak ketiga.</li>
              <li>Penyalahgunaan akun Anda untuk transaksi atau penipuan kepada pengunjung bio Anda.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>4. Hak Akses Pemantauan Sistem (Monitoring & Telemetry Rights)</span>
            </h2>
            <p>
              Demi menjaga integritas jaringan, keamanan platform, dan pencegahan tindakan kriminal, pengelola/Superadmin memiliki hak teknis wajar (legitimate interest) untuk memantau aktivitas sistem, memeriksa analitik kunjungan, memeriksa pesan mencurigakan, dan mengaudit data publik. Pengguna melepaskan hak untuk menuntut pengelola terkait akses pemeliharaan sistem tersebut.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>5. Penutupan Akun Sepihak (Termination at Will)</span>
            </h2>
            <p>
              Kami berhak sewaktu-waktu membekukan, mencabut status langganan PRO, atau menghapus permanen akun pengguna yang terindikasi melanggar hukum atau merusak reputasi platform tanpa pemberitahuan sebelumnya dan tanpa kewajiban kompensasi atau pengembalian dana (no refund).
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>6. Batasan Tanggung Jawab & Jaminan "As-Is"</span>
            </h2>
            <p>
              Layanan disediakan apa adanya ("as-is") tanpa jaminan ketersediaan waktu henti (uptime) tanpa gangguan. Pemilik platform tidak bertanggung jawab atas kerugian tidak langsung, kegagalan penjualan bisnis, atau kehilangan data yang diakibatkan oleh gangguan jaringan internet pihak ketiga atau Cloudflare.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>7. Prosedur Pelaporan Hak Cipta (Takedown Notice)</span>
            </h2>
            <p>
              Jika Anda merupakan pemilik hak cipta dan menemukan pengguna Curiolot Link menyalahgunakan karya Anda, silakan hubungi tim kami via email atau tiket dukungan dengan menyertakan bukti kepemilikan. Kami akan menindaklanjuti dan menghapus materi tersebut dalam 1-3 hari kerja.
            </p>
          </section>

        </div>

        {/* Footer Link */}
        <div className="pt-6 border-t border-neutral-800 text-xs text-neutral-500 flex justify-between">
          <Link href="/privacy" className="hover:text-emerald-400 transition underline">
            Baca Kebijakan Privasi
          </Link>
          <Link href="/" className="hover:text-white transition">
            Kembali ke Beranda
          </Link>
        </div>

      </div>
    </div>
  );
}