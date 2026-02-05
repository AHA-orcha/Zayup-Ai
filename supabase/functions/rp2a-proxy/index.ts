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
  const RP2A_JWT_TOKEN = Deno.env.get('RP2A_JWT_TOKEN');
  
  if (!RP2A_API_URL) {
    return new Response(JSON.stringify({ error: 'RP2A_API_URL not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!RP2A_JWT_TOKEN) {
    return new Response(JSON.stringify({ error: 'RP2A_JWT_TOKEN not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { action, payload } = await req.json();

    // Map actions to RP2A production endpoints
    const endpoints: Record<string, { method: string; path: string }> = {
      // Order endpoints
      'order-start':    { method: 'POST', path: '/api/order/start' },
      'order-add-item': { method: 'POST', path: '/api/order/add-item' },
      'order-place':    { method: 'POST', path: '/api/order/place' },
      
      // Menu endpoints
      'menu-items':     { method: 'GET',  path: '/api/menu/items' },
      'menu-search':    { method: 'POST', path: '/api/menu/search' },
      'categories':     { method: 'GET',  path: '/api/categories' },
      'specials':       { method: 'GET',  path: '/api/specials' },
      
      // Health check
      'health':         { method: 'GET',  path: '/health' },
    };

    const endpoint = endpoints[action];
    if (!endpoint) {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build request URL with query params for GET requests
    let url = `${RP2A_API_URL}${endpoint.path}`;
    if (endpoint.method === 'GET' && payload) {
      const params = new URLSearchParams();
      if (payload.orderType) params.append('orderType', payload.orderType);
      if (payload.page) params.append('page', String(payload.page));
      if (payload.limit) params.append('limit', String(payload.limit));
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }

    console.log(`RP2A Request: ${endpoint.method} ${url}`);

    // Forward request to RP2A backend with JWT auth
    const response = await fetch(url, {
      method: endpoint.method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RP2A_JWT_TOKEN}`
      },
      body: endpoint.method !== 'GET' ? JSON.stringify(payload) : undefined,
    });

    const responseText = await response.text();
    console.log(`RP2A Response: ${response.status} - ${responseText.substring(0, 200)}`);
    
    // Try to parse as JSON, fallback to error message
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText || `HTTP ${response.status}` };
    }

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
