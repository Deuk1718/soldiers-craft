import { useEffect, useRef, useCallback, useState } from "react";
import { PASTEL_PRESETS, getRandomPastel } from "./mouse-trail/pastelColors";
import ColorPalettePicker from "./mouse-trail/ColorPalettePicker";

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  color: [number, number, number];
}

const MouseGhostTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const idleTimerRef = useRef<number>(0);
  const idleIntervalRef = useRef<number>(0);
  const selectedColorRef = useRef<number>(-2);
  const pausedRef = useRef(false);
  const [selectedIdx, setSelectedIdx] = useState(-2);
  const [paused, setPaused] = useState(false);
  const customColorRef = useRef<[number, number, number] | null>(null);

  const getColor = useCallback((): [number, number, number] => {
    if (customColorRef.current) return customColorRef.current;
    const idx = selectedColorRef.current;
    // Default: sand color
    if (idx === -2) {
      return [245, 225, 195];
    }
    if (idx === PASTEL_PRESETS.length - 1) return getRandomPastel();
    return PASTEL_PRESETS[idx].rgb;
  }, []);

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  const spawnIdleBubble = useCallback(() => {
    if (pausedRef.current) return;
    const pos = lastMousePos.current;
    if (!pos) return;
    particlesRef.current.push({
      x: pos.x + (Math.random() - 0.5) * 16,
      y: pos.y + (Math.random() - 0.5) * 8,
      size: 3 + Math.random() * 6,
      opacity: 0.45 + Math.random() * 0.2,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -0.3 - Math.random() * 1.0,
      color: getColor(),
    });
  }, [getColor]);

  const startIdleBubbles = useCallback(() => {
    if (idleIntervalRef.current) return;
    idleIntervalRef.current = window.setInterval(() => {
      spawnIdleBubble();
    }, 300);
  }, [spawnIdleBubble]);

  const stopIdleBubbles = useCallback(() => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = 0; }
    if (idleIntervalRef.current) { clearInterval(idleIntervalRef.current); idleIntervalRef.current = 0; }
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      if (!pausedRef.current) {
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          size: 2 + Math.random() * 8,
          opacity: 0.6,
          speedX: (Math.random() - 0.5),
          speedY: -0.5 - Math.random() * 1.5,
          color: getColor(),
        });
      }

      stopIdleBubbles();
      idleTimerRef.current = window.setTimeout(() => {
        startIdleBubbles();
      }, 2000);
    };

    window.addEventListener("mousemove", onMove);
    const ctx = canvasRef.current?.getContext("2d");

    const animate = () => {
      if (!ctx || !canvasRef.current) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const ps = particlesRef.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.size += 0.05;
        p.opacity -= 0.005;

        if (p.opacity <= 0) {
          ps.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.opacity})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animFrameRef.current);
      stopIdleBubbles();
    };
  }, [startIdleBubbles, stopIdleBubbles, getColor]);

  const handleSelect = (idx: number) => {
    selectedColorRef.current = idx;
    customColorRef.current = null;
    setSelectedIdx(idx);
  };

  const handleCustomColor = (rgb: [number, number, number]) => {
    customColorRef.current = rgb;
    setSelectedIdx(-1);
  };

  const handleTogglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    if (pausedRef.current) {
      stopIdleBubbles();
      // Reset to sand color
      selectedColorRef.current = -2;
      customColorRef.current = null;
      setSelectedIdx(-2);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
      <ColorPalettePicker selectedIdx={selectedIdx} onSelect={handleSelect} onCustomColor={handleCustomColor} paused={paused} onTogglePause={handleTogglePause} customColor={customColorRef.current} />
    </>
  );
};

export default MouseGhostTrail;
