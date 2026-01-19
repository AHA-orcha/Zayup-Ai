import { useState, useCallback } from "react";
import { Radio, Zap } from "lucide-react";
import VoiceOrb from "@/components/VoiceOrb";
import AgentIndicator from "@/components/AgentIndicator";
import BackgroundEffects from "@/components/BackgroundEffects";
import LivePanel from "@/components/LivePanel";
import EmailCapture from "@/components/EmailCapture";
import { OrderItem } from "@/components/OrderSummary";
import { LogEntry } from "@/components/AdminPanel";
import { useVapi } from "@/hooks/useVapi";

// Your Vapi Assistant IDs
const INTRO_ASSISTANT_ID = ""; // Zayup intro bot (add ID when ready)
const DEMO_ASSISTANT_ID = "c8951f28-76ac-4c9e-ba73-b51fb6b8af6f"; // Demo bot with MCP tools

const Index = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), type: "SYSTEM", message: "Voice system initialized" },
    { id: "2", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), type: "API", message: "Backend connection established" },
  ]);
  const [transcript, setTranscript] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
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
      setTranscript([]);
    },
    onCallEnd: () => {
      addLog("SYSTEM", "Call ended");
    },
    onSpeechStart: () => {
      // Don't spam logs with listening messages
    },
    onSpeechEnd: () => {
      addLog("SYSTEM", "Processing speech...");
    },
    onFunctionCall: handleFunctionCall,
    onMessage: (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const text = message.transcript || "";
        if (text.trim()) {
          setTranscript(prev => [...prev.slice(-20), { role: message.role as "user" | "assistant", text }]);
          if (message.role === "assistant") {
            addLog("API", `Ava: ${text.substring(0, 50)}${text.length > 50 ? "..." : ""}`);
          } else {
            addLog("API", `User: ${text.substring(0, 50)}${text.length > 50 ? "..." : ""}`);
          }
        }
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
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-background/60 border-b border-border/30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                Zayup<span className="text-primary">OS</span>
              </span>
              <p className="text-xs text-muted-foreground">Voice Adapter</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Demo Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Live Demo</span>
            </div>

            <div className="hidden md:block">
              <AgentIndicator currentAgent={currentAssistant} isActive={isActive} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Orb */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        {/* Agent Indicator for Mobile */}
        <div className="md:hidden mb-8">
          <AgentIndicator currentAgent={currentAssistant} isActive={isActive} />
        </div>

        {/* Voice Orb */}
        <VoiceOrb
          isActive={isActive}
          status={status}
          currentAgent={currentAssistant}
          onStart={handleStartCall}
          onStop={handleStopCall}
        />

        {/* Email Capture Overlay */}
        {showEmail && (
          <div className="mt-8">
            <EmailCapture isVisible={showEmail} />
          </div>
        )}

        {/* Tagline */}
        <div className="mt-12 text-center max-w-lg">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Real Vendor. Real Backend. Real Orders.
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This demo connects directly to a live restaurant backend. 
            Place an order and watch it flow through our agentic voice system in real-time.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Connected to sandbox environment</span>
          </div>
        </div>
      </main>

      {/* Live Panel - Always shows logs, order/transcript when active */}
      <LivePanel
        orderItems={orderItems}
        logs={logs}
        isVisible={isActive}
        transcript={transcript}
      />
    </div>
  );
};

export default Index;
