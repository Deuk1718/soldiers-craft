import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, MessageSquare, CheckCircle2, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Expert {
  name: string;
  expertise: string;
  [key: string]: any;
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expert: Expert;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00",
];

type Step = "form" | "confirm" | "success";

const BookingModal = ({ open, onOpenChange, expert }: BookingModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [memo, setMemo] = useState("");
  const [agreed, setAgreed] = useState(false);

  const resetForm = () => {
    setStep("form");
    setDate(undefined);
    setTime(undefined);
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

  const canProceed = date && time && name.trim() && phone.trim() && agreed;

  const handleConfirm = async () => {
    if (!date || !time) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-consultation", {
        body: {
          client_name: name.trim(),
          client_phone: phone.trim(),
          client_email: email.trim() || null,
          expert_name: expert.name,
          expert_expertise: expert.expertise,
          consultation_date: format(date, "yyyy-MM-dd"),
          consultation_time: time,
          memo: memo.trim() || null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStep("success");
    } catch (err) {
      toast({
        title: t("booking.fail"),
        description: t("consult.retry"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader>
                <DialogTitle className="text-xl">{t("booking.title")}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">{expert.name}</span> {t("booking.expert")} · {expert.expertise}
                </p>
              </DialogHeader>

              <div className="mt-6 space-y-5">
                {/* Date picker */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t("booking.date")} *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "yyyy-MM-dd (EEE)", { locale: ko }) : t("booking.date.placeholder")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date() || d.getDay() === 0 || d.getDay() === 6}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time slots */}
                {date && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <Clock className="mr-1 inline h-4 w-4" /> {t("booking.time")} *
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setTime(slot)}
                          className={cn(
                            "rounded-lg py-2 text-xs font-medium transition-colors font-mono-num",
                            time === slot
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-accent"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Client info */}
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <User className="mr-1 inline h-4 w-4" /> {t("booking.name")} *
                    </label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("will.name.placeholder")} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <Phone className="mr-1 inline h-4 w-4" /> {t("booking.phone")} *
                    </label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <Mail className="mr-1 inline h-4 w-4" /> {t("booking.email")}
                    </label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" type="email" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <MessageSquare className="mr-1 inline h-4 w-4" /> {t("booking.memo")}
                    </label>
                    <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder={t("booking.memo.placeholder")} rows={3} />
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
                </div>

                <Button
                  variant="warmBrown"
                  onClick={() => setStep("confirm")}
                  disabled={!canProceed}
                  className="w-full rounded-xl py-3"
                  size="lg"
                >
                  {t("booking.next")}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <DialogHeader>
                <DialogTitle className="text-xl">{t("booking.confirm.title")}</DialogTitle>
                <p className="text-sm text-muted-foreground">{t("booking.confirm.subtitle")}</p>
              </DialogHeader>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl bg-secondary p-5 space-y-3">
                  <Row label={t("booking.expert")} value={`${expert.name} (${expert.expertise})`} />
                  <Row label={t("booking.date")} value={date ? format(date, "yyyy-MM-dd (EEE)", { locale: ko }) : ""} />
                  <Row label={t("booking.time")} value={time || ""} mono />
                  <div className="my-2 h-px bg-border" />
                  <Row label={t("booking.name")} value={name} />
                  <Row label={t("booking.phone")} value={phone} />
                  {email && <Row label={t("booking.email")} value={email} />}
                  {memo && <Row label={t("booking.memo")} value={memo} />}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep("form")} className="flex-1 rounded-xl" size="lg">
                    {t("booking.edit")}
                  </Button>
                  <Button variant="warmBrown" onClick={handleConfirm} disabled={loading} className="flex-1 rounded-xl" size="lg">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {t("booking.complete")}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-foreground">{t("booking.success.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                {t("booking.success.desc", { expert: expert.name, date: dateStr, time: time || "" })}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                {t("booking.success.note")}
              </p>
              <Button variant="warmBrown" onClick={handleClose} className="mt-6 rounded-xl px-8" size="lg">
                {t("booking.confirm.btn")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
    <span className={cn("text-right text-sm font-medium text-foreground", mono && "font-mono-num")}>{value}</span>
  </div>
);

export default BookingModal;
