import { motion } from "framer-motion";
import { FileText, Calculator, Camera, Users, Heart, Handshake, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestConsult: () => void;
}

const SERVICE_KEYS = [
  { icon: FileText, titleKey: "services.s1.title", descKey: "services.s1.desc" },
  { icon: Calculator, titleKey: "services.s2.title", descKey: "services.s2.desc" },
  { icon: Camera, titleKey: "services.s3.title", descKey: "services.s3.desc" },
  { icon: Users, titleKey: "services.s4.title", descKey: "services.s4.desc" },
  { icon: Heart, titleKey: "services.s5.title", descKey: "services.s5.desc" },
  { icon: Handshake, titleKey: "services.s6.title", descKey: "services.s6.desc" },
];

const ServiceInfoModal = ({ open, onOpenChange, onRequestConsult }: ServiceInfoModalProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("serviceInfo.title")}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t("serviceInfo.subtitle")}
          </p>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {SERVICE_KEYS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-accent/30 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">{t(s.titleKey)}</h4>
              </div>
              <p className="mt-3 pl-12 text-xs leading-relaxed text-muted-foreground">
                {t(s.descKey)}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="warmBrown" size="lg" className="flex-1 rounded-xl" onClick={() => { onOpenChange(false); onRequestConsult(); }}>
            {t("serviceInfo.consult")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
            {t("serviceInfo.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceInfoModal;
