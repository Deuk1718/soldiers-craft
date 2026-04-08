import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Mail, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface FreeConsultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "form" | "success";

const FreeConsultModal = ({ open, onOpenChange }: FreeConsultModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [memo, setMemo] = useState("");
  const [agreed, setAgreed] = useState(false);

  const resetForm = () => {
    setStep("form");
    setName("");
    setPhone("");
    setEmail("");
    setMemo("");
    setAgreed(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300);
  };

  const canSubmit = name.trim() && phone.trim() && agreed;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-consultation", {
        body: {
          client_name: name.trim(),
          client_phone: phone.trim(),
          client_email: email.trim() || null,
          expert_name: "미배정",
          expert_expertise: "무료 초기 상담",
          consultation_date: format(new Date(), "yyyy-MM-dd"),
          consultation_time: "협의 예정",
          memo: memo.trim() || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStep("success");
    } catch {
      toast({ title: t("consult.fail"), description: t("consult.retry"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader>
                <DialogTitle className="text-xl">{t("consult.title")}</DialogTitle>
                <p className="text-sm text-muted-foreground">{t("consult.subtitle")}</p>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    <User className="mr-1 inline h-4 w-4" /> {t("consult.name")} *
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    <Phone className="mr-1 inline h-4 w-4" /> {t("consult.phone")} *
                  </label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    <Mail className="mr-1 inline h-4 w-4" /> {t("consult.email")}
                  </label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" type="email" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    <MessageSquare className="mr-1 inline h-4 w-4" /> {t("consult.memo")}
                  </label>
                  <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder={t("consult.memo.placeholder")} rows={3} />
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {t("consult.agree")}
                  </span>
                </label>

                <Button variant="warmBrown" onClick={handleSubmit} disabled={!canSubmit || loading} className="w-full rounded-xl" size="lg">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t("consult.submit")}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-foreground">{t("consult.success.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("consult.success.desc")}</p>
              <Button variant="warmBrown" onClick={handleClose} className="mt-6 rounded-xl px-8" size="lg">
                {t("consult.confirm")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default FreeConsultModal;
