import React, { useState } from 'react';
import { links } from '../data/links';

export const Header: React.FC = () => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="flex flex-col items-center text-center pt-8 pb-5 px-4 fade-in-up">
      {/* Logo in Circle */}
      <div className="relative mb-4 group">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-beige border-2 border-sand p-1 shadow-soft flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
          {/* Logo image with graceful monogram fallback if image not yet placed */}
          {!logoError && (
            <img
              src="/logo.png"
              alt="شعار وسم"
              width={112}
              height={112}
              className={`w-full h-full object-cover rounded-full transition-opacity duration-300 ${
                logoLoaded ? 'opacity-100' : 'opacity-0 absolute'
              }`}
              onLoad={(e) => {
                const target = e.currentTarget;
                if (target.naturalWidth <= 1 && target.naturalHeight <= 1) {
                  setLogoError(true);
                } else {
                  setLogoLoaded(true);
                }
              }}
              onError={() => setLogoError(true)}
            />
          )}

          {(!logoLoaded || logoError) && (
            <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-beige text-gold-dark select-none">
              <span className="font-arabic font-bold text-2xl tracking-wide">وَسم</span>
              <span className="text-[10px] tracking-widest text-brown-muted font-latin mt-0.5">WASM</span>
            </div>
          )}
        </div>
      </div>

      {/* Brand Title */}
      <h1 className="font-arabic font-bold text-3xl sm:text-4xl text-brown tracking-tight mb-1">
        وَسم
      </h1>

      {/* Subtitle */}
      <p className="font-arabic font-medium text-sm sm:text-base text-gold-dark mb-2">
        دعوات أعراس إلكترونية
      </p>

      {/* Slogan */}
      <p className="text-xs sm:text-sm text-brown-muted font-arabic max-w-xs leading-relaxed mb-4">
        دعوة عرسك… برابط واحد بيوصل لكل ضيوفك 🤎
      </p>

      {/* Small Instagram icon (Min tap target 44x44px for accessibility) */}
      <a
        href={links.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="حساب وَسم على إنستغرام"
        className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-beige border border-sand text-brown hover:text-gold-dark hover:border-gold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      </a>
    </header>
  );
};

