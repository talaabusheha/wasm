import React from 'react';
import { links } from '../data/links';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
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

      {/* زر موظف وسم */}
      {onOpenAdmin && (
        <button
          type="button"
          onClick={onOpenAdmin}
          className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-arabic text-brown-muted/80 hover:text-brown border border-sand/60 bg-beige/60 hover:bg-beige hover:border-gold/50 transition-colors focus:outline-none focus:ring-1 focus:ring-gold"
          aria-label="تسجيل دخول موظف وسم"
        >
          <span className="text-[10px]">🔒</span>
          <span>موظف وسم</span>
        </button>
      )}
    </footer>
  );
};
