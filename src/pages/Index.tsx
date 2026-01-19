import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu } from "lucide-react";
import VoiceOrb from "@/components/VoiceOrb";
import AgentIndicator from "@/components/AgentIndicator";
import BackgroundEffects from "@/components/BackgroundEffects";
import LivePanel from "@/components/LivePanel";
import EmailCapture from "@/components/EmailCapture";
import { OrderItem } from "@/components/OrderSummary";
import { LogEntry } from "@/components/AdminPanel";
import { useVapi, VapiStatus } from "@/hooks/useVapi";

// Your Vapi Assistant IDs
const INTRO_ASSISTANT_ID = ""; // Zayup intro bot (add ID when ready)
const DEMO_ASSISTANT_ID = "c8951f28-76ac-4c9e-ba73-b51fb6b8af6f"; // Demo bot with MCP tools

const Index = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showEmail, setShowEmail] = useState(false);
  const [currentAssistant, setCurrentAssistant] = useState<"intro" | "demo">("demo");

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    setLogs(prev => [...prev.slice(-50), { id: Date.now().toString(), timestamp, type, message }]);
  }, []);

  const addOrderItem = useCallback((item: OrderItem) => {
    setOrderItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
    addLog("MCP", `item-add: ${item.name}`);
  }, [addLog]);

  // Handle MCP function calls from Vapi
  const handleFunctionCall = useCallback((name: string, params: Record<string, unknown>) => {
    addLog("MCP", `${name} called`);

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
        addLog("MCP", `Modified: ${params.item_name || params.name}`);
        break;

      case "remove_item":
      case "remove-item":
      case "removeItem":
        setOrderItems(prev => prev.filter(item => 
          item.name !== (params.item_name as string || params.name as string)
        ));
        addLog("MCP", `Removed: ${params.item_name || params.name}`);
        break;

      case "capture_email":
      case "capture-email":
      case "captureEmail":
      case "show_email":
      case "showEmail":
      case "trigger_email_input":
        setShowEmail(true);
        addLog("MCP", "Email capture triggered");
        break;

      case "place_order":
      case "place-order":
      case "placeOrder":
      case "submit_order":
      case "submitOrder":
      case "order-validate":
        addLog("API", "Order validated & submitted");
        addLog("SYSTEM", "Sending receipt email...");
        break;

      case "switch_to_demo":
      case "switchToDemo":
      case "transfer_to_demo":
        setCurrentAssistant("demo");
        addLog("SYSTEM", "Switching to demo agent...");
        break;

      case "menu-export":
      case "menuExport":
        addLog("MCP", "Menu data exported to agent");
        break;

      default:
        addLog("MCP", `Function: ${name}`);
    }
  }, [addOrderItem, addLog]);

  const { status, startCall, stopCall } = useVapi({
    onCallStart: () => {
      addLog("SYSTEM", `Connected to ${currentAssistant === "intro" ? "Zayup AI" : "Ava"}`);
    },
    onCallEnd: () => {
      addLog("SYSTEM", "Call ended");
    },
    onSpeechStart: () => {
      addLog("SYSTEM", "Listening...");
    },
    onSpeechEnd: () => {
      addLog("SYSTEM", "Processing...");
    },
    onFunctionCall: handleFunctionCall,
    onMessage: (message) => {
      if (message.type === "transcript" && message.role === "assistant") {
        const preview = message.transcript?.substring(0, 40) || "";
        addLog("API", `Response: ${preview}...`);
      }
    },
    onError: (error) => {
      addLog("SYSTEM", `Error: ${error.message}`);
    },
  });

  const handleStartCall = useCallback(() => {
    const assistantId = currentAssistant === "intro" && INTRO_ASSISTANT_ID 
      ? INTRO_ASSISTANT_ID 
      : DEMO_ASSISTANT_ID;
    startCall(assistantId);
    addLog("SYSTEM", "Initiating connection...");
  }, [currentAssistant, startCall, addLog]);

  const handleStopCall = useCallback(() => {
    stopCall();
    setOrderItems([]);
    setShowEmail(false);
  }, [stopCall]);

  const isActive = status !== "idle";

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background Effects */}
      <BackgroundEffects isActive={isActive} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">
                Zayup<span className="text-primary">.ai</span>
              </span>
              <p className="text-xs text-muted-foreground">Voice-First CRM Automation</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden md:block"
          >
            <AgentIndicator currentAgent={currentAssistant} isActive={isActive} />
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content - Centered Orb */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        {/* Agent Indicator for Mobile */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:hidden mb-8"
        >
          <AgentIndicator currentAgent={currentAssistant} isActive={isActive} />
        </motion.div>

        {/* Voice Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20, delay: 0.2 }}
        >
          <VoiceOrb
            isActive={isActive}
            status={status}
            currentAgent={currentAssistant}
            onStart={handleStartCall}
            onStop={handleStopCall}
          />
        </motion.div>

        {/* Email Capture Overlay */}
        <AnimatePresence>
          {showEmail && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              <EmailCapture isVisible={showEmail} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center max-w-md"
        >
          <p className="text-muted-foreground text-sm leading-relaxed">
            Experience the future of restaurant ordering. Our AI agents handle calls, 
            take orders, and process payments — all through natural conversation.
          </p>
        </motion.div>
      </main>

      {/* Live Panel - Shows order & logs when active */}
      <LivePanel
        orderItems={orderItems}
        logs={logs}
        isVisible={isActive}
      />
    </div>
  );
};

export default Index;
