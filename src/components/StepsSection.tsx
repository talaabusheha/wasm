import React from 'react';
import { steps } from '../data/steps';

export const StepsSection: React.FC = () => {
  return (
    <section className="w-full px-4 my-7" aria-labelledby="steps-heading">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="w-1.5 h-4 bg-gold-dark rounded-full"></span>
        <h2 id="steps-heading" className="font-arabic font-bold text-lg sm:text-xl text-brown">
          كيف بتطلبي؟
        </h2>
      </div>

      <div className="flex flex-col gap-2.5">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-beige border border-sand shadow-soft transition-all duration-200 hover:border-gold/50"
          >
            <div className="w-8 h-8 rounded-full bg-gold-dark text-white font-arabic font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              {step.stepNumber}
            </div>
            <p className="font-arabic font-semibold text-sm sm:text-base text-brown">
              {step.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

