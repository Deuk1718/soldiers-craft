import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, CreditCard, Languages, Shield, UsersRound } from "lucide-react";
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

  const currentBranch = branchOptions.find(b => b.days === serviceDays)?.label || branchOptions[0].label;

  const briefStats = [
    { icon: Clock, label: t("dday.stat.dDay") },
    { icon: CheckCircle2, label: t("dday.stat.checklist") },
    { icon: UsersRound, label: t("dday.stat.matching") },
    { icon: Languages, label: t("dday.stat.languages") },
  ];

  return (
    <>
    <section className="relative overflow-hidden bg-[#202818] py-20 text-navy-foreground lg:py-24" id="dday">
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(230,225,202,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(230,225,202,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(132, 153, 88, 0.24), transparent 32%), linear-gradient(135deg, rgba(23, 32, 20, 0.92), rgba(36, 43, 27, 0.96))",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <div className="mb-6 inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-medium text-gold">
              <Shield className="h-4 w-4" />
              <span>{t("hero.badge")}</span>
            </div>

            <h1 className="font-serif-legal text-balance text-4xl font-bold leading-tight text-navy-foreground md:text-5xl lg:text-6xl">
              {t("dday.heroTitle")}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-foreground/72 md:text-lg">
              {t("dday.heroSubtitle")}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl">
              {briefStats.map((stat) => (
                <div key={stat.label} className="border border-navy-foreground/10 bg-navy-foreground/[0.04] px-3 py-3">
                  <stat.icon className="mb-2 h-4 w-4 text-gold" />
                  <p className="text-sm font-medium leading-snug text-navy-foreground/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border border-navy-foreground/10 bg-[#f4f1e7]/[0.075] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-md md:p-5"
          >
            <div className="border border-navy-foreground/10 bg-[#12190f]/80 p-5 md:p-7">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">{t("dday.panelLabel")}</p>
                  <h2 className="mt-2 text-xl font-bold text-navy-foreground sm:text-2xl">{t("dday.panelTitle")}</h2>
                </div>
                <div className="self-start border border-gold/30 bg-gold/10 px-3 py-2 text-right sm:self-auto">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gold/70">{t("dday.currentBranch")}</p>
                  <p className="mt-1 text-sm font-semibold text-gold">{currentBranch}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="mb-2 block text-sm font-medium text-navy-foreground/70">{t("dday.branch")}</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {branchOptions.map((b) => (
                      <button
                        key={b.days + b.label}
                        onClick={() => setServiceDays(b.days)}
                        className={`min-h-12 border px-3 py-2 text-sm font-medium transition-all ${
                          serviceDays === b.days
                            ? "border-gold/60 bg-gold/[0.18] text-gold"
                            : "border-navy-foreground/10 bg-navy-foreground/[0.04] text-navy-foreground/60 hover:border-gold/35 hover:text-navy-foreground"
                        }`}
                      >
                        <span className="block">{b.label}</span>
                        <span className="mt-0.5 block font-mono-num text-[11px] opacity-70">{b.days}{t("dday.days")}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium text-navy-foreground/70">
                    {t("dday.enlistDate")} <span className="ml-1 text-xs text-navy-foreground/40">({t("dday.dateHint")})</span>
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <Input
                      type="date"
                      value={enlistDate}
                      onChange={(e) => setEnlistDate(e.target.value)}
                      className="h-12 border-navy-foreground/10 bg-navy-foreground/[0.06] text-navy-foreground placeholder:text-navy-foreground/30"
                    />
                    <Button
                      onClick={() => setMemberCardOpen(true)}
                      className="h-12 gap-2 border border-gold/45 bg-gold/[0.18] px-5 text-gold hover:bg-gold/[0.28] hover:text-gold"
                    >
                      <CreditCard className="h-4 w-4" />
                      {t("dday.memberCard")}
                    </Button>
                  </div>
                </div>

                <div className="border border-navy-foreground/10 bg-navy-foreground/[0.035] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-navy-foreground/64">{t("dday.progress")}</span>
                    <span className="font-mono-num text-sm font-bold text-gold">{animatedProgress.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden bg-navy-foreground/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${animatedProgress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary via-[#9da86c] to-gold"
                    />
                  </div>
                </div>

                {result ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                  >
                    <div className="border border-navy-foreground/10 bg-navy-foreground/[0.04] p-4">
                      <Calendar className="mb-3 h-5 w-5 text-gold" />
                      <p className="text-xs text-navy-foreground/50">{t("dday.dischargeDate")}</p>
                      <p className="mt-1 font-mono-num text-lg font-bold text-navy-foreground">{result.dischargeStr}</p>
                    </div>
                    <div className="border border-navy-foreground/10 bg-navy-foreground/[0.04] p-4">
                      <Clock className="mb-3 h-5 w-5 text-gold" />
                      <p className="text-xs text-navy-foreground/50">{result.discharged ? t("dday.discharged") : t("dday.remaining")}</p>
                      <p className={`mt-1 font-mono-num text-lg font-bold ${result.discharged ? "text-success" : "text-navy-foreground"}`}>
                        {result.discharged ? t("dday.done") : `D-${result.remainingDays}`}
                      </p>
                    </div>
                    <div className="col-span-2 border border-navy-foreground/10 bg-navy-foreground/[0.04] p-4 sm:col-span-1">
                      <Shield className="mb-3 h-5 w-5 text-gold" />
                      <p className="text-xs text-navy-foreground/50">{t("dday.served")}</p>
                      <p className="mt-1 font-mono-num text-lg font-bold text-navy-foreground">{result.elapsedDays}{t("dday.days")}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="border border-dashed border-navy-foreground/16 bg-navy-foreground/[0.025] px-4 py-7 text-center text-sm text-navy-foreground/45">
                    {t("dday.placeholder")}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    <MemberCardModal
      open={memberCardOpen}
      onClose={() => setMemberCardOpen(false)}
      enlistDate={enlistDate}
      dischargeDate={result?.dischargeStr || ""}
      serviceDays={serviceDays}
      elapsedDays={result?.elapsedDays || 0}
      progressPct={result?.progressPct || 0}
      branchLabel={currentBranch}
    />
    </>
  );
};

export default DdayHeroSection;
