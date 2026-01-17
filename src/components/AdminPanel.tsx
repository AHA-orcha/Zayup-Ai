import { motion, AnimatePresence } from "framer-motion";
import { Server, Package, Terminal } from "lucide-react";

export interface Order {
  id: string;
  items: string[];
  status: "pending" | "preparing" | "ready";
  time: string;
  isNew?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "MCP" | "API" | "SYSTEM";
  message: string;
}

interface AdminPanelProps {
  orders: Order[];
  logs: LogEntry[];
}

const AdminPanel = ({ orders, logs }: AdminPanelProps) => {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "preparing":
        return "bg-primary/20 text-primary border-primary/30";
      case "ready":
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  const getLogTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "MCP":
        return "text-primary";
      case "API":
        return "text-green-400";
      case "SYSTEM":
        return "text-yellow-400";
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <Server className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Restarage Admin Panel
        </h2>
        <span className="text-xs px-2 py-1 rounded-full glass border border-primary/20 text-primary">
          Sandbox Environment
        </span>
      </motion.div>

      {/* Order Queue */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Order Queue</span>
        </div>
        
        <div className="flex-1 overflow-auto glass rounded-2xl p-3 border border-border/30 space-y-2">
          <AnimatePresence mode="popLayout">
            {orders.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground text-center py-8"
              >
                No orders in queue
              </motion.p>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 rounded-xl border transition-all ${
                    order.isNew 
                      ? "border-primary bg-primary/10 animate-flash" 
                      : "border-border/30 bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Order #{order.id}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {order.items.join(", ")}
                    </p>
                    <span className="text-xs text-muted-foreground">{order.time}</span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* System Console */}
      <div className="h-48 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Live Logs</span>
        </div>
        
        <div className="flex-1 overflow-auto glass rounded-2xl p-3 border border-border/30 font-mono text-xs">
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="py-1"
              >
                <span className="text-muted-foreground">{log.timestamp}</span>
                <span className={`mx-2 ${getLogTypeColor(log.type)}`}>[{log.type}]</span>
                <span className="text-foreground">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
