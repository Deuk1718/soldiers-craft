import { motion } from "framer-motion";
import { Shield, FileText, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroSectionProps {
  onConsultClick: () => void;
  onServiceClick: () => void;
}

const HeroSection = ({ onConsultClick, onServiceClick }: HeroSectionProps) => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-navy py-24 lg:py-32">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c5a0' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container relative z-10 mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-8 flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2">
            <Shield className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-gold">{t("hero.badge")}</span>
          </div>

          <h1 className="font-serif-legal text-balance text-4xl font-bold leading-tight text-navy-foreground md:text-5xl lg:text-6xl">
            {t("hero.title1")}<br />
            <span className="text-gold">{t("brand.name")}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-foreground/65 md:text-lg whitespace-pre-line">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button variant="warmBrown" size="lg" className="px-8 py-6 text-base" onClick={onConsultClick}>
              {t("hero.cta1")}
            </Button>
            <Button variant="warmBrown" size="lg" className="px-8 py-6 text-base opacity-80 hover:opacity-100" onClick={onServiceClick}>
              {t("hero.cta2")}
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {[
              { icon: FileText, label: t("hero.card1.label"), desc: t("hero.card1.desc"), href: "#will" },
              { icon: Calendar, label: t("hero.card2.label"), desc: t("hero.card2.desc"), href: "#tax" },
              { icon: Users, label: t("hero.card3.label"), desc: t("hero.card3.desc"), href: "#dispute" },
            ].map((item, i) => (
              <a key={i} href={item.href} onClick={(e) => { e.preventDefault(); document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" }); }} className="flex items-center gap-3 rounded-2xl border border-navy-foreground/8 bg-navy-foreground/5 p-4 text-left backdrop-blur-sm cursor-pointer transition-colors hover:bg-navy-foreground/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15">
                  <item.icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-foreground">{item.label}</p>
                  <p className="text-xs text-navy-foreground/50">{item.desc}</p>
                </div>
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
