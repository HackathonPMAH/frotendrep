import HeatmapOverlay from "@/components/monitor/HeatmapOverlay";
import type { MapLayerMode } from "@/components/monitor/ControlPanel";

interface Props {
  mediaUrl: string;
  kind: "image" | "video";
  mediaKey: number;
  layerMode: MapLayerMode;
  heatmap: number[][] | null;
}

/**
 * Full-bleed base map with optional heatmap overlay (Heat Map mode).
 */
const BaseMapStage = ({ mediaUrl, kind, mediaKey, layerMode, heatmap }: Props) => {
  const showHeatOverlay = layerMode === "heatmap" && heatmap !== null;

  return (
    <div className="absolute inset-0 w-full h-full bg-black/80">
      {kind === "video" ? (
        <video
          key={mediaKey}
          className="absolute inset-0 w-full h-full object-contain"
          src={mediaUrl}
          muted
          playsInline
          loop
          autoPlay
          controls={false}
        />
      ) : (
        <img
          key={mediaKey}
          src={mediaUrl}
          alt="Uploaded base map"
          className="absolute inset-0 w-full h-full object-contain select-none"
          draggable={false}
        />
      )}
      <HeatmapOverlay heatmap={heatmap} visible={showHeatOverlay} />
    </div>
  );
};

export default BaseMapStage;
