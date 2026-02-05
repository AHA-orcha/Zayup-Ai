
# RP2A Backend Integration Plan

## Overview

Connect the ZayupOS Pizza Bolis demo frontend to the RP2A backend deployed on GCP. The integration will enable real-time cart sync, menu fetching, and order submission through the Cloud Run frontend API.

## Architecture After Integration

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Lovable Frontend (ZayupOS)                          │
│  ┌──────────────┐   ┌───────────────────┐   ┌───────────────────────────┐  │
│  │   useVapi    │──▶│  Function Call    │──▶│  Edge Function Proxy      │  │
│  │   (voice)    │   │  Handler          │   │  (routes to RP2A)         │  │
│  └──────────────┘   └───────────────────┘   └─────────────┬─────────────┘  │
│         │                                                  │                │
│         │ session_id                                       │ HTTP           │
│         ▼                                                  ▼                │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Lovable Cloud (Supabase)                                          │    │
│  │  - cart_items (realtime)                                           │    │
│  │  - orders (permanent)                                              │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTPS (via edge function)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GCP Infrastructure (RP2A)                                │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Global Load Balancer (Public Entry Point)                         │    │
│  └─────────────────────────────────┬──────────────────────────────────┘    │
│                                    ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Cloud Run Frontend Service (API Gateway)                          │    │
│  │  Endpoints:                                                        │    │
│  │  - POST /api/session/start     → Initialize session                │    │
│  │  - GET  /api/menu              → Fetch menu (FoodTec)              │    │
│  │  - POST /api/cart/add          → Add item to cart                  │    │
│  │  - POST /api/cart/modify       → Modify cart item                  │    │
│  │  - POST /api/cart/remove       → Remove item                       │    │
│  │  - POST /api/order/validate    → Validate & submit order           │    │
│  └─────────────────────────────────┬──────────────────────────────────┘    │
│                                    ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Regional Load Balancer → MIG Backend → Cloud SQL (PostgreSQL)     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Store RP2A API URL as Secret

Store the GCP Cloud Run frontend URL as a backend secret:
- Secret name: `RP2A_API_URL`
- Value: Your Cloud Run service URL (e.g., `https://rp2a-frontend-xxxxx-uc.a.run.app`)

### Step 2: Create Edge Function Proxy

Create `supabase/functions/rp2a-proxy/index.ts` to securely route requests to GCP:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const RP2A_API_URL = Deno.env.get('RP2A_API_URL');
  if (!RP2A_API_URL) {
    return new Response(JSON.stringify({ error: 'RP2A not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { action, payload } = await req.json();
    
    const endpoints: Record<string, { method: string; path: string }> = {
      'session-start': { method: 'POST', path: '/api/session/start' },
      'menu-export':   { method: 'GET',  path: '/api/menu' },
      'add-item':      { method: 'POST', path: '/api/cart/add' },
      'modify-item':   { method: 'POST', path: '/api/cart/modify' },
      'remove-item':   { method: 'POST', path: '/api/cart/remove' },
      'order-validate':{ method: 'POST', path: '/api/order/validate' },
    };

    const endpoint = endpoints[action];
    if (!endpoint) {
      return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(`${RP2A_API_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' },
      body: endpoint.method !== 'GET' ? JSON.stringify(payload) : undefined,
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

### Step 3: Create RP2A Client Hook

Create `src/hooks/useRP2A.ts` to interact with the proxy:

```typescript
import { supabase } from "@/integrations/supabase/client";

export interface RP2APayload {
  session_id: string;
  [key: string]: unknown;
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

  const addItem = (sessionId: string, item: { name: string; size?: string; modifications?: string[]; price: number }) =>
    callRP2A('add-item', { session_id: sessionId, ...item });

  const modifyItem = (sessionId: string, itemId: string, modifications: string[]) =>
    callRP2A('modify-item', { session_id: sessionId, item_id: itemId, modifications });

  const removeItem = (sessionId: string, itemId: string) =>
    callRP2A('remove-item', { session_id: sessionId, item_id: itemId });

  const validateOrder = (sessionId: string, customerInfo: { email?: string; phone?: string }) =>
    callRP2A('order-validate', { session_id: sessionId, ...customerInfo });

  return { startSession, fetchMenu, addItem, modifyItem, removeItem, validateOrder };
};
```

### Step 4: Update Index.tsx for Hybrid Mode

Modify the function call handler to use RP2A when in realtime mode:

```typescript
// Add import
import { useRP2A } from "@/hooks/useRP2A";

// Inside Index component
const { startSession, addItem, modifyItem, removeItem, validateOrder } = useRP2A();

// Update handleStartCall to initialize RP2A session
const handleStartCall = useCallback(async () => {
  setIsDemoExpanded(true);
  setIsRealtimeMode(true); // Enable realtime mode
  
  // Initialize RP2A session
  try {
    await startSession(sessionIdRef.current);
    addLog("API", "RP2A session initialized");
  } catch (error) {
    addLog("SYSTEM", "RP2A unavailable, using local mode");
    setIsRealtimeMode(false);
  }
  
  startCall(DEMO_ASSISTANT_ID);
  addLog("SYSTEM", "Initiating connection...");
}, [startCall, addLog, startSession]);

// Update handleFunctionCall to route through RP2A
const handleFunctionCall = useCallback(async (name: string, params: Record<string, unknown>) => {
  addLog("MCP", `${name} called`);

  if (isRealtimeMode) {
    // Route through RP2A - cart updates come via Supabase realtime
    try {
      switch (name) {
        case "add_item":
        case "add-item":
          await addItem(sessionIdRef.current, {
            name: params.item_name as string,
            size: params.size as string,
            modifications: params.modifications as string[],
            price: params.price as number || 0
          });
          break;
        case "modify_item":
        case "modify-item":
          await modifyItem(sessionIdRef.current, params.item_id as string, params.modifications as string[]);
          break;
        case "remove_item":
        case "remove-item":
          await removeItem(sessionIdRef.current, params.item_id as string);
          break;
        case "order-validate":
        case "place_order":
          await validateOrder(sessionIdRef.current, { email: params.email as string });
          break;
      }
    } catch (error) {
      addLog("SYSTEM", `RP2A error: ${error.message}`);
    }
  } else {
    // Local fallback (existing logic)
  }
}, [isRealtimeMode, addItem, modifyItem, removeItem, validateOrder, addLog]);
```

### Step 5: Update config.toml for Edge Function

Add JWT verification setting:

```toml
[functions.rp2a-proxy]
verify_jwt = false
```

## Data Flow Summary

| Action | Flow |
|--------|------|
| **Start Call** | Frontend → RP2A `/session/start` → Creates session in GCP PostgreSQL |
| **Add Item** | Vapi function call → Edge Function → RP2A → GCP writes to PostgreSQL → RP2A writes to Supabase `cart_items` → Realtime pushes to frontend |
| **Order Submit** | Vapi function call → Edge Function → RP2A validates with FoodTec → Writes to `orders` table |

## Required Secrets

| Secret Name | Description |
|-------------|-------------|
| `RP2A_API_URL` | Cloud Run frontend service URL |

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/rp2a-proxy/index.ts` | Create |
| `src/hooks/useRP2A.ts` | Create |
| `src/pages/Index.tsx` | Modify |
| `supabase/config.toml` | Modify |

## Estimated Time

| Task | Hours |
|------|-------|
| Store RP2A secret | 0.25 |
| Create edge function proxy | 0.5 |
| Create useRP2A hook | 0.5 |
| Update Index.tsx | 1.0 |
| Testing & debugging | 1.0 |
| **Total** | **3.25** |

## Technical Notes

1. **CORS**: The edge function handles CORS so the GCP backend doesn't need to allow the Lovable domain directly

2. **Session Sync**: The RP2A backend should write cart updates to Supabase `cart_items` table (using the service role key stored in Secret Manager) so the frontend receives realtime updates

3. **Fallback Mode**: If RP2A is unavailable, the demo falls back to local state (no backend)

4. **Security**: The RP2A_API_URL is stored as a secret and never exposed to the client - all requests go through the edge function proxy
