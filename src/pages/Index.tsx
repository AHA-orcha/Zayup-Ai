import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, ChevronDown, Globe, CheckCircle, Headphones } from "lucide-react";
import PizzaBolisDemo from "@/components/PizzaBolisDemo";
import LivePanel from "@/components/LivePanel";
import EmailCapture from "@/components/EmailCapture";
import { OrderItem } from "@/components/OrderSummary";
import { LogEntry } from "@/components/AdminPanel";
import { useVapi } from "@/hooks/useVapi";
import { useRealtimeCart } from "@/hooks/useRealtimeCart";
import { useRP2A } from "@/hooks/useRP2A";

const DEMO_ASSISTANT_ID = "c8951f28-76ac-4c9e-ba73-b51fb6b8af6f";

const Index = () => {
  // Session ID for realtime cart sync
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const [isRealtimeMode, setIsRealtimeMode] = useState(false);
  
  // Local state (fallback when not connected to backend)
  const [localOrderItems, setLocalOrderItems] = useState<OrderItem[]>([]);
  
  // Realtime cart from database
  const { items: realtimeItems, clearCart } = useRealtimeCart(
    isRealtimeMode ? sessionIdRef.current : null
  );

  // RP2A backend hook
  const { startOrder, addItemToOrder, placeOrder } = useRP2A();
  const orderNumRef = useRef<number | null>(null);
  
  // Use realtime items when connected, fallback to local state
  const orderItems: OrderItem[] = isRealtimeMode 
    ? realtimeItems.map(item => ({
        id: item.id,
        name: item.item_name,
        modification: item.modifications?.join(', '),
        price: Number(item.price)
      }))
    : localOrderItems;

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), type: "SYSTEM", message: "Voice system initialized" },
    { id: "2", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), type: "API", message: "Backend connection established" },
  ]);
  const [transcript, setTranscript] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [showEmail, setShowEmail] = useState(false);
  const [isDemoExpanded, setIsDemoExpanded] = useState(false);

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    setLogs(prev => [...prev.slice(-50), { id: Date.now().toString(), timestamp, type, message }]);
  }, []);

  const addOrderItem = useCallback((item: OrderItem) => {
    // Only update local state - realtime items come from Supabase
    if (!isRealtimeMode) {
      setLocalOrderItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
    }
    addLog("MCP", `item-add: ${item.name}`);
  }, [addLog, isRealtimeMode]);

  // Handle MCP function calls from Vapi
  const handleFunctionCall = useCallback(async (name: string, params: Record<string, unknown>) => {
    addLog("MCP", `${name} called`);

    // When in realtime mode with valid orderNum, route cart operations through RP2A
    if (isRealtimeMode && orderNumRef.current) {
      try {
        switch (name) {
          case "add_item":
          case "add-item":
          case "addItem":
            await addItemToOrder(orderNumRef.current, {
              category: (params.category as string) || "Pizza",
              item: (params.name as string) || (params.item_name as string),
              size: params.size as string,
              quantity: (params.quantity as number) || 1,
              specialInstructions: params.specialInstructions as string,
            });
            addLog("MCP", `item-add: ${params.name || params.item_name}`);
            return;

          case "place_order":
          case "place-order":
          case "placeOrder":
          case "submit_order":
          case "submitOrder":
            await placeOrder(
              orderNumRef.current,
              {
                name: (params.customer_name as string) || "Customer",
                phone: (params.phone as string) || "000-000-0000",
                email: params.email as string,
              },
              params.address ? {
                address: params.address as string,
                city: params.city as string,
                state: params.state as string,
                zipCode: params.zipCode as string,
              } : undefined
            );
            addLog("API", "Order placed successfully");
            addLog("SYSTEM", "Sending receipt email...");
            return;
        }
      } catch (error) {
        addLog("SYSTEM", `RP2A error: ${(error as Error).message}`);
        // Fall through to local handling if RP2A fails
      }
    }

    // Local fallback handling (non-realtime mode or RP2A failure)
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
        if (!isRealtimeMode) {
          setLocalOrderItems(prev => prev.map(item => 
            item.name === (params.item_name as string || params.name as string)
              ? { ...item, modification: params.modification as string }
              : item
          ));
        }
        addLog("MCP", `Modified: ${params.item_name || params.name}`);
        break;

      case "remove_item":
      case "remove-item":
      case "removeItem":
        if (!isRealtimeMode) {
          setLocalOrderItems(prev => prev.filter(item => 
            item.name !== (params.item_name as string || params.name as string)
          ));
        }
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
        addLog("SYSTEM", "Switching to demo agent...");
        break;

      case "menu-export":
      case "menuExport":
        addLog("MCP", "Menu data exported to agent");
        break;

      default:
        addLog("MCP", `Function: ${name}`);
    }
  }, [addOrderItem, addLog, isRealtimeMode, addItemToOrder, placeOrder]);

  const { status, startCall, stopCall } = useVapi({
    onCallStart: () => {
      addLog("SYSTEM", "Connected to Ava");
      setTranscript([]);
    },
    onCallEnd: () => {
      addLog("SYSTEM", "Call ended");
    },
    onSpeechStart: () => {},
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

  const handleStartCall = useCallback(async () => {
    setIsDemoExpanded(true);
    setIsRealtimeMode(true);
    
    // Initialize RP2A order
    try {
      const result = await startOrder('Delivery');
      orderNumRef.current = result.orderNum;
      addLog("API", `RP2A order started: #${result.orderNum}`);
    } catch (error) {
      addLog("SYSTEM", `RP2A unavailable: ${(error as Error).message}`);
      setIsRealtimeMode(false);
    }
    
    startCall(DEMO_ASSISTANT_ID);
    addLog("SYSTEM", "Initiating connection...");
  }, [startCall, addLog, startOrder]);

  const handleStopCall = useCallback(() => {
    stopCall();
    if (isRealtimeMode) {
      clearCart();
    } else {
      setLocalOrderItems([]);
    }
    setShowEmail(false);
  }, [stopCall, isRealtimeMode, clearCart]);

  const isActive = status !== "idle";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 backdrop-blur-md bg-background/80 border-b border-border/30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                Zayup
              </span>
              <span className="text-xs text-primary font-medium">OS</span>
            </div>
          </div>

          <button className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-medium hover:bg-primary/90 transition-colors">
            Join Waitlist
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 md:pt-36 pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              Introducing <span className="text-primary font-medium">Zayup OS</span>
            </p>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Where Technology Meets
              <br />
              <span className="text-primary">Restaurant Efficiency</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed"
          >
            An AI-powered order taker that works for you around the clock. 
            100% accurate. Multilingual. The first of its kind — built to transform 
            how pizza restaurants handle phone orders.
          </motion.p>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12 md:mb-16"
          >
            {[
              { icon: CheckCircle, label: "100% Order Accuracy" },
              { icon: Globe, label: "Multilingual Support" },
              { icon: Headphones, label: "24/7 Availability" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs md:text-sm">See it in action</span>
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-8 md:py-16 px-4 md:px-6" id="demo">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 md:mb-10"
          >
            <p className="text-sm md:text-base text-muted-foreground">
              Experience a live demo — tap to start a call
            </p>
          </motion.div>

          {/* Pizza Bolis Demo Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center"
          >
            <PizzaBolisDemo
              isExpanded={isDemoExpanded}
              isActive={isActive}
              status={status}
              orderItems={orderItems}
              onStart={handleStartCall}
              onStop={handleStopCall}
            />
          </motion.div>

          {/* Email Capture Overlay */}
          {showEmail && (
            <div className="mt-6 flex justify-center">
              <EmailCapture 
                isVisible={showEmail} 
                sessionId={sessionIdRef.current}
                onEmailCaptured={(email) => addLog("API", `Email captured: ${email}`)}
              />
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-secondary/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 md:mb-14"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              Replace the overhead. Keep the orders.
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              No more missed calls, no more order errors, no more staffing headaches for phone lines.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                title: "Never Miss a Call",
                description: "Every call answered instantly, even during rush hours.",
              },
              {
                title: "Zero Order Errors",
                description: "AI captures every detail — toppings, modifications, special requests.",
              },
              {
                title: "Speaks Their Language",
                description: "Serve customers in English, Spanish, and more — seamlessly.",
              },
            ].map(({ title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-5 md:p-6 rounded-2xl bg-card border border-border/50"
              >
                <h3 className="text-base md:text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 md:py-24 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">
            Ready to modernize your phone orders?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
            We're onboarding select restaurants for early access.
          </p>
          <button className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
            <span className="text-sm md:text-base">Join the Waitlist</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 px-4 md:px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Zayup</span>
            <span className="text-xs text-primary">OS</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 Zayup Inc. — Technology meets efficiency.
          </p>
        </div>
      </footer>

      {/* Live Panel - Desktop only, shows during active call */}
      <div className="hidden lg:block">
        <LivePanel
          orderItems={orderItems}
          isVisible={isActive}
          transcript={transcript}
        />
      </div>
    </div>
  );
};

export default Index;
