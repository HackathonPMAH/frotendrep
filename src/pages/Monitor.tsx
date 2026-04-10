import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SimulationCanvas from "@/components/monitor/SimulationCanvas";
import BaseMapStage from "@/components/monitor/BaseMapStage";
import TopOverlay from "@/components/monitor/TopOverlay";
import MapLegend from "@/components/monitor/MapLegend";
import ControlPanel, { type MapLayerMode } from "@/components/monitor/ControlPanel";
import RiskPanel from "@/components/monitor/RiskPanel";
import LiveUpdatesPanel, { type LiveUpdate } from "@/components/monitor/LiveUpdatesPanel";
import AlertsPanel, { type Alert } from "@/components/monitor/AlertsPanel";
import { analyzeBaseMap, apiUrl, uploadBaseMap } from "@/lib/api";

function mapUiStatus(backend: string): "READY" | "PROCESSING" | "ALERT" {
  if (backend === "CRITICAL") return "ALERT";
  if (backend === "WARNING") return "PROCESSING";
  return "READY";
}

type BaseMapState = { id: number; kind: "image" | "video"; url: string };

const Monitor = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [layerMode, setLayerMode] = useState<MapLayerMode>("base");
  const [baseMap, setBaseMap] = useState<BaseMapState | null>(null);
  const [heatmapMatrix, setHeatmapMatrix] = useState<number[][] | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const [riskScore, setRiskScore] = useState(0);
  const [status, setStatus] = useState<"READY" | "PROCESSING" | "ALERT">("READY");
  const [exitsDetected, setExitsDetected] = useState(false);
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const idRef = useRef(0);

  const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });

  const handleOpenFilePicker = useCallback(() => {
    setMapError(null);
    fileInputRef.current?.click();
  }, []);

  const handleRemoveFromView = useCallback(() => {
    setBaseMap(null);
    setHeatmapMatrix(null);
    setLayerMode("base");
    setMapError(null);
    setIsAnalyzing(false);
    setRiskScore(0);
    setStatus("READY");
    setExitsDetected(false);
    setUpdates([]);
    setAlerts([]);
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setMapError(null);
    setIsAnalyzing(false);
    setHeatmapMatrix(null);
    setLayerMode("base");
    setRiskScore(0);
    setStatus("READY");
    setExitsDetected(false);
    setUpdates([]);
    setAlerts([]);

    try {
      const res = await uploadBaseMap(file);
      setBaseMap({
        id: res.id,
        kind: res.kind,
        url: apiUrl(res.media_url),
      });
    } catch (err) {
      setBaseMap(null);
      setMapError(err instanceof Error ? err.message : "Upload failed");
    }
  }, []);

  const handleStartAnalysis = useCallback(async () => {
    if (isAnalyzing || !baseMap) return;

    setIsAnalyzing(true);
    setMapError(null);
    setRiskScore(0);
    setUpdates([]);
    setAlerts([]);
    setExitsDetected(false);
    setStatus("PROCESSING");

    try {
      const data = await analyzeBaseMap();
      const score = Math.round(Number(data.risk?.risk_score ?? 0));
      setRiskScore(Math.min(100, Math.max(0, score)));
      const backendStatus = String(data.risk?.status ?? "SAFE");
      setStatus(mapUiStatus(backendStatus));

      const hasHotspots = Array.isArray(data.hotspots) && data.hotspots.length > 0;
      const hasRecs = Array.isArray(data.recommendations) && data.recommendations.length > 0;
      setExitsDetected(hasHotspots || hasRecs);

      setHeatmapMatrix(data.heatmap ?? null);
      setLayerMode("heatmap");

      const recs = data.recommendations ?? [];
      if (recs.length > 0) {
        const newLines: LiveUpdate[] = recs.slice(0, 5).map((message) => {
          const lower = message.toLowerCase();
          let type: LiveUpdate["type"] = "general";
          if (lower.includes("exit") || lower.includes("evacuat") || lower.includes("route")) type = "evacuation";
          else if (lower.includes("choke") || lower.includes("congest") || lower.includes("block")) type = "congestion";
          else if (lower.includes("density") || lower.includes("crowd")) type = "density";
          return { type, message, id: ++idRef.current, timestamp: now() };
        });
        setUpdates((prev) => [...prev, ...newLines].slice(-25));
      } else {
        const f = data.features as Record<string, unknown> | undefined;
        const msg =
          f != null
            ? `Crowd ${Number(f.crowd_size ?? 0)} · max density ${Number(f.max_density ?? 0).toFixed(2)}`
            : `Analysis complete · risk ${score}`;
        setUpdates((prev) => [...prev, { type: "general" as const, message: msg, id: ++idRef.current, timestamp: now() }].slice(-25));
      }

      if (backendStatus === "CRITICAL") {
        const raw = data.recommendations?.[0];
        const msg = raw
          ? raw.toUpperCase().startsWith("CRITICAL")
            ? raw
            : `CRITICAL: ${raw}`
          : `CRITICAL: Risk score ${score} — immediate action required`;
        setAlerts((prev) => [...prev, { id: ++idRef.current, message: msg, timestamp: now() }].slice(-20));
      }
    } catch (err) {
      setStatus("READY");
      setMapError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }, [baseMap, isAnalyzing]);

  const handleToggleLayer = useCallback(() => {
    if (!baseMap) return;
    setLayerMode((m) => (m === "base" ? "heatmap" : "base"));
  }, [baseMap]);

  const handleFindExit = useCallback(() => {
    setUpdates((prev) => [
      ...prev,
      {
        id: ++idRef.current,
        type: "evacuation",
        message: "Manual exit search initiated. Scanning nearest routes...",
        timestamp: now(),
      },
    ]);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        aria-hidden
        onChange={handleFileChange}
      />

      <div className="flex flex-1 min-h-0">
        <div className="w-[70%] border-r border-border/50 flex flex-col">
          <div className="relative flex-[7] min-h-0">
            <TopOverlay isAnalyzing={isAnalyzing} />
            {baseMap ? (
              <BaseMapStage
                mediaUrl={baseMap.url}
                kind={baseMap.kind}
                mediaKey={baseMap.id}
                layerMode={layerMode}
                heatmap={heatmapMatrix}
              />
            ) : (
              <SimulationCanvas
                isAnalyzing={isAnalyzing}
                showHeatmap={false}
                exitsDetected={exitsDetected}
              />
            )}
            {mapError && (
              <div
                role="alert"
                className="absolute bottom-3 left-3 right-3 rounded-lg border border-neon-red/40 bg-background/90 px-3 py-2 font-mono text-xs text-neon-red"
              >
                {mapError}
              </div>
            )}
          </div>
          <MapLegend />
          <ControlPanel
            layerMode={layerMode}
            hasBaseMap={!!baseMap}
            hasHeatmap={heatmapMatrix !== null}
            isAnalyzing={isAnalyzing}
            status={status}
            exitsDetected={exitsDetected}
            onToggleLayer={handleToggleLayer}
            onOpenFilePicker={handleOpenFilePicker}
            onRemoveFromView={handleRemoveFromView}
            onFindExit={handleFindExit}
            onStartAnalysis={handleStartAnalysis}
            onNavigateDashboard={() => navigate("/dashboard")}
          />
        </div>

        <div className="w-[30%] overflow-hidden p-3 flex flex-col gap-3">
          <RiskPanel riskScore={riskScore} />
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0 flex flex-col">
              <LiveUpdatesPanel updates={updates} />
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <AlertsPanel alerts={alerts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitor;
