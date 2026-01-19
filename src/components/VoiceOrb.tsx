import { motion, AnimatePresence } from "framer-motion";
import { Mic, Phone, PhoneOff } from "lucide-react";

interface VoiceOrbProps {
  isActive: boolean;
  status: "idle" | "listening" | "processing" | "connecting";
  currentAgent: "intro" | "demo";
  onStart: () => void;
  onStop: () => void;
}

const VoiceOrb = ({ isActive, status, currentAgent, onStart, onStop }: VoiceOrbProps) => {
  const isConnecting = status === "connecting";
  const isListening = status === "listening";
  const isProcessing = status === "processing";

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Large ambient glow */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
        }}
        animate={isActive ? {
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        } : { scale: 1, opacity: 0.2 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer pulse rings */}
      <AnimatePresence>
        {isActive && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-48 h-48 rounded-full border border-primary/20"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.75,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Secondary glow ring */}
      <motion.div
        className="absolute w-56 h-56 rounded-full"
        style={{
          background: isActive 
            ? "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 60%)"
            : "radial-gradient(circle, hsl(var(--muted) / 0.1) 0%, transparent 60%)",
        }}
        animate={isActive ? {
          scale: [1, 1.15, 1],
        } : { scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main orb container - clickable */}
      <motion.button
        onClick={isActive ? onStop : onStart}
        className="relative w-40 h-40 rounded-full flex items-center justify-center cursor-pointer focus:outline-none group"
        style={{
          background: isActive
            ? "radial-gradient(circle at 30% 30%, hsl(var(--primary)) 0%, hsl(187 100% 35%) 50%, hsl(187 100% 25%) 100%)"
            : "radial-gradient(circle at 30% 30%, hsl(220 30% 30%) 0%, hsl(220 30% 18%) 50%, hsl(220 30% 12%) 100%)",
          boxShadow: isActive
            ? "0 0 60px hsl(var(--primary) / 0.5), 0 0 120px hsl(var(--primary) / 0.3), inset 0 0 30px hsl(var(--primary) / 0.2)"
            : "0 0 30px hsl(220 30% 15% / 0.5), inset 0 0 20px hsl(220 30% 8% / 0.5)",
        }}
        animate={isActive ? {
          scale: isListening ? [1, 1.08, 1] : isProcessing ? [1, 1.03, 1] : [1, 1.02, 1],
        } : {
          scale: 1,
        }}
        transition={{ 
          duration: isListening ? 0.8 : 2, 
          repeat: isActive ? Infinity : 0, 
          ease: "easeInOut" 
        }}
        whileHover={{ scale: isActive ? undefined : 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Inner core glow */}
        <motion.div
          className="absolute w-20 h-20 rounded-full"
          style={{
            background: isActive
              ? "radial-gradient(circle, hsl(0 0% 100% / 0.9) 0%, hsl(var(--primary) / 0.6) 60%, transparent 100%)"
              : "radial-gradient(circle, hsl(220 20% 50% / 0.4) 0%, transparent 70%)",
          }}
          animate={isActive ? {
            scale: isListening ? [1, 1.4, 1] : [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          } : { scale: 1, opacity: 0.5 }}
          transition={{ 
            duration: isListening ? 0.6 : 1.5, 
            repeat: Infinity 
          }}
        />

        {/* Icon */}
        <motion.div
          className="relative z-10"
          animate={isConnecting ? { rotate: 360 } : { rotate: 0 }}
          transition={isConnecting ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        >
          {status === "idle" ? (
            <Phone className="w-10 h-10 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : isConnecting ? (
            <Phone className="w-10 h-10 text-primary-foreground animate-pulse" />
          ) : (
            <Mic className="w-10 h-10 text-primary-foreground" />
          )}
        </motion.div>
      </motion.button>

      {/* Status text */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={status + currentAgent}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col items-center gap-2"
          >
            {status === "idle" ? (
              <>
                <span className="text-lg font-medium text-foreground">Tap to Start</span>
                <span className="text-sm text-muted-foreground">Experience Zayup's Voice AI</span>
              </>
            ) : isConnecting ? (
              <>
                <span className="text-lg font-medium text-primary text-glow">Connecting...</span>
                <span className="text-sm text-muted-foreground">Establishing voice link</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-lg font-medium text-primary text-glow">
                    {currentAgent === "intro" ? "Zayup AI" : "Ava"} {isListening ? "Listening" : "Speaking"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentAgent === "intro" ? "Introduction Agent" : "Restaurant Demo Agent"}
                </span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* End call indicator */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20">
              <PhoneOff className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">Tap orb to end call</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceOrb;
