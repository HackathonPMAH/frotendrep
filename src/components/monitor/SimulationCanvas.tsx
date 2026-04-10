import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  density: number;
}

interface ClusterZone {
  x: number;
  y: number;
  radius: number;
  density: number;
  label: string;
}

const CLUSTER_ZONES: ClusterZone[] = [
  { x: 0.25, y: 0.35, radius: 0.12, density: 0.85, label: "Zone A" },
  { x: 0.60, y: 0.45, radius: 0.10, density: 0.65, label: "Zone B" },
  { x: 0.40, y: 0.70, radius: 0.09, density: 0.50, label: "Zone C" },
  { x: 0.75, y: 0.25, radius: 0.08, density: 0.40, label: "Zone D" },
];

const EXIT_POSITIONS = [
  { x: 0.05, y: 0.05 },
  { x: 0.95, y: 0.05 },
  { x: 0.05, y: 0.95 },
  { x: 0.95, y: 0.95 },
];

interface Props {
  isAnalyzing: boolean;
  showHeatmap: boolean;
  exitsDetected: boolean;
}

const SimulationCanvas = ({ isAnalyzing, showHeatmap, exitsDetected }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const perZone = 45;
    CLUSTER_ZONES.forEach((zone) => {
      for (let i = 0; i < perZone; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * zone.radius * Math.min(w, h);
        const hx = zone.x * w;
        const hy = zone.y * h;
        particles.push({
          x: hx + Math.cos(angle) * dist,
          y: hy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          homeX: hx,
          homeY: hy,
          density: zone.density,
        });
      }
    });
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let running = true;

    const resize = () => {
      const parent = canvas.parentElement!;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      if (particlesRef.current.length === 0) {
        initParticles(canvas.width, canvas.height);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!running) return;
      const w = canvas.width;
      const h = canvas.height;
      const now = Date.now();
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(168,85,247,0.04)";
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
          const cx = zone.x * w;
          const cy = zone.y * h;
          const r = zone.radius * Math.min(w, h) * 2.5;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          if (zone.density > 0.7) {
            grad.addColorStop(0, "rgba(239,68,68,0.45)");
            grad.addColorStop(1, "rgba(239,68,68,0)");
          } else if (zone.density > 0.4) {
            grad.addColorStop(0, "rgba(250,204,21,0.35)");
            grad.addColorStop(1, "rgba(250,204,21,0)");
          } else {
            grad.addColorStop(0, "rgba(168,85,247,0.25)");
            grad.addColorStop(1, "rgba(168,85,247,0)");
          }
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        });
      }

      // Exit markers & evacuation paths
      if (exitsDetected) {
        // Evacuation paths from dense zones to nearest exit
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "rgba(34,197,94,0.6)";
        ctx.lineWidth = 1.5;
        CLUSTER_ZONES.forEach((zone) => {
          if (zone.density <= 0.5) return;
          const zx = zone.x * w;
          const zy = zone.y * h;
          // Find nearest exit
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

        // Exit circles
        EXIT_POSITIONS.forEach((ep) => {
          const ex = ep.x * w;
          const ey = ep.y * h;
          // Pulsing outer ring
          const pulse = Math.sin(now / 500) * 0.5 + 0.5;
          const outerR = 12 + pulse * 8;
          ctx.beginPath();
          ctx.arc(ex, ey, outerR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(168,85,247,${0.2 + pulse * 0.3})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          // Inner circle
          ctx.beginPath();
          ctx.arc(ex, ey, 12, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(168,85,247,0.9)";
          ctx.fill();
          // Label
          ctx.font = "bold 9px 'JetBrains Mono'";
          ctx.fillStyle = "rgba(34,197,94,1)";
          ctx.textAlign = "center";
          ctx.fillText("EXIT", ex, ey + 24);
          ctx.textAlign = "start";
        });
      }

      // Particles
      particlesRef.current.forEach((p) => {
        const dx = p.homeX - p.x;
        const dy = p.homeY - p.y;
        p.vx += dx * 0.0003;
        p.vy += dy * 0.0003;

        // More agitated during analysis
        if (isAnalyzing) {
          p.vx += (Math.random() - 0.5) * 1.5;
          p.vy += (Math.random() - 0.5) * 1.5;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        let color = "rgba(192,132,252,0.6)";
        if (showHeatmap || isAnalyzing) {
          if (p.density > 0.7) color = "rgba(239,68,68,0.9)";
          else if (p.density > 0.4) color = "rgba(250,204,21,0.8)";
          else color = "rgba(0,240,255,0.7)";
        }

        // Glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, "0.08)");
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Bounding boxes during analysis
      if (isAnalyzing) {
        ctx.setLineDash([4, 4]);
        CLUSTER_ZONES.forEach((zone) => {
          if (zone.density <= 0.4) return;
          const cx = zone.x * w;
          const cy = zone.y * h;
          const r = zone.radius * Math.min(w, h);
          const boxColor = zone.density > 0.7 ? "rgba(239,68,68,0.6)" : "rgba(250,204,21,0.5)";
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
          ctx.font = "10px 'JetBrains Mono'";
          ctx.fillStyle = boxColor;
          ctx.fillText(zone.label, cx - r + 4, cy - r - 4);
        });
        ctx.setLineDash([]);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAnalyzing, showHeatmap, exitsDetected, initParticles]);

  return (
    <div className="relative flex-[7] w-full">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default SimulationCanvas;
