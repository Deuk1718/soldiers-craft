import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServiceOverview from "@/components/ServiceOverview";
import AssetDashboard from "@/components/AssetDashboard";
import TaxSimulator from "@/components/TaxSimulator";
import ExpertMatchSection from "@/components/ExpertMatchSection";
import WillPreview from "@/components/WillPreview";
import DisputeDetector from "@/components/DisputeDetector";
import Footer from "@/components/Footer";
import FreeConsultModal from "@/components/FreeConsultModal";
import ServiceInfoModal from "@/components/ServiceInfoModal";
import WelcomeModal from "@/components/WelcomeModal";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const [consultOpen, setConsultOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [customerAssets, setCustomerAssets] = useState(0);
  const [willHeirs, setWillHeirs] = useState<{ name: string; relation: string }[]>([
    { name: t("will.sample.heir1.name"), relation: t("will.sample.heir1.relation") },
    { name: t("will.sample.heir2.name"), relation: t("will.sample.heir2.relation") },
    { name: t("will.sample.heir3.name"), relation: t("will.sample.heir3.relation") },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onConsultClick={() => setConsultOpen(true)} />
      <HeroSection onConsultClick={() => setConsultOpen(true)} onServiceClick={() => setServiceOpen(true)} />
      <WillPreview onHeirsChange={setWillHeirs} />
      <ServiceOverview />
      <AssetDashboard onTotalChange={setCustomerAssets} />
      <TaxSimulator customerTotal={customerAssets} />
      <ExpertMatchSection />
      <DisputeDetector heirs={willHeirs} />
      <Footer onConsultClick={() => setConsultOpen(true)} />

      <FreeConsultModal open={consultOpen} onOpenChange={setConsultOpen} />
      <ServiceInfoModal open={serviceOpen} onOpenChange={setServiceOpen} onRequestConsult={() => setConsultOpen(true)} />
      <WelcomeModal onStart={() => document.querySelector("#will")?.scrollIntoView({ behavior: "smooth" })} />
    </div>
  );
};

export default Index;
