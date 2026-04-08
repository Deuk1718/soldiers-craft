import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

interface InternalHeir {
  name: string;
  relation: string;
  forcedShareMin: number;
  allocated: number;
}

interface DisputeDetectorProps {
  heirs?: { name: string; relation: string }[];
}

const DisputeDetector = ({ heirs: externalHeirs }: DisputeDetectorProps) => {
  const { t } = useLanguage();

  const buildHeirs = (input: { name: string; relation: string }[]): InternalHeir[] => {
    const valid = input.filter(h => h.name.trim());
    if (valid.length === 0) return [];
    const forcedMin = Math.round(100 / (valid.length * 2));
    const baseAlloc = Math.floor(100 / valid.length);
    return valid.map((h, i) => ({
      name: h.name,
      relation: h.relation,
      forcedShareMin: forcedMin,
      allocated: i === 0 ? 100 - baseAlloc * (valid.length - 1) : baseAlloc,
    }));
  };

  const [heirs, setHeirs] = useState<InternalHeir[]>(() =>
    buildHeirs(externalHeirs || [
      { name: t("will.sample.heir1.name"), relation: t("will.sample.heir1.relation") },
      { name: t("will.sample.heir2.name"), relation: t("will.sample.heir2.relation") },
      { name: t("will.sample.heir3.name"), relation: t("will.sample.heir3.relation") },
    ])
  );

  // Sync when external heirs change
  const [prevExternal, setPrevExternal] = useState(externalHeirs);
  if (externalHeirs && externalHeirs !== prevExternal) {
    setPrevExternal(externalHeirs);
    const externalNames = externalHeirs.filter(h => h.name.trim()).map(h => h.name);
    const currentNames = heirs.map(h => h.name);
    const changed = externalNames.length !== currentNames.length || externalNames.some((n, i) => n !== currentNames[i]);
    if (changed) {
      setHeirs(buildHeirs(externalHeirs));
    }
  }
  const [expandedHeir, setExpandedHeir] = useState<string | null>(null);

  const updateAllocation = (index: number, value: number[]) => {
    const newHeirs = [...heirs];
    newHeirs[index] = { ...newHeirs[index], allocated: value[0] };
    setHeirs(newHeirs);
  };

  const totalAllocated = heirs.reduce((s, h) => s + h.allocated, 0);
  const hasDispute = heirs.some((h) => h.allocated < h.forcedShareMin);
  const overAllocated = totalAllocated > 100;

  return (
    <section className="bg-secondary/50 py-20" id="dispute">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">{t("dispute.label")}</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("dispute.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("dispute.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {heirs.map((heir, i) => {
              const isViolation = heir.allocated < heir.forcedShareMin;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-2xl bg-card p-6 shadow-card transition-shadow ${isViolation ? 'ring-2 ring-warning/50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isViolation ? 'bg-warning/10' : 'bg-success/10'}`}>
                        <Users className={`h-5 w-5 ${isViolation ? 'text-warning' : 'text-success'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">{heir.name}</p>
                        <p className="text-xs text-muted-foreground">{heir.relation} · {t("dispute.forcedShare", { pct: heir.forcedShareMin })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono-num text-2xl font-bold text-card-foreground">{heir.allocated}%</p>
                      {isViolation && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-warning">
                          {t("dispute.violation")}
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Slider value={[heir.allocated]} onValueChange={(v) => updateAllocation(i, v)} min={0} max={100} step={1} />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className="text-warning">{t("dispute.forcedShare", { pct: heir.forcedShareMin })}</span>
                      <span>100%</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className={`rounded-2xl p-6 shadow-card ${hasDispute ? 'bg-warning/10 ring-2 ring-warning/30' : 'bg-success/10 ring-2 ring-success/30'}`}>
              <div className="flex items-center gap-3">
                {hasDispute ? <AlertTriangle className="h-6 w-6 text-warning" /> : <CheckCircle2 className="h-6 w-6 text-success" />}
                <p className="text-lg font-bold text-foreground">
                  {hasDispute ? t("dispute.riskDetected") : t("dispute.riskLow")}
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                {hasDispute ? t("dispute.riskDesc") : t("dispute.safeDesc")}
              </p>
              {hasDispute && (
                <div className="mt-3 animate-pulse-ring inline-block rounded-full bg-warning/20 p-1">
                  <div className="rounded-full bg-warning px-3 py-1 text-xs font-bold text-warning-foreground">
                    {t("dispute.expertNeeded")}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">{t("dispute.totalAllocation")}</p>
              <p className={`mt-1 font-mono-num text-3xl font-bold ${overAllocated ? 'text-destructive' : 'text-card-foreground'}`}>
                {totalAllocated}%
              </p>
              {overAllocated && <p className="mt-1 text-xs text-destructive">{t("dispute.over100")}</p>}
            </div>

            {hasDispute && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-navy p-6 text-navy-foreground shadow-card"
              >
                <p className="text-sm font-semibold">{t("dispute.details")}</p>
                <ul className="mt-3 space-y-3">
                  {heirs.filter(h => h.allocated < h.forcedShareMin).map((h, i) => {
                    const deficit = h.forcedShareMin - h.allocated;
                    return (
                      <li key={i}>
                        <button
                          onClick={() => setExpandedHeir(expandedHeir === h.name ? null : h.name)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-navy-foreground/5"
                        >
                          <span className="text-navy-foreground/70">{h.name} ({h.relation})</span>
                          <span className="font-mono-num text-warning">{t("dispute.deficit", { deficit })}</span>
                        </button>
                        {expandedHeir === h.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-1 ml-3 rounded-xl bg-navy-foreground/5 p-4 text-xs leading-relaxed text-navy-foreground/70"
                          >
                            <p className="font-semibold text-warning mb-2">{t("dispute.detailTitle")}</p>
                            <div className="space-y-1.5">
                              <p>• <strong>{t("dispute.heir")}:</strong> {h.name} ({h.relation})</p>
                              <p>• <strong>{t("dispute.legalForced")}:</strong> {h.forcedShareMin}%</p>
                              <p>• <strong>{t("dispute.currentAlloc")}:</strong> {h.allocated}%</p>
                              <p>• <strong>{t("dispute.shortfall")}:</strong> {deficit}%p ({deficit > 0 ? t("dispute.shortfallDesc", { pct: ((deficit / h.forcedShareMin) * 100).toFixed(0) }) : t("dispute.met")})</p>
                              <div className="mt-3 border-t border-navy-foreground/10 pt-3">
                                <p className="font-semibold text-navy-foreground/90 mb-1">{t("dispute.legalBasis")}</p>
                                <p>{t("dispute.legalDesc", { name: h.name })}</p>
                              </div>
                              <div className="mt-2 border-t border-navy-foreground/10 pt-3">
                                <p className="font-semibold text-navy-foreground/90 mb-1">{t("dispute.expertAdvice")}</p>
                                <p>• {t("dispute.advice1", { pct: h.forcedShareMin })}</p>
                                <p>• {t("dispute.advice2")}</p>
                                <p>• {t("dispute.advice3")}</p>
                              </div>
                              <p className="mt-3 text-[10px] leading-relaxed text-navy-foreground/40">{t("dispute.disclaimer")}</p>
                            </div>
                          </motion.div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisputeDetector;
