/** Client-side exit hints from heatmap: prefer map perimeter with lowest congestion. */

export type ExitCell = { row: number; col: number };

export function computeExitCells(heatmap: number[][]): ExitCell[] {
  const rows = heatmap.length;
  const cols = heatmap[0]?.length ?? 0;
  if (rows < 2 || cols < 2) return [];

  const onBorder = (r: number, c: number) =>
    r === 0 || r === rows - 1 || c === 0 || c === cols - 1;

  const scored: { row: number; col: number; v: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!onBorder(r, c)) continue;
      const v = Number(heatmap[r][c] ?? 0);
      scored.push({ row: r, col: c, v });
    }
  }
  if (!scored.length) return [];

  scored.sort((a, b) => a.v - b.v);
  const bestV = scored[0].v;
  const band = Math.max(0.08, bestV * 0.35 + 0.05);

  const picked = new Map<string, ExitCell>();
  for (const s of scored) {
    if (s.v <= bestV + band) {
      picked.set(`${s.row},${s.col}`, { row: s.row, col: s.col });
      if (picked.size >= 14) break;
    }
  }
  return [...picked.values()];
}

export function describeExitDirection(cells: ExitCell[], rows: number, cols: number): string {
  if (!cells.length) return "No clear perimeter exit from current density data.";
  let n = 0,
    s = 0,
    w = 0,
    e = 0;
  for (const { row, col } of cells) {
    if (row === 0) n++;
    if (row === rows - 1) s++;
    if (col === 0) w++;
    if (col === cols - 1) e++;
  }
  const parts: string[] = [];
  const m = Math.max(n, s, w, e);
  if (m === n && n > 0) parts.push("north edge");
  if (m === s && s > 0) parts.push("south edge");
  if (m === w && w > 0) parts.push("west edge");
  if (m === e && e > 0) parts.push("east edge");
  const primary = parts[0] ?? "perimeter";
  return `Lowest congestion along the ${primary} — highlighted in purple.`;
}

/** Share of grid cells above high-density threshold (aligns with heatmap red band). */
export function heatmapHighDensityFraction(heatmap: number[][] | null, threshold = 0.62): number {
  if (!heatmap?.length) return 0;
  let hi = 0;
  let n = 0;
  for (const row of heatmap) {
    for (const v of row) {
      n++;
      if (Number(v) > threshold) hi++;
    }
  }
  return n ? hi / n : 0;
}
