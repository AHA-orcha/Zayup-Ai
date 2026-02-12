Zayup.ai
Autonomous Restaurant Vendor Automation
Official Website | Live Voice Demo
Zayup.ai is a collaborative services-based repository developed between AHA and Zayup.ai. It serves as an intelligent orchestration layer designed to automate customer interactions and restaurant operations by bridging natural conversation with enterprise Point of Sale (POS) systems.
🚀 The Solution
Zayup.ai provides a seamless, "always-on" AI workforce that handles the most critical and repetitive tasks in the hospitality industry.
Core Pillars
 * Autonomous Voice & Text Ordering: Intelligent agents that process complex menu customizations and place orders directly into the POS.
 * Customer Support Automation: Instant resolution for order tracking, store information, and location-specific inquiries.
 * Multi-Vendor Orchestration: A robust middleware that synchronizes real-time data across various restaurant ecosystems.
🏗️ Architectural Overview (Brief Architect)
The system follows a Three-Tier Orchestration model to ensure low latency and high reliability:
 * Interaction Layer (The Edge):
   * Uses Vapi for voice processing and Lovable (React) for the "Phygital" UI.
   * Goal: Capture intent and provide real-time visual feedback to the customer.
 * Intelligence Layer (The Brain):
   * GPT-4o-mini processes text/voice transcripts via the MCP (Model Context Protocol).
   * Goal: Translate human speech into structured tool calls (e.g., order_accept).
 * Execution Layer (The POS):
   * RP2A Backend (FastAPI) manages the Proprietary Adapter Pattern.
   * Goal: Route orders to FoodTec, Square, or Clover through a unified API schema.
⚙️ Core Technology: Proprietary Adapter Patterns
The system is built on a modular architecture. This proprietary design allows Zayup.ai to integrate with industry-standard POS vendors through a unified interface:
> Note on Adapters: By abstracting the vendor logic, the AI "Brain" only needs to learn one way to order, while the backend handles the unique XML/JSON requirements of each POS.
> 
 * FoodTec: Primary integration for high-volume delivery and franchise operations.
 * Clover: Specialized adapters for hardware-centric SMB inventory sync.
 * Square: Rapid deployment adapters for cloud-first environments.
🛠️ Technical Annotations & Logic
| Component | Choice | Annotation (The "Why") |
|---|---|---|
| Backend | FastAPI / Starlette | Chosen for high-concurrency support and native async handling required for real-time voice tool calls. |
| Protocol | FastMCP | Standardizes how LLMs interact with local functions, making it easy to swap GPT models without rewriting code. |
| Persistence | GCS (Google Cloud) | Since Cloud Run is stateless, we use GCS to "warm start" search indices so the AI never forgets the menu. |
| Database | Supabase | Provides the real-time WebSocket layer needed to update the customer's web UI the moment the AI adds an item. |
📡 System Status
 * Primary Protocol: Voice AI (Vapi + Cloud Backend)
 * Infrastructure: GCP / Lovable / Supabase
 * Vendor Support: FoodTec (Production), Clover (Beta), Square (Alpha)
© 2026 Zayup.ai & AHA. All rights reserved.
