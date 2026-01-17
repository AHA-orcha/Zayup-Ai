import { motion } from "framer-motion";
import VoiceOrb from "./VoiceOrb";
import StatusBar from "./StatusBar";
import EmailCapture from "./EmailCapture";
import OrderSummary, { OrderItem } from "./OrderSummary";
import { Play } from "lucide-react";

interface ClientPaneProps {
  isActive: boolean;
  status: "idle" | "listening" | "processing";
  showEmail: boolean;
  orderItems: OrderItem[];
  onStartDemo: () => void;
}

const ClientPane = ({ 
  isActive, 
  status, 
  showEmail, 
  orderItems, 
  onStartDemo 
}: ClientPaneProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
      {/* Voice Orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <VoiceOrb isActive={isActive} status={status} />
      </motion.div>
      
      {/* Status Bar */}
      <StatusBar status={status} />
      
      {/* Start Demo Button */}
      {status === "idle" && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onStartDemo}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold glow-primary-intense hover:bg-primary/90 transition-all"
        >
          <Play className="w-5 h-5" />
          Start Demo
        </motion.button>
      )}
      
      {/* Email Capture */}
      <EmailCapture isVisible={showEmail} />
      
      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <OrderSummary items={orderItems} />
      </motion.div>
    </div>
  );
};

export default ClientPane;
