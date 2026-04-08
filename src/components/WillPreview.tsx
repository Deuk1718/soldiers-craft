import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Circle, FileText, ChevronRight, Download, Zap, Gift, Plus, Trash2, AlertTriangle, ArrowRight, ArrowUpRight, HelpCircle } from "lucide-react";
import CertificateGenerator from "@/components/CertificateGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ── 체크리스트 항목 정의 (translation key references) ──
interface CheckItem {
  id: string;
  labelKey: string;
  descKey: string;
  categoryKey: string;
}

const CHECKLIST_ITEMS: CheckItem[] = [
  { id: "real_estate", labelKey: "will.check.realEstate", descKey: "will.check.realEstate.desc", categoryKey: "assetType" },
  { id: "financial", labelKey: "will.check.financial", descKey: "will.check.financial.desc", categoryKey: "assetType" },
  { id: "crypto", labelKey: "will.check.crypto", descKey: "will.check.crypto.desc", categoryKey: "assetType" },
  { id: "insurance", labelKey: "will.check.insurance", descKey: "will.check.insurance.desc", categoryKey: "assetType" },
  { id: "business", labelKey: "will.check.business", descKey: "will.check.business.desc", categoryKey: "assetType" },
  { id: "executor", labelKey: "will.check.executor", descKey: "will.check.executor.desc", categoryKey: "structure" },
  { id: "trust", labelKey: "will.check.trust", descKey: "will.check.trust.desc", categoryKey: "structure" },
  { id: "forced_share", labelKey: "will.check.forcedShare", descKey: "will.check.forcedShare.desc", categoryKey: "structure" },
  { id: "charity", labelKey: "will.check.charity", descKey: "will.check.charity.desc", categoryKey: "structure" },
  { id: "medical", labelKey: "will.check.medical", descKey: "will.check.medical.desc", categoryKey: "supplement" },
  { id: "pet", labelKey: "will.check.pet", descKey: "will.check.pet.desc", categoryKey: "supplement" },
  { id: "digital_legacy", labelKey: "will.check.digitalLegacy", descKey: "will.check.digitalLegacy.desc", categoryKey: "supplement" },
];

const CATEGORY_KEYS: Record<string, string> = {
  assetType: "will.cat.assetType",
  structure: "will.cat.structure",
  supplement: "will.cat.supplement",
};

// ── 상속인 입력 ──
interface Heir {
  name: string;
  relation: string;
}

interface OneClickChild {
  gender: "남" | "여";
}

// ── 자산 배분 설정 ──
interface AssetAssignment {
  mode: "equal" | "specific";
  heirIndex: number;
}

const ASSET_TYPE_IDS = ["real_estate", "financial", "crypto", "insurance", "business"];
const SUPPLEMENTARY_IDS = ["medical", "pet", "digital_legacy"];

// ── 빈칸(fillable) 정의 ──
interface FillableField {
  key: string;
  placeholder: string;
  width?: string;
}

interface ClauseData {
  id: string;
  title: string;
  segments: (string | FillableField)[];
  color: string;
}

// ── 유언장 조항 생성 함수 ──
const generateClauses = (
  selected: Set<string>,
  testator: string,
  heirs: Heir[],
  assetAssignments: Record<string, AssetAssignment>,
  t: (key: string, params?: Record<string, string | number>) => string
): ClauseData[] => {
  const clauses: ClauseData[] = [];
  let clauseNum = 1;

  const heirNames = heirs.filter(h => h.name.trim()).map(h => `${h.relation} ${h.name}`);
  const allHeirs = heirNames.length > 0 ? heirNames.join(", ") : t("will.cl.heirUnset");

  const getHeirText = (assetId: string) => {
    const assignment = assetAssignments[assetId];
    if (!assignment || assignment.mode === "equal") {
      return { text: allHeirs, suffix: t("will.cl.equalSuffix") };
    }
    const heir = heirNames[assignment.heirIndex] || heirNames[0] || "○○○";
    return { text: heir, suffix: t("will.cl.inheritSuffix") };
  };

  if (selected.has("real_estate")) {
    const h = getHeirText("real_estate");
    clauses.push({
      id: "real_estate",
      title: t("will.cl.re.title", { n: clauseNum }),
      segments: [
        t("will.cl.re.seg1", { testator: testator || "○○○" }),
        { key: "re_detail", placeholder: t("will.cl.re.ph"), width: "w-64" },
        t("will.cl.re.seg2", { heirs: h.text, suffix: h.suffix }),
      ],
      color: "text-primary",
    });
    clauseNum++;
  }

  if (selected.has("financial")) {
    const h = getHeirText("financial");
    clauses.push({
      id: "financial",
      title: t("will.cl.fin.title", { n: clauseNum }),
      segments: [
        t("will.cl.fin.seg1"),
        { key: "fin_bank", placeholder: t("will.cl.fin.ph"), width: "w-32" },
        t("will.cl.fin.seg2", { heirs: h.text, suffix: h.suffix }),
      ],
      color: "text-primary",
    });
    clauseNum++;
  }

  if (selected.has("crypto")) {
    const h = getHeirText("crypto");
    clauses.push({
      id: "crypto",
      title: t("will.cl.crypto.title", { n: clauseNum }),
      segments: [
        t("will.cl.crypto.seg1"),
        { key: "crypto_types", placeholder: t("will.cl.crypto.ph"), width: "w-48" },
        t("will.cl.crypto.seg2", { heirs: h.text, suffix: h.suffix }),
      ],
      color: "text-warning",
    });
    clauseNum++;
  }

  if (selected.has("insurance")) {
    const h = getHeirText("insurance");
    clauses.push({
      id: "insurance",
      title: t("will.cl.ins.title", { n: clauseNum }),
      segments: [
        t("will.cl.ins.seg1"),
        { key: "ins_company", placeholder: t("will.cl.ins.ph"), width: "w-28" },
        t("will.cl.ins.seg2", { heirs: h.text, suffix: h.suffix }),
      ],
      color: "text-primary",
    });
    clauseNum++;
  }

  if (selected.has("business")) {
    const h = getHeirText("business");
    clauses.push({
      id: "business",
      title: t("will.cl.biz.title", { n: clauseNum }),
      segments: [
        t("will.cl.biz.seg1"),
        { key: "biz_name", placeholder: t("will.cl.biz.ph"), width: "w-32" },
        t("will.cl.biz.seg2", { heirs: h.text, suffix: h.suffix }),
      ],
      color: "text-primary",
    });
    clauseNum++;
  }

  if (selected.has("executor")) {
    clauses.push({
      id: "executor",
      title: t("will.cl.exec.title", { n: clauseNum }),
      segments: [
        t("will.cl.exec.seg1"),
        { key: "exec_firm", placeholder: t("will.cl.exec.ph1"), width: "w-28" },
        t("will.cl.exec.seg2"),
        { key: "exec_name", placeholder: t("will.cl.exec.ph2"), width: "w-24" },
        t("will.cl.exec.seg3"),
      ],
      color: "text-primary",
    });
    clauseNum++;
  }

  if (selected.has("trust")) {
    clauses.push({
      id: "trust",
      title: t("will.cl.trust.title", { n: clauseNum }),
      segments: [
        t("will.cl.trust.seg1"),
        { key: "trust_bank", placeholder: t("will.cl.trust.ph1"), width: "w-24" },
        t("will.cl.trust.seg2"),
        { key: "trust_age", placeholder: t("will.cl.trust.ph2"), width: "w-12" },
        t("will.cl.trust.seg3"),
      ],
      color: "text-primary",
    });
    clauseNum++;
  }

  if (selected.has("forced_share")) {
    clauses.push({
      id: "forced_share",
      title: t("will.cl.forced.title", { n: clauseNum }),
      segments: [t("will.cl.forced.text")],
      color: "text-success",
    });
    clauseNum++;
  }

  if (selected.has("charity")) {
    clauses.push({
      id: "charity",
      title: t("will.cl.charity.title", { n: clauseNum }),
      segments: [
        t("will.cl.charity.seg1"),
        { key: "charity_pct", placeholder: t("will.cl.charity.ph1"), width: "w-20" },
        t("will.cl.charity.seg2"),
        { key: "charity_org", placeholder: t("will.cl.charity.ph2"), width: "w-28" },
        t("will.cl.charity.seg3"),
      ],
      color: "text-primary",
    });
    clauseNum++;
  }

  if (selected.has("medical")) {
    const assignedHeir = (() => {
      const assignment = assetAssignments["medical"];
      if (!assignment || assignment.mode === "equal") return heirNames[0] || "○○○";
      return heirNames[assignment.heirIndex] || heirNames[0] || "○○○";
    })();
    clauses.push({
      id: "medical",
      title: t("will.cl.medical.title", { n: clauseNum }),
      segments: [t("will.cl.medical.text", { heir: assignedHeir })],
      color: "text-primary",
    });
    clauseNum++;
  }

  if (selected.has("pet")) {
    const assignedHeir = (() => {
      const assignment = assetAssignments["pet"];
      if (!assignment || assignment.mode === "equal") return heirNames[0] || "○○○";
      return heirNames[assignment.heirIndex] || heirNames[0] || "○○○";
    })();
    clauses.push({
      id: "pet",
      title: t("will.cl.pet.title", { n: clauseNum }),
      segments: [
        t("will.cl.pet.seg1"),
        { key: "pet_name", placeholder: t("will.cl.pet.ph1"), width: "w-24" },
        t("will.cl.pet.seg2", { heir: assignedHeir }),
        { key: "pet_cost", placeholder: t("will.cl.pet.ph2"), width: "w-16" },
        t("will.cl.pet.seg3"),
        { key: "pet_shelter", placeholder: t("will.cl.pet.ph3"), width: "w-28" },
        t("will.cl.pet.seg4"),
      ],
      color: "text-primary",
    });
    clauseNum++;
  }

  if (selected.has("digital_legacy")) {
    const assignedHeir = (() => {
      const assignment = assetAssignments["digital_legacy"];
      if (!assignment || assignment.mode === "equal") return heirNames[0] || "○○○";
      return heirNames[assignment.heirIndex] || heirNames[0] || "○○○";
    })();
    clauses.push({
      id: "digital_legacy",
      title: t("will.cl.digital.title", { n: clauseNum }),
      segments: [t("will.cl.digital.text", { heir: assignedHeir })],
      color: "text-primary",
    });
    clauseNum++;
  }

  return clauses;
};

// ── 메인 컴포넌트 ──
interface WillPreviewProps {
  onHeirsChange?: (heirs: Heir[]) => void;
}

const WillPreview = ({ onHeirsChange }: WillPreviewProps) => {
  const { t, lang } = useLanguage();
  const [selected, setSelected] = useState<Set<string>>(new Set(["real_estate", "financial", "executor", "forced_share"]));
  const [showDraft, setShowDraft] = useState(false);
  const [testatorName, setTestatorName] = useState(t("will.sample.testator"));
  const [heirs, setHeirsInternal] = useState<Heir[]>([
    { name: t("will.sample.heir1.name"), relation: t("will.sample.heir1.relation") },
    { name: t("will.sample.heir2.name"), relation: t("will.sample.heir2.relation") },
    { name: t("will.sample.heir3.name"), relation: t("will.sample.heir3.relation") },
  ]);
  const setHeirs = (newHeirs: Heir[] | ((prev: Heir[]) => Heir[])) => {
    setHeirsInternal(prev => {
      const result = typeof newHeirs === 'function' ? newHeirs(prev) : newHeirs;
      onHeirsChange?.(result);
      return result;
    });
  };
  const willDateObj = useMemo(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
  }, []);

  const willDate = useMemo(() => {
    return t("will.dateFormat", { year: willDateObj.year, month: willDateObj.month, day: willDateObj.day });
  }, [willDateObj, t, lang]);
  const [witness1, setWitness1] = useState("");
  const [witness2, setWitness2] = useState("");
  const [fillValues, setFillValues] = useState<Record<string, string>>({});
  const [assetAssignments, setAssetAssignments] = useState<Record<string, AssetAssignment>>({});


  // 평생 증여/상속 계획 테이블 상태
  interface GiftPlanRow {
    childName: string;
    amountPerQuarter: number;
    startYear: number;
    endYear: number;
    frequency: "quarterly" | "semi-annual" | "annual";
  }
  const [giftPlan, setGiftPlan] = useState<GiftPlanRow[]>([
    { childName: t("will.sample.heir1.name"), amountPerQuarter: 500, startYear: 2026, endYear: 2036, frequency: "quarterly" },
  ]);
  const [includeGiftPlanInWill, setIncludeGiftPlanInWill] = useState(false);

  const sanitizeText = (text: string, maxLen = 50) => text.replace(/[<>&"']/g, "").slice(0, maxLen);
  const clampNumber = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const addGiftRow = () => {
    if (giftPlan.length >= 20) return;
    const nextChild = heirs[giftPlan.length % heirs.length];
    setGiftPlan(prev => [...prev, {
      childName: nextChild?.name || "",
      amountPerQuarter: 500,
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear() + 10,
      frequency: "quarterly",
    }]);
  };

  const updateGiftRow = (index: number, field: keyof GiftPlanRow, value: string | number) => {
    setGiftPlan(prev => {
      const updated = [...prev];
      if (field === "amountPerQuarter") {
        updated[index] = { ...updated[index], [field]: clampNumber(Number(value) || 0, 0, 9999999) };
      } else if (field === "startYear" || field === "endYear") {
        updated[index] = { ...updated[index], [field]: clampNumber(Number(value) || 2026, 2000, 2100) };
      } else if (field === "childName") {
        updated[index] = { ...updated[index], [field]: sanitizeText(String(value), 30) };
      } else if (field === "frequency") {
        const validFreq = ["quarterly", "semi-annual", "annual"].includes(String(value)) ? String(value) as GiftPlanRow["frequency"] : "quarterly";
        updated[index] = { ...updated[index], frequency: validFreq };
      }
      return updated;
    });
  };

  const removeGiftRow = (index: number) => {
    setGiftPlan(prev => prev.filter((_, i) => i !== index));
  };

  const getFrequencyMultiplier = (freq: string) => {
    switch (freq) {
      case "quarterly": return 4;
      case "semi-annual": return 2;
      case "annual": return 1;
      default: return 4;
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "quarterly": return t("gift.freq.quarterly.short");
      case "semi-annual": return t("gift.freq.semiAnnual.short");
      case "annual": return t("gift.freq.annual.short");
      default: return t("gift.freq.quarterly.short");
    }
  };

  const giftPlanSummary = useMemo(() => {
    return giftPlan.map(row => {
      const yearly = row.amountPerQuarter * getFrequencyMultiplier(row.frequency);
      const years = Math.max(0, row.endYear - row.startYear);
      const total = yearly * years;
      const overLimit = total > 5000;
      return { ...row, yearly, years, total, overLimit };
    });
  }, [giftPlan]);

  // 사용설명서 상태
  const [guideOpen, setGuideOpen] = useState(false);

  // 원클릭 유언장 상태
  const [oneClickAsset, setOneClickAsset] = useState("10");
  const [oneClickChildren, setOneClickChildren] = useState(2);
  const [oneClickName, setOneClickName] = useState(t("will.sample.testator"));
  const [oneClickGenerated, setOneClickGenerated] = useState(false);
  const [oneClickChildGenders, setOneClickChildGenders] = useState<OneClickChild[]>([
    { gender: "남" },
    { gender: "여" },
  ]);

  // 언어 변경 시 샘플 데이터 초기화
  useEffect(() => {
    setTestatorName(t("will.sample.testator"));
    setHeirsInternal([
      { name: t("will.sample.heir1.name"), relation: t("will.sample.heir1.relation") },
      { name: t("will.sample.heir2.name"), relation: t("will.sample.heir2.relation") },
      { name: t("will.sample.heir3.name"), relation: t("will.sample.heir3.relation") },
    ]);
    setOneClickName(t("will.sample.testator"));
    setOneClickGenerated(false);
    setGiftPlan([
      { childName: t("will.sample.heir1.name"), amountPerQuarter: 500, startYear: 2026, endYear: 2036, frequency: "quarterly" },
    ]);
  }, [lang]);

  const updateFillValue = (key: string, value: string) => {
    setFillValues((prev) => ({ ...prev, [key]: value }));
  };

  const formatAssetInput = (v: string) => v.replace(/[^0-9.]/g, "");

  const getChildName = (i: number, gender: string) => {
    if (i === 0) return gender === "남" ? t("will.gender.eldestSon") : t("will.gender.eldestDaughter");
    if (i === 1) return gender === "남" ? t("will.gender.secondSon") : t("will.gender.secondDaughter");
    return gender === "남" ? t("will.gender.nthSon", { n: i + 1 }) : t("will.gender.nthDaughter", { n: i + 1 });
  };

  const getSonBtnLabel = (i: number) => {
    if (i === 0) return t("will.gender.sonBtnEldest");
    if (i === 1) return t("will.gender.sonBtnSecond");
    return t("will.gender.sonBtnNth", { n: i + 1 });
  };

  const getDaughterBtnLabel = (i: number) => {
    if (i === 0) return t("will.gender.daughterBtnEldest");
    if (i === 1) return t("will.gender.daughterBtnSecond");
    return t("will.gender.daughterBtnNth", { n: i + 1 });
  };

  const oneClickWillDoc = useMemo(() => {
    const assetNum = parseFloat(oneClickAsset) || 0;
    const assetWon = assetNum * 100000000;
    const childCount = Math.max(1, oneClickChildren);
    const perChild = assetWon / childCount;
    const perChildStr = perChild >= 100000000
      ? `${(perChild / 100000000).toFixed(1)}억`
      : `${(perChild / 10000).toFixed(0)}만`;
    const forcedSharePct = (1 / (childCount * 2) * 100).toFixed(1);

    const childNames = Array.from({ length: childCount }, (_, i) => {
      const gender = oneClickChildGenders[i]?.gender || "남";
      return getChildName(i, gender);
    });

    return {
      assetStr: assetNum >= 1 ? `${assetNum}억 원` : `${(assetNum * 10000).toFixed(0)}만 원`,
      perChildStr,
      forcedSharePct,
      childCount,
      childNames,
      assetWon,
    };
  }, [oneClickAsset, oneClickChildren, oneClickChildGenders, t]);

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addHeir = () => {
    if (heirs.length < 6) setHeirs([...heirs, { name: "", relation: "" }]);
  };

  const updateHeir = (index: number, field: keyof Heir, value: string) => {
    const updated = [...heirs];
    updated[index] = { ...updated[index], [field]: value };
    setHeirs(updated);
  };

  const removeHeir = (index: number) => {
    if (heirs.length > 1) setHeirs(heirs.filter((_, i) => i !== index));
  };

  const oneClickDocRef = useRef<HTMLDivElement>(null);
  const customDocRef = useRef<HTMLDivElement>(null);
  const clauses = useMemo(() => generateClauses(selected, testatorName, heirs, assetAssignments, t), [selected, testatorName, heirs, assetAssignments, t]);
  const categories = [...new Set(CHECKLIST_ITEMS.map((item) => item.categoryKey))];

  const handleDownloadPDF = useCallback(async (targetRef: React.RefObject<HTMLDivElement>, label: string) => {
    const el = targetRef.current;
    if (!el) return;

    const prevMaxH = el.style.maxHeight;
    const prevOverflow = el.style.overflow;
    el.style.maxHeight = "none";
    el.style.overflow = "visible";

    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#f7f3ee" });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 5;
      const usableW = pdfW - margin * 2;
      const usableH = pdfH - margin * 2;

      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = usableW / imgW;
      const pageHeightInPx = usableH / ratio;

      const elTop = el.getBoundingClientRect().top;
      const breakPoints: number[] = [0];

      const blocks = el.querySelectorAll("[data-pdf-block]");
      if (blocks.length > 0) {
        blocks.forEach((child) => {
          const rect = child.getBoundingClientRect();
          breakPoints.push((rect.top - elTop) * 2);
          breakPoints.push((rect.bottom - elTop) * 2);
        });
      }

      Array.from(el.children).forEach((child) => {
        const rect = child.getBoundingClientRect();
        breakPoints.push((rect.top - elTop) * 2);
        breakPoints.push((rect.bottom - elTop) * 2);
      });

      breakPoints.push(imgH);
      const sortedBreaks = [...new Set(breakPoints)].filter(b => b >= 0 && b <= imgH).sort((a, b) => a - b);

      const pageSlices: { y: number; h: number }[] = [];
      let currentY = 0;

      while (currentY < imgH - 1) {
        const maxY = currentY + pageHeightInPx;

        if (maxY >= imgH) {
          pageSlices.push({ y: currentY, h: imgH - currentY });
          break;
        }

        let bestBreak = -1;
        for (let i = sortedBreaks.length - 1; i >= 0; i--) {
          if (sortedBreaks[i] <= maxY && sortedBreaks[i] > currentY + pageHeightInPx * 0.3) {
            bestBreak = sortedBreaks[i];
            break;
          }
        }

        if (bestBreak <= currentY) {
          bestBreak = currentY + pageHeightInPx;
        }

        pageSlices.push({ y: currentY, h: bestBreak - currentY });
        currentY = bestBreak;
      }

      const bgColor = "#f7f3ee";
      for (let i = 0; i < pageSlices.length; i++) {
        const { y, h } = pageSlices[i];
        if (i > 0) pdf.addPage();

        pdf.setFillColor(247, 243, 238);
        pdf.rect(0, 0, pdfW, pdfH, "F");

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgW;
        pageCanvas.height = Math.ceil(h);
        const ctx = pageCanvas.getContext("2d");
        if (!ctx) break;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, imgW, Math.ceil(h));
        ctx.drawImage(canvas, 0, y, imgW, h, 0, 0, imgW, Math.ceil(h));

        const pageImgData = pageCanvas.toDataURL("image/png");
        pdf.addImage(pageImgData, "PNG", margin, margin, usableW, h * ratio);
      }

      pdf.save(`유언장_초안_${label || "미지정"}.pdf`);
    } finally {
      el.style.maxHeight = prevMaxH;
      el.style.overflow = prevOverflow;
    }
  }, []);

  return (
    <section className="bg-background py-20" id="will">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">{t("will.label")}</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("will.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("will.subtitle")}</p>
        </motion.div>

        <Tabs defaultValue="oneclick" className="w-full">
          <div className="mb-6 flex items-center gap-3">
            <TabsList className="w-full max-w-lg">
              <TabsTrigger value="oneclick" className="flex-1 gap-1.5">
                <ArrowRight className="h-3.5 w-3.5" /> {t("will.tab.oneclick")}
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1 gap-1.5">
                <ArrowRight className="h-3.5 w-3.5" /> {t("will.tab.custom")}
              </TabsTrigger>
              <TabsTrigger value="certificate" className="flex-1 gap-1.5">
                <FileText className="h-3.5 w-3.5" /> 증명서 발급
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGuideOpen(true)}
              className="shrink-0 gap-1.5 text-xs"
            >
              {t("will.guide.btn")}
            </Button>
          </div>

          {/* ════════ 원클릭 유언장 탭 ════════ */}
          <TabsContent value="oneclick">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* 좌측: 간단 입력 */}
              <div className="space-y-5 lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5 text-gold" />
                    <p className="text-lg font-semibold text-card-foreground">{t("will.oneclick.title")}</p>
                  </div>
                  <p className="mb-5 text-sm text-muted-foreground">
                    {t("will.oneclick.desc")}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("will.testator")}</p>
                      <Input
                        value={oneClickName}
                        onChange={(e) => setOneClickName(e.target.value)}
                        placeholder={t("will.testator.placeholder")}
                      />
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("will.totalProperty")}</p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={oneClickAsset}
                          onChange={(e) => setOneClickAsset(formatAssetInput(e.target.value))}
                          placeholder="10"
                          className="font-mono-num text-lg font-bold"
                        />
                        <span className="shrink-0 text-sm font-semibold text-muted-foreground">{t("will.hundred_million")}</span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("will.childCount")}</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => {
                              setOneClickChildren(n);
                              setOneClickGenerated(false);
                              setOneClickChildGenders(prev => {
                                const updated = [...prev];
                                while (updated.length < n) updated.push({ gender: "남" });
                                return updated.slice(0, n);
                              });
                            }}
                            className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-lg font-bold transition-all ${
                              oneClickChildren === n
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 자녀 성별 선택 */}
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("will.childGender")}</p>
                      <div className="space-y-2">
                        {Array.from({ length: oneClickChildren }, (_, i) => {
                          const gender = oneClickChildGenders[i]?.gender || "남";
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-16 text-xs font-medium text-muted-foreground">{t("will.gender.nthLabel", { n: i + 1 })}</span>
                              <button
                                onClick={() => {
                                  setOneClickChildGenders(prev => {
                                    const updated = [...prev];
                                    updated[i] = { gender: "남" };
                                    return updated;
                                  });
                                  setOneClickGenerated(false);
                                }}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                  gender === "남"
                                    ? "bg-blue-500/15 text-blue-600 border border-blue-500/30"
                                    : "bg-background text-muted-foreground border border-border hover:border-blue-500/30"
                                }`}
                              >
                                {getSonBtnLabel(i)}
                              </button>
                              <button
                                onClick={() => {
                                  setOneClickChildGenders(prev => {
                                    const updated = [...prev];
                                    updated[i] = { gender: "여" };
                                    return updated;
                                  });
                                  setOneClickGenerated(false);
                                }}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                  gender === "여"
                                    ? "bg-pink-500/15 text-pink-600 border border-pink-500/30"
                                    : "bg-background text-muted-foreground border border-border hover:border-pink-500/30"
                                }`}
                              >
                                {getDaughterBtnLabel(i)}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="warmBrown"
                    size="lg"
                    className="mt-6 w-full gap-2"
                    onClick={() => setOneClickGenerated(true)}
                  >
                    <Zap className="h-4 w-4" /> {t("will.generate")}
                  </Button>
                </motion.div>

                {oneClickGenerated && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-success/30 bg-success/5 p-5 shadow-card"
                  >
                    <p className="text-sm font-semibold text-success mb-2">{t("will.summary")}</p>
                    <div className="space-y-1.5 text-xs text-foreground/70">
                      <p>• {t("will.totalProperty2")}: <strong className="text-foreground">{oneClickWillDoc.assetStr}</strong></p>
                      <p>• {t("will.equalDist", { count: oneClickWillDoc.childCount })}: <strong className="text-foreground">{t("will.perPerson", { amount: oneClickWillDoc.perChildStr })}</strong></p>
                      <p>• {t("will.forcedShare")}: <strong className="text-foreground">{t("will.forcedSharePct", { pct: oneClickWillDoc.forcedSharePct })}</strong> ({t("will.forcedShareMet")})</p>
                      <p>• {t("will.executorNeeded")}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 우측: 원클릭 유언장 프리뷰 */}
              <div className="lg:col-span-3">
                <div className="sticky top-20">
                  {!oneClickGenerated ? (
                    <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-border">
                      <div className="text-center">
                        <Zap className="mx-auto h-10 w-10 text-muted-foreground/30" />
                        <p className="mt-3 text-sm text-muted-foreground">{t("will.emptyHint")}</p>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                    >
                      <div className="border-b border-border bg-accent/60 px-6 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground">{t("will.tab.oneclick")}</p>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-gold/15 px-3 py-0.5 text-xs font-semibold text-gold">
                              {t("will.autoGenerated")}
                            </span>
                            <Button variant="warmBrown" size="sm" onClick={() => handleDownloadPDF(oneClickDocRef, oneClickName)} className="gap-1.5">
                              <Download className="h-3.5 w-3.5" /> {t("will.pdfSave")}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div ref={oneClickDocRef} className="max-h-[70vh] overflow-y-auto bg-[hsl(38_28%_96%)] px-6 py-8 sm:px-10">
                        <h3 className="font-serif-legal text-center text-2xl font-semibold text-foreground">{t("will.docTitle")}</h3>
                        <div className="mx-auto mt-2 h-px w-16 bg-gold/40" />

                        <div className="mt-6 space-y-5 font-serif-legal text-sm leading-7 text-foreground/80">
                          <p>{t("will.preamble", { name: oneClickName || "○○○" })}</p>

                          {/* 제1조 — 재산 총액 */}
                          <div data-pdf-block className="rounded-xl border border-border bg-card p-5">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{t("will.clause1")}</p>
                            <p>{t("will.clause1.text", { name: oneClickName || "○○○", asset: oneClickWillDoc.assetStr, assetWon: (parseFloat(oneClickAsset || "0") * 100000000).toLocaleString() })}</p>
                          </div>

                          {/* 제2조 — 균등 분배 */}
                          <div data-pdf-block className="rounded-xl border border-border bg-card p-5">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{t("will.clause2")}</p>
                            <p>{t("will.clause2.text", { count: oneClickWillDoc.childCount })}</p>
                            <div className="mt-3 space-y-2">
                              {oneClickWillDoc.childNames.map((name, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg bg-accent/50 px-4 py-2">
                                  <span className="font-medium text-foreground">{name}</span>
                                  <span className="font-mono-num font-bold text-primary">{oneClickWillDoc.perChildStr} ({(100 / oneClickWillDoc.childCount).toFixed(1)}%)</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 제3조 — 유류분 */}
                          <div data-pdf-block className="rounded-xl border border-success/30 bg-success/5 p-5">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-success">{t("will.oc.c3.title")}</p>
                            <p>{t("will.oc.c3.text", { pct: oneClickWillDoc.forcedSharePct })}</p>
                          </div>

                          {/* 제4조 — 집행자 */}
                          <div data-pdf-block className="rounded-xl border border-border bg-card p-5">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{t("will.oc.c4.title")}</p>
                            <p>{t("will.oc.c4.text")}</p>
                          </div>

                          {/* 제5조 — 세금 */}
                          <div data-pdf-block className="rounded-xl border border-warning/30 bg-warning/5 p-5">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-warning">{t("will.oc.c5.title")}</p>
                            <p>{t("will.oc.c5.text")}</p>
                          </div>

                          {/* 평생 증여/상속 계획 (유언장 포함 시) */}
                          {includeGiftPlanInWill && giftPlanSummary.length > 0 && (
                            <div data-pdf-block className="rounded-xl border border-gold/30 bg-gold/5 p-5">
                              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gold">{t("gift.attachTitle")}</p>
                              <p className="mb-3 text-xs text-foreground/60">{t("gift.attachDesc")}</p>
                              <div className="space-y-2">
                                {giftPlanSummary.map((row, ri) => (
                                  <div key={ri} className="flex flex-wrap items-center justify-between rounded-lg bg-accent/50 px-3 py-2 gap-2">
                                    <span className="text-xs font-medium text-foreground">{row.childName || t("gift.unassigned")}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {getFrequencyLabel(row.frequency)} {row.amountPerQuarter.toLocaleString()}{t("common.manWon")} · {row.startYear}~{row.endYear}
                                    </span>
                                    <span className="text-xs font-bold text-gold">
                                      {t("gift.total.prefix")} {row.total >= 10000 ? `${(row.total / 10000).toFixed(1)}${t("common.eokWon")}` : `${row.total.toLocaleString()}${t("common.manWon")}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 안내 */}
                          <div data-pdf-block className="rounded-xl border border-border bg-accent/40 p-4 text-center">
                            <p className="text-xs text-muted-foreground whitespace-pre-line">
                              {t("will.notice")}
                            </p>
                          </div>

                          {/* 서명란 */}
                          <div data-pdf-block className="pt-4 text-right">
                            <p className="text-muted-foreground">{willDate || t("will.datePlaceholder")}</p>
                            <p className="mt-4 font-serif-legal text-sm text-muted-foreground">
                              {t("will.address")}: _______________________________________
                            </p>
                            <p className="mt-4 font-serif-legal text-lg text-foreground">
                              {t("will.testatorSign")}: {oneClickName || "_________________"} <span className="italic text-muted-foreground">{t("will.seal")}</span>
                            </p>
                            <p className="mt-2 font-serif-legal text-sm text-muted-foreground">
                              {t("will.witness1")}: ___________ &nbsp;&nbsp; {t("will.witness2")}: ___________
                            </p>
                            <p className="mt-1 font-serif-legal text-xs text-muted-foreground">
                              {t("will.witnessNote")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ════════ 맞춤형 유언장 탭 ════════ */}
          <TabsContent value="custom">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* ── 좌측: 체크리스트 + 상속인 입력 ── */}
              <div className="space-y-5 lg:col-span-2">
                {/* 유언자 */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <p className="mb-3 text-sm font-semibold text-card-foreground">{t("will.testator")}</p>
                  <Input
                    value={testatorName}
                    onChange={(e) => setTestatorName(e.target.value)}
                    placeholder={t("will.testator.placeholder")}
                    className="mb-3"
                  />
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("will.witness1")}/{t("will.witness2")}</p>
                  <div className="flex gap-2">
                    <Input
                      value={witness1}
                      onChange={(e) => setWitness1(e.target.value)}
                      placeholder={t("will.witness1")}
                      className="text-xs"
                    />
                    <Input
                      value={witness2}
                      onChange={(e) => setWitness2(e.target.value)}
                      placeholder={t("will.witness2")}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* 상속인 */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-card-foreground">{t("will.heirList")}</p>
                    <button onClick={addHeir} className="text-xs font-medium text-primary hover:text-primary/70">
                      {t("will.addHeir")}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {heirs.map((heir, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={heir.relation}
                          onChange={(e) => updateHeir(i, "relation", e.target.value)}
                          placeholder={t("will.relation.placeholder")}
                          className="w-24 shrink-0 text-xs"
                        />
                        <Input
                          value={heir.name}
                          onChange={(e) => updateHeir(i, "name", e.target.value)}
                          placeholder={t("will.name.placeholder")}
                          className="text-xs"
                        />
                        {heirs.length > 1 && (
                          <button onClick={() => removeHeir(i)} className="shrink-0 text-xs text-destructive hover:text-destructive/70">
                            {t("will.delete")}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 체크리스트 */}
                {categories.map((cat) => (
                  <div key={cat} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t(CATEGORY_KEYS[cat])}</p>
                    <div className="space-y-1">
                      {CHECKLIST_ITEMS.filter((item) => item.categoryKey === cat).map((item) => {
                        const isChecked = selected.has(item.id);
                        const isAssetType = ASSET_TYPE_IDS.includes(item.id);
                        const isSupplementary = SUPPLEMENTARY_IDS.includes(item.id);
                        const showHeirSelect = isAssetType || isSupplementary;
                        const assignment = assetAssignments[item.id];
                        const validHeirs = heirs.filter(h => h.name.trim());
                        return (
                          <div key={item.id}>
                            <button
                              onClick={() => toggleItem(item.id)}
                              className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                                isChecked ? "bg-primary/5" : "hover:bg-accent/50"
                              }`}
                            >
                              {isChecked ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              ) : (
                                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                              )}
                              <div>
                                <p className={`text-sm font-medium ${isChecked ? "text-foreground" : "text-muted-foreground"}`}>
                                  {t(item.labelKey)}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground/70">{t(item.descKey)}</p>
                              </div>
                            </button>
                            {/* 자산 유형 배분 설정 */}
                            {isChecked && showHeirSelect && validHeirs.length > 0 && (
                              <div className="ml-10 mt-1 mb-2 rounded-lg border border-border bg-accent/30 p-3 space-y-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setAssetAssignments(prev => ({ ...prev, [item.id]: { mode: "equal", heirIndex: 0 } }))}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                      (!assignment || assignment.mode === "equal")
                                        ? "bg-primary/15 text-primary border border-primary/30"
                                        : "bg-background text-muted-foreground border border-border hover:border-primary/30"
                                    }`}
                                  >
                                    {t("will.equalDivide")}
                                  </button>
                                  <button
                                    onClick={() => setAssetAssignments(prev => ({ ...prev, [item.id]: { mode: "specific", heirIndex: 0 } }))}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                      assignment?.mode === "specific"
                                        ? "bg-gold/15 text-gold border border-gold/30"
                                        : "bg-background text-muted-foreground border border-border hover:border-gold/30"
                                    }`}
                                  >
                                    {t("will.specificHeir")}
                                  </button>
                                </div>
                                {assignment?.mode === "specific" && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {validHeirs.map((heir, hi) => (
                                      <button
                                        key={hi}
                                        onClick={() => setAssetAssignments(prev => ({ ...prev, [item.id]: { mode: "specific", heirIndex: hi } }))}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                          assignment.heirIndex === hi
                                            ? "bg-gold/20 text-gold border border-gold/40"
                                            : "bg-background text-muted-foreground border border-border hover:border-gold/30"
                                        }`}
                                      >
                                        {heir.relation} {heir.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <Button
                  variant="warmBrown"
                  size="lg"
                  className="w-full"
                  disabled={selected.size === 0}
                  onClick={() => setShowDraft(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {t("will.generateDraft", { count: selected.size })}
                </Button>
              </div>

              {/* ── 우측: 자동 생성 유언장 ── */}
              <div className="lg:col-span-3">
                <div className="sticky top-20">
                  <AnimatePresence mode="wait">
                    {!showDraft && selected.size === 0 && clauses.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-border"
                      >
                        <div className="text-center">
                          <FileText className="mx-auto h-10 w-10 text-muted-foreground/30" />
                          <p className="mt-3 text-sm text-muted-foreground">{t("will.selectItems")}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="draft"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                      >
                        {/* Header */}
                        <div className="border-b border-border bg-accent/60 px-6 py-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">{t("will.autoGenDraft")}</p>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-warning/15 px-3 py-0.5 text-xs font-semibold text-warning">
                                {t("will.draftCount", { count: clauses.length })}
                              </span>
                              <Button variant="warmBrown" size="sm" onClick={() => handleDownloadPDF(customDocRef, testatorName)} className="gap-1.5">
                                <Download className="h-3.5 w-3.5" /> {t("will.pdfSave")}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Document */}
                        <div ref={customDocRef} className="max-h-[70vh] overflow-y-auto bg-[hsl(38_28%_96%)] px-6 py-8 sm:px-10">
                          <h3 className="font-serif-legal text-center text-2xl font-semibold text-foreground">{t("will.docTitle")}</h3>
                          <div className="mx-auto mt-2 h-px w-16 bg-gold/40" />

                          <div className="mt-6 space-y-5 font-serif-legal text-sm leading-7 text-foreground/80">
                            {/* 서문 */}
                            <p>{t("will.preamble", { name: testatorName || "○○○" })}</p>

                            {clauses.length === 0 ? (
                              <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                                <p className="text-muted-foreground">{t("will.selectToGen")}</p>
                              </div>
                            ) : (
                              clauses.map((clause, i) => (
                                <motion.div
                                  data-pdf-block
                                  key={clause.id}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className={`rounded-xl border p-5 ${
                                    clause.color === "text-warning"
                                      ? "border-warning/30 bg-warning/5"
                                      : clause.color === "text-success"
                                      ? "border-success/30 bg-success/5"
                                      : "border-border bg-card"
                                  }`}
                                >
                                  <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${clause.color}`}>
                                    {clause.title}
                                  </p>
                                  <p>
                                    {clause.segments.map((seg, si) =>
                                      typeof seg === "string" ? (
                                        <span key={si}>{seg}</span>
                                      ) : (
                                        <span key={si} className="relative inline-block">
                                          <span className="invisible whitespace-pre px-1 text-sm font-semibold">
                                            {fillValues[seg.key] || seg.placeholder}
                                          </span>
                                          <input
                                            type="text"
                                            value={fillValues[seg.key] || ""}
                                            onChange={(e) => updateFillValue(seg.key, e.target.value)}
                                            placeholder={seg.placeholder}
                                            className="absolute inset-0 w-full border-b-2 border-dashed border-primary/30 bg-transparent px-1 text-sm font-semibold text-primary placeholder:text-primary/30 focus:border-primary focus:outline-none"
                                            maxLength={100}
                                          />
                                        </span>
                                      )
                                    )}
                                  </p>
                                </motion.div>
                              ))
                            )}

                            {/* 평생 증여/상속 계획 (유언장 포함 시) */}
                            {includeGiftPlanInWill && giftPlanSummary.length > 0 && (
                              <motion.div data-pdf-block initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-gold/30 bg-gold/5 p-5">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gold">{t("gift.attachTitle")}</p>
                                <p className="mb-3 text-xs text-foreground/60">{t("gift.attachDesc")}</p>
                                <div className="space-y-2">
                                  {giftPlanSummary.map((row, ri) => (
                                    <div key={ri} className="flex flex-wrap items-center justify-between rounded-lg bg-accent/50 px-3 py-2 gap-2">
                                      <span className="text-xs font-medium text-foreground">{row.childName || t("gift.unassigned")}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {getFrequencyLabel(row.frequency)} {row.amountPerQuarter.toLocaleString()}{t("common.manWon")} · {row.startYear}~{row.endYear}
                                      </span>
                                      <span className="text-xs font-bold text-gold">
                                        {t("gift.total.prefix")} {row.total >= 10000 ? `${(row.total / 10000).toFixed(1)}${t("common.eokWon")}` : `${row.total.toLocaleString()}${t("common.manWon")}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}

                            {/* 안내 */}
                            <div className="rounded-xl border border-border bg-accent/40 p-4 text-center">
                              <p className="text-xs text-muted-foreground whitespace-pre-line">
                                {t("will.notice")}
                              </p>
                            </div>

                            {/* 서명란 */}
                            <div className="pt-4 text-right">
                              <p className="text-muted-foreground">{willDate || "____"}</p>
                              <p className="mt-4 font-serif-legal text-sm text-muted-foreground">
                                {t("will.address")}: _______________________________________
                              </p>
                              <p className="mt-4 font-serif-legal text-lg text-foreground">
                                {t("will.testatorSign")}: {testatorName || "_________________"} <span className="italic text-muted-foreground">{t("will.seal")}</span>
                              </p>
                              <p className="mt-2 font-serif-legal text-sm text-muted-foreground">
                                {t("will.witness1")}: {witness1 || "___________"} &nbsp;&nbsp; {t("will.witness2")}: {witness2 || "___________"}
                              </p>
                              <p className="mt-1 font-serif-legal text-xs text-muted-foreground">
                                {t("will.witnessNote")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ════════ 증명서 발급 탭 ════════ */}
          <TabsContent value="certificate">
            <div className="max-w-2xl mx-auto">
              <CertificateGenerator />
            </div>
          </TabsContent>
        </Tabs>

        {/* ════════ 평생 증여/상속 계획 테이블 ════════ */}
        <div className="mt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-gold" />
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">{t("gift.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("gift.subtitle")}</p>
              </div>
            </div>
            <button
              onClick={() => setIncludeGiftPlanInWill(!includeGiftPlanInWill)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                includeGiftPlanInWill
                  ? "bg-gold/15 text-gold border border-gold/40"
                  : "bg-background text-muted-foreground border border-border hover:border-gold/30"
              }`}
            >
              {includeGiftPlanInWill ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              {t("gift.includeInWill")}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            {/* 데스크탑 테이블 헤더 */}
            <div className="hidden md:grid grid-cols-12 gap-2 border-b border-border bg-accent/60 px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-2">{t("gift.childName")}</div>
              <div className="col-span-2">{t("gift.amount")}</div>
              <div className="col-span-2">{t("gift.frequency")}</div>
              <div className="col-span-1">{t("gift.start")}</div>
              <div className="col-span-1">{t("gift.end")}</div>
              <div className="col-span-2">{t("gift.yearlyTotal")}</div>
              <div className="col-span-1">{t("gift.totalGift")}</div>
              <div className="col-span-1"></div>
            </div>

            {/* 테이블 행 */}
            {giftPlanSummary.map((row, i) => (
              <div key={i}>
                {/* 데스크탑 행 */}
                <div className="hidden md:grid grid-cols-12 gap-2 items-center border-b border-border/50 px-4 py-3 hover:bg-accent/30 transition-colors">
                  <div className="col-span-2">
                    <select
                      value={row.childName}
                      onChange={(e) => updateGiftRow(i, "childName", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="">{t("gift.select")}</option>
                      {heirs.filter(h => h.name.trim()).map((h, hi) => (
                        <option key={hi} value={h.name}>{h.relation} {h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={row.amountPerQuarter}
                      onChange={(e) => updateGiftRow(i, "amountPerQuarter", parseInt(e.target.value) || 0)}
                      className="text-sm font-mono-num"
                      min={0}
                      max={9999999}
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={row.frequency}
                      onChange={(e) => updateGiftRow(i, "frequency", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="quarterly">{t("gift.freq.quarterly")}</option>
                      <option value="semi-annual">{t("gift.freq.semiAnnual")}</option>
                      <option value="annual">{t("gift.freq.annual")}</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <Input type="number" value={row.startYear} onChange={(e) => updateGiftRow(i, "startYear", parseInt(e.target.value) || 2026)} className="text-sm font-mono-num" min={2000} max={2100} />
                  </div>
                  <div className="col-span-1">
                    <Input type="number" value={row.endYear} onChange={(e) => updateGiftRow(i, "endYear", parseInt(e.target.value) || 2036)} className="text-sm font-mono-num" min={2000} max={2100} />
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                      {row.yearly >= 10000 ? `${(row.yearly / 10000).toFixed(1)}${t("common.eokWon")}` : `${row.yearly.toLocaleString()}${t("common.manWon")}`}{t("common.annual")}
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className={`text-sm font-bold ${row.overLimit ? "text-destructive" : "text-gold"}`}>
                      {row.total >= 10000 ? `${(row.total / 10000).toFixed(1)}${t("common.eokWon")}` : `${row.total.toLocaleString()}${t("common.manWon")}`}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <button onClick={() => removeGiftRow(i)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 모바일 카드 */}
                <div className="md:hidden border-b border-border/50 px-4 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <select
                      value={row.childName}
                      onChange={(e) => updateGiftRow(i, "childName", e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-semibold focus:border-primary focus:outline-none"
                    >
                      <option value="">{t("gift.selectChild")}</option>
                      {heirs.filter(h => h.name.trim()).map((h, hi) => (
                        <option key={hi} value={h.name}>{h.relation} {h.name}</option>
                      ))}
                    </select>
                    <button onClick={() => removeGiftRow(i)} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">{t("gift.amount")}</p>
                      <Input type="number" value={row.amountPerQuarter} onChange={(e) => updateGiftRow(i, "amountPerQuarter", parseInt(e.target.value) || 0)} className="text-sm font-mono-num" min={0} max={9999999} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">{t("gift.frequency")}</p>
                      <select value={row.frequency} onChange={(e) => updateGiftRow(i, "frequency", e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none">
                        <option value="quarterly">{t("gift.freq.quarterly.short")}</option>
                        <option value="semi-annual">{t("gift.freq.semiAnnual.short")}</option>
                        <option value="annual">{t("gift.freq.annual.short")}</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">{t("gift.start")}</p>
                      <Input type="number" value={row.startYear} onChange={(e) => updateGiftRow(i, "startYear", parseInt(e.target.value) || 2026)} className="text-sm font-mono-num" min={2000} max={2100} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">{t("gift.end")}</p>
                      <Input type="number" value={row.endYear} onChange={(e) => updateGiftRow(i, "endYear", parseInt(e.target.value) || 2036)} className="text-sm font-mono-num" min={2000} max={2100} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{t("gift.yearly.label")} <strong className="text-primary">{row.yearly >= 10000 ? `${(row.yearly / 10000).toFixed(1)}${t("common.eokWon")}` : `${row.yearly.toLocaleString()}${t("common.manWon")}`}</strong></span>
                    <span className={`text-xs font-bold ${row.overLimit ? "text-destructive" : "text-gold"}`}>
                      {t("gift.total.prefix")} {row.total >= 10000 ? `${(row.total / 10000).toFixed(1)}${t("common.eokWon")}` : `${row.total.toLocaleString()}${t("common.manWon")}`}
                      {row.overLimit && <AlertTriangle className="inline ml-1 h-3 w-3" />}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* 추가 버튼 + 합계 */}
            <div className="flex flex-col gap-3 sm:flex-row items-center justify-between px-4 py-4 bg-accent/30">
              <button
                onClick={addGiftRow}
                disabled={giftPlan.length >= 20}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" /> {t("gift.addPlan")}
              </button>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t("gift.grandTotal")}</p>
                <p className="text-lg font-bold text-foreground">
                  {(() => {
                    const total = giftPlanSummary.reduce((sum, row) => sum + row.total, 0);
                    return total >= 10000 ? `${(total / 10000).toFixed(1)}${t("common.eokWon")}` : `${total.toLocaleString()}${t("common.manWon")}`;
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* 증여세 참고 안내 */}
          <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4">
            <p className="text-xs text-warning font-semibold mb-1">{t("gift.taxNote.title")}</p>
            <p className="text-xs text-foreground/60">
              {t("gift.taxNote.desc")}
            </p>
          </div>
        </motion.div>
        </div> {/* end mt-16 */}
      </div>

      {/* 사용설명서 다이얼로그 */}
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{t("will.guide.title")}</DialogTitle>
            <DialogDescription className="sr-only">{t("will.guide.title")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* 원클릭 유언장 가이드 */}
            <div className="rounded-xl border border-border bg-accent/30 p-5">
              <h3 className="mb-3 text-base font-bold text-foreground">{t("will.guide.oneclick.title").replace(/^🚀\s*/, "")}</h3>
              <div className="space-y-2 text-sm text-foreground/80">
                <p>{t("will.guide.oneclick.step1")}</p>
                <p>{t("will.guide.oneclick.step2")}</p>
                <p>{t("will.guide.oneclick.step3")}</p>
                <p>{t("will.guide.oneclick.step4")}</p>
                <p>{t("will.guide.oneclick.step5")}</p>
              </div>
            </div>

            {/* 맞춤형 유언장 가이드 */}
            <div className="rounded-xl border border-border bg-accent/30 p-5">
              <h3 className="mb-3 text-base font-bold text-foreground">{t("will.guide.custom.title")}</h3>
              <div className="space-y-2 text-sm text-foreground/80">
                <p>{t("will.guide.custom.step1")}</p>
                <p>{t("will.guide.custom.step2")}</p>
                <p>{t("will.guide.custom.step3")}</p>
                <p>{t("will.guide.custom.step4")}</p>
                <p>{t("will.guide.custom.step5")}</p>
                <p>{t("will.guide.custom.step6")}</p>
                <p>{t("will.guide.custom.step7")}</p>
              </div>
            </div>

            {/* 안내 문구 */}
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <p className="text-xs text-warning font-medium">{t("will.guide.notice")}</p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setGuideOpen(false)} variant="default" size="sm">
                {t("will.guide.close")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default WillPreview;
