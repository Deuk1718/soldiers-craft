import { useState, useRef, useCallback } from "react";
import { FileText, Download, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useLanguage } from "@/contexts/LanguageContext";

type CertType = "divorce" | "custody" | "asset";

const CertificateGenerator = () => {
  const { t } = useLanguage();
  const [certType, setCertType] = useState<CertType>("divorce");
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [message, setMessage] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const certRef = useRef<HTMLDivElement>(null);

  const certConfig: Record<CertType, { title: string; subtitle: string; accent: string; border: string; bg: string; icon: string }> = {
    divorce: {
      title: "이 혼 합 의 서",
      subtitle: "Divorce Agreement",
      accent: "text-primary",
      border: "border-primary/20",
      bg: "bg-gradient-to-br from-secondary via-background to-accent/30",
      icon: "⚖️",
    },
    custody: {
      title: "양 육 권 합 의 서",
      subtitle: "Custody Agreement",
      accent: "text-primary",
      border: "border-primary/20",
      bg: "bg-gradient-to-br from-accent/30 via-background to-secondary",
      icon: "👨‍👧‍👦",
    },
    asset: {
      title: "재 산 분 할 합 의 서",
      subtitle: "Asset Division Agreement",
      accent: "text-primary",
      border: "border-primary/20",
      bg: "bg-gradient-to-br from-secondary via-background to-accent/40",
      icon: "📋",
    },
  };

  const cfg = certConfig[certType];
  const formattedDate = date ? new Date(date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : "____년 __월 __일";

  const defaultMessages: Record<CertType, string> = {
    divorce: "쌍방은 협의에 의하여 이혼할 것을 합의하며, 본 합의서에 기재된 조건을 성실히 이행할 것을 약정합니다.",
    custody: "미성년 자녀의 양육에 관하여 쌍방이 협의한 내용을 아래와 같이 확인하며, 자녀의 복리를 최우선으로 합니다.",
    asset: "혼인 중 형성한 공동 재산에 대하여 쌍방의 협의에 따라 아래와 같이 분할할 것을 합의합니다.",
  };

  const handleDownloadPDF = useCallback(async () => {
    const el = certRef.current;
    if (!el) return;

    try {
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 5;
      const usableW = pdfW - margin * 2;
      const usableH = pdfH - margin * 2;
      const imgRatio = canvas.width / canvas.height;
      const pageRatio = usableW / usableH;
      let w: number, h: number;
      if (imgRatio > pageRatio) {
        w = usableW;
        h = usableW / imgRatio;
      } else {
        h = usableH;
        w = usableH * imgRatio;
      }
      const x = margin + (usableW - w) / 2;
      const y = margin + (usableH - h) / 2;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, w, h);
      const typeLabel = certType === "divorce" ? "이혼합의서" : certType === "custody" ? "양육권합의서" : "재산분할합의서";
      pdf.save(`${typeLabel}_${name1 || "미입력"}_${name2 || "미입력"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  }, [certType, name1, name2]);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      <div className="border-b border-border bg-accent/60 px-6 py-4">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-card-foreground">합의서 작성</h3>
          <span className="text-xs text-muted-foreground">원클릭 PDF 출력</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Certificate type selector */}
        <Tabs value={certType} onValueChange={(v) => setCertType(v as CertType)}>
          <TabsList className="w-full">
            <TabsTrigger value="divorce" className="flex-1 gap-1">⚖️ 이혼합의서</TabsTrigger>
            <TabsTrigger value="custody" className="flex-1 gap-1">👨‍👧‍👦 양육권합의서</TabsTrigger>
            <TabsTrigger value="asset" className="flex-1 gap-1">📋 재산분할합의서</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Input fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">당사자 1 (갑)</p>
            <Input value={name1} onChange={(e) => setName1(e.target.value)} placeholder="홍길동" maxLength={50} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">당사자 2 (을)</p>
            <Input value={name2} onChange={(e) => setName2(e.target.value)} placeholder="김영희" maxLength={50} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">합의 일자</p>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">사건번호 (선택)</p>
            <Input value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} placeholder="2026드합12345" maxLength={30} />
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">합의 내용 (선택)</p>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={defaultMessages[certType]}
            maxLength={300}
          />
        </div>

        {/* Certificate Preview */}
        <div ref={certRef} className={`relative rounded-xl ${cfg.bg} p-10 sm:p-14 ${cfg.border} border-2 overflow-hidden`}>
          {/* Outer ornamental border */}
          <div className="absolute inset-3 border border-primary/15 rounded-lg pointer-events-none" />
          <div className="absolute inset-5 border border-primary/10 rounded-lg pointer-events-none" style={{ borderStyle: 'double', borderWidth: '3px' }} />

          {/* Corner accents */}
          <div className="absolute top-4 left-4 text-primary/30 text-2xl pointer-events-none select-none">◇</div>
          <div className="absolute top-4 right-4 text-primary/30 text-2xl pointer-events-none select-none">◇</div>
          <div className="absolute bottom-4 left-4 text-primary/30 text-2xl pointer-events-none select-none">◇</div>
          <div className="absolute bottom-4 right-4 text-primary/30 text-2xl pointer-events-none select-none">◇</div>

          {/* Top/bottom decorative line */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-primary/25 text-xs pointer-events-none select-none tracking-[0.5em]">
            ─ ◆ ─ ◆ ─ ◆ ─
          </div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-primary/25 text-xs pointer-events-none select-none tracking-[0.5em]">
            ─ ◆ ─ ◆ ─ ◆ ─
          </div>

          <div className="relative text-center space-y-4 z-10">
            <div className="flex items-center justify-center gap-2 text-primary/30">
              <span className="text-sm">◆ ─── ◇ ─── ◆</span>
            </div>

            <p className="text-3xl">{cfg.icon}</p>
            <h4 className={`text-2xl sm:text-3xl font-bold tracking-[0.3em] ${cfg.accent}`}>
              {cfg.title}
            </h4>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">{cfg.subtitle}</p>

            {caseNumber && (
              <p className="text-xs text-muted-foreground">사건번호: {caseNumber}</p>
            )}

            <div className="flex items-center justify-center gap-2">
              <span className="inline-block h-px w-12 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-primary/30 text-xs">◆</span>
              <span className="inline-block h-px w-8 bg-primary/30" />
              <span className="text-primary/30 text-xs">◆</span>
              <span className="inline-block h-px w-12 bg-gradient-to-l from-transparent to-primary/30" />
            </div>

            <div className="space-y-3 py-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-primary/20 text-sm">◇</span>
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">갑 (甲)</span>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{name1 || "○○○"}</p>
                </div>
                <span className={`text-2xl ${cfg.accent}`}>⚖</span>
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">을 (乙)</span>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{name2 || "○○○"}</p>
                </div>
                <span className="text-primary/20 text-sm">◇</span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto px-4">
                {message || defaultMessages[certType]}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="inline-block h-px w-12 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-primary/30 text-xs">◇</span>
              <span className="inline-block h-px w-8 bg-primary/30" />
              <span className="text-primary/30 text-xs">◇</span>
              <span className="inline-block h-px w-12 bg-gradient-to-l from-transparent to-primary/30" />
            </div>

            <p className="text-sm text-muted-foreground">{formattedDate}</p>

            <div className="pt-4 space-y-2">
              <p className="text-xs text-muted-foreground">위 내용에 쌍방이 합의하였음을 확인합니다.</p>
              <div className="flex justify-center gap-12 pt-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">갑 (甲)</p>
                  <p className="text-sm text-foreground font-medium">{name1 || "___________"}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">(서명 또는 날인)</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">을 (乙)</p>
                  <p className="text-sm text-foreground font-medium">{name2 || "___________"}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">(서명 또는 날인)</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-primary/25 pt-2">
              <span className="text-sm">◆ ─── ◇ ─── ◆</span>
            </div>
            <p className="text-[10px] text-muted-foreground/50">Divorce Agreement Document</p>
          </div>
        </div>

        {/* Download button */}
        <Button
          variant="warmBrown"
          size="lg"
          className="w-full gap-2"
          onClick={handleDownloadPDF}
        >
          <Download className="h-4 w-4" />
          {cfg.title.replace(/ /g, "")} PDF 다운로드
        </Button>
      </div>
    </div>
  );
};

export default CertificateGenerator;
