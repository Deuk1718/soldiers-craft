import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeModalProps {
  onStart: () => void;
}

const WelcomeModal = ({ onStart }: WelcomeModalProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setOpen(false);
    setTimeout(onStart, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-gold/20 bg-background shadow-2xl overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-gold/60 via-gold to-gold/60" />

            <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
              <div className="flex items-center gap-2 text-center justify-center mb-4">
                <Heart className="h-5 w-5 text-gold fill-gold/30" />
                <h2 className="font-serif-legal text-lg font-bold text-foreground sm:text-xl">
                  {t("welcome.title")}
                </h2>
                <Heart className="h-5 w-5 text-gold fill-gold/30" />
              </div>

              <blockquote className="mx-auto mb-5 max-w-md rounded-xl border border-gold/15 bg-gold/5 px-4 py-3 text-center text-sm leading-relaxed text-muted-foreground italic whitespace-pre-line">
                {t("welcome.quote")}
              </blockquote>

              <p className="mb-5 text-center text-sm leading-relaxed text-foreground/80">
                {t("welcome.desc")}
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { title: t("welcome.f1.title"), desc: t("welcome.f1.desc") },
                  { title: t("welcome.f2.title"), desc: t("welcome.f2.desc") },
                  { title: t("welcome.f3.title"), desc: t("welcome.f3.desc") },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <p className="text-sm leading-relaxed text-foreground/85">
                      <span className="font-semibold text-foreground">{item.title}:</span>{" "}
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mb-6 text-center text-xs leading-relaxed text-muted-foreground">
                {t("welcome.closing")}
              </p>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Button variant="warmBrown" size="lg" className="flex-1 rounded-xl text-sm" onClick={handleStart}>
                  {t("welcome.start")}
                </Button>
                <Button variant="outline" size="lg" className="flex-1 rounded-xl text-sm" onClick={() => setOpen(false)}>
                  {t("welcome.close")}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
