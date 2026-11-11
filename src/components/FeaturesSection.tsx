import React from 'react';
import { features, Feature } from '../data/features';

const FeatureIcon: React.FC<{ icon: Feature['iconName'] }> = ({ icon }) => {
  switch (icon) {
    case 'countdown':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gold-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'calendar':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gold-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      );
    case 'rsvp':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gold-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      );
    case 'location':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gold-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'prayer':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gold-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case 'gallery':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gold-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
  }
};

export const FeaturesSection: React.FC = () => {
  return (
    <section className="w-full px-4 my-7" aria-labelledby="features-heading">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="w-1.5 h-4 bg-gold-dark rounded-full"></span>
        <h2 id="features-heading" className="font-arabic font-bold text-lg sm:text-xl text-brown">
          شو بتحتوي الدعوة؟
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-beige border border-sand shadow-soft hover:border-gold/50 transition-colors duration-200"
          >
            <div className="p-2 rounded-xl bg-cream border border-sand/70 shrink-0 shadow-xs">
              <FeatureIcon icon={feature.iconName} />
            </div>
            <span className="font-arabic font-medium text-xs sm:text-sm text-brown leading-snug">
              {feature.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

