const ITEMS = [
  { color: "#22c55e", label: "Safe Zone" },
  { color: "#facc15", label: "Least Critical" },
  { color: "#f97316", label: "Less Critical" },
  { color: "#ef4444", label: "Critical" },
  { color: "#a855f7", label: "Exit Place" },
];

const MapLegend = () => (
  <div className="flex items-center justify-center gap-6 py-2 px-4 bg-background/60 backdrop-blur-sm border-t border-b border-border/40">
    {ITEMS.map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
        />
        <span className="font-mono text-[10px] text-muted-foreground">{item.label}</span>
      </div>
    ))}
  </div>
);

export default MapLegend;
