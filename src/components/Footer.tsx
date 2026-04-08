import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface FooterProps {
  onConsultClick: () => void;
}

const Footer = ({ onConsultClick }: FooterProps) => {
  const { t } = useLanguage();

  const siteUrl = "https://willwise-future-guide.lovable.app";
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
    // PC / unsupported: clipboard fallback
    try {
      await navigator.clipboard.writeText(siteUrl);
      toast("🔗 링크가 복사되었습니다. 원하는 곳에 붙여넣기 해주세요.");
    } catch {
      toast("🔗 링크가 복사되었습니다. 원하는 곳에 붙여넣기 해주세요.");
    }
  };

  return (
    <footer className="bg-navy py-16 text-navy-foreground">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-gold" />
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
          <p className="mt-8 text-xs text-navy-foreground/30">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
