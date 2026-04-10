import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const FALLBACK = [
  { time: "0:00", s1: 10, s2: 15, s3: 5 },
  { time: "0:30", s1: 25, s2: 20, s3: 18 },
  { time: "1:00", s1: 35, s2: 30, s3: 28 },
  { time: "1:30", s1: 50, s2: 42, s3: 35 },
  { time: "2:00", s1: 65, s2: 55, s3: 48 },
  { time: "2:30", s1: 72, s2: 68, s3: 52 },
  { time: "3:00", s1: 80, s2: 75, s3: 60 },
  { time: "3:30", s1: 85, s2: 80, s3: 70 },
  { time: "4:00", s1: 90, s2: 85, s3: 78 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-lg px-3 py-2">
      <p className="font-mono text-[10px] text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-mono text-[11px]" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

interface Props {
  data?: { time: string; s1: number; s2: number; s3: number }[];
  isLoading?: boolean;
}

const RiskHistoryChart = ({ data, isLoading }: Props) => {
  const chartData = data?.length ? data : FALLBACK;

  return (
    <div className={`glass-panel rounded-xl p-5 transition-opacity ${isLoading ? "opacity-75" : "opacity-100"}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-neon-purple" />
        <span className="font-mono text-[11px] text-muted-foreground tracking-wider">RISK HISTORY — 3 SESSIONS</span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="hsl(270 20% 20% / 0.6)" strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fill: "#6b5f80", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b5f80", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} iconSize={8} />
          <Line type="monotone" dataKey="s1" name="Session 1" stroke="#c084fc" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="s2" name="Session 2" stroke="#a855f7" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="s3" name="Session 3" stroke="#facc15" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskHistoryChart;
