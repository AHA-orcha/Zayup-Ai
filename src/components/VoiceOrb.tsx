import { motion } from "framer-motion";

interface VoiceOrbProps {
  isActive: boolean;
  status: "idle" | "listening" | "processing";
}

const VoiceOrb = ({ isActive, status }: VoiceOrbProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Ripple effects */}
      {isActive && (
        <>
          <motion.div
            className="absolute w-32 h-32 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
          />
        </>
      )}
      
      {/* Outer glow ring */}
      <motion.div
        className="absolute w-40 h-40 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(187 100% 50% / 0.1) 0%, transparent 70%)",
        }}
        animate={isActive ? {
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Main orb */}
      <motion.div
        className="relative w-32 h-32 rounded-full glow-primary-intense flex items-center justify-center"
        style={{
          background: isActive 
            ? "radial-gradient(circle, hsl(187 100% 60%) 0%, hsl(187 100% 40%) 50%, hsl(187 100% 30%) 100%)"
            : "radial-gradient(circle, hsl(220 30% 25%) 0%, hsl(220 30% 15%) 100%)",
        }}
        animate={isActive ? {
          scale: [1, 1.05, 1],
        } : {
          scale: 1,
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Inner glow */}
        <motion.div
          className="w-16 h-16 rounded-full"
          style={{
            background: isActive 
              ? "radial-gradient(circle, hsl(0 0% 100% / 0.8) 0%, hsl(187 100% 70% / 0.5) 100%)"
              : "radial-gradient(circle, hsl(220 20% 40%) 0%, transparent 100%)",
          }}
          animate={isActive ? {
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Status indicator */}
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isActive && (
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default VoiceOrb;
