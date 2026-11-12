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
        <svg className="w-3 h-3 text-gold-dark fill-gold-dark" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
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
        <a
          href="#admin"
          onClick={(e) => {
            e.preventDefault();
            onOpenAdmin();
          }}
          className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-arabic text-brown-muted/80 hover:text-brown border border-sand/60 bg-beige/60 hover:bg-beige hover:border-gold/50 transition-colors focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
          aria-label="تسجيل دخول موظف وسم"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 text-brown-muted/80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>موظف وسم</span>
        </a>
      )}
    </footer>
  );
};
