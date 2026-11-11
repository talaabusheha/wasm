import React from 'react';
import { designs } from '../data/designs';
import { DesignCard } from './DesignCard';

export const DesignsSection: React.FC = () => {
  // Hide any card whose url is empty
  const activeDesigns = designs.filter(
    (design) => design.url && design.url.trim().length > 0
  );

  if (activeDesigns.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 my-7" aria-labelledby="designs-heading">
      <div className="mb-3.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-4 bg-gold-dark rounded-full"></span>
          <h2 id="designs-heading" className="font-arabic font-bold text-lg sm:text-xl text-brown">
            شوفي تصاميمنا
          </h2>
        </div>
        <p className="text-xs text-brown-muted font-arabic">
          اكبسي على أي تصميم وجربيه بإيدك
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {activeDesigns.map((design) => (
          <DesignCard key={design.id} design={design} />
        ))}
      </div>
    </section>
  );
};

