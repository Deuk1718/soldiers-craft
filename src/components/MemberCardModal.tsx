import React, { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Shield, SquareStack as SquaresSubtract } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useLanguage } from "@/contexts/LanguageContext";

interface MemberCardModalProps {
  open: boolean;
  onClose: () => void;
  enlistDate: string;
  dischargeDate: string;
  serviceDays: number;
  elapsedDays: number;
  progressPct: number;
  branchLabel: string;
}

const MemberCardModal = ({
  open,
  onClose,
  enlistDate,
  dischargeDate,
  serviceDays,
  elapsedDays,
  progressPct,
  branchLabel,
}: MemberCardModalProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [rank, setRank] = useState("병장");
  const [unit, setUnit] = useState("");

  // Reset fields every time modal opens
  React.useEffect(() => {
    if (open) {
      setName(t("mc.name.default"));
      setRank("병장");
      setUnit(t("mc.unit.default"));
    }
  }, [open, t]);
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const ranks = [
    "이병", "일병", "상병", "병장",
    "하사", "중사", "상사", "원사",
    "준위",
    "소위", "중위", "대위",
    "소령", "중령", "대령",
    "준장 ★", "소장 ★★", "중장 ★★★", "대장 ★★★★",
  ];

  const formatDate = (d: string) => {
    if (!d) return "____.__.__";
    const date = new Date(d);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  const captureCard = useCallback(async () => {
    const el = cardRef.current;
    if (!el) return null;
    return html2canvas(el, { scale: 3, useCORS: true, backgroundColor: null });
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      // Credit card size: 85.6mm x 53.98mm (ISO/IEC 7810 ID-1)
      const cardW = 85.6;
      const cardH = 53.98;
      const pdf = new jsPDF("l", "mm", [cardW, cardH]);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, cardW, cardH);
      pdf.save(`Soldiers_Craft_멤버증_${name || t("mc.noname")}.pdf`);
    } finally {
      setGenerating(false);
    }
  }, [captureCard, name]);

  const handleDownloadImage = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `Soldiers_Craft_멤버증_${name || t("mc.noname")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setGenerating(false);
    }
  }, [captureCard, name]);

  const handleShare = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "soldiers_craft_member.png", { type: "image/png" });
        const shareData = { title: "Soldiers Craft 멤버증", files: [file] };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      // Fallback: copy image to clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        alert(t("mc.clipboard"));
      } catch {
        // Final fallback: download
        handleDownloadImage();
      }
    } finally {
      setGenerating(false);
    }
  }, [captureCard, handleDownloadImage]);

  const cardNumber = `SC-${enlistDate.replace(/-/g, "").slice(2)}-${String(serviceDays).padStart(4, "0")}`;

  const qrData = useMemo(() => JSON.stringify({
    type: "SOLDIERS_CRAFT_MEMBER",
    card: cardNumber,
    name: name || t("mc.noname"),
    rank,
    branch: branchLabel,
    enlist: enlistDate,
    progress: progressPct.toFixed(1),
    issued: new Date().toISOString().split("T")[0],
  }), [cardNumber, name, rank, branchLabel, enlistDate, progressPct]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t("mc.title")}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t("mc.name")}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("mc.name.placeholder")}
                  maxLength={20}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t("mc.rank")}</label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {ranks.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("mc.unit")}</label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t("mc.unit.placeholder")}
                maxLength={30}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Card Preview */}
            <div ref={cardRef} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "1.6/1" }}>
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(80,20%,18%)] via-[hsl(85,25%,22%)] to-[hsl(80,15%,12%)]" />

              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-[0.06]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4c5a0' fill-opacity='1'%3E%3Cpath d='M20 18v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              {/* Gold border */}
              <div className="absolute inset-[3px] rounded-[10px] border border-[hsl(42,45%,52%)]/40" />
              <div className="absolute inset-[6px] rounded-[8px] border border-[hsl(42,45%,52%)]/20" />

              {/* Content */}
              <div className="relative z-10 p-4 sm:p-5 h-full flex flex-col justify-between opacity-95">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-[hsl(42,45%,52%)]" />
                      <span className="text-[hsl(42,45%,52%)] text-xs font-bold tracking-wider">SOLDIERS CRAFT</span>
                    </div>
                    <p className="text-[hsl(42,45%,52%)]/60 text-[9px] mt-0.5 tracking-widest">MEMBER CARD</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <SquaresSubtract className="h-3 w-3 text-[hsl(42,45%,52%)]" fill="hsl(42,45%,52%)" />
                    <SquaresSubtract className="h-3 w-3 text-[hsl(42,45%,52%)]" fill="hsl(42,45%,52%)" />
                    <SquaresSubtract className="h-3 w-3 text-[hsl(42,45%,52%)]" fill="hsl(42,45%,52%)" />
                  </div>
                </div>

                {/* Center info */}
                <div className="space-y-1">
                  <p className="text-xl tracking-wide text-gold font-serif text-left sm:text-xs font-light">
                    {name || t("mc.name.empty")}
                  </p>
                  <p className="text-[hsl(42,45%,52%)] font-medium text-base font-serif">{rank} · {branchLabel}</p>
                  {unit && <p className="text-white/60 text-base font-serif">{unit}</p>}
                </div>

                {/* Bottom row */}
                <div className="flex items-end justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3 text-[10px] text-white/50">
                      <span>{t("mc.enlist")} {formatDate(enlistDate)}</span>
                      <span>{t("mc.discharge")} {dischargeDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[hsl(85,30%,42%)] to-[hsl(42,45%,52%)]"
                          style={{ width: `${Math.min(progressPct, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[hsl(42,45%,52%)] font-mono">{progressPct.toFixed(1)}%</span>
                    </div>
                   </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="bg-white rounded p-0.5">
                      <QRCodeSVG
                        value={qrData}
                        size={36}
                        level="M"
                        bgColor="#ffffff"
                        fgColor="#1a1a1a"
                      />
                    </div>
                    <p className="text-[8px] text-white/30 font-mono">{cardNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="warmBrown"
                size="sm"
                className="gap-1.5"
                onClick={handleDownloadPDF}
                disabled={generating}
              >
                <Download className="h-3.5 w-3.5" />
                {t("mc.pdf")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleDownloadImage}
                disabled={generating}
              >
                <Download className="h-3.5 w-3.5" />
                {t("mc.image")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleShare}
                disabled={generating}
              >
                <Share2 className="h-3.5 w-3.5" />
                {t("mc.share")}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {t("mc.share.tip")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MemberCardModal;
