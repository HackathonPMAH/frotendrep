import { motion } from "framer-motion";
import { Layers, Upload, Navigation, Play, Loader2 } from "lucide-react";

interface Props {
  showHeatmap: boolean;
  isAnalyzing: boolean;
  status: "READY" | "PROCESSING" | "ALERT";
  exitsDetected: boolean;
  onToggleHeatmap: () => void;
  onUpload: () => void;
  onFindExit: () => void;
  onStartAnalysis: () => void;
}

const ControlPanel = ({
  showHeatmap, isAnalyzing, status, exitsDetected,
  onToggleHeatmap, onUpload, onFindExit, onStartAnalysis,
}: Props) => {
  const statusColors = {
    READY: "border-neon-green/50 text-neon-green",
    PROCESSING: "border-neon-yellow/50 text-neon-yellow",
    ALERT: "border-neon-red/50 text-neon-red animate-flash-red",
  };

  return (
    <div className="flex-[3] border-t border-border/50 flex flex-col p-3 gap-3">
      <div className="grid grid-cols-4 gap-3 flex-1">
        {/* Heat Map */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggleHeatmap}
          className={`rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${
            showHeatmap
              ? "glass-panel border border-neon-purple/50 bg-neon-purple/10"
              : "glass-panel hover:bg-muted/50"
          }`}
        >
          <Layers className="w-5 h-5 text-neon-purple" />
          <span className="font-mono text-[10px] text-muted-foreground">
            {showHeatmap ? "Base Map" : "Heat Map"}
          </span>
        </motion.button>

        {/* Upload */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onUpload}
          className="glass-panel rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-muted/50"
        >
          <Upload className="w-5 h-5 text-neon-purple" />
          <span className="font-mono text-[10px] text-muted-foreground">Upload Input</span>
        </motion.button>

        {/* Find Exit */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onFindExit}
          className="glass-panel rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-muted/50"
        >
          <Navigation className="w-5 h-5 text-neon-green" />
          <span className="font-mono text-[10px] text-muted-foreground">Find Exit</span>
        </motion.button>

        {/* Start Analysis */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartAnalysis}
          disabled={isAnalyzing}
          className="relative rounded-xl flex flex-col items-center justify-center gap-2 bg-neon-cyan/10 border-2 border-neon-cyan/50 glow-cyan overflow-hidden"
        >
          {isAnalyzing && <div className="absolute inset-0 animate-pulse-glow bg-neon-cyan/5" />}
          {isAnalyzing ? (
            <Loader2 className="w-5 h-5 text-neon-cyan animate-spin" />
          ) : (
            <Play className="w-5 h-5 text-neon-cyan" />
          )}
          <span className="font-mono text-[10px] text-neon-cyan">
            {isAnalyzing ? "Analyzing..." : "Start Analysis"}
          </span>
        </motion.button>
      </div>

      <div className="flex items-center gap-3">
        <div className={`rounded-full px-3 py-1 border font-mono text-[10px] ${statusColors[status]}`}>
          {status}
        </div>
        {exitsDetected && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-neon-green" style={{ boxShadow: "0 0 6px #22c55e" }} />
            <span className="font-mono text-[10px] text-neon-green">EXITS DETECTED</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
