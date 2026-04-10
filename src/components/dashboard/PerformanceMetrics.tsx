import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

const BAR_DATA = [
  { name: "Avg Evacuation", value: 4.2 },
  { name: "Response Time", value: 2.8 },
  { name: "Detection Time", value: 1.5 },
];

const PIE_DATA = [
  { name: "Gate A", value: 35 },
  { name: "Gate B", value: 28 },
  { name: "Gate C", value: 22 },
  { name: "Gate D", value: 15 },
];

const PIE_COLORS = ["#c084fc", "#a855f7", "#facc15", "#22c55e"];
const BAR_COLORS = ["#c084fc", "#a855f7", "#facc15"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-lg px-3 py-2">
      <p className="font-mono text-[11px] text-foreground">{payload[0].payload.name}: {payload[0].value}</p>
    </div>
  );
};

const PerformanceMetrics = () => (
  <div className="grid grid-cols-2 gap-6">
    {/* Bar Chart */}
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-neon-purple" />
        <span className="font-mono text-[11px] text-muted-foreground tracking-wider">RESPONSE TIMES (MIN)</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={BAR_DATA} layout="vertical">
          <CartesianGrid stroke="hsl(270 20% 20% / 0.6)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#6b5f80", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fill: "#6b5f80", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={110} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
            {BAR_DATA.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Pie Chart */}
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-neon-purple" />
        <span className="font-mono text-[11px] text-muted-foreground tracking-wider">EXIT GATE USAGE</span>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
              {PIE_DATA.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {PIE_DATA.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
              <span className="font-mono text-[10px] text-muted-foreground">{d.name}</span>
              <span className="font-mono text-[10px] text-foreground">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default PerformanceMetrics;
