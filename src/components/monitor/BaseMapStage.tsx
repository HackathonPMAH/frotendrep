import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import HeatmapOverlay from "@/components/monitor/HeatmapOverlay";
import type { MapLayerMode } from "@/components/monitor/ControlPanel";
import type { ExitCell } from "@/lib/mapExit";

interface Props {
  mediaUrl: string;
  kind: "image" | "video";
  mediaKey: number;
  layerMode: MapLayerMode;
  heatmap: number[][] | null;
  exitCells: ExitCell[] | null;
}

const ZOOM_MIN = 0.7;
const ZOOM_MAX = 3.2;
const ZOOM_STEP = 0.15;

/**
 * Base map with map-only zoom/pan (wheel + drag when zoomed) and overlays.
 */
const BaseMapStage = ({ mediaUrl, kind, mediaKey, layerMode, heatmap, exitCells }: Props) => {
  const showHeatOverlay = layerMode === "heatmap" && heatmap !== null;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragActiveRef = useRef(false);
  const drag = useRef({ sx: 0, sy: 0, px: 0, py: 0 });

  const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = -e.deltaY * 0.0018;
    setZoom((z) => clampZoom(z + delta));
  }, []);

  useEffect(() => {
    if (zoom <= 1.02) setPan({ x: 0, y: 0 });
  }, [zoom]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom <= 1.02) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      drag.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
      dragActiveRef.current = true;
    },
    [pan.x, pan.y, zoom],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragActiveRef.current) return;
    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    setPan({ x: drag.current.px + dx, y: drag.current.py + dy });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragActiveRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const zoomIn = () => setZoom((z) => clampZoom(z + ZOOM_STEP));
  const zoomOut = () => setZoom((z) => clampZoom(z - ZOOM_STEP));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={viewportRef}
      className="absolute inset-0 w-full h-full bg-black/80 overflow-hidden touch-none"
      onWheel={onWheel}
      title="Scroll to zoom the map · drag when zoomed"
    >
      <div
        className={`absolute inset-0 w-full h-full ${zoom > 1.02 ? "cursor-grab active:cursor-grabbing" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <div className="absolute inset-0 w-full h-full">
          {kind === "video" ? (
            <video
              key={mediaKey}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
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
              className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
              draggable={false}
            />
          )}
          <HeatmapOverlay
            heatmap={heatmap}
            heatmapVisible={showHeatOverlay}
            exitCells={exitCells}
          />
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={zoomIn}
          className="rounded-lg bg-background/85 border border-border/60 p-2 shadow-md hover:bg-muted/80 backdrop-blur-sm"
          aria-label="Zoom map in"
        >
          <Plus className="w-4 h-4 text-foreground" />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="rounded-lg bg-background/85 border border-border/60 p-2 shadow-md hover:bg-muted/80 backdrop-blur-sm"
          aria-label="Zoom map out"
        >
          <Minus className="w-4 h-4 text-foreground" />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="rounded-lg bg-background/85 border border-neon-purple/40 px-2 py-1.5 font-mono text-[9px] text-neon-purple shadow-md hover:bg-neon-purple/10 backdrop-blur-sm"
          title="Reset map zoom and pan"
        >
          1:1
        </button>
      </div>
    </div>
  );
};

export default BaseMapStage;
