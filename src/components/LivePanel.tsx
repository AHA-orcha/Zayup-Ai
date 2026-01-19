import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Terminal, Clock, Trash2 } from "lucide-react";
import { OrderItem } from "./OrderSummary";
import { LogEntry } from "./AdminPanel";

interface LivePanelProps {
  orderItems: OrderItem[];
  logs: LogEntry[];
  isVisible: boolean;
}

const LivePanel = ({ orderItems, logs, isVisible }: LivePanelProps) => {
  const total = orderItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed right-6 top-24 bottom-6 w-80 flex flex-col gap-4 z-40"
        >
          {/* Order Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Live Order</span>
              {orderItems.length > 0 && (
                <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {orderItems.length} items
                </span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {orderItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-6 text-center text-muted-foreground text-sm"
                  >
                    Items will appear here as you order
                  </motion.div>
                ) : (
                  orderItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="px-4 py-3 border-b border-border/20 last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          {item.modification && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.modification}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-primary">${item.price.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {orderItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-3 bg-primary/10 border-t border-primary/20"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Live Logs Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">System Logs</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
              <AnimatePresence mode="popLayout">
                {logs.length === 0 ? (
                  <div className="px-2 py-4 text-center text-muted-foreground">
                    Logs will stream here...
                  </div>
                ) : (
                  logs.slice(-20).map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-2 py-1.5 rounded hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
                        <span className={`shrink-0 font-semibold ${
                          log.type === "MCP" ? "text-primary" :
                          log.type === "API" ? "text-green-400" :
                          log.type === "SYSTEM" ? "text-yellow-400" :
                          "text-muted-foreground"
                        }`}>
                          [{log.type}]
                        </span>
                        <span className="text-foreground/80 break-all">{log.message}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LivePanel;
