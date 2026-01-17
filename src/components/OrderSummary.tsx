import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

export interface OrderItem {
  id: string;
  name: string;
  modification?: string;
  price: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
}

const OrderSummary = ({ items }: OrderSummaryProps) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Live Order Summary</span>
      </div>
      
      <div className="glass rounded-2xl p-4 border border-border/30 space-y-3">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground text-center py-4"
            >
              No items yet
            </motion.p>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-start py-2 border-b border-border/30 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  {item.modification && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.modification}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-primary">
                  ${item.price.toFixed(2)}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center pt-2 border-t border-primary/30"
          >
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary text-glow">
              ${total.toFixed(2)}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
