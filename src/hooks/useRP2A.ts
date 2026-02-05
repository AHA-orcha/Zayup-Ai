import { supabase } from "@/integrations/supabase/client";

export interface RP2APayload {
  [key: string]: unknown;
}

export interface RP2AOrderItem {
  category: string;
  item: string;
  size?: string;
  quantity?: number;
  specialInstructions?: string;
  ingredients?: {
    ingredient: string;
    isLeftHalf?: boolean;
    isRightHalf?: boolean;
    ordered: boolean;
  }[];
}

export interface RP2ACustomer {
  name: string;
  phone: string;
  email?: string;
}

export interface RP2ADeliveryAddress {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  aptNumber?: string;
}

export const useRP2A = () => {
  const callRP2A = async (action: string, payload: RP2APayload = {}) => {
    const { data, error } = await supabase.functions.invoke('rp2a-proxy', {
      body: { action, payload }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  // Order operations
  const startOrder = (orderType: 'Delivery' | 'Pickup' = 'Delivery') => 
    callRP2A('order-start', { orderType });

  const addItemToOrder = (orderNum: number, item: RP2AOrderItem) =>
    callRP2A('order-add-item', { orderNum, ...item });

  const placeOrder = (
    orderNum: number, 
    customer: RP2ACustomer, 
    deliveryAddress?: RP2ADeliveryAddress
  ) => callRP2A('order-place', { orderNum, customer, deliveryAddress });

  // Menu operations
  const getMenuItems = (orderType: 'Delivery' | 'Pickup' = 'Delivery', page = 1, limit = 50) =>
    callRP2A('menu-items', { orderType, page, limit });

  const searchMenu = (query: string, orderType: 'Delivery' | 'Pickup' = 'Delivery', page = 1, limit = 20) =>
    callRP2A('menu-search', { query, orderType, page, limit });

  const getCategories = (orderType: 'Delivery' | 'Pickup' = 'Delivery') =>
    callRP2A('categories', { orderType });

  const getSpecials = (orderType: 'Delivery' | 'Pickup' = 'Delivery') =>
    callRP2A('specials', { orderType });

  // Health check
  const healthCheck = () => callRP2A('health');

  return { 
    startOrder,
    addItemToOrder,
    placeOrder,
    getMenuItems,
    searchMenu,
    getCategories,
    getSpecials,
    healthCheck
  };
};
