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

  // Listen to URL path and hash to automatically open admin modal (supports /admin, #admin, /wasm)
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path === '/admin' ||
        path === '/admin/' ||
        path === '/wasm' ||
        path === '/wasm/' ||
        hash === '#admin' ||
        hash === '#wasm' ||
        search.includes('admin')
      ) {
        setIsAdminOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    if (!window.location.hash && !window.location.pathname.includes('admin')) {
      window.history.pushState(null, '', '#admin');
    }
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin' || window.location.pathname.includes('admin')) {
      window.history.pushState(null, '', '/');
    }
  };

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
        <Footer onOpenAdmin={handleOpenAdmin} />
      </main>

      {/* Admin Panel Modal for WASM Employee with Supabase Sync */}
      {isAdminOpen && (
        <AdminModal
          isOpen={isAdminOpen}
          onClose={handleCloseAdmin}
          designs={designsList}
          onUpdateDesigns={handleUpdateDesigns}
        />
      )}
    </div>
  );
};

export default App;
