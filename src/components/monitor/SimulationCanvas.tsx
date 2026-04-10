import { useRef, useEffect, useCallback } from "react";

const PARTICLE_COUNT = 180;
const CLUSTER_ZONES = [
  { x: 0.3, y: 0.4, radius: 0.12, density: 0.9 },   // Zone A — very dense
  { x: 0.7, y: 0.6, radius: 0.1, density: 0.7 },    // Zone B — dense
  { x: 0.5, y: 0.25, radius: 0.08, density: 0.5 },   // Zone C — medium
  { x: 0.2, y: 0.75, radius: 0.06, density: 0.3 },   // Zone D — sparse
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  zone: (typeof CLUSTER_ZONES)[number] | null;
}

function createParticles(w: number, h: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const zone = CLUSTER_ZONES[Math.floor(Math.random() * CLUSTER_ZONES.length)];
    const inCluster = Math.random() < zone.density;
    const baseX = inCluster
      ? zone.x * w + (Math.random() - 0.5) * zone.radius * w * 2
      : Math.random() * w;
    const baseY = inCluster
      ? zone.y * h + (Math.random() - 0.5) * zone.radius * h * 2
      : Math.random() * h;
    particles.push({
      x: baseX,
      y: baseY,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 2 + Math.random() * 2,
      zone: inCluster ? zone : null,
    });
  }
  return particles;
}

function getDensityColor(density: number): string {
  if (density > 0.7) return "rgba(239, 68, 68, 0.9)";
  if (density > 0.4) return "rgba(250, 204, 21, 0.8)";
  return "rgba(0, 240, 255, 0.7)";
}

function getGlowColor(density: number, isAnalyzing: boolean): string {
  if (!isAnalyzing) return "rgba(0,240,255,0.1)";
  if (density > 0.7) return "rgba(239,68,68,0.15)";
  if (density > 0.4) return "rgba(250,204,21,0.12)";
  return "rgba(0,240,255,0.1)";
}

interface Props {
  isAnalyzing: boolean;
  showHeatmap: boolean;
  exitsDetected: boolean;
}

const EXIT_POSITIONS = [
  { x: 0.05, y: 0.05 },
  { x: 0.95, y: 0.05 },
  { x: 0.05, y: 0.95 },
  { x: 0.95, y: 0.95 },
];

const SimulationCanvas = ({ isAnalyzing, showHeatmap, exitsDetected }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const now = Date.now();

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Heatmap
    if (showHeatmap) {
      CLUSTER_ZONES.forEach((zone) => {
        const gradient = ctx.createRadialGradient(
          zone.x * w, zone.y * h, 0,
          zone.x * w, zone.y * h, zone.radius * w * 2.5
        );
        const color = zone.density > 0.7 ? "239,68,68"
          : zone.density > 0.4 ? "250,204,21"
          : "0,240,255";
        gradient.addColorStop(0, `rgba(${color}, ${0.25 * zone.density})`);
        gradient.addColorStop(0.5, `rgba(${color}, ${0.1 * zone.density})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });
    }

    // Exit markers & evacuation paths
    if (exitsDetected) {
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "rgba(34,197,94,0.6)";
      ctx.lineWidth = 1.5;
      CLUSTER_ZONES.forEach((zone) => {
        if (zone.density <= 0.5) return;
        const zx = zone.x * w;
        const zy = zone.y * h;
        let nearest = EXIT_POSITIONS[0];
        let minDist = Infinity;
        EXIT_POSITIONS.forEach((ep) => {
          const d = Math.hypot(ep.x * w - zx, ep.y * h - zy);
          if (d < minDist) { minDist = d; nearest = ep; }
        });
        ctx.beginPath();
        ctx.moveTo(zx, zy);
        ctx.lineTo(nearest.x * w, nearest.y * h);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      EXIT_POSITIONS.forEach((ep) => {
        const ex = ep.x * w;
        const ey = ep.y * h;
        const pulse = Math.sin(now / 500) * 0.5 + 0.5;
        const outerR = 12 + pulse * 8;
        ctx.beginPath();
        ctx.arc(ex, ey, outerR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168,85,247,${0.2 + pulse * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ex, ey, 12, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168,85,247,0.9)";
        ctx.fill();
        ctx.font = "bold 9px 'JetBrains Mono'";
        ctx.fillStyle = "rgba(34,197,94,1)";
        ctx.textAlign = "center";
        ctx.fillText("EXIT", ex, ey + 24);
        ctx.textAlign = "start";
      });
    }

    // Particles
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.zone) {
        const dx = p.zone.x * w - p.x;
        const dy = p.zone.y * h - p.y;
        p.vx += dx * 0.0003;
        p.vy += dy * 0.0003;
      }
      p.vx *= 0.99;
      p.vy *= 0.99;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const density = p.zone ? p.zone.density : 0.2;
      const color = isAnalyzing
        ? getDensityColor(density)
        : "rgba(0, 240, 255, 0.6)";

      // Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Glow halo
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      glow.addColorStop(0, getGlowColor(density, isAnalyzing));
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    });

    // Bounding boxes during analysis
    if (isAnalyzing) {
      CLUSTER_ZONES.forEach((zone, i) => {
        if (zone.density > 0.5) {
          const x = (zone.x - zone.radius) * w;
          const y = (zone.y - zone.radius) * h;
          const boxW = zone.radius * 2 * w;
          const boxH = zone.radius * 2 * h;
          ctx.strokeStyle = zone.density > 0.7
            ? "rgba(239,68,68,0.6)"
            : "rgba(250,204,21,0.5)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(x, y, boxW, boxH);
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.font = "11px 'Inter'";
          ctx.fillText(`Zone ${String.fromCharCode(65 + i)}`, x + 4, y - 6);
        }
      });
    }

    animRef.current = requestAnimationFrame(draw);
  }, [showHeatmap, isAnalyzing, exitsDetected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let running = true;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      particlesRef.current = createParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
  );
};

export default SimulationCanvas;
