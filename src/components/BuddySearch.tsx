import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Phone, Mail, Shield, CreditCard, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MatchSuccessAnimation from "./MatchSuccessAnimation";

interface WaitingUser {
  id: string;
  name: string;
  unit: string;
  service_year: string;
  phone: string;
  email: string | null;
  is_matched: boolean;
  created_at: string;
  match_fee_type: string;
  match_fee: number;
}

const BuddySearch = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<WaitingUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Wait & Notify form
  const [waitName, setWaitName] = useState("");
  const [waitUnit, setWaitUnit] = useState("");
  const [waitYear, setWaitYear] = useState("");
  const [waitPhone, setWaitPhone] = useState("");
  const [waitEmail, setWaitEmail] = useState("");
  const [waitConsent, setWaitConsent] = useState(false);
  const [waitFeeType, setWaitFeeType] = useState<"free" | "paid">("free");
  const [waitFeeAmount, setWaitFeeAmount] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Matching flow
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [matchStep, setMatchStep] = useState(1);
  const [selectedBuddy, setSelectedBuddy] = useState<WaitingUser | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  // Search from database
  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearched(true);
    setRegistered(false);
    setSearchLoading(true);

    const q = query.toLowerCase().replace(/\s+/g, " ").trim();
    const words = q.split(" ").filter(Boolean);

    // Fetch all non-matched waiting users
    const { data, error } = await supabase
      .from("buddy_waiting_users")
      .select("*")
      .eq("is_matched", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: t("buddy.searchError"), description: error.message, variant: "destructive" });
      setSearchLoading(false);
      return;
    }

    // Client-side filter by query words
    const filtered = (data || []).filter((b: any) => {
      const combined = `${b.name} ${b.unit} ${b.service_year}`.toLowerCase();
      return words.some((w) => combined.includes(w));
    });

    setResults(filtered as WaitingUser[]);
    setSearchLoading(false);
  };

  const handleConnect = (buddy: WaitingUser) => {
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

  const handleRegisterWait = async () => {
    if (!waitName || !waitUnit || !waitYear || !waitPhone || !waitConsent) return;
    setRegistering(true);

    const { error } = await supabase.from("buddy_waiting_users").insert({
      name: waitName,
      unit: waitUnit,
      service_year: waitYear,
      phone: waitPhone,
      email: waitEmail || null,
      match_fee_type: waitFeeType,
      match_fee: waitFeeType === "paid" ? parseInt(waitFeeAmount) || 0 : 0,
    } as any);

    if (error) {
      toast({ title: "등록 실패", description: error.message, variant: "destructive" });
    } else {
      setRegistered(true);
      toast({ title: "등록 완료", description: "동기가 등록되면 연락드리겠습니다." });
    }

    setWaitName("");
    setWaitUnit("");
    setWaitYear("");
    setWaitPhone("");
    setWaitEmail("");
    setWaitConsent(false);
    setWaitFeeType("free");
    setWaitFeeAmount("");
    setRegistering(false);
  };

  const canProceedStep1 = privacyConsent && userPhone.length >= 10;

  return (
    <section className="bg-accent/30 py-20" id="buddy">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("buddy.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("buddy.hint")}
          </p>
        </motion.div>

        {/* Single Search Input */}
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
                placeholder={t("buddy.searchPlaceholderLong")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-12 pl-10 text-base"
              />
            </div>
            <Button variant="warmBrown" onClick={handleSearch} className="h-12 shrink-0 px-6" disabled={searchLoading}>
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
                {t("buddy.results")} <span className="font-semibold text-foreground">{results.length}{t("buddy.resultUnit")}</span>
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
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            {r.service_year}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{r.name}</p>
                          <Badge variant="outline" className={`text-xs ${r.match_fee_type === "paid" ? "border-primary/30 bg-primary/10 text-primary" : "border-muted"}`}>
                            {r.match_fee_type === "paid" ? `₩${(r.match_fee || 0).toLocaleString()}` : t("buddy.free")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="warmBrown" size="sm" onClick={() => handleConnect(r)}>
                      {t("buddy.connect")}
                    </Button>
                  </motion.div>
                ))
              ) : (
                /* No Match → Registration */
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-8"
                >
                  <div className="text-center mb-6">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <h3 className="mt-3 text-lg font-semibold text-foreground">{t("buddy.noMatch.title")}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("buddy.noMatch.desc")}
                    </p>
                  </div>

                  {registered ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                      <p className="mt-3 text-lg font-semibold text-foreground">{t("buddy.registered")}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("buddy.registered.desc")}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3 max-w-md mx-auto">
                      <Input placeholder={t("buddy.form.name")} value={waitName} onChange={(e) => setWaitName(e.target.value)} />
                      <Input placeholder={t("buddy.form.unit")} value={waitUnit} onChange={(e) => setWaitUnit(e.target.value)} />
                      <Input placeholder={t("buddy.form.year")} value={waitYear} onChange={(e) => setWaitYear(e.target.value)} />
                      <Input placeholder={t("buddy.form.phone")} type="tel" value={waitPhone} onChange={(e) => setWaitPhone(e.target.value)} />
                      <Input placeholder={t("buddy.form.email")} type="email" value={waitEmail} onChange={(e) => setWaitEmail(e.target.value)} />

                      {/* Fee type selection */}
                      <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                        <p className="text-sm font-semibold text-foreground">{t("buddy.form.feeTitle")}</p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => { setWaitFeeType("free"); setWaitFeeAmount(""); }}
                            className={`flex-1 rounded-lg border-2 p-3 text-center text-sm font-medium transition-all ${
                              waitFeeType === "free"
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {t("buddy.form.free")}
                            <p className="text-xs mt-1 font-normal">{t("buddy.form.freeDesc")}</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setWaitFeeType("paid")}
                            className={`flex-1 rounded-lg border-2 p-3 text-center text-sm font-medium transition-all ${
                              waitFeeType === "paid"
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {t("buddy.form.paid")}
                            <p className="text-xs mt-1 font-normal">{t("buddy.form.paidDesc")}</p>
                          </button>
                        </div>
                        {waitFeeType === "paid" && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">₩</span>
                            <Input
                              type="number"
                              placeholder={t("buddy.form.amount")}
                              value={waitFeeAmount}
                              onChange={(e) => setWaitFeeAmount(e.target.value)}
                              min="0"
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground">{t("buddy.form.won")}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                        <Checkbox
                          id="wait-consent"
                          checked={waitConsent}
                          onCheckedChange={(v) => setWaitConsent(v === true)}
                          className="mt-0.5"
                        />
                        <label htmlFor="wait-consent" className="text-sm leading-relaxed text-foreground cursor-pointer">
                          <span className="font-semibold text-primary">{t("buddy.form.required")}</span> {t("buddy.form.consent")}
                        </label>
                      </div>

                      <Button
                        variant="warmBrown"
                        className="h-11 w-full"
                        disabled={!waitName || !waitUnit || !waitYear || !waitPhone || !waitConsent || registering}
                        onClick={handleRegisterWait}
                      >
                        {registering ? t("buddy.form.registering") : t("buddy.form.register")}
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Initial state — feature hints */
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-border bg-card p-8 text-center shadow-card"
            >
              <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">
                {t("buddy.hint")}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[t("buddy.example1"), t("buddy.example2"), t("buddy.example3"), t("buddy.example4"), t("buddy.example5")].map((ex) => (
                  <button
                    key={ex}
                    className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    onClick={() => {
                      setQuery(ex);
                      setSearched(false);
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Multi-step Matching Dialog */}
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
                      <p className="text-sm font-medium text-foreground">
                        매칭 대상: {selectedBuddy.unit} {selectedBuddy.service_year} 전우
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                    <Checkbox id="privacy" checked={privacyConsent} onCheckedChange={(v) => setPrivacyConsent(v === true)} className="mt-0.5" />
                    <label htmlFor="privacy" className="text-sm leading-relaxed text-foreground cursor-pointer">
                      <span className="font-semibold text-primary">[필수]</span> 개인정보 수집 및 제공 동의
                    </label>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <Phone className="mr-1 inline h-3.5 w-3.5" />전화번호
                    </label>
                    <Input type="tel" placeholder="010-0000-0000" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <Mail className="mr-1 inline h-3.5 w-3.5" />이메일 주소 (선택사항)
                    </label>
                    <Input type="email" placeholder="email@example.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                  </div>
                  <Button variant="warmBrown" className="h-11 w-full" disabled={!canProceedStep1} onClick={() => setMatchStep(2)}>
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
                    <p className="text-3xl font-bold text-foreground">
                      {selectedBuddy?.match_fee_type === "free" || !selectedBuddy?.match_fee
                        ? "무료"
                        : `₩${(selectedBuddy?.match_fee ?? 0).toLocaleString()}`}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedBuddy?.match_fee_type === "free" ? "무료 연결" : "장난전화 방지 인증 비용"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium text-foreground">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />신용카드
                    </div>
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium text-foreground">
                      <Shield className="h-4 w-4 text-muted-foreground" />간편결제
                    </div>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground leading-relaxed">
                    <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-primary" />
                    결제 완료 시 매칭된 전우의 연락처가 즉시 공개됩니다.
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="h-11 flex-1" onClick={() => setMatchStep(1)}>이전</Button>
                    <Button variant="warmBrown" className="h-11 flex-1" onClick={handlePayAndMatch}>결제 및 매칭 완료</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Match Success Animation */}
      {selectedBuddy && (
        <MatchSuccessAnimation
          open={showMatchAnimation}
          onClose={() => setShowMatchAnimation(false)}
          userA={{ name: "나", unit: "내 부대", period: "내 복무기간" }}
          userB={{ name: selectedBuddy.name, unit: selectedBuddy.unit, period: selectedBuddy.service_year }}
          contactInfo={{ phone: selectedBuddy.phone, email: selectedBuddy.email || "" }}
        />
      )}
    </section>
  );
};

export default BuddySearch;
