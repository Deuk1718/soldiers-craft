import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

interface CheckItem {
  id: string;
  labelKey: string;
  descKey: string;
}

const CHECKLIST: Record<string, CheckItem[]> = {
  "d100": [
    { id: "d100_1", labelKey: "checklist.d100.1.label", descKey: "checklist.d100.1.desc" },
    { id: "d100_2", labelKey: "checklist.d100.2.label", descKey: "checklist.d100.2.desc" },
    { id: "d100_3", labelKey: "checklist.d100.3.label", descKey: "checklist.d100.3.desc" },
    { id: "d100_4", labelKey: "checklist.d100.4.label", descKey: "checklist.d100.4.desc" },
  ],
  "d30": [
    { id: "d30_1", labelKey: "checklist.d30.1.label", descKey: "checklist.d30.1.desc" },
    { id: "d30_2", labelKey: "checklist.d30.2.label", descKey: "checklist.d30.2.desc" },
    { id: "d30_3", labelKey: "checklist.d30.3.label", descKey: "checklist.d30.3.desc" },
    { id: "d30_4", labelKey: "checklist.d30.4.label", descKey: "checklist.d30.4.desc" },
  ],
  "d7": [
    { id: "d7_1", labelKey: "checklist.d7.1.label", descKey: "checklist.d7.1.desc" },
    { id: "d7_2", labelKey: "checklist.d7.2.label", descKey: "checklist.d7.2.desc" },
    { id: "d7_3", labelKey: "checklist.d7.3.label", descKey: "checklist.d7.3.desc" },
    { id: "d7_4", labelKey: "checklist.d7.4.label", descKey: "checklist.d7.4.desc" },
  ],
};

const DischargeChecklist = () => {
  const { t } = useLanguage();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allItems = Object.values(CHECKLIST).flat();
  const completedCount = allItems.filter((item) => checked.has(item.id)).length;
  const totalCount = allItems.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <section className="bg-background py-20" id="checklist">
      <div className="container mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">{t("checklist.label")}</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("checklist.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("checklist.subtitle")}</p>
        </motion.div>

        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 rounded-2xl bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-card-foreground">{t("checklist.progress")}</span>
            <span className="font-mono-num text-sm font-bold text-primary">{completedCount}/{totalCount}</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </motion.div>

        <Tabs defaultValue="d100" className="w-full">
          <TabsList className="mb-6 w-full grid grid-cols-3">
            <TabsTrigger value="d100">D-100</TabsTrigger>
            <TabsTrigger value="d30">D-30</TabsTrigger>
            <TabsTrigger value="d7">D-7</TabsTrigger>
          </TabsList>

          {Object.entries(CHECKLIST).map(([phase, items]) => (
            <TabsContent key={phase} value={phase}>
              <div className="space-y-3">
                {items.map((item, i) => {
                  const done = checked.has(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => toggle(item.id)}
                      className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
                        done
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-card hover:border-primary/20"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${done ? "text-primary line-through" : "text-card-foreground"}`}>
                          {t(item.labelKey)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{t(item.descKey)}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default DischargeChecklist;
