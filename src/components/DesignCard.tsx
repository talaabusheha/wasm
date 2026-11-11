import React, { useState } from 'react';
import { Design } from '../data/designs';

interface DesignCardProps {
  design: Design;
}

export const DesignCard: React.FC<DesignCardProps> = ({ design }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasImage = !imageError && Boolean(design.image && design.image.trim().length > 0);
  const isImageShowing = hasImage && imageLoaded;

  return (
    <a
      href={design.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl bg-beige border border-sand p-2 overflow-hidden shadow-soft hover:shadow-card hover:border-gold/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50"
    >
      {/* Portrait 9:14 container with explicit aspect ratio */}
      <div className="relative w-full aspect-[9/14] rounded-xl overflow-hidden bg-beige border border-sand/60">
        {/* Soft beige placeholder with the design name centered when image is missing */}
        {!isImageShowing && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-beige text-brown select-none">
            <span className="text-sm sm:text-base font-arabic font-bold text-brown leading-snug">
              {design.name}
            </span>
          </div>
        )}

        {/* Real image if provided and loaded */}
        {hasImage && (
          <img
            src={design.image}
            alt={`معاينة تصميم ${design.name}`}
            loading="lazy"
            decoding="async"
            width={240}
            height={373}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Style Tag badge (Only shown if tag exists) */}
        {design.tag && design.tag.trim().length > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-cream/95 backdrop-blur-sm text-brown text-[11px] font-arabic font-medium px-2 py-0.5 rounded-full border border-sand/70 shadow-xs">
            {design.tag}
          </span>
        )}
      </div>

      {/* Card Info: Only visible when the image exists and is displayed */}
      {isImageShowing && (
        <div className="pt-2.5 pb-1 px-1 flex items-center justify-between">
          <h3 className="font-arabic font-bold text-xs sm:text-sm text-brown truncate">
            {design.name}
          </h3>
          <span className="text-[11px] font-arabic text-gold-dark font-medium group-hover:underline flex items-center gap-0.5 shrink-0">
            معاينة ↗
          </span>
        </div>
      )}
    </a>
  );
};
