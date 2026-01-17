import { motion } from "framer-motion";
import { Cpu } from "lucide-react";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">
              Zayup<span className="text-primary">.ai</span>
            </span>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass px-4 py-2 rounded-full border border-primary/30"
        >
          <span className="text-sm font-medium text-primary">
            Multi-Layer Ops Demo
          </span>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
