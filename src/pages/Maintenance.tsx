import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const Maintenance = () => {
  const navigate = useNavigate();
  const clickCount = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = useCallback(() => {
    clickCount.current += 1;
    if (timer.current) clearTimeout(timer.current);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      navigate("/admin");
      return;
    }
    timer.current = setTimeout(() => { clickCount.current = 0; }, 2000);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-lg text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 cursor-default items-center justify-center rounded-2xl bg-primary/10 select-none"
          onClick={handleLogoClick}
        >
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-3 font-serif-legal text-2xl font-bold text-foreground sm:text-3xl">
          이혼 가이드
        </h1>
        <p className="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
          현재 서비스 점검 및 업데이트를 진행 중입니다.
          <br />
          빠른 시일 내에 정상 서비스를 제공하겠습니다.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-5 py-2.5 text-sm text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />
          업데이트 진행 중
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
