import React from 'react';
import { links } from '../data/links';

export const CtaButton: React.FC = () => {
  return (
    <div className="w-full px-4 my-3 flex flex-col items-center">
      <a
        href={links.orderCta}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-gold-dark hover:bg-gold text-white font-arabic font-bold text-lg text-center shadow-gold-glow flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-cream"
      >
        <span>اطلبي دعوتك</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white/95"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </a>
      <p className="mt-2 text-xs text-brown-muted font-arabic text-center leading-relaxed">
        ابعتيلنا «دعوة»… وبنبعتلك التصاميم والأسعار
      </p>
    </div>
  );
};

