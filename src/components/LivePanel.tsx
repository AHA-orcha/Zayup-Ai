import { ShoppingCart, Terminal, MessageSquare } from "lucide-react";
import { OrderItem } from "./OrderSummary";
import { LogEntry } from "./AdminPanel";
import { useRef, useEffect } from "react";

interface LivePanelProps {
  orderItems: OrderItem[];
  logs: LogEntry[];
  isVisible: boolean;
  transcript?: { role: "user" | "assistant"; text: string }[];
}

const LivePanel = ({ orderItems, logs, isVisible, transcript = [] }: LivePanelProps) => {
  const total = orderItems.reduce((sum, item) => sum + item.price, 0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="fixed right-4 top-20 bottom-4 w-80 flex flex-col gap-3 z-40">
      {/* Order Summary Card - Only show when there's a call or items */}
      {(isVisible || orderItems.length > 0) && (
        <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-border/50 overflow-hidden shadow-xl">
          <div className="px-4 py-2.5 border-b border-border/30 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Live Order</span>
            {orderItems.length > 0 && (
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {orderItems.length}
              </span>
            )}
          </div>

          <div className="max-h-36 overflow-y-auto">
            {orderItems.length === 0 ? (
              <div className="px-4 py-4 text-center text-muted-foreground text-xs">
                Order items appear here
              </div>
            ) : (
              orderItems.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-2 border-b border-border/20 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      {item.modification && (
                        <p className="text-xs text-muted-foreground">{item.modification}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-primary">${item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {orderItems.length > 0 && (
            <div className="px-4 py-2 bg-primary/10 border-t border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transcript Card - Show during call */}
      {isVisible && (
        <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-border/50 overflow-hidden shadow-xl">
          <div className="px-4 py-2.5 border-b border-border/30 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Transcript</span>
          </div>

          <div className="max-h-32 overflow-y-auto p-3 space-y-2">
            {transcript.length === 0 ? (
              <div className="text-center text-muted-foreground text-xs py-2">
                Conversation will appear here...
              </div>
            ) : (
              transcript.slice(-10).map((msg, i) => (
                <div
                  key={i}
                  className={`text-xs px-2 py-1 rounded ${
                    msg.role === "user" 
                      ? "bg-secondary/50 text-foreground" 
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <span className="font-medium">{msg.role === "user" ? "You" : "Ava"}:</span>{" "}
                  {msg.text}
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}

      {/* Live Logs Card - Always visible */}
      <div className="flex-1 bg-card/90 backdrop-blur-xl rounded-xl border border-border/50 overflow-hidden flex flex-col shadow-xl min-h-[200px]">
        <div className="px-4 py-2.5 border-b border-border/30 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Backend Logs</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
        </div>

        <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed">
          {logs.length === 0 ? (
            <div className="px-2 py-4 text-center text-muted-foreground text-xs">
              Backend activity will stream here...
            </div>
          ) : (
            logs.slice(-30).map((log) => (
              <div
                key={log.id}
                className="px-2 py-1 rounded hover:bg-secondary/20"
              >
                <div className="flex items-start gap-1.5">
                  <span className="text-muted-foreground/70 shrink-0">{log.timestamp}</span>
                  <span className={`shrink-0 font-bold ${
                    log.type === "MCP" ? "text-primary" :
                    log.type === "API" ? "text-emerald-400" :
                    log.type === "SYSTEM" ? "text-amber-400" :
                    "text-muted-foreground"
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-foreground/80 break-all">{log.message}</span>
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LivePanel;
