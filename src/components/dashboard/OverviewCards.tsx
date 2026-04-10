import { motion } from "framer-motion";
import { AlertTriangle, BarChart3, Shield, TrendingUp } from "lucide-react";
import type { DashboardOverviewCard } from "@/lib/api";

const CARD_META = [
  { icon: Shield, color: "bg-neon-red/15 text-neon-red" },
  { icon: TrendingUp, color: "bg-neon-yellow/15 text-neon-yellow" },
  { icon: BarChart3, color: "bg-neon-purple/15 text-neon-purple" },
  { icon: AlertTriangle, color: "bg-neon-red/15 text-neon-red" },
] as const;

const FALLBACK: (DashboardOverviewCard & (typeof CARD_META)[number])[] = [
  { label: "Highest Risk", value: "87", icon: Shield, color: "bg-neon-red/15 text-neon-red", trend: "+12%", trendUp: true },
  { label: "Avg Risk Score", value: "54", icon: TrendingUp, color: "bg-neon-yellow/15 text-neon-yellow", trend: "+3%", trendUp: true },
  { label: "Total Analyses", value: "128", icon: BarChart3, color: "bg-neon-purple/15 text-neon-purple", trend: "+24", trendUp: true },
  { label: "Critical Alerts", value: "23", icon: AlertTriangle, color: "bg-neon-red/15 text-neon-red", trend: "-5%", trendUp: false },
];

function mergeCards(api?: DashboardOverviewCard[]) {
  if (!api?.length) return FALLBACK;
  return api.map((c, i) => ({
    ...c,
    icon: CARD_META[i % CARD_META.length].icon,
    color: CARD_META[i % CARD_META.length].color,
  }));
}

interface Props {
  cards?: DashboardOverviewCard[];
  isLoading?: boolean;
}

const OverviewCards = ({ cards, isLoading }: Props) => {
  const merged = mergeCards(cards);

  return (
    <div className={`grid grid-cols-4 gap-4 transition-opacity ${isLoading ? "opacity-75" : "opacity-100"}`}>
      {merged.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -3 }}
          className="glass-panel rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                card.trendUp ? "bg-neon-red/10 text-neon-red" : "bg-neon-green/10 text-neon-green"
              }`}
            >
              {card.trend}
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-foreground">{card.value}</p>
          <p className="text-[11px] font-mono text-muted-foreground mt-1">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default OverviewCards;
