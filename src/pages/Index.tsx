import { lazy, Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import DdayHeroSection from "@/components/DdayHeroSection";
import DischargeChecklist from "@/components/DischargeChecklist";
import { useLanguage } from "@/contexts/LanguageContext";

// Below-the-fold sections — split for faster TTI
const BuddySearch = lazy(() => import("@/components/BuddySearch"));
const ExpertMatchSection = lazy(() => import("@/components/ExpertMatchSection"));
const ServiceOverview = lazy(() => import("@/components/ServiceOverview"));
const Footer = lazy(() => import("@/components/Footer"));

// Modals — only load when triggered
const FreeConsultModal = lazy(() => import("@/components/FreeConsultModal"));
const ServiceInfoModal = lazy(() => import("@/components/ServiceInfoModal"));
const WelcomeModal = lazy(() => import("@/components/WelcomeModal"));

const SectionFallback = () => <div className="py-20" aria-hidden="true" />;

const Index = () => {
  const { t } = useLanguage();
  const [consultOpen, setConsultOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onConsultClick={() => setConsultOpen(true)} />
      <DdayHeroSection />
      <DischargeChecklist />
      <Suspense fallback={<SectionFallback />}>
        <BuddySearch />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ExpertMatchSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ServiceOverview />
      </Suspense>
      <Suspense fallback={null}>
        <Footer onConsultClick={() => setConsultOpen(true)} />
      </Suspense>

      {consultOpen && (
        <Suspense fallback={null}>
          <FreeConsultModal open={consultOpen} onOpenChange={setConsultOpen} />
        </Suspense>
      )}
      {serviceOpen && (
        <Suspense fallback={null}>
          <ServiceInfoModal
            open={serviceOpen}
            onOpenChange={setServiceOpen}
            onRequestConsult={() => setConsultOpen(true)}
          />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <WelcomeModal onStart={() => document.querySelector("#dday")?.scrollIntoView({ behavior: "smooth" })} />
      </Suspense>
    </div>
  );
};

export default Index;
