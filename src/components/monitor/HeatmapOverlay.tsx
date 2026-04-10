import { useRef, useEffect } from "react";

function cellColor(v: number): string {
  if (v > 0.65) return `rgba(239, 68, 68, ${0.22 + v * 0.48})`;
  if (v > 0.35) return `rgba(250, 204, 21, ${0.18 + v * 0.38})`;
  return `rgba(0, 240, 255, ${0.12 + v * 0.28})`;
}

interface Props {
  heatmap: number[][] | null;
  visible: boolean;
}

/**
 * Semi-transparent density grid aligned to the map container (same coordinate space as the base image).
 */
const HeatmapOverlay = ({ heatmap, visible }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent || !visible || !heatmap?.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeAndDraw = () => {
      const r = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width));
      canvas.height = Math.max(1, Math.floor(r.height));
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const rows = heatmap.length;
      const cols = heatmap[0]?.length ?? 0;
      if (!rows || !cols) return;

      const cw = w / cols;
      const ch = h / rows;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const v = Number(heatmap[row][col] ?? 0);
          if (v < 0.04) continue;
          ctx.fillStyle = cellColor(v);
          ctx.fillRect(col * cw, row * ch, cw + 1, ch + 1);
        }
      }
    };

    resizeAndDraw();
    const ro = new ResizeObserver(resizeAndDraw);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [heatmap, visible]);

  if (!visible || !heatmap?.length) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
      aria-hidden
    />
  );
};

export default HeatmapOverlay;
