'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'id', label: 'Indonesia' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative inline-flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 backdrop-blur-md px-2.5 py-1.5 rounded-full text-xs text-neutral-300">
      <Globe className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent text-neutral-200 text-xs focus:outline-none cursor-pointer pr-1"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}