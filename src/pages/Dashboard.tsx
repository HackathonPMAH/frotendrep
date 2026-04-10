import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Radio } from "lucide-react";
import OverviewCards from "@/components/dashboard/OverviewCards";
import DensityChart from "@/components/dashboard/DensityChart";
import RiskHistoryChart from "@/components/dashboard/RiskHistoryChart";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import IncidentTable from "@/components/dashboard/IncidentTable";
import { fetchDashboard } from "@/lib/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 5000,
  });

  const busy = isPending || isFetching;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 glass-panel border-b border-border/50">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div>
              <h1 className="font-bold text-sm tracking-wider text-foreground">ANALYTICS DASHBOARD</h1>
              <p className="font-mono text-[10px] text-muted-foreground tracking-widest">CROWDPULSE AI — AGGREGATED INTELLIGENCE</p>
            </div>
          </div>
          <div className="flex items-center gap-2 border border-neon-purple/40 bg-neon-purple/10 rounded-full px-3 py-1">
            <Radio className="w-3 h-3 text-neon-purple animate-pulse" />
            <span className="font-mono text-[10px] text-neon-purple">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {isError && (
          <div className="glass-panel rounded-lg px-4 py-3 flex items-center justify-between gap-3 border border-neon-red/30">
            <p className="font-mono text-[11px] text-neon-red">Could not load live dashboard data.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="font-mono text-[10px] px-3 py-1 rounded-md border border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10"
            >
              Retry
            </button>
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <OverviewCards cards={data?.overviewCards} isLoading={busy} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <DensityChart data={data?.densityTimeline} isLoading={busy} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <RiskHistoryChart data={data?.riskHistory} isLoading={busy} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <PerformanceMetrics
            responseTimes={data?.performance?.responseTimes}
            exitGateUsage={data?.performance?.exitGateUsage}
            isLoading={busy}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <IncidentTable incidents={data?.incidents} isLoading={busy} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
