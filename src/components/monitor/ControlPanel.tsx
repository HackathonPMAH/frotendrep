import { motion } from "framer-motion";
import { Layers, Upload, Navigation, Play, Loader2, LayoutDashboard, X } from "lucide-react";

export type MapLayerMode = "base" | "heatmap";

interface Props {
  layerMode: MapLayerMode;
  hasBaseMap: boolean;
  hasHeatmap: boolean;
  isAnalyzing: boolean;
  status: "READY" | "PROCESSING" | "ALERT";
  exitsDetected: boolean;
  onToggleLayer: () => void;
  onOpenFilePicker: () => void;
  /** Clears the map from the UI only; server-side uploads remain for analytics. */
  onRemoveFromView: () => void;
  onFindExit: () => void;
  onStartAnalysis: () => void;
  onNavigateDashboard: () => void;
}

const ControlPanel = ({
  layerMode,
  hasBaseMap,
  hasHeatmap,
  isAnalyzing,
  status,
  exitsDetected,
  onToggleLayer,
  onOpenFilePicker,
  onRemoveFromView,
  onFindExit,
  onStartAnalysis,
  onNavigateDashboard,
}: Props) => {
  const statusColors = {
    READY: "border-neon-green/50 text-neon-green",
    PROCESSING: "border-neon-yellow/50 text-neon-yellow",
    ALERT: "border-neon-red/50 text-neon-red animate-flash-red",
  };

  const heatmapActive = layerMode === "heatmap";
  const layerToggleDisabled =
    !hasBaseMap || (layerMode === "base" && !hasHeatmap);

  return (
    <div className="flex-[3] border-t border-border/50 flex flex-col p-3 gap-3">
      <div className="grid grid-cols-4 gap-3 flex-1">
        {/* Base map vs heat map overlay */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggleLayer}
          disabled={layerToggleDisabled}
          title={
            !hasBaseMap
              ? "Upload a base map first"
              : layerMode === "base" && !hasHeatmap
                ? "Run Start Analysis to generate a heat map overlay"
                : undefined
          }
          className={`rounded-xl flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:pointer-events-none ${
            heatmapActive
              ? "glass-panel border border-neon-purple/50 bg-neon-purple/10"
              : "glass-panel hover:bg-muted/50"
          }`}
        >
          <Layers className="w-5 h-5 text-neon-purple" />
          <span className="font-mono text-[10px] text-muted-foreground text-center leading-tight px-1">
            {layerMode === "base" ? "Base Map" : "Heat Map"}
          </span>
        </motion.button>

        {/* Upload + remove from view (DB unchanged) */}
        <div className="flex flex-col items-center justify-center gap-1 min-h-0">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenFilePicker}
            className="glass-panel rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-muted/50 flex-1 w-full min-h-[72px]"
          >
            <Upload className="w-5 h-5 text-neon-purple" />
            <span className="font-mono text-[10px] text-muted-foreground text-center leading-tight px-1">
              Upload Input
            </span>
          </motion.button>
          {hasBaseMap && (
            <button
              type="button"
              onClick={onRemoveFromView}
              className="font-mono text-[9px] text-muted-foreground/90 hover:text-neon-red underline-offset-2 hover:underline px-1 py-0.5"
              title="Remove from map only — upload stays in the database for dashboard analytics"
            >
              <span className="inline-flex items-center gap-0.5">
                <X className="w-2.5 h-2.5 shrink-0 opacity-80" aria-hidden />
                Remove
              </span>
            </button>
          )}
        </div>

        {/* Find Exit */}
        <motion.button
          type="button"
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
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartAnalysis}
          disabled={isAnalyzing || !hasBaseMap}
          title={!hasBaseMap ? "Upload a base map image or video first" : undefined}
          className="relative rounded-xl flex flex-col items-center justify-center gap-2 bg-neon-cyan/10 border-2 border-neon-cyan/50 glow-cyan overflow-hidden disabled:opacity-50 disabled:pointer-events-none"
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

      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-3" aria-hidden />
        <div className="flex justify-center -translate-x-2 sm:-translate-x-3 pt-1">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateDashboard}
            className="glass-panel border border-neon-purple/50 rounded-xl px-5 py-3 flex items-center gap-2.5 hover:bg-neon-purple/15 glow-purple"
          >
            <LayoutDashboard className="w-5 h-5 text-neon-purple shrink-0" />
            <span className="font-mono text-sm text-neon-purple">Dashboard</span>
          </motion.button>
        </div>
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
