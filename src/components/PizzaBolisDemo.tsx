import { useState, useEffect } from "react";
import { Phone, PhoneOff, ShoppingCart, Mic, Pizza, X, Terminal } from "lucide-react";
import { OrderItem } from "./OrderSummary";

interface PizzaBolisDemoProps {
  isExpanded: boolean;
  isActive: boolean;
  status: "idle" | "listening" | "processing" | "connecting";
  orderItems: OrderItem[];
  onStart: () => void;
  onStop: () => void;
}

const PizzaBolisDemo = ({
  isExpanded,
  isActive,
  status,
  orderItems,
  onStart,
  onStop,
}: PizzaBolisDemoProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const total = orderItems.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    if (isExpanded) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const isConnecting = status === "connecting";
  const isListening = status === "listening";

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl border-4 border-bolis-orange
        transition-all duration-500 ease-out
        ${isExpanded 
          ? "w-full max-w-4xl" 
          : "w-72 md:w-80 cursor-pointer hover:scale-105"
        }
        ${isAnimating ? "scale-[1.02]" : ""}
      `}
      style={{
        background: "linear-gradient(145deg, hsl(40 40% 95%) 0%, hsl(40 30% 90%) 100%)",
        boxShadow: isExpanded 
          ? "0 25px 80px hsl(28 95% 52% / 0.4), 0 10px 30px hsl(0 0% 0% / 0.3)"
          : "0 10px 40px hsl(28 95% 52% / 0.3), 0 4px 15px hsl(0 0% 0% / 0.2)",
      }}
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-bolis-red via-bolis-orange to-bolis-yellow p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-bolis-cream flex items-center justify-center shadow-lg">
              <Pizza className="w-6 h-6 md:w-7 md:h-7 text-bolis-orange" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-md tracking-wide">
                Pizza Boli's
              </h3>
              {isExpanded && (
                <p className="text-xs text-white/80">Voice Ordering Demo</p>
              )}
            </div>
          </div>
          
          {isExpanded && isActive && (
            <button
              onClick={onStop}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsed State - Tap to expand and start */}
      {!isExpanded && (
        <button
          onClick={onStart}
          className="w-full p-5 md:p-6 text-center hover:bg-bolis-cream/50 transition-colors"
        >
          <p className="text-bolis-brown font-medium text-sm md:text-base mb-2">
            Tap to try voice ordering
          </p>
          <div className="flex items-center justify-center gap-2 text-bolis-orange">
            <Phone className="w-4 h-4" />
            <span className="text-sm font-semibold">Start Demo Call</span>
          </div>
        </button>
      )}

      {/* Expanded State - Full Demo Interface */}
      {isExpanded && (
        <div className="flex flex-col md:flex-row">
          {/* Left: Voice Control */}
          <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-bolis-orange/20">
            {/* Voice Orb */}
            <button
              onClick={isActive ? onStop : onStart}
              className={`
                relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center 
                cursor-pointer focus:outline-none transition-all duration-300
                ${isActive ? "scale-110" : "hover:scale-105"}
              `}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, hsl(28 95% 52%) 0%, hsl(45 100% 55%) 50%, hsl(8 85% 50%) 100%)"
                  : "linear-gradient(135deg, hsl(25 40% 25%) 0%, hsl(25 30% 35%) 100%)",
                boxShadow: isActive
                  ? "0 0 60px hsl(28 95% 52% / 0.6), 0 0 100px hsl(45 100% 55% / 0.3)"
                  : "0 8px 30px hsl(0 0% 0% / 0.3)",
              }}
            >
              {/* Pulse rings when active */}
              {isActive && (
                <>
                  <span className="absolute inset-0 rounded-full bg-bolis-orange/30 animate-ping" />
                  <span className="absolute inset-[-10px] rounded-full border-2 border-bolis-orange/40 animate-pulse" />
                </>
              )}
              
              <div className="relative z-10">
                {status === "idle" ? (
                  <Phone className="w-10 h-10 md:w-12 md:h-12 text-bolis-cream" />
                ) : isConnecting ? (
                  <Phone className="w-10 h-10 md:w-12 md:h-12 text-white animate-pulse" />
                ) : (
                  <Mic className={`w-10 h-10 md:w-12 md:h-12 text-white ${isListening ? "animate-pulse" : ""}`} />
                )}
              </div>
            </button>

            {/* Status */}
            <div className="mt-6 text-center">
              {status === "idle" ? (
                <>
                  <p className="text-lg font-bold text-bolis-brown">Tap to Call</p>
                  <p className="text-sm text-bolis-brown/60">Place your order by voice</p>
                </>
              ) : isConnecting ? (
                <>
                  <p className="text-lg font-bold text-bolis-orange">Connecting...</p>
                  <p className="text-sm text-bolis-brown/60">Please wait</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isListening ? "bg-bolis-orange animate-pulse" : "bg-green-500"}`} />
                    <p className="text-lg font-bold text-bolis-brown">
                      {isListening ? "Listening..." : "Speaking..."}
                    </p>
                  </div>
                  <p className="text-sm text-bolis-brown/60">Agent: Ava</p>
                </>
              )}
            </div>

            {/* End Call Button */}
            {isActive && (
              <button
                onClick={onStop}
                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-bolis-red/10 border border-bolis-red/30 text-bolis-red hover:bg-bolis-red/20 transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="text-sm font-medium">End Call</span>
              </button>
            )}
          </div>

          {/* Right: Order Cart + Agent Actions */}
          <div className="w-full md:w-80 bg-white/50 p-4 md:p-6 flex flex-col">
            {/* Cart Section */}
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-5 h-5 text-bolis-orange" />
              <h4 className="font-bold text-bolis-brown text-sm">Your Cart</h4>
              {orderItems.length > 0 && (
                <span className="ml-auto text-xs bg-bolis-orange text-white px-2 py-0.5 rounded-full">
                  {orderItems.length}
                </span>
              )}
            </div>

            <div className="space-y-2 min-h-[80px] max-h-[140px] overflow-y-auto">
              {orderItems.length === 0 ? (
                <div className="text-center py-4 text-bolis-brown/50">
                  <Pizza className="w-8 h-8 mx-auto mb-1 opacity-30" />
                  <p className="text-xs">Your order will appear here</p>
                </div>
              ) : (
                orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-2 bg-white rounded-lg shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-bolis-brown text-xs">{item.name}</p>
                      {item.modification && (
                        <p className="text-[10px] text-bolis-brown/60">{item.modification}</p>
                      )}
                    </div>
                    <span className="font-bold text-bolis-orange text-sm">${item.price.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {orderItems.length > 0 && (
              <div className="mt-3 pt-3 border-t-2 border-dashed border-bolis-orange/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-bolis-brown text-sm">Total</span>
                  <span className="text-lg font-bold text-bolis-orange">${total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Agent Actions Terminal */}
            <div className="mt-4 pt-4 border-t border-bolis-brown/10">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-bolis-brown/70" />
                <h4 className="font-semibold text-bolis-brown/80 text-xs uppercase tracking-wide">Agent Actions</h4>
              </div>
              <div className="bg-bolis-brown/5 rounded-lg p-3 font-mono text-[10px] text-bolis-brown/70 space-y-1 max-h-[80px] overflow-y-auto">
                {isActive ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span>agent.connected</span>
                    </div>
                    {orderItems.length > 0 && (
                      <div className="text-bolis-orange">→ cart.add({orderItems.length} items)</div>
                    )}
                    <div className="text-bolis-brown/50">⌁ awaiting next action...</div>
                  </>
                ) : (
                  <div className="text-bolis-brown/40">⌁ agent.idle — tap to connect</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PizzaBolisDemo;
