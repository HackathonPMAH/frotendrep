import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

const DATA = [
  { time: "00:00", density: 20 }, { time: "02:00", density: 15 },
  { time: "04:00", density: 10 }, { time: "06:00", density: 25 },
  { time: "08:00", density: 45 }, { time: "10:00", density: 65 },
  { time: "12:00", density: 80 }, { time: "14:00", density: 70 },
  { time: "16:00", density: 55 }, { time: "18:00", density: 75 },
  { time: "20:00", density: 60 }, { time: "22:00", density: 35 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-lg px-3 py-2">
      <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm text-neon-purple">{payload[0].value}%</p>
    </div>
  );
};

const DensityChart = () => (
  <div className="glass-panel rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <Activity className="w-4 h-4 text-neon-purple" />
      <span className="font-mono text-[11px] text-muted-foreground tracking-wider">DENSITY TIMELINE — 24H</span>
    </div>
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={DATA}>
        <defs>
          <linearGradient id="densityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#c084fc" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="hsl(270 20% 20% / 0.6)" strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fill: "#6b5f80", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#6b5f80", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="density" stroke="#c084fc" strokeWidth={2} fill="url(#densityGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default DensityChart;
