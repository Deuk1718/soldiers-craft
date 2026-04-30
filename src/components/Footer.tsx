import { Shield, Share2, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface FooterProps {
  onConsultClick: () => void;
}

const Footer = ({ onConsultClick }: FooterProps) => {
  const { t } = useLanguage();

  const siteUrl = "https://s-craft.lovable.app";
  const shareTitle = t("footer.share.title");
  const shareText = t("footer.share.text");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: siteUrl });
        return;
      } catch {
        // User cancelled — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(siteUrl);
      toast(t("footer.share.copied"));
    } catch {
      toast(t("footer.share.copied"));
    }
  };

  return (
    <footer className="bg-navy py-16 text-navy-foreground">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-gold" />
            <span className="font-serif-legal text-xl font-bold">{t("brand.name")}</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-navy-foreground/50">
            {t("footer.desc")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button variant="warmBrown" size="lg" className="px-8" onClick={onConsultClick}>
              {t("footer.cta")}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 rounded-xl border border-gold/40 bg-gold/10 px-6 text-gold hover:bg-gold/20 hover:text-gold"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              {t("footer.share")}
            </Button>
          </div>

          <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-navy-foreground/70">
            <Link to="/about" className="hover:text-gold">{t("footer.about")}</Link>
            <span className="text-navy-foreground/20">·</span>
            <Link to="/faq" className="hover:text-gold">{t("footer.faq")}</Link>
            <span className="text-navy-foreground/20">·</span>
            <Link to="/legal/terms" className="hover:text-gold">{t("footer.terms")}</Link>
            <span className="text-navy-foreground/20">·</span>
            <Link to="/legal/privacy" className="hover:text-gold">{t("footer.privacy")}</Link>
            <span className="text-navy-foreground/20">·</span>
            <Link to="/legal/disclaimer" className="hover:text-gold">{t("footer.disclaimer")}</Link>
          </nav>

          <p className="mt-6 max-w-2xl text-xs leading-relaxed text-navy-foreground/40">
            {t("footer.businessInfo")}: GJ Group · support@gjgroup.example
          </p>
          <p className="mt-2 text-xs text-navy-foreground/30">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

