import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";

interface Props {
  riskScore: number;
}

const RiskPanel = ({ riskScore }: Props) => {
  const getLevel = () => {
    if (riskScore >= 80) return { label: "CRITICAL", color: "text-neon-red", bg: "bg-neon-red/15", barColor: "bg-neon-red", flash: true };
    if (riskScore >= 60) return { label: "HIGH", color: "text-neon-red", bg: "bg-neon-red/10", barColor: "bg-neon-red", flash: false };
    if (riskScore >= 30) return { label: "MEDIUM", color: "text-neon-yellow", bg: "bg-neon-yellow/10", barColor: "bg-neon-yellow", flash: false };
    return { label: "LOW", color: "text-neon-green", bg: "bg-neon-green/10", barColor: "bg-neon-green", flash: false };
  };
  const level = getLevel();

  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-neon-purple" />
        <span className="font-mono text-[11px] text-muted-foreground tracking-wider">RISK ASSESSMENT</span>
      </div>

      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={riskScore}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-20 h-20 rounded-xl flex items-center justify-center ${level.bg} ${level.flash ? "animate-flash-red" : ""}`}
          >
            <span className={`text-3xl font-bold font-mono ${level.color}`}>{riskScore}</span>
          </motion.div>
        </AnimatePresence>

        <div className="flex-1">
          <span className={`font-mono text-xs font-bold ${level.color}`}>{level.label}</span>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${level.barColor}`}
              animate={{ width: `${riskScore}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPanel;
