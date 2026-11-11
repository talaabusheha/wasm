import React from 'react';
import { links } from '../data/links';

export const CtaButton: React.FC = () => {
  return (
    <div className="w-full px-4 my-3 flex flex-col items-center">
      <a
        href={links.orderCta}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-gold-dark hover:bg-gold text-white font-arabic font-bold text-lg text-center shadow-gold-glow flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-cream"
      >
        <span>اطلبي دعوتك 💌</span>
      </a>
      <p className="mt-2 text-xs text-brown-muted font-arabic text-center leading-relaxed">
        ابعتيلنا «دعوة»… وبنبعتلك التصاميم والأسعار
      </p>
    </div>
  );
};

