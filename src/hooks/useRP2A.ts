import { supabase } from "@/integrations/supabase/client";

export interface RP2APayload {
  session_id: string;
  [key: string]: unknown;
}

export interface RP2ACartItem {
  name: string;
  size?: string;
  modifications?: string[];
  price: number;
}

export const useRP2A = () => {
  const callRP2A = async (action: string, payload: RP2APayload) => {
    const { data, error } = await supabase.functions.invoke('rp2a-proxy', {
      body: { action, payload }
    });
    
    if (error) throw error;
    return data;
  };

  const startSession = (sessionId: string) => 
    callRP2A('session-start', { session_id: sessionId });

  const fetchMenu = (sessionId: string) => 
    callRP2A('menu-export', { session_id: sessionId });

  const addItem = (sessionId: string, item: RP2ACartItem) =>
    callRP2A('add-item', { session_id: sessionId, ...item });

  const modifyItem = (sessionId: string, itemId: string, modifications: string[]) =>
    callRP2A('modify-item', { session_id: sessionId, item_id: itemId, modifications });

  const removeItem = (sessionId: string, itemId: string) =>
    callRP2A('remove-item', { session_id: sessionId, item_id: itemId });

  const validateOrder = (sessionId: string, customerInfo: { email?: string; phone?: string }) =>
    callRP2A('order-validate', { session_id: sessionId, ...customerInfo });

  return { 
    startSession, 
    fetchMenu, 
    addItem, 
    modifyItem, 
    removeItem, 
    validateOrder 
  };
};
