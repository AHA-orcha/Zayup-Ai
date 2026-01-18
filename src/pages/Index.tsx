import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import ClientPane from "@/components/ClientPane";
import AdminPanel, { Order, LogEntry } from "@/components/AdminPanel";
import { OrderItem } from "@/components/OrderSummary";
import { useVapi, VapiStatus } from "@/hooks/useVapi";

// Your Vapi Assistant IDs - replace these with your actual IDs
const INTRO_ASSISTANT_ID = "your-intro-assistant-id"; // Zayup intro bot
const DEMO_ASSISTANT_ID = "your-demo-assistant-id";   // Demo bot with MCP tools

const Index = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showEmail, setShowEmail] = useState(false);
  const [currentAssistant, setCurrentAssistant] = useState<"intro" | "demo">("intro");

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    setLogs(prev => [...prev, { id: Date.now().toString(), timestamp, type, message }]);
  }, []);

  const addOrderItem = useCallback((item: OrderItem) => {
    setOrderItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
    addLog("MCP", `item-add: ${item.name}`);
  }, [addLog]);

  const addOrder = useCallback((items: string[]) => {
    setOrders(prev => [
      { 
        id: (1001 + prev.length).toString(), 
        items, 
        status: "pending", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true 
      },
      ...prev.map(o => ({ ...o, isNew: false }))
    ]);
    addLog("MCP", "order-accept triggered");
  }, [addLog]);

  // Handle MCP function calls from Vapi
  const handleFunctionCall = useCallback((name: string, params: Record<string, unknown>) => {
    addLog("MCP", `${name} triggered`);

    switch (name) {
      case "add_item":
      case "add-item":
      case "addItem":
        addOrderItem({
          id: "",
          name: params.name as string || params.item_name as string,
          modification: params.modification as string,
          price: params.price as number || 0,
        });
        break;

      case "modify_item":
      case "modify-item":
      case "modifyItem":
        setOrderItems(prev => prev.map(item => 
          item.name === (params.item_name as string || params.name as string)
            ? { ...item, modification: params.modification as string }
            : item
        ));
        break;

      case "remove_item":
      case "remove-item":
      case "removeItem":
        setOrderItems(prev => prev.filter(item => 
          item.name !== (params.item_name as string || params.name as string)
        ));
        break;

      case "capture_email":
      case "capture-email":
      case "captureEmail":
      case "show_email":
      case "showEmail":
        setShowEmail(true);
        addLog("MCP", "email-capture triggered");
        break;

      case "place_order":
      case "place-order":
      case "placeOrder":
      case "submit_order":
      case "submitOrder":
        addOrder(orderItems.map(i => i.name));
        addLog("API", "Order submitted to Restarage");
        break;

      case "switch_to_demo":
      case "switchToDemo":
      case "transfer_to_demo":
        // Switch from intro bot to demo bot
        setCurrentAssistant("demo");
        addLog("SYSTEM", "Switching to demo assistant...");
        // The actual switch happens via stopCall + startCall
        break;

      default:
        addLog("MCP", `Unknown function: ${name}`);
    }
  }, [addOrderItem, addOrder, orderItems, addLog]);

  const { status, startCall, stopCall } = useVapi({
    onCallStart: () => {
      addLog("SYSTEM", `${currentAssistant === "intro" ? "Intro" : "Demo"} voice agent connected`);
    },
    onCallEnd: () => {
      addLog("SYSTEM", "Voice agent disconnected");
    },
    onSpeechStart: () => {
      addLog("SYSTEM", "User speaking...");
    },
    onSpeechEnd: () => {
      addLog("SYSTEM", "Processing speech...");
    },
    onFunctionCall: handleFunctionCall,
    onMessage: (message) => {
      if (message.type === "transcript" && message.role === "assistant") {
        addLog("API", `Ava: ${message.transcript?.substring(0, 50)}...`);
      }
    },
    onError: (error) => {
      addLog("SYSTEM", `Error: ${error.message}`);
    },
  });

  const handleStartDemo = useCallback(() => {
    const assistantId = currentAssistant === "intro" ? INTRO_ASSISTANT_ID : DEMO_ASSISTANT_ID;
    startCall(assistantId);
    addLog("SYSTEM", "Initializing voice connection...");
  }, [currentAssistant, startCall, addLog]);

  const handleStopDemo = useCallback(() => {
    stopCall();
    setOrderItems([]);
    setShowEmail(false);
  }, [stopCall]);

  // Map Vapi status to our UI status
  const uiStatus: "idle" | "listening" | "processing" = 
    status === "connecting" ? "processing" : 
    status === "idle" ? "idle" : 
    status;

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
            status={uiStatus}
            showEmail={showEmail}
            orderItems={orderItems}
            onStartDemo={handleStartDemo}
            onStopDemo={handleStopDemo}
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
