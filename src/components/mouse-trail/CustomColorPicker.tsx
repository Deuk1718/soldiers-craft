import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomColorPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (rgb: [number, number, number]) => void;
  initialColor?: [number, number, number] | null;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

const QUICK_COLORS: [number, number, number][] = [
  [255, 0, 0], [255, 127, 0], [255, 255, 0], [0, 200, 0], [0, 150, 255],
  [100, 0, 255], [255, 0, 200], [255, 255, 255], [128, 128, 128], [0, 0, 0],
];

const CustomColorPicker = ({ open, onClose, onSelect, initialColor }: CustomColorPickerProps) => {
  const { t } = useLanguage();
  const [hue, setHue] = useState(270);
  const [sat, setSat] = useState(60);
  const [light, setLight] = useState(75);

  const rgb = hslToRgb(hue, sat, light);

  const handleApply = useCallback(() => {
    onSelect(rgb);
    onClose();
  }, [rgb, onSelect, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0" style={{ zIndex: 10002, background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div
        className="fixed rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 animate-in fade-in zoom-in-95 duration-200"
        style={{
          zIndex: 10003,
          background: "rgba(25, 25, 35, 0.95)",
          bottom: "50%", right: "50%",
          transform: "translate(50%, 50%)",
          width: "min(340px, 90vw)",
          padding: "20px",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/90 font-semibold">🎨 {t("trail.custom.title")}</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={16} className="text-white/60" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-16 h-16 rounded-xl border-2 border-white/20 shadow-lg"
            style={{ background: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, boxShadow: `0 4px 20px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.4)` }}
          />
          <div className="flex-1">
            <p className="text-white/50 text-[10px] mb-0.5">RGB</p>
            <p className="text-white/90 text-xs font-mono">{rgb[0]}, {rgb[1]}, {rgb[2]}</p>
            <p className="text-white/50 text-[10px] mt-1 mb-0.5">HEX</p>
            <p className="text-white/90 text-xs font-mono">#{rgb.map(v => v.toString(16).padStart(2, '0')).join('')}</p>
          </div>
        </div>

        {/* Hue */}
        <div className="mb-3">
          <p className="text-[10px] text-white/50 mb-1.5">{t("trail.custom.hue")}</p>
          <input
            type="range" min={0} max={360} value={hue}
            onChange={e => setHue(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{
              background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
            }}
          />
        </div>

        {/* Saturation */}
        <div className="mb-3">
          <p className="text-[10px] text-white/50 mb-1.5">{t("trail.custom.sat")}</p>
          <input
            type="range" min={0} max={100} value={sat}
            onChange={e => setSat(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, hsl(${hue}, 0%, ${light}%), hsl(${hue}, 100%, ${light}%))`,
            }}
          />
        </div>

        {/* Lightness */}
        <div className="mb-4">
          <p className="text-[10px] text-white/50 mb-1.5">{t("trail.custom.light")}</p>
          <input
            type="range" min={10} max={95} value={light}
            onChange={e => setLight(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, hsl(${hue}, ${sat}%, 10%), hsl(${hue}, ${sat}%, 50%), hsl(${hue}, ${sat}%, 95%))`,
            }}
          />
        </div>

        {/* Quick colors */}
        <div className="mb-4">
          <p className="text-[10px] text-white/50 mb-1.5">{t("trail.custom.quick")}</p>
          <div className="flex gap-1.5 flex-wrap">
            {QUICK_COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => { onSelect(c); onClose(); }}
                className="w-7 h-7 rounded-full border border-white/20 hover:scale-125 transition-transform"
                style={{ background: `rgb(${c[0]}, ${c[1]}, ${c[2]})` }}
              />
            ))}
          </div>
        </div>

        {/* Apply button */}
        <button
          onClick={handleApply}
          className="w-full h-10 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]}), rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.7))`,
            boxShadow: `0 4px 16px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.35)`,
          }}
        >
          {t("trail.custom.apply")}
        </button>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default CustomColorPicker;
