import React from 'react';
import { Header } from './components/Header';
import { CtaButton } from './components/CtaButton';
import { DesignsSection } from './components/DesignsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { StepsSection } from './components/StepsSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream text-brown flex flex-col items-center">
      {/* Mobile-first centered frame with max-width ~480px */}
      <main className="w-full max-w-[480px] min-h-screen flex flex-col justify-between py-2 sm:py-4">
        <div>
          {/* 1. Header */}
          <Header />

          {/* 2. Primary CTA Button (Top) */}
          <CtaButton />

          {/* 3. Section: شوفي تصاميمنا */}
          <DesignsSection />

          {/* 3.5 Section: آراء العرايس */}
          <ReviewsSection />

          {/* 4. Section: شو بتحتوي الدعوة؟ */}
          <FeaturesSection />

          {/* 5. Section: كيف بتطلبي؟ */}
          <StepsSection />

          {/* 6. Repeat Primary CTA Button */}
          <div className="mt-3">
            <CtaButton />
          </div>
        </div>

        {/* 7. Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default App;

