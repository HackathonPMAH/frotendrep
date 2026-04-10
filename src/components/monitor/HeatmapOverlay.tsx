import { useRef, useEffect } from "react";
import type { ExitCell } from "@/lib/mapExit";

/** Darker, higher-opacity stops so patterns read clearly on video/image. */
function cellColor(v: number): string {
  if (v > 0.65) return `rgba(127, 29, 29, ${0.5 + v * 0.42})`;
  if (v > 0.35) return `rgba(180, 83, 9, ${0.42 + v * 0.38})`;
  return `rgba(8, 145, 178, ${0.28 + v * 0.35})`;
}

const EXIT_FILL = "rgba(88, 28, 135, 0.62)";
const EXIT_STROKE = "rgba(168, 85, 247, 0.95)";

interface Props {
  heatmap: number[][] | null;
  /** When false, heatmap cells are not drawn (exits may still show). */
  heatmapVisible: boolean;
  exitCells: ExitCell[] | null;
}

/**
 * Density grid + optional purple exit highlights (same grid as heatmap).
 */
const HeatmapOverlay = ({ heatmap, heatmapVisible, exitCells }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const showExits = exitCells != null && exitCells.length > 0;
  const showHeat = heatmapVisible && heatmap != null && heatmap.length > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent || (!showHeat && !showExits)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeAndDraw = () => {
      const r = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width));
      canvas.height = Math.max(1, Math.floor(r.height));
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      let rows = heatmap?.length ?? 0;
      let cols = heatmap?.[0]?.length ?? 0;
      if ((!rows || !cols) && showExits && exitCells?.length) {
        rows = Math.max(...exitCells.map((c) => c.row)) + 1;
        cols = Math.max(...exitCells.map((c) => c.col)) + 1;
      }
      if (!rows || !cols) return;

      const cw = w / cols;
      const ch = h / rows;

      if (showHeat && heatmap) {
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const v = Number(heatmap[row][col] ?? 0);
            if (v < 0.035) continue;
            ctx.fillStyle = cellColor(v);
            ctx.fillRect(col * cw, row * ch, cw + 1, ch + 1);
          }
        }
      }

      if (showExits && exitCells) {
        drawExitCells(ctx, exitCells, w, h, rows, cols, cw, ch);
      }
    };

    resizeAndDraw();
    const ro = new ResizeObserver(resizeAndDraw);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [heatmap, showHeat, showExits, exitCells]);

  if (!showHeat && !showExits) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-normal"
      aria-hidden
    />
  );
};

function drawExitCells(
  ctx: CanvasRenderingContext2D,
  cells: ExitCell[],
  w: number,
  h: number,
  rows: number,
  cols: number,
  cw?: number,
  ch?: number,
) {
  const cellW = cw ?? w / cols;
  const cellH = ch ?? h / rows;
  ctx.save();
  for (const { row, col } of cells) {
    if (row < 0 || col < 0 || row >= rows || col >= cols) continue;
    const x = col * cellW;
    const y = row * cellH;
    ctx.fillStyle = EXIT_FILL;
    ctx.strokeStyle = EXIT_STROKE;
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, cellW + 1, cellH + 1);
    ctx.strokeRect(x + 1, y + 1, Math.max(0, cellW - 2), Math.max(0, cellH - 2));
  }
  ctx.restore();
}

export default HeatmapOverlay;
