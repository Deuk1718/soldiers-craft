import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Calendar, Clock, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import MemberCardModal from "@/components/MemberCardModal";

const DdayHeroSection = () => {
  const { t } = useLanguage();
  const [enlistDate, setEnlistDate] = useState("");
  const [serviceDays, setServiceDays] = useState(548);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [memberCardOpen, setMemberCardOpen] = useState(false);

  const result = useMemo(() => {
    if (!enlistDate) return null;
    const start = new Date(enlistDate);
    if (isNaN(start.getTime())) return null;

    const discharge = new Date(start);
    discharge.setDate(discharge.getDate() + serviceDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalMs = discharge.getTime() - start.getTime();
    const elapsedMs = today.getTime() - start.getTime();
    const remainingMs = discharge.getTime() - today.getTime();

    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const progressPct = Math.min(Math.max((elapsedMs / totalMs) * 100, 0), 100);

    const dischargeStr = `${discharge.getFullYear()}.${String(discharge.getMonth() + 1).padStart(2, "0")}.${String(discharge.getDate()).padStart(2, "0")}`;

  return { remainingDays, elapsedDays, progressPct, dischargeStr, discharged: remainingDays <= 0 };
  }, [enlistDate, serviceDays]);

  // Animate progress bar from 0 to target
  useEffect(() => {
    if (!result) {
      setAnimatedProgress(0);
      return;
    }
    setAnimatedProgress(0);
    const timer = setTimeout(() => setAnimatedProgress(result.progressPct), 100);
    return () => clearTimeout(timer);
  }, [result]);

  const branchOptions = [
    { label: t("dday.branch.army"), days: 548 },
    { label: t("dday.branch.navy"), days: 614 },
    { label: t("dday.branch.airforce"), days: 639 },
    { label: t("dday.branch.marine"), days: 548 },
  ];

  return (
    <section className="relative overflow-hidden bg-navy py-24 lg:py-32" id="dday">
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
            {t("dday.heroTitle")}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-foreground/65 md:text-lg">
            {t("dday.heroSubtitle")}
          </p>

          {/* D-Day Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 w-full max-w-2xl rounded-2xl border border-navy-foreground/10 bg-navy-foreground/5 p-6 md:p-8 backdrop-blur-sm text-left"
          >
            {/* Branch selector */}
            <div className="mb-5">
              <Label className="mb-2 block text-sm font-medium text-navy-foreground/70">{t("dday.branch")}</Label>
              <div className="flex flex-wrap gap-2">
                {branchOptions.map((b) => (
                  <button
                    key={b.days + b.label}
                    onClick={() => setServiceDays(b.days)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      serviceDays === b.days
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "bg-navy-foreground/5 text-navy-foreground/50 border border-navy-foreground/10 hover:border-gold/30"
                    }`}
                  >
                    {b.label} ({b.days}{t("dday.days")})
                  </button>
                ))}
              </div>
            </div>

            {/* Enlist date input */}
            <div className="mb-6">
              <Label className="mb-2 block text-sm font-medium text-navy-foreground/70">{t("dday.enlistDate")}</Label>
              <div className="flex items-end gap-3">
                <Input
                  type="date"
                  value={enlistDate}
                  onChange={(e) => setEnlistDate(e.target.value)}
                  className="max-w-xs bg-navy-foreground/5 border-navy-foreground/10 text-navy-foreground placeholder:text-navy-foreground/30"
                />
                {result && (
                  <Button
                    onClick={() => setMemberCardOpen(true)}
                    className="gap-1.5 bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 rounded-xl text-sm font-medium whitespace-nowrap"
                    size="sm"
                  >
                    <CreditCard className="h-4 w-4" />
                    멤버증 발급
                  </Button>
                )}
              </div>
            </div>

            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Progress bar with animation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-navy-foreground/60">{t("dday.progress")}</span>
                    <span className="font-mono-num text-sm font-bold text-gold">{animatedProgress.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-5 w-full overflow-hidden rounded-full bg-navy-foreground/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${animatedProgress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-navy-foreground/5 p-4 text-center">
                    <Calendar className="mx-auto mb-1 h-5 w-5 text-gold" />
                    <p className="text-xs text-navy-foreground/50">{t("dday.dischargeDate")}</p>
                    <p className="mt-1 font-mono-num text-lg font-bold text-navy-foreground">{result.dischargeStr}</p>
                  </div>
                  <div className="rounded-xl bg-navy-foreground/5 p-4 text-center">
                    <Clock className="mx-auto mb-1 h-5 w-5 text-gold" />
                    <p className="text-xs text-navy-foreground/50">{result.discharged ? t("dday.discharged") : t("dday.remaining")}</p>
                    <p className={`mt-1 font-mono-num text-lg font-bold ${result.discharged ? "text-success" : "text-navy-foreground"}`}>
                      {result.discharged ? t("dday.done") : `D-${result.remainingDays}`}
                    </p>
                  </div>
                  <div className="rounded-xl bg-navy-foreground/5 p-4 text-center col-span-2 sm:col-span-1">
                    <Shield className="mx-auto mb-1 h-5 w-5 text-gold" />
                    <p className="text-xs text-navy-foreground/50">{t("dday.served")}</p>
                    <p className="mt-1 font-mono-num text-lg font-bold text-navy-foreground">{result.elapsedDays}{t("dday.days")}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {!result && (
              <p className="text-center text-sm text-navy-foreground/40 py-4">{t("dday.placeholder")}</p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default DdayHeroSection;
