import { useState } from "react";
import Navbar from "@/components/Navbar";
import DdayHeroSection from "@/components/DdayHeroSection";
import DischargeChecklist from "@/components/DischargeChecklist";
import ExpertMatchSection from "@/components/ExpertMatchSection";
import BuddySearch from "@/components/BuddySearch";
import ServiceOverview from "@/components/ServiceOverview";
import Footer from "@/components/Footer";
import FreeConsultModal from "@/components/FreeConsultModal";
import ServiceInfoModal from "@/components/ServiceInfoModal";
import WelcomeModal from "@/components/WelcomeModal";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const [consultOpen, setConsultOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onConsultClick={() => setConsultOpen(true)} />
      <DdayHeroSection />
      <DischargeChecklist />
      <BuddySearch />
      <ExpertMatchSection />
      <ServiceOverview />
      <Footer onConsultClick={() => setConsultOpen(true)} />

      <FreeConsultModal open={consultOpen} onOpenChange={setConsultOpen} />
      <ServiceInfoModal open={serviceOpen} onOpenChange={setServiceOpen} onRequestConsult={() => setConsultOpen(true)} />
      <WelcomeModal onStart={() => document.querySelector("#dday")?.scrollIntoView({ behavior: "smooth" })} />
    </div>
  );
};

export default Index;
