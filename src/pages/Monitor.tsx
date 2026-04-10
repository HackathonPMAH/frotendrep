import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import SimulationCanvas from "@/components/monitor/SimulationCanvas";
import TopOverlay from "@/components/monitor/TopOverlay";
import MapLegend from "@/components/monitor/MapLegend";
import ControlPanel from "@/components/monitor/ControlPanel";
import RiskPanel from "@/components/monitor/RiskPanel";
import LiveUpdatesPanel, { type LiveUpdate } from "@/components/monitor/LiveUpdatesPanel";
import AlertsPanel, { type Alert } from "@/components/monitor/AlertsPanel";

const SIMULATED_UPDATES: Omit<LiveUpdate, "id" | "timestamp">[] = [
  { type: "general", message: "Analysis initialized. Scanning crowd density patterns..." },
  { type: "density", message: "High density detected in Zone C — 892 people/m²" },
  { type: "density", message: "Zone A density rising — 654 people/m²" },
  { type: "evacuation", message: "Exit routes calculated. 4 viable paths identified." },
  { type: "congestion", message: "Congestion alert: Zone C corridor narrowing detected." },
  { type: "density", message: "Zone A density critical — 1,102 people/m²" },
  { type: "congestion", message: "Flow disruption at Zone C-D intersection." },
  { type: "general", message: "Panic probability elevated. Recommend crowd control measures." },
];

const SIMULATED_ALERTS: Omit<Alert, "id" | "timestamp">[] = [
  { message: "CRITICAL: Zone C density exceeds safe threshold by 180%" },
  { message: "WARNING: Stampede risk elevated in Zone A corridor" },
  { message: "EMERGENCY: Multiple chokepoints detected near exits 2 & 3" },
];

const Monitor = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [status, setStatus] = useState<"READY" | "PROCESSING" | "ALERT">("READY");
  const [exitsDetected, setExitsDetected] = useState(false);
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const tickRef = useRef(0);

  const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });

  const handleStartAnalysis = useCallback(() => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setShowHeatmap(true);
    setRiskScore(0);
    setUpdates([]);
    setAlerts([]);
    setExitsDetected(false);
    setStatus("PROCESSING");
    tickRef.current = 0;

    intervalRef.current = setInterval(() => {
      tickRef.current++;
      const tick = tickRef.current;

      setRiskScore((prev) => Math.min(95, prev + Math.floor(Math.random() * 7) + 2));

      if (tick <= SIMULATED_UPDATES.length) {
        const u = SIMULATED_UPDATES[tick - 1];
        setUpdates((prev) => [...prev, { ...u, id: Date.now() + tick, timestamp: now() }]);
      }

      if (tick === 3) setExitsDetected(true);

      if (tick > 4 && tick - 5 < SIMULATED_ALERTS.length) {
        const a = SIMULATED_ALERTS[tick - 5];
        setAlerts((prev) => [...prev, { ...a, id: Date.now() + tick, timestamp: now() }]);
        setStatus("ALERT");
      }

      if (tick >= 12) {
        clearInterval(intervalRef.current);
      }
    }, 2000);
  }, [isAnalyzing]);

  const handleUpload = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsAnalyzing(false);
    setShowHeatmap(false);
    setRiskScore(0);
    setStatus("READY");
    setExitsDetected(false);
    setUpdates([]);
    setAlerts([]);
  }, []);

  const handleFindExit = useCallback(() => {
    setUpdates((prev) => [
      ...prev,
      { id: Date.now(), type: "evacuation", message: "Manual exit search initiated. Scanning nearest routes...", timestamp: now() },
    ]);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background">
      {/* Dashboard button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/dashboard")}
        className="fixed bottom-3 right-3 z-50 glass-panel border border-neon-purple/50 rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-neon-purple/15 glow-purple"
      >
        <LayoutDashboard className="w-4 h-4 text-neon-purple" />
        <span className="font-mono text-[11px] text-neon-purple">Dashboard</span>
      </motion.button>

      <div className="flex flex-1 min-h-0">
        {/* Left panel */}
        <div className="w-[70%] border-r border-border/50 flex flex-col">
          <div className="relative flex-[7] min-h-0">
            <TopOverlay isAnalyzing={isAnalyzing} />
            <SimulationCanvas isAnalyzing={isAnalyzing} showHeatmap={showHeatmap} exitsDetected={exitsDetected} />
          </div>
          <MapLegend />
          <ControlPanel
            showHeatmap={showHeatmap}
            isAnalyzing={isAnalyzing}
            status={status}
            exitsDetected={exitsDetected}
            onToggleHeatmap={() => setShowHeatmap((v) => !v)}
            onUpload={handleUpload}
            onFindExit={handleFindExit}
            onStartAnalysis={handleStartAnalysis}
          />
        </div>

        {/* Right panel */}
        <div className="w-[30%] overflow-y-auto p-3 flex flex-col gap-3">
          <RiskPanel riskScore={riskScore} />
          <LiveUpdatesPanel updates={updates} />
          <AlertsPanel alerts={alerts} />
        </div>
      </div>
    </div>
  );
};

export default Monitor;
