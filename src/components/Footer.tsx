import React from 'react';
import { links } from '../data/links';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-8 pt-6 pb-8 border-t border-sand flex flex-col items-center justify-center text-center gap-2">
      <div className="flex items-center gap-2 text-brown-muted">
        <span className="w-6 h-[1px] bg-sand"></span>
        <span className="text-gold-dark text-xs">✨</span>
        <span className="w-6 h-[1px] bg-sand"></span>
      </div>

      <p className="font-arabic text-xs text-brown-muted">
        © وَسم 2026
      </p>

      <a
        href={links.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="حساب وَسم على إنستغرام"
        className="font-arabic text-[11px] text-gold-dark hover:underline flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-gold rounded px-2 py-1 min-h-[32px]"
      >
        <span>إنستغرام</span>
        <span className="font-latin text-[10px]">@wasm.invites</span>
      </a>
    </footer>
  );
};

