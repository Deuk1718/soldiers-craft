import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import MouseGhostTrail from "@/components/MouseGhostTrail";
import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import Maintenance from "./pages/Maintenance.tsx";
import NotFound from "./pages/NotFound.tsx";
import Legal from "./pages/Legal.tsx";
import FAQ from "./pages/FAQ.tsx";
import About from "./pages/About.tsx";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const [serviceEnabled, setServiceEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.from("site_settings").select("service_enabled").eq("id", "main").single();
      setServiceEnabled(data?.service_enabled ?? true);
    };
    check();

    const channel = supabase
      .channel("site_settings_changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "site_settings" }, (payload: any) => {
        setServiceEnabled(payload.new.service_enabled);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (serviceEnabled === null) return null; // loading

  if (!serviceEnabled) {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Maintenance />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <MouseGhostTrail />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
