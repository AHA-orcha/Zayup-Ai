import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2 } from "lucide-react";

interface StatusBarProps {
  status: "idle" | "listening" | "processing";
}

const StatusBar = ({ status }: StatusBarProps) => {
  const getStatusText = () => {
    switch (status) {
      case "listening":
        return "Ava is listening...";
      case "processing":
        return "Ava is processing...";
      default:
        return "Click Start Demo to begin";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "listening":
        return <Mic className="w-4 h-4" />;
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center justify-center gap-2"
      >
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full glass ${
          status !== "idle" ? "border border-primary/30" : "border border-border/30"
        }`}>
          {status !== "idle" && (
            <motion.span
              className="text-primary"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {getIcon()}
            </motion.span>
          )}
          <span className={`text-sm font-medium ${
            status !== "idle" ? "text-primary text-glow" : "text-muted-foreground"
          }`}>
            {getStatusText()}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusBar;
