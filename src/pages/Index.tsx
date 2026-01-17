import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import ClientPane from "@/components/ClientPane";
import AdminPanel, { Order, LogEntry } from "@/components/AdminPanel";
import { OrderItem } from "@/components/OrderSummary";

const DEMO_ITEMS: OrderItem[] = [
  { id: "1", name: "Double Cheeseburger", modification: "No onions, extra pickles", price: 12.99 },
  { id: "2", name: "Large Fries", modification: "Seasoned", price: 4.99 },
  { id: "3", name: "Chocolate Milkshake", price: 5.99 },
];

const DEMO_LOGS: Omit<LogEntry, "id">[] = [
  { timestamp: "12:34:01", type: "SYSTEM", message: "Voice agent initialized" },
  { timestamp: "12:34:03", type: "MCP", message: "order-start triggered" },
  { timestamp: "12:34:08", type: "API", message: "Menu data fetched successfully" },
  { timestamp: "12:34:15", type: "MCP", message: "item-add: Double Cheeseburger" },
  { timestamp: "12:34:22", type: "MCP", message: "item-modify: No onions, extra pickles" },
  { timestamp: "12:34:30", type: "MCP", message: "item-add: Large Fries" },
  { timestamp: "12:34:38", type: "MCP", message: "item-add: Chocolate Milkshake" },
  { timestamp: "12:34:45", type: "API", message: "Order validated" },
  { timestamp: "12:34:48", type: "MCP", message: "email-capture triggered" },
  { timestamp: "12:34:55", type: "API", message: "Data Sync Complete" },
  { timestamp: "12:35:02", type: "MCP", message: "order-accept triggered" },
];

const Index = () => {
  const [status, setStatus] = useState<"idle" | "listening" | "processing">("idle");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showEmail, setShowEmail] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const addLog = useCallback((log: Omit<LogEntry, "id">) => {
    setLogs(prev => [...prev, { ...log, id: Date.now().toString() }]);
  }, []);

  const addOrderItem = useCallback((item: OrderItem) => {
    setOrderItems(prev => [...prev, item]);
  }, []);

  const addOrder = useCallback((order: Omit<Order, "id">) => {
    setOrders(prev => [
      { ...order, id: (1001 + prev.length).toString(), isNew: true },
      ...prev.map(o => ({ ...o, isNew: false }))
    ]);
  }, []);

  const runDemo = useCallback(() => {
    setStatus("listening");
    setDemoStep(1);
  }, []);

  useEffect(() => {
    if (demoStep === 0) return;

    const timeouts: NodeJS.Timeout[] = [];

    // Step 1: Initial logs
    if (demoStep === 1) {
      timeouts.push(setTimeout(() => addLog(DEMO_LOGS[0]), 500));
      timeouts.push(setTimeout(() => addLog(DEMO_LOGS[1]), 1500));
      timeouts.push(setTimeout(() => addLog(DEMO_LOGS[2]), 2500));
      timeouts.push(setTimeout(() => setDemoStep(2), 3000));
    }

    // Step 2: Add items
    if (demoStep === 2) {
      timeouts.push(setTimeout(() => {
        setStatus("processing");
        addLog(DEMO_LOGS[3]);
      }, 500));
      timeouts.push(setTimeout(() => {
        addLog(DEMO_LOGS[4]);
        addOrderItem(DEMO_ITEMS[0]);
        setStatus("listening");
      }, 1500));
      timeouts.push(setTimeout(() => {
        setStatus("processing");
        addLog(DEMO_LOGS[5]);
      }, 3000));
      timeouts.push(setTimeout(() => {
        addOrderItem(DEMO_ITEMS[1]);
        setStatus("listening");
      }, 4000));
      timeouts.push(setTimeout(() => {
        setStatus("processing");
        addLog(DEMO_LOGS[6]);
      }, 5500));
      timeouts.push(setTimeout(() => {
        addOrderItem(DEMO_ITEMS[2]);
        setStatus("listening");
      }, 6500));
      timeouts.push(setTimeout(() => setDemoStep(3), 7500));
    }

    // Step 3: Email capture
    if (demoStep === 3) {
      timeouts.push(setTimeout(() => {
        setStatus("processing");
        addLog(DEMO_LOGS[7]);
      }, 500));
      timeouts.push(setTimeout(() => {
        addLog(DEMO_LOGS[8]);
        setShowEmail(true);
        setStatus("listening");
      }, 1500));
      timeouts.push(setTimeout(() => setDemoStep(4), 3000));
    }

    // Step 4: Complete order
    if (demoStep === 4) {
      timeouts.push(setTimeout(() => {
        setStatus("processing");
        addLog(DEMO_LOGS[9]);
      }, 500));
      timeouts.push(setTimeout(() => {
        addLog(DEMO_LOGS[10]);
        addOrder({
          items: orderItems.map(i => i.name),
          status: "pending",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        setStatus("idle");
      }, 2000));
    }

    return () => timeouts.forEach(clearTimeout);
  }, [demoStep, addLog, addOrderItem, addOrder, orderItems]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 pt-20 flex flex-col lg:flex-row">
        {/* Client Pane */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:w-[40%] min-h-[60vh] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-border/30"
        >
          <ClientPane
            isActive={status !== "idle"}
            status={status}
            showEmail={showEmail}
            orderItems={orderItems}
            onStartDemo={runDemo}
          />
        </motion.div>
        
        {/* Admin Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:w-[60%] min-h-[40vh] lg:min-h-0 glass"
        >
          <AdminPanel orders={orders} logs={logs} />
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
