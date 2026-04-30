import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface MatchedUser {
  name: string;
  unit: string;
  period: string;
}

interface MatchSuccessAnimationProps {
  open: boolean;
  onClose: () => void;
  userA: MatchedUser;
  userB: MatchedUser;
  contactInfo?: { phone: string; email: string };
}

// Simple confetti particle
const Particle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: Math.random() * 8 + 4,
      height: Math.random() * 8 + 4,
      backgroundColor: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe", "#fbbf24", "#f59e0b"][Math.floor(Math.random() * 7)],
      left: `${x}%`,
      top: "50%",
    }}
    initial={{ opacity: 0, y: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [0, -120 - Math.random() * 100, -200 - Math.random() * 80, -260],
      x: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 120],
      scale: [0, 1.2, 1, 0.5],
      rotate: [0, Math.random() * 360],
    }}
    transition={{ duration: 2.2, delay: delay + 1.5, ease: "easeOut" }}
  />
);

const MatchSuccessAnimation = ({ open, onClose, userA, userB, contactInfo }: MatchSuccessAnimationProps) => {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (open) {
      setShowButtons(false);
      const timer = setTimeout(() => setShowButtons(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Glassmorphism overlay */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Confetti particles */}
            {Array.from({ length: 24 }).map((_, i) => (
              <Particle key={i} delay={i * 0.05} x={30 + Math.random() * 40} />
            ))}

            {/* Two profiles merging */}
            <div className="relative flex items-center gap-4">
              {/* User A from left */}
              <motion.div
                className="flex flex-col items-center"
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 shadow-lg">
                  <Users className="h-9 w-9 text-primary" />
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{userA.name}</p>
                <p className="text-xs text-muted-foreground">{userA.unit}</p>
              </motion.div>

              {/* Glowing connection line */}
              <motion.div
                className="relative h-1 overflow-visible"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 80, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: "#2563eb" }}
                  animate={{
                    boxShadow: [
                      "0 0 8px 2px rgba(37,99,235,0.4)",
                      "0 0 20px 6px rgba(37,99,235,0.6)",
                      "0 0 8px 2px rgba(37,99,235,0.4)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>

              {/* User B from right */}
              <motion.div
                className="flex flex-col items-center"
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 shadow-lg">
                  <Users className="h-9 w-9 text-primary" />
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{userB.name}</p>
                <p className="text-xs text-muted-foreground">{userB.unit}</p>
              </motion.div>
            </div>

            {/* Success message */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <h2 className="text-2xl font-bold text-foreground">
                {contactInfo ? "매칭 성공! 유료 결제(900원) 후 연락처가 공개됩니다." : "새로운 전우가 연결되었습니다!"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{userA.period} ~ {userB.period}</p>
            </motion.div>

            {/* Contact info if paid */}
            {contactInfo && (
              <motion.div
                className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-6 py-4 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.2 }}
              >
                <p className="text-sm font-medium text-foreground">📞 {contactInfo.phone}</p>
                <p className="text-sm font-medium text-foreground">✉️ {contactInfo.email}</p>
              </motion.div>
            )}

            {/* Buttons */}
            <AnimatePresence>
              {showButtons && (
                <motion.div
                  className="mt-6 flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Button variant="warmBrown" size="lg" className="gap-2" onClick={onClose}>
                    <MessageCircle className="h-4 w-4" />
                    대화 시작하기
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2" onClick={onClose}>
                    <X className="h-4 w-4" />
                    닫기
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchSuccessAnimation;
