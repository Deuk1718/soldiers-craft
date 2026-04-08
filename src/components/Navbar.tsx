import { useState, useRef, useCallback } from "react";
import { Shield, Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage, LANGUAGE_LABELS, LANGUAGE_FLAGS, Language } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onConsultClick: () => void;
}

const Navbar = ({ onConsultClick }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const clickCount = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    clickCount.current += 1;
    if (timer.current) clearTimeout(timer.current);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      navigate("/admin");
      return;
    }
    timer.current = setTimeout(() => { clickCount.current = 0; }, 2000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const navItems = [
    { label: t("nav.will"), href: "#checklist" },
    { label: t("nav.tax"), href: "#dday" },
    { label: t("nav.assets"), href: "#buddy" },
    { label: t("nav.experts"), href: "#experts" },
  ];

  const languages: Language[] = ["ko", "en", "ja", "zh"];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#" onClick={handleLogoClick} className="flex items-center gap-2 select-none">
          <Shield className="h-5 w-5 text-gold" />
          <span className="font-serif-legal text-lg font-bold text-foreground">{t("brand.name")}</span>
        </a>

        <div className="hidden items-center justify-end gap-2 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={(e) => { e.preventDefault(); document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" }); }}>
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                {item.label}
              </Button>
            </a>
          ))}

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
                <Globe className="h-4 w-4" />
                <span className="text-xs">{LANGUAGE_FLAGS[lang]} {LANGUAGE_LABELS[lang]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {languages.map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => setLang(l)}
                  className={`gap-2 ${lang === l ? "bg-accent font-semibold" : ""}`}
                >
                  <span>{LANGUAGE_FLAGS[l]}</span>
                  <span>{LANGUAGE_LABELS[l]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-2 p-4">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={(e) => { e.preventDefault(); setOpen(false); document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">
                  {item.label}
                </a>
              ))}

              {/* Mobile Language Switcher */}
              <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl bg-accent/50 p-2">
                {languages.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); }}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      lang === l
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-background text-muted-foreground border border-border hover:border-primary/30"
                    }`}
                  >
                    {LANGUAGE_FLAGS[l]} {LANGUAGE_LABELS[l]}
                  </button>
                ))}
              </div>

              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
