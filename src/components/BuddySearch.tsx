import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, MapPin, Calendar, CreditCard, Shield, CheckCircle2, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import MatchSuccessAnimation from "./MatchSuccessAnimation";

// ── Mock Data ──
interface MockBuddy {
  id: string;
  name: string;
  unit: string;
  classYear: string;
  periodStart: string;
  periodEnd: string;
  phone: string;
  email: string;
}

const MOCK_BUDDIES: MockBuddy[] = [
  { id: "1", name: "김OO", unit: "3사단 22대대", classYear: "24-71기", periodStart: "2023.01", periodEnd: "2024.09", phone: "010-1234-5678", email: "kim@mail.com" },
  { id: "2", name: "이OO", unit: "백골부대 수색중대", classYear: "24-71기", periodStart: "2023.01", periodEnd: "2024.09", phone: "010-2345-6789", email: "lee@mail.com" },
  { id: "3", name: "박OO", unit: "3사단 1대대", classYear: "23-65기", periodStart: "2022.06", periodEnd: "2024.03", phone: "010-3456-7890", email: "park@mail.com" },
  { id: "4", name: "최OO", unit: "1사단 본부중대", classYear: "24-71기", periodStart: "2023.03", periodEnd: "2024.12", phone: "010-4567-8901", email: "choi@mail.com" },
  { id: "5", name: "정OO", unit: "백골부대 3중대", classYear: "23-65기", periodStart: "2022.06", periodEnd: "2024.03", phone: "010-5678-9012", email: "jung@mail.com" },
  { id: "6", name: "한OO", unit: "7사단 수색대대", classYear: "24-73기", periodStart: "2023.06", periodEnd: "2025.03", phone: "010-6789-0123", email: "han@mail.com" },
  { id: "7", name: "윤OO", unit: "3사단 22대대", classYear: "23-65기", periodStart: "2022.03", periodEnd: "2023.12", phone: "010-7890-1234", email: "yoon@mail.com" },
  { id: "8", name: "조OO", unit: "1사단 포병대대", classYear: "24-71기", periodStart: "2023.01", periodEnd: "2024.09", phone: "010-8901-2345", email: "jo@mail.com" },
];

const BuddySearch = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("class");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<MockBuddy[]>([]);

  // Matching flow state
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [matchStep, setMatchStep] = useState(1);
  const [selectedBuddy, setSelectedBuddy] = useState<MockBuddy | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearched(true);
    const q = query.toLowerCase();
    let filtered: MockBuddy[] = [];

    if (searchMode === "class") {
      filtered = MOCK_BUDDIES.filter(b => b.classYear.toLowerCase().includes(q));
    } else if (searchMode === "unit") {
      filtered = MOCK_BUDDIES.filter(b => b.unit.toLowerCase().includes(q));
    } else {
      // period matching – find overlapping service periods
      filtered = MOCK_BUDDIES.filter(b =>
        b.periodStart.includes(q) || b.periodEnd.includes(q) || b.unit.toLowerCase().includes(q)
      );
    }
    setResults(filtered);
  };

  const handleConnect = (buddy: MockBuddy) => {
    setSelectedBuddy(buddy);
    setMatchStep(1);
    setPrivacyConsent(false);
    setUserPhone("");
    setUserEmail("");
    setMatchDialogOpen(true);
  };

  const handlePayAndMatch = () => {
    setMatchDialogOpen(false);
    setShowMatchAnimation(true);
  };

  const canProceedStep1 = privacyConsent && userPhone.length >= 10 && userEmail.includes("@");

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

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <Tabs value={searchMode} onValueChange={setSearchMode}>
            <TabsList className="mb-4 h-11 w-full justify-start rounded-xl bg-secondary/60 p-1">
              <TabsTrigger value="class" className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Users className="h-4 w-4" />{t("buddy.feature1.title")}
              </TabsTrigger>
              <TabsTrigger value="unit" className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MapPin className="h-4 w-4" />{t("buddy.feature2.title")}
              </TabsTrigger>
              <TabsTrigger value="period" className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Calendar className="h-4 w-4" />{t("buddy.feature3.title")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="class">
              <p className="mb-3 text-sm text-muted-foreground">{t("buddy.feature1.desc")}</p>
            </TabsContent>
            <TabsContent value="unit">
              <p className="mb-3 text-sm text-muted-foreground">{t("buddy.feature2.desc")}</p>
            </TabsContent>
            <TabsContent value="period">
              <p className="mb-3 text-sm text-muted-foreground">{t("buddy.feature3.desc")}</p>
            </TabsContent>
          </Tabs>
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
                placeholder={
                  searchMode === "class" ? "기수를 입력하세요 (예: 24-71)" :
                  searchMode === "unit" ? "부대명을 입력하세요 (예: 3사단)" :
                  "복무 시작 시기를 입력하세요 (예: 2023)"
                }
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
        <AnimatePresence mode="wait">
          {searched ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                검색 결과: <span className="font-semibold text-foreground">{results.length}명</span>
              </p>
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
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-card-foreground">{r.unit}</p>
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">{r.classYear}</Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{r.periodStart} ~ {r.periodEnd}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.name}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="warmBrown" size="sm" onClick={() => handleConnect(r)}>
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
          ) : (
            <motion.div
              key="features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {[
                { icon: Users, titleKey: "buddy.feature1.title", descKey: "buddy.feature1.desc", hint: "예: 24-71기" },
                { icon: MapPin, titleKey: "buddy.feature2.title", descKey: "buddy.feature2.desc", hint: "예: 3사단, 백골부대" },
                { icon: Calendar, titleKey: "buddy.feature3.title", descKey: "buddy.feature3.desc", hint: "예: 2023.01" },
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
                  <p className="mt-2 rounded-lg bg-secondary/50 px-2 py-1 text-xs text-muted-foreground">{f.hint}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Multi-step Matching Dialog ── */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <AnimatePresence mode="wait">
            {matchStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    개인정보 동의 및 연락처 입력
                  </DialogTitle>
                  <DialogDescription>
                    안전한 매칭을 위해 개인정보 수집에 동의하고 연락처를 입력해 주세요.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  {selectedBuddy && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <p className="text-sm font-medium text-foreground">매칭 대상: {selectedBuddy.unit} {selectedBuddy.classYear} 전우</p>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                    <Checkbox
                      id="privacy"
                      checked={privacyConsent}
                      onCheckedChange={(v) => setPrivacyConsent(v === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="privacy" className="text-sm leading-relaxed text-foreground cursor-pointer">
                      <span className="font-semibold text-primary">[필수]</span> 개인정보 수집 및 제공 동의 — 매칭 서비스 제공을 위해 연락처 정보를 수집하고 매칭된 전우에게 제공하는 것에 동의합니다.
                    </label>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <Phone className="mr-1 inline h-3.5 w-3.5" />전화번호
                    </label>
                    <Input
                      type="tel"
                      placeholder="010-0000-0000"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <Mail className="mr-1 inline h-3.5 w-3.5" />이메일 주소
                    </label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>

                  <Button
                    variant="warmBrown"
                    className="h-11 w-full"
                    disabled={!canProceedStep1}
                    onClick={() => setMatchStep(2)}
                  >
                    다음 단계로
                  </Button>
                </div>
              </motion.div>
            )}

            {matchStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    인증 비용 결제
                  </DialogTitle>
                  <DialogDescription>
                    안전하고 검증된 매칭을 위해 소액의 인증 비용이 필요합니다.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center">
                    <p className="text-3xl font-bold text-foreground">₩20,000</p>
                    <p className="mt-1 text-sm text-muted-foreground">인증 비용 (1회)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium text-foreground">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      신용카드
                    </div>
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium text-foreground">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      간편결제
                    </div>
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground leading-relaxed">
                    <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-primary" />
                    결제 완료 시 매칭된 전우의 연락처가 즉시 공개됩니다.
                    <br />
                    <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-primary" />
                    모든 결제 정보는 AES-256 암호화로 안전하게 처리됩니다.
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="h-11 flex-1" onClick={() => setMatchStep(1)}>
                      이전
                    </Button>
                    <Button variant="warmBrown" className="h-11 flex-1" onClick={handlePayAndMatch}>
                      결제 및 매칭 완료
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* ── Match Success Animation ── */}
      {selectedBuddy && (
        <MatchSuccessAnimation
          open={showMatchAnimation}
          onClose={() => setShowMatchAnimation(false)}
          userA={{ name: "나", unit: "내 부대", period: "내 복무기간" }}
          userB={{ name: selectedBuddy.name, unit: selectedBuddy.unit, period: `${selectedBuddy.periodStart} ~ ${selectedBuddy.periodEnd}` }}
          contactInfo={{ phone: selectedBuddy.phone, email: selectedBuddy.email }}
        />
      )}
    </section>
  );
};

export default BuddySearch;
