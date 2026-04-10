import { AlertTriangle } from "lucide-react";

const FALLBACK = [
  { time: "14:23:15", zone: "Zone C", level: "CRITICAL", message: "Density exceeded 1200 p/m² — stampede risk" },
  { time: "14:21:08", zone: "Zone A", level: "CRITICAL", message: "Crowd surge detected at main entrance" },
  { time: "14:18:42", zone: "Zone C", level: "CRITICAL", message: "Exit 2 blocked — counter-flow detected" },
  { time: "14:15:33", zone: "Zone B", level: "CRITICAL", message: "Abnormal movement pattern — panic signature" },
  { time: "14:12:19", zone: "Zone D", level: "CRITICAL", message: "Chokepoint formation at corridor junction" },
  { time: "14:09:05", zone: "Zone A", level: "CRITICAL", message: "Rapid density spike — 400% increase in 90s" },
  { time: "14:06:51", zone: "Zone C", level: "CRITICAL", message: "Multiple fall detections in high-density area" },
  { time: "14:03:27", zone: "Zone B", level: "CRITICAL", message: "Emergency exit capacity exceeded by 200%" },
];

function levelBadgeClass(level: string) {
  if (level === "CRITICAL") {
    return "font-mono text-[9px] font-bold bg-neon-red/15 text-neon-red border border-neon-red/30 rounded px-1.5 py-0.5";
  }
  if (level === "WARNING") {
    return "font-mono text-[9px] font-bold bg-neon-yellow/15 text-neon-yellow border border-neon-yellow/30 rounded px-1.5 py-0.5";
  }
  return "font-mono text-[9px] font-bold bg-muted text-muted-foreground border border-border rounded px-1.5 py-0.5";
}

interface Props {
  incidents?: { time: string; zone: string; level: string; message: string }[];
  isLoading?: boolean;
}

const IncidentTable = ({ incidents, isLoading }: Props) => {
  const rows = incidents?.length ? incidents : FALLBACK;

  return (
    <div className={`glass-panel rounded-xl p-5 transition-opacity ${isLoading ? "opacity-75" : "opacity-100"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-neon-red" />
          <span className="font-mono text-[11px] text-muted-foreground tracking-wider">INCIDENT LOG — CRITICAL</span>
        </div>
        <span className="font-mono text-[10px] bg-neon-red/15 text-neon-red px-2 py-0.5 rounded-full">{rows.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              {["TIMESTAMP", "ZONE", "LEVEL", "MESSAGE"].map((h) => (
                <th key={h} className="text-left font-mono text-[10px] text-muted-foreground pb-2 pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((inc, i) => (
              <tr key={`${inc.time}-${i}`} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                <td className="font-mono text-[10px] text-muted-foreground py-2 pr-4">{inc.time}</td>
                <td className="font-mono text-[10px] text-foreground py-2 pr-4">{inc.zone}</td>
                <td className="py-2 pr-4">
                  <span className={levelBadgeClass(inc.level)}>{inc.level}</span>
                </td>
                <td className="font-mono text-[10px] text-foreground/80 py-2">{inc.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentTable;
