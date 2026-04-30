import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Calendar, CheckCircle2, ChevronDown, Award, Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingModal from "@/components/BookingModal";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Expert {
  id: string;
  name: string;
  expertise: string;
  experience_score: number;
  tags: string[];
  match_rate: number;
  available: boolean;
  career: string;
  description: string;
  specialties: string[];
  consult_fee: string;
  sort_order: number;
  name_en: string; name_ja: string; name_zh: string;
  expertise_en: string; expertise_ja: string; expertise_zh: string;
  career_en: string; career_ja: string; career_zh: string;
  description_en: string; description_ja: string; description_zh: string;
  consult_fee_en: string; consult_fee_ja: string; consult_fee_zh: string;
  tags_en: string[]; tags_ja: string[]; tags_zh: string[];
  specialties_en: string[]; specialties_ja: string[]; specialties_zh: string[];
}

const useLangField = () => {
  const { lang } = useLanguage();
  return <K extends string>(expert: Expert, field: K): string => {
    if (lang === "ko") return (expert as any)[field];
    const key = `${field}_${lang}`;
    const val = (expert as any)[key];
    return val && (typeof val === 'string' ? val : (val as string[]).length > 0) ? val : (expert as any)[field];
  };
};

const useLangArray = () => {
  const { lang } = useLanguage();
  return (expert: Expert, field: string): string[] => {
    if (lang === "ko") return (expert as any)[field];
    const key = `${field}_${lang}`;
    const val = (expert as any)[key];
    return val && val.length > 0 ? val : (expert as any)[field];
  };
};

// 실명·자격사 명칭 노출 우회: 분야 자동 감지 → 익명 라벨 매핑
const detectCategory = (expert: Expert): "legal" | "veterans" | "psych" | "default" => {
  const blob = [
    expert.expertise, expert.expertise_en, expert.expertise_ja, expert.expertise_zh,
    expert.name, expert.career,
    ...(expert.tags || []),
  ].filter(Boolean).join(" ").toLowerCase();
  if (/(법|법무|변호|legal|law|弁護|律|法務)/i.test(blob)) return "legal";
  if (/(보훈|행정|veteran|보상|援護|退伍|退役)/i.test(blob)) return "veterans";
  if (/(심리|상담|ptsd|psych|mental|心理|カウン|咨询|关怀)/i.test(blob)) return "psych";
  return "default";
};

const ExpertMatchSection = () => {
  const { t } = useLanguage();
  const getField = useLangField();
  const getArray = useLangArray();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchExperts = async () => {
      const { data } = await supabase
        .from("experts")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setExperts(data as unknown as Expert[]);
      setLoading(false);
    };
    fetchExperts();
  }, []);

  const handleBook = (expert: Expert) => {
    setSelectedExpert(expert);
    setModalOpen(true);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="bg-accent/30 py-20" id="experts">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">{t("experts.label")}</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("experts.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("experts.subtitle")}</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {experts.map((expert, i) => {
              const isExpanded = expandedIndex === i;
              return (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  layout
                  className="relative flex flex-col rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          {getField(expert, 'expertise')}
                        </span>
                        <h3 className="mt-1 text-xl font-semibold text-card-foreground">
                          {getField(expert, 'name')}
                        </h3>
                      </div>
                      <div className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-muted-foreground">
                        {t("experts.customerFirst")}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {getField(expert, 'career')}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                        <Star className="h-3 w-3" />
                        {t("experts.topVerified")}
                      </div>
                      {expert.available ? (
                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("experts.available")}
                        </div>
                      ) : (
                        <div className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {t("experts.reservation")}
                        </div>
                      )}
                      <div className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
                        {getField(expert, 'consult_fee')}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {getArray(expert, 'tags').map((tag, j) => (
                        <span key={j} className="rounded-lg bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => toggleExpand(i)}
                      className="mt-4 flex items-center gap-1 self-start text-xs font-medium text-primary transition-colors hover:text-primary/70"
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      {isExpanded ? t("experts.viewLess") : t("experts.viewMore")}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-4 border-t border-border pt-4">
                            <div>
                              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-card-foreground">
                                <Briefcase className="h-3.5 w-3.5" />
                                {t("experts.intro")}
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground">{getField(expert, 'description')}</p>
                            </div>
                            <div>
                              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-card-foreground">
                                <Award className="h-3.5 w-3.5" />
                                {t("experts.specialties")}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {getArray(expert, 'specialties').map((s, k) => (
                                  <span key={k} className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="border-t border-border p-4">
                    <Button
                      variant="warmBrown"
                      size="lg"
                      className="w-full"
                      onClick={() => handleBook(expert)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {t("experts.book")}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="mt-10 rounded-xl border border-border bg-secondary/30 p-4 text-xs leading-relaxed text-muted-foreground">
          {t("experts.disclaimer")}
        </p>
      </div>

      {selectedExpert && (
        <BookingModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          expert={selectedExpert}
        />
      )}
    </section>
  );
};

export default ExpertMatchSection;
