import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchResult {
  id: string;
  unit: string;
  period: string;
  count: number;
}

const BuddySearch = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearched(true);
    // Mock results based on query
    setResults([
      { id: "1", unit: `${query} ${t("buddy.result.unit1")}`, period: "2023.01 ~ 2024.09", count: 12 },
      { id: "2", unit: `${query} ${t("buddy.result.unit2")}`, period: "2022.06 ~ 2024.03", count: 8 },
      { id: "3", unit: `${query} ${t("buddy.result.unit3")}`, period: "2023.03 ~ 2024.12", count: 15 },
    ]);
  };

  return (
    <section className="bg-accent/30 py-20" id="buddy">
      <div className="container mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">{t("buddy.label")}</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("buddy.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("buddy.subtitle")}</p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("buddy.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="warmBrown" onClick={handleSearch} className="shrink-0">
              <Search className="mr-2 h-4 w-4" />
              {t("buddy.searchBtn")}
            </Button>
          </div>
        </motion.div>

        {/* Results */}
        {searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {results.length > 0 ? (
              results.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground">{r.unit}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{r.period}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.count}{t("buddy.people")}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {t("buddy.connect")}
                  </Button>
                </motion.div>
              ))
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 py-12 text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground">{t("buddy.noResults")}</p>
              </div>
            )}
          </motion.div>
        )}

        {!searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {[
              { icon: Users, titleKey: "buddy.feature1.title", descKey: "buddy.feature1.desc" },
              { icon: MapPin, titleKey: "buddy.feature2.title", descKey: "buddy.feature2.desc" },
              { icon: Calendar, titleKey: "buddy.feature3.title", descKey: "buddy.feature3.desc" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-card"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-card-foreground">{t(f.titleKey)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BuddySearch;
