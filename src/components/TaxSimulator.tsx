import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

const BRACKET_KEYS = ["tax.b1", "tax.b2", "tax.b3", "tax.b4", "tax.b5"];

// All values in 만원
const TAX_BRACKETS = [
  { limit: 1000, rate: 0.10, deduction: 0 },        // ~1000만
  { limit: 5000, rate: 0.20, deduction: 100 },       // ~5000만
  { limit: 10000, rate: 0.30, deduction: 600 },      // ~1억
  { limit: 30000, rate: 0.40, deduction: 1600 },     // ~3억
  { limit: Infinity, rate: 0.50, deduction: 4600 },  // 3억 초과
];

const formatAmount = (v: number, t: (key: string) => string) => {
  // v is in 만원 units
  if (v >= 10000) return `${(v / 10000).toFixed(1)}${t("tax.unit.billion")}`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}${t("tax.unit.tenMillion")}`;
  return `${v.toLocaleString()}${t("tax.unit.tenThousand")}`;
};

const calculateTax = (amount: number, exemption: number) => {
  const taxable = Math.max(amount - exemption, 0);
  for (const bracket of TAX_BRACKETS) {
    if (taxable <= bracket.limit) {
      return Math.max(taxable * bracket.rate - bracket.deduction, 0);
    }
  }
  return 0;
};

const getBracketIndex = (amount: number, exemption: number) => {
  const taxable = Math.max(amount - exemption, 0);
  for (let i = 0; i < TAX_BRACKETS.length; i++) {
    if (taxable <= TAX_BRACKETS[i].limit) return i;
  }
  return TAX_BRACKETS.length - 1;
};

const TaxSimulator = ({ customerTotal = 0 }: { customerTotal?: number }) => {
  const { t } = useLanguage();

  // All values in 만원 units
  const sliderMax = useMemo(() => {
    if (customerTotal <= 0) return 50000; // 5억 = 50000만원
    const padded = Math.ceil((customerTotal * 1.5) / 1000) * 1000;
    return Math.max(padded, 50000);
  }, [customerTotal]);

  const initialAssets = customerTotal > 0 ? customerTotal : 12000; // 1.2억 = 12000만원
  const [totalAssets, setTotalAssets] = useState([initialAssets]);
  const [exemption, setExemption] = useState([5000]); // 5000만원

  useEffect(() => {
    if (customerTotal > 0) {
      setTotalAssets([customerTotal]);
    }
  }, [customerTotal]);

  const tax = useMemo(() => calculateTax(totalAssets[0], exemption[0]), [totalAssets, exemption]);
  const effectiveRate = totalAssets[0] > exemption[0] ? ((tax / (totalAssets[0] - exemption[0])) * 100) : 0;
  const currentBracket = getBracketIndex(totalAssets[0], exemption[0]);

  return (
    <section className="bg-background py-20" id="tax">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">{t("tax.label")}</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("tax.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("tax.subtitle")}</p>
        </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Controls */}
          <div className="space-y-8 lg:col-span-3">
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <label className="mb-1 block text-sm font-medium text-card-foreground">{t("tax.totalAssets")}</label>
              <p className="mb-4 font-mono-num text-2xl font-bold text-primary">{formatAmount(totalAssets[0], t)} {t("common.manWon")}</p>
              <Slider
                value={totalAssets}
                onValueChange={setTotalAssets}
                min={0}
                max={sliderMax}
                step={500}
                className="w-full"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>0</span><span>{formatAmount(sliderMax, t)}</span>
              </div>
              {customerTotal > 0 && (
                <p className="mt-1 text-xs text-primary">{t("tax.customerSync")}</p>
              )}
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-card">
              <label className="mb-1 block text-sm font-medium text-card-foreground">{t("tax.exemption")}</label>
              <p className="mb-4 font-mono-num text-2xl font-bold text-success">{formatAmount(exemption[0], t)} {t("common.manWon")}</p>
              <Slider
                value={exemption}
                onValueChange={setExemption}
                min={0}
                max={20000}
                step={500}
                className="w-full"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>0</span><span>{t("tax.unit.maxExemption")}</span>
              </div>
            </div>

            {/* Bracket visualization */}
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <p className="mb-4 text-sm font-semibold text-card-foreground">{t("tax.brackets")}</p>
              <div className="space-y-2">
                {TAX_BRACKETS.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`h-8 rounded-md transition-all duration-300 ${i <= currentBracket ? 'bg-primary' : 'bg-secondary'}`}
                      style={{ width: `${(b.rate) * 100 * 1.8}%`, minWidth: 12 }}
                    />
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="font-mono-num text-xs font-semibold text-card-foreground">{(b.rate * 100).toFixed(0)}%</span>
                      <span className="text-xs text-muted-foreground">{t(BRACKET_KEYS[i])}</span>
                      {i === currentBracket && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{t("tax.currentBracket")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="sticky top-8 space-y-4">
              <div className="rounded-2xl bg-navy p-6 text-navy-foreground shadow-card">
                <p className="text-sm text-navy-foreground/60">{t("tax.estimatedTax")}</p>
                <motion.p
                  key={tax}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="mt-2 font-mono-num text-4xl font-bold"
                >
                  {formatAmount(tax, t)} {t("common.manWon")}
                </motion.p>
                <p className="mt-1 font-mono-num text-sm text-navy-foreground/50">
                  {tax.toLocaleString()} 만원
                </p>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-card">
                <p className="text-sm text-muted-foreground">{t("tax.effectiveRate")}</p>
                <p className="mt-1 font-mono-num text-3xl font-bold text-card-foreground">
                  {effectiveRate.toFixed(1)}%
                </p>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-card">
                <p className="text-sm text-muted-foreground">{t("tax.taxableBase")}</p>
                <p className="mt-1 font-mono-num text-xl font-bold text-card-foreground">
                  {formatAmount(Math.max(totalAssets[0] - exemption[0], 0), t)} {t("common.manWon")}
                </p>
              </div>

              <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
                <p className="text-xs leading-relaxed text-primary">
                  {t("tax.expertTip")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TaxSimulator;
