import { lazy, Suspense, useEffect, useState } from "react";

const MouseGhostTrail = lazy(() => import("./MouseGhostTrail"));

/**
 * Defer the trail mount until the browser is idle, and skip it entirely on:
 *  - touch-only devices (no fine pointer)
 *  - users that prefer reduced motion
 *  - devices with low memory or low CPU concurrency
 */
const MouseGhostTrailLoader = () => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
    const lowMemory = (nav.deviceMemory ?? 8) < 4;
    const lowCpu = (nav.hardwareConcurrency ?? 8) < 4;

    if (!finePointer || reducedMotion || lowMemory || lowCpu) return;

    const ric =
      (window as any).requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 800));
    const handle = ric(() => setShouldRender(true));

    return () => {
      const cancel =
        (window as any).cancelIdleCallback ??
        ((id: number) => clearTimeout(id));
      cancel(handle);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <Suspense fallback={null}>
      <MouseGhostTrail />
    </Suspense>
  );
};

export default MouseGhostTrailLoader;
