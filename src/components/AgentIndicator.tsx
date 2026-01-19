import { motion, AnimatePresence } from "framer-motion";
import { Bot, Utensils, ArrowRight } from "lucide-react";

interface AgentIndicatorProps {
  currentAgent: "intro" | "demo";
  isActive: boolean;
}

const AgentIndicator = ({ currentAgent, isActive }: AgentIndicatorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex items-center gap-4"
    >
      {/* Intro Agent */}
      <motion.div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-500 ${
          currentAgent === "intro" && isActive
            ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20"
            : "bg-secondary/30 border border-border/30"
        }`}
        animate={currentAgent === "intro" && isActive ? {
          scale: [1, 1.02, 1],
        } : { scale: 1 }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className={`p-2 rounded-xl ${
          currentAgent === "intro" && isActive ? "bg-primary/30" : "bg-muted/50"
        }`}>
          <Bot className={`w-5 h-5 ${
            currentAgent === "intro" && isActive ? "text-primary" : "text-muted-foreground"
          }`} />
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-semibold ${
            currentAgent === "intro" && isActive ? "text-primary text-glow" : "text-muted-foreground"
          }`}>
            Zayup AI
          </span>
          <span className="text-xs text-muted-foreground">Introduction</span>
        </div>
        {currentAgent === "intro" && isActive && (
          <motion.div
            className="w-2 h-2 rounded-full bg-primary ml-2"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Arrow */}
      <motion.div
        animate={isActive ? { x: [0, 5, 0] } : { x: 0 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ArrowRight className={`w-5 h-5 ${
          isActive ? "text-primary/50" : "text-muted-foreground/30"
        }`} />
      </motion.div>

      {/* Demo Agent */}
      <motion.div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-500 ${
          currentAgent === "demo" && isActive
            ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20"
            : "bg-secondary/30 border border-border/30"
        }`}
        animate={currentAgent === "demo" && isActive ? {
          scale: [1, 1.02, 1],
        } : { scale: 1 }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className={`p-2 rounded-xl ${
          currentAgent === "demo" && isActive ? "bg-primary/30" : "bg-muted/50"
        }`}>
          <Utensils className={`w-5 h-5 ${
            currentAgent === "demo" && isActive ? "text-primary" : "text-muted-foreground"
          }`} />
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-semibold ${
            currentAgent === "demo" && isActive ? "text-primary text-glow" : "text-muted-foreground"
          }`}>
            Ava
          </span>
          <span className="text-xs text-muted-foreground">Restaurant Demo</span>
        </div>
        {currentAgent === "demo" && isActive && (
          <motion.div
            className="w-2 h-2 rounded-full bg-primary ml-2"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default AgentIndicator;
