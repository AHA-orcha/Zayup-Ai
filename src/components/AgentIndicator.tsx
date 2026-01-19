import { Bot, Utensils, ArrowRight } from "lucide-react";

interface AgentIndicatorProps {
  currentAgent: "intro" | "demo";
  isActive: boolean;
}

const AgentIndicator = ({ currentAgent, isActive }: AgentIndicatorProps) => {
  return (
    <div className="flex items-center gap-4">
      {/* Intro Agent */}
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
          currentAgent === "intro" && isActive
            ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20"
            : "bg-secondary/30 border border-border/30"
        }`}
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
            currentAgent === "intro" && isActive ? "text-primary" : "text-muted-foreground"
          }`}>
            Zayup AI
          </span>
          <span className="text-xs text-muted-foreground">Introduction</span>
        </div>
        {currentAgent === "intro" && isActive && (
          <span className="w-2 h-2 rounded-full bg-primary ml-2" />
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className={`w-5 h-5 ${
        isActive ? "text-primary/50" : "text-muted-foreground/30"
      }`} />

      {/* Demo Agent */}
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
          currentAgent === "demo" && isActive
            ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20"
            : "bg-secondary/30 border border-border/30"
        }`}
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
            currentAgent === "demo" && isActive ? "text-primary" : "text-muted-foreground"
          }`}>
            Ava
          </span>
          <span className="text-xs text-muted-foreground">Restaurant Demo</span>
        </div>
        {currentAgent === "demo" && isActive && (
          <span className="w-2 h-2 rounded-full bg-primary ml-2" />
        )}
      </div>
    </div>
  );
};

export default AgentIndicator;
