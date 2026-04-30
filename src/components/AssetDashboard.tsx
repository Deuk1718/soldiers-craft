import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, TrendingUp, Bitcoin, Wallet, Car, Gem, Plus, Trash2, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

const ASSET_CATEGORY_KEYS: Record<string, string> = {
  "real-estate": "assets.cat.realEstate",
  stocks: "assets.cat.stocks",
  crypto: "assets.cat.crypto",
  cash: "assets.cat.cash",
  vehicle: "assets.cat.vehicle",
  other: "assets.cat.other",
};

const ASSET_CATEGORIES = [
  { id: "real-estate", icon: Building2, color: "text-primary", bg: "bg-primary/10" },
  { id: "stocks", icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  { id: "crypto", icon: Bitcoin, color: "text-warning", bg: "bg-warning/10" },
  { id: "cash", icon: Wallet, color: "text-foreground", bg: "bg-accent" },
  { id: "vehicle", icon: Car, color: "text-primary", bg: "bg-primary/10" },
  { id: "other", icon: Gem, color: "text-gold", bg: "bg-gold/10" },
] as const;

type CategoryId = (typeof ASSET_CATEGORIES)[number]["id"];

interface AssetItem {
  id: string;
  category: CategoryId;
  name: string;
  valuation: number;
}

// formatKRW is moved inside component to access translations

const AssetDashboard = ({ onTotalChange }: { onTotalChange?: (total: number) => void }) => {
  const { t } = useLanguage();
  const formatKRW = (v: number) =>
    v >= 10000
      ? `${(v / 10000).toFixed(1)}${t("unit.eok")}`
      : `${v.toLocaleString()}${t("unit.man")}`;
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryId>("real-estate");
  const [name, setName] = useState("");
  const [valuation, setValuation] = useState("");

  const totalValue = assets.reduce((s, a) => s + a.valuation, 0);

  useEffect(() => {
    onTotalChange?.(totalValue);
  }, [totalValue, onTotalChange]);

  const grouped = ASSET_CATEGORIES.map((cat) => {
    const items = assets.filter((a) => a.category === cat.id);
    const total = items.reduce((s, a) => s + a.valuation, 0);
    return { ...cat, items, total };
  }).filter((g) => g.items.length > 0);

  const resetForm = () => {
    setName("");
    setValuation("");
    setCategory("real-estate");
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    const val = parseInt(valuation.replace(/,/g, ""), 10);
    if (!name.trim() || isNaN(val) || val <= 0) return;

    if (editId) {
      setAssets((prev) => prev.map((a) => (a.id === editId ? { ...a, category, name: name.trim(), valuation: val } : a)));
    } else {
      setAssets((prev) => [...prev, { id: crypto.randomUUID(), category, name: name.trim(), valuation: val }]);
    }
    resetForm();
  };

  const handleEdit = (item: AssetItem) => {
    setCategory(item.category);
    setName(item.name);
    setValuation(item.valuation.toString());
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const formatInputValue = (v: string) => {
    const num = v.replace(/[^0-9]/g, "");
    return num ? parseInt(num, 10).toLocaleString() : "";
  };

  return (
    <section className="bg-accent/50 py-20" id="assets">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">{t("assets.label")}</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("assets.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("assets.subtitle")}</p>
        </motion.div>

        {/* Total */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 rounded-2xl bg-navy p-8 text-navy-foreground shadow-card">
          <p className="text-sm text-navy-foreground/50">{t("assets.total")}</p>
          <p className="mt-1 font-mono-num text-4xl font-bold text-gold">
            {totalValue > 0 ? `${totalValue.toLocaleString()} ${t("unit.manwon")}` : `0 ${t("unit.manwon")}`}
          </p>
          {totalValue > 0 && (
            <p className="mt-1 font-mono-num text-sm text-navy-foreground/40">{t("assets.approx", { value: formatKRW(totalValue) })}</p>
          )}
          {assets.length === 0 && (
            <p className="mt-3 text-sm text-navy-foreground/40">{t("assets.empty.hint")}</p>
          )}
        </motion.div>

        {/* Add button */}
        <div className="mb-6 flex justify-end">
          <Button variant="warmBrown" onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> {t("assets.add")}
          </Button>
        </div>

        {/* Add / Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">
                {editId ? t("assets.edit") : t("assets.new")}
              </h3>

              {/* Category selector */}
              <div className="mb-4">
                <Label className="mb-2 block text-sm text-muted-foreground">{t("assets.type")}</Label>
                <div className="flex flex-wrap gap-2">
                  {ASSET_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const active = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {t(ASSET_CATEGORY_KEYS[cat.id])}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="asset-name" className="mb-1 block text-sm text-muted-foreground">{t("assets.name")}</Label>
                  <Input
                    id="asset-name"
                    placeholder={t("assets.name.placeholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="asset-value" className="mb-1 block text-sm text-muted-foreground">{t("assets.value")}</Label>
                  <Input
                    id="asset-value"
                    placeholder={t("assets.value.placeholder")}
                    value={valuation}
                    onChange={(e) => setValuation(formatInputValue(e.target.value))}
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2 justify-end">
                <Button variant="outline" onClick={resetForm}>{t("assets.cancel")}</Button>
                <Button variant="warmBrown" onClick={handleSubmit}>
                  {editId ? t("assets.submit.edit") : t("assets.submit.new")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Asset Cards by Category */}
        {grouped.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map((group, gi) => {
              const Icon = group.icon;
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: gi * 0.06 }}
                  className="rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${group.bg}`}>
                        <Icon className={`h-4 w-4 ${group.color}`} />
                      </div>
                      <span className="text-sm font-semibold text-card-foreground">{t(ASSET_CATEGORY_KEYS[group.id])}</span>
                    </div>
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {t("assets.count", { count: group.items.length })}
                    </span>
                  </div>

                  <p className="font-mono-num text-xl font-bold text-card-foreground mb-3">{formatKRW(group.total)}</p>

                  {/* Progress bar */}
                  {totalValue > 0 && (
                    <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-accent">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(group.total / totalValue) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-primary/60"
                      />
                    </div>
                  )}

                  {/* Individual items */}
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl bg-accent/60 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                          <p className="font-mono-num text-xs text-muted-foreground">{formatKRW(item.valuation)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(item)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-primary transition-colors">
                            <PencilLine className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border-2 border-dashed border-border bg-card/50 py-16 text-center">
            <Wallet className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">{t("assets.empty.title")}</p>
            <p className="text-sm text-muted-foreground/60">{t("assets.empty.desc")}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AssetDashboard;
