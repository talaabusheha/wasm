import React, { useState } from 'react';
import { reviews, Review } from '../data/reviews';

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const [imageError, setImageError] = useState(false);

  // If image fails or does not exist, do not render a placeholder card
  if (imageError || !review.image) {
    return null;
  }

  return (
    <div className="snap-start shrink-0 w-[240px] sm:w-[260px] rounded-2xl overflow-hidden bg-beige border border-sand shadow-soft hover:shadow-card hover:border-gold/50 transition-all duration-300">
      <div className="relative w-full aspect-[9/16] bg-beige flex items-center justify-center overflow-hidden">
        <img
          src={review.image}
          alt={review.alt || 'لقطة شاشة لرأي عروس مع وسم'}
          loading="lazy"
          decoding="async"
          width={260}
          height={462}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    </div>
  );
};

export const ReviewsSection: React.FC = () => {
  // Only consider reviews with a valid image path
  const validReviews = (reviews || []).filter(
    (review) => review && review.image && review.image.trim().length > 0
  );

  // If reviews array is empty or has no valid images, do not render the section at all
  if (validReviews.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 my-7" aria-labelledby="reviews-heading">
      <div className="mb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-gold-dark rounded-full"></span>
          <h2 id="reviews-heading" className="font-arabic font-bold text-lg sm:text-xl text-brown">
            آراء العرايس
          </h2>
        </div>
      </div>

      {/* Horizontal scroll-snap row kept within page column padding */}
      <div
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 pt-1 no-scrollbar scroll-smooth"
        role="region"
        aria-label="قائمة لقطات آراء العرايس"
      >
        {validReviews.map((review, idx) => (
          <ReviewCard key={idx} review={review} />
        ))}
      </div>
    </section>
  );
};
