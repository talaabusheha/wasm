import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CtaButton } from './components/CtaButton';
import { DesignsSection } from './components/DesignsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { StepsSection } from './components/StepsSection';
import { Footer } from './components/Footer';
import { AdminModal } from './components/AdminModal';
import { Design } from './data/designs';
import { getStoredDesigns } from './utils/designsStorage';
import { fetchDesigns, subscribeToDesigns } from './utils/designsService';

export const App: React.FC = () => {
  const [designsList, setDesignsList] = useState<Design[]>(() => getStoredDesigns());
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync with Supabase on mount and listen to real-time changes
  useEffect(() => {
    fetchDesigns().then((designs) => {
      if (designs && Array.isArray(designs)) {
        setDesignsList(designs);
      }
    });

    const unsubscribe = subscribeToDesigns(() => {
      fetchDesigns().then((designs) => {
        if (designs && Array.isArray(designs)) {
          setDesignsList(designs);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpdateDesigns = (updatedDesigns: Design[]) => {
    setDesignsList(updatedDesigns);
  };

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
          <DesignsSection designsList={designsList} />

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

        {/* 7. Footer with Admin Access */}
        <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
      </main>

      {/* Admin Panel Modal for WASM Employee with Supabase Sync */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        designs={designsList}
        onUpdateDesigns={handleUpdateDesigns}
      />
    </div>
  );
};

export default App;
