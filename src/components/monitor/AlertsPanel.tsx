import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export interface Alert {
  id: number;
  message: string;
  timestamp: string;
}

interface Props {
  alerts: Alert[];
}

const AlertsPanel = ({ alerts }: Props) => (
  <div className="glass-panel rounded-xl p-4 flex flex-col flex-1 min-h-0">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-neon-red" />
        <span className="font-mono text-[11px] text-muted-foreground tracking-wider">CRITICAL ALERTS</span>
      </div>
      {alerts.length > 0 && (
        <span className="font-mono text-[10px] bg-neon-red/15 text-neon-red px-2 py-0.5 rounded-full">
          {alerts.length}
        </span>
      )}
    </div>
    <div className="space-y-2 max-h-40 overflow-y-auto">
      <AnimatePresence>
        {alerts.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 rounded-lg bg-neon-red/10 border border-neon-red/20"
          >
            <span className="font-mono text-[10px] text-neon-red/70">{a.timestamp}</span>
            <p className="text-[11px] text-neon-red">{a.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
      {alerts.length === 0 && (
        <p className="text-[11px] text-muted-foreground font-mono text-center py-3">No critical alerts</p>
      )}
    </div>
  </div>
);

export default AlertsPanel;
