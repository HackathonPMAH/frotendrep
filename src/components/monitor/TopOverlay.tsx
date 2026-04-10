import { useState, useEffect } from "react";
import { Radio } from "lucide-react";

interface Props {
  isAnalyzing: boolean;
}

const TopOverlay = ({ isAnalyzing }: Props) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const clock = time.toLocaleTimeString("en-US", { hour12: false });

  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-pulse" style={{ boxShadow: "0 0 8px #00f0ff" }} />
        <span className="font-bold text-sm tracking-wider text-foreground">CROWDPULSE AI</span>
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest">PANIC PREDICTION SYSTEM</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="glass-panel rounded-full px-3 py-1 flex items-center gap-2">
          <Radio className="w-3 h-3 text-neon-red animate-pulse" />
          <span className="font-mono text-[10px] text-neon-red">LIVE FEED</span>
        </div>
        <div className="glass-panel rounded-full px-3 py-1">
          <span className="font-mono text-[10px] text-muted-foreground">{clock}</span>
        </div>
        {isAnalyzing && (
          <div className="glass-panel rounded-full px-3 py-1">
            <span className="font-mono text-[10px] text-neon-cyan">ANALYZING</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopOverlay;
