import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import MouseGhostTrail from "@/components/MouseGhostTrail";
import Index from "./pages/Index.tsx";

// Heavy / less-frequent routes — split into separate chunks
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Maintenance = lazy(() => import("./pages/Maintenance.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Legal = lazy(() => import("./pages/Legal.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const About = lazy(() => import("./pages/About.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — avoid refetch storms
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen bg-background" aria-busy="true" />
);

const AppRoutes = () => {
  const [serviceEnabled, setServiceEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("service_enabled")
        .eq("id", "main")
        .single();
      if (!cancelled) setServiceEnabled(data?.service_enabled ?? true);
    };
    check();

    const channel = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_settings" },
        (payload: any) => {
          setServiceEnabled(payload.new.service_enabled);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  if (serviceEnabled === null) return null;

  if (!serviceEnabled) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Maintenance />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/legal/:section" element={<Legal />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
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
