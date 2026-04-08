import { useState } from "react";
import { Palette, X, Pause, Play, Pipette } from "lucide-react";
import { PASTEL_PRESETS, COLOR_CATEGORIES } from "./pastelColors";
import CustomColorPicker from "./CustomColorPicker";

interface ColorPalettePickerProps {
  selectedIdx: number;
  onSelect: (idx: number) => void;
  onCustomColor: (rgb: [number, number, number]) => void;
  paused: boolean;
  onTogglePause: () => void;
  customColor?: [number, number, number] | null;
}

const ColorPalettePicker = ({ selectedIdx, onSelect, onCustomColor, paused, onTogglePause, customColor: customColorProp }: ColorPalettePickerProps) => {
  const [open, setOpen] = useState(false);
  const [customPickerOpen, setCustomPickerOpen] = useState(false);

  const handleSelect = (idx: number) => {
    onSelect(idx);
    setOpen(false);
  };

  const lastIdx = PASTEL_PRESETS.length - 1;
  const isRandom = selectedIdx === lastIdx;
  const isCustom = selectedIdx === -1 && customColorProp;

  // Compute current active RGB for reuse
  const activeRgb: [number, number, number] = isCustom
    ? customColorProp!
    : selectedIdx >= 0 && selectedIdx < lastIdx
      ? PASTEL_PRESETS[selectedIdx].rgb
      : [245, 225, 195]; // sand default or random fallback

  const buttonBg = isCustom
    ? `rgba(${activeRgb[0]}, ${activeRgb[1]}, ${activeRgb[2]}, 0.85)`
    : isRandom
      ? "linear-gradient(135deg, #FFB6C1, #C8B4FF, #AAF0D1, #ADD8FA, #FFDAB9, #FFFAB4)"
      : `rgba(${activeRgb[0]}, ${activeRgb[1]}, ${activeRgb[2]}, 0.85)`;

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 10000 }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-11 h-11 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all hover:scale-110 bg-[#496209]/[0.58]"
        style={{
          background: buttonBg,
        }}
        aria-label="파티클 색상 선택"
      >
        <Palette size={18} className="text-gray-700" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 10000, background: "rgba(0,0,0,0.4)" }}
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div
            className="fixed rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 flex flex-col"
            style={{
              zIndex: 10001,
              background: "rgba(25, 25, 35, 0.92)",
              bottom: "50%",
              right: "50%",
              transform: "translate(50%, 50%)",
              width: "min(720px, 96vw)",
              maxHeight: "none",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-sm text-white/90 font-semibold">🎨 방울 색상 선택</p>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={16} className="text-white/60" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 px-4 pb-4 space-y-3">
              {COLOR_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-[11px] text-white/50 mb-1.5 font-medium">{cat.label}</p>
                  <div className="grid grid-cols-10 gap-1.5">
                    {PASTEL_PRESETS.slice(cat.start, cat.start + cat.count).map((preset, i) => {
                      const idx = cat.start + i;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(idx)}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-125 ${
                            selectedIdx === idx
                              ? "border-white scale-110 ring-2 ring-white/50"
                              : "border-transparent hover:border-white/40"
                          }`}
                          style={{
                            background: `rgb(${preset.rgb[0]}, ${preset.rgb[1]}, ${preset.rgb[2]})`,
                          }}
                          title={preset.label}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special buttons */}
              <div>
                <p className="text-[11px] text-white/50 mb-1.5 font-medium">스페셜</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleSelect(lastIdx)}
                    className={`h-9 px-4 rounded-full border-2 transition-all hover:scale-105 flex items-center gap-2 text-xs font-medium text-white ${
                      selectedIdx === lastIdx
                        ? "border-white ring-2 ring-white/50"
                        : "border-transparent hover:border-white/40"
                    }`}
                    style={{
                      background: "conic-gradient(#FFB6C1, #C8B4FF, #AAF0D1, #ADD8FA, #FFDAB9, #FFFAB4, #FFB6C1)",
                    }}
                  >
                    🎲 랜덤
                  </button>

                  {/* Custom color picker */}
                  <button
                    onClick={() => setCustomPickerOpen(true)}
                    className={`h-9 px-4 rounded-full border-2 transition-all hover:scale-105 flex items-center gap-2 text-xs font-medium text-white ${
                      isCustom ? "border-white ring-2 ring-white/50" : "border-transparent hover:border-white/40"
                    }`}
                    style={{
                      background: isCustom
                        ? `linear-gradient(135deg, rgb(${customColorProp![0]}, ${customColorProp![1]}, ${customColorProp![2]}), rgba(${customColorProp![0]}, ${customColorProp![1]}, ${customColorProp![2]}, 0.7))`
                        : "linear-gradient(135deg, #c8b4ff, #ffb6c1)",
                      boxShadow: isCustom ? `0 0 12px rgba(${customColorProp![0]}, ${customColorProp![1]}, ${customColorProp![2]}, 0.4)` : undefined,
                    }}
                  >
                    <Pipette size={14} />
                    커스텀
                  </button>

                  <CustomColorPicker
                    open={customPickerOpen}
                    onClose={() => setCustomPickerOpen(false)}
                    onSelect={(rgb) => { onCustomColor(rgb); setOpen(false); }}
                    initialColor={customColorProp}
                  />

                  <button
                    onClick={() => { onTogglePause(); setOpen(false); }}
                    className={`h-9 px-4 rounded-full border-2 transition-all hover:scale-105 flex items-center gap-2 text-xs font-medium ${
                      paused
                        ? "border-white/60 bg-white/15 text-white ring-2 ring-white/30"
                        : "border-transparent hover:border-white/40 text-white/80"
                    }`}
                    style={{
                      background: paused
                        ? `rgba(${activeRgb[0]}, ${activeRgb[1]}, ${activeRgb[2]}, 0.5)`
                        : `rgba(${activeRgb[0]}, ${activeRgb[1]}, ${activeRgb[2]}, 0.35)`,
                    }}
                  >
                    {paused ? <Play size={14} /> : <Pause size={14} />}
                    {paused ? "재생" : "멈춤"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorPalettePicker;
