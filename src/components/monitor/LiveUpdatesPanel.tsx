import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, TrendingUp, AlertTriangle, Navigation } from "lucide-react";

export interface LiveUpdate {
  id: number;
  type: "density" | "congestion" | "evacuation" | "general";
  message: string;
  timestamp: string;
}

const ICONS = {
  density: TrendingUp,
  congestion: AlertTriangle,
  evacuation: Navigation,
  general: Activity,
};

interface Props {
  updates: LiveUpdate[];
}

const LiveUpdatesPanel = ({ updates }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [updates]);

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-neon-cyan" />
        <span className="font-mono text-[11px] text-muted-foreground tracking-wider">LIVE UPDATES</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 min-h-0">
        <AnimatePresence>
          {updates.map((u) => {
            const Icon = ICONS[u.type];
            return (
              <motion.div
                key={u.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
              >
                <Icon className="w-3 h-3 mt-0.5 text-neon-purple shrink-0" />
                <div>
                  <span className="font-mono text-[10px] text-muted-foreground">{u.timestamp}</span>
                  <p className="text-[11px] text-foreground/80">{u.message}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {updates.length === 0 && (
          <p className="text-[11px] text-muted-foreground font-mono text-center py-4">Awaiting analysis...</p>
        )}
      </div>
    </div>
  );
};

export default LiveUpdatesPanel;
