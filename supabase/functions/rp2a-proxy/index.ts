import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const RP2A_API_URL = Deno.env.get('RP2A_API_URL');
  if (!RP2A_API_URL) {
    return new Response(JSON.stringify({ error: 'RP2A backend not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { action, payload } = await req.json();

    // Map actions to RP2A endpoints
    const endpoints: Record<string, { method: string; path: string }> = {
      'session-start':  { method: 'POST', path: '/api/session/start' },
      'menu-export':    { method: 'GET',  path: '/api/menu' },
      'add-item':       { method: 'POST', path: '/api/cart/add' },
      'modify-item':    { method: 'POST', path: '/api/cart/modify' },
      'remove-item':    { method: 'POST', path: '/api/cart/remove' },
      'order-validate': { method: 'POST', path: '/api/order/validate' },
    };

    const endpoint = endpoints[action];
    if (!endpoint) {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build request URL - for GET requests, append session_id as query param
    let url = `${RP2A_API_URL}${endpoint.path}`;
    if (endpoint.method === 'GET' && payload?.session_id) {
      url += `?session_id=${encodeURIComponent(payload.session_id)}`;
    }

    // Forward request to RP2A backend
    const response = await fetch(url, {
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
    console.error('RP2A proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
