Zayup.ai: Multi-Layer Voice Orchestration System
Zayup.ai is a high-performance demonstration of Voice-to-API Orchestration. The system bridges natural language processing with real-time web state and backend operations, specifically showcasing how AI can automate complex CRM and POS workflows through API/MCP alignment.
🏗️ System Architecture
The project is built on a decoupled, multi-layer architecture designed for low-latency human-AI interaction.
1. The Voice Intelligence Layer (Vapi)
The entry point of the system is a sophisticated voice agent powered by the Vapi SDK and GPT-4.1-mini. It handles:
 * Dual-Persona Logic: Transitions seamlessly from a visionary CRM consultant to a functional Food-Tech operator.
 * Intent Extraction: Translates natural speech into structured tool calls.
 * Natural Language Generation: Provides human-like feedback with sub-1.5s latency.
2. The RP2A Backend (GCP/GKE)
RP2A is the "Nervous System" of the project. It is a Python-based middleware server deployed on Google Kubernetes Engine (GKE) that implements the Model Context Protocol (MCP).
 * MCP Bridge: Acts as the secure interface between the LLM and the FoodTec sandbox environment.
 * State Synchronization: Orchestrates data flow between voice intents and the Supabase persistence layer.
 * Security: Manages API keys and secrets via GCP Secret Manager.
3. The Zayup OS (Frontend)
A high-fidelity React interface that provides visual transparency into the AI's "thought process."
 * Phygital Interaction: Features a voice-reactive visualizer and a real-time "Live Cart."
 * Hybrid Elicitation: Supports multi-modal input, allowing the AI to "summon" web components (like email textboxes) to handle high-friction data entry.
 * Admin Transparency: Includes a live dashboard view that reflects backend database changes as they happen via WebSockets.
🚀 The Multi-Layer Workflow
Phase A: The Vision (CRM Automation)
The agent introduces Zayup’s core mission: automating CRMs worldwide by aligning technical APIs with human voice commands. This phase demonstrates high-level reasoning and strategic communication.
Phase B: The Proof (Food-Tech Demo)
The agent transitions into a live ordering simulation for "Restaurant X." The process involves three critical backend operations:
 * Menu Ingestion (menu-export): The RP2A backend fetches the canonical menu from the FoodTec sandbox, ensuring the AI has 100% accurate data on pricing and availability.
 * Real-time CRUD (order-accept): As the user speaks, the agent performs Create, Update, and Delete operations on a virtual cart. Every change is mirrored in the Supabase DB and pushed to the web UI instantly.
 * Manifest Validation (order-validate): Upon order completion, the system aggregates a full manifest (Customer Info + Order Details + Payment Metadata) and pushes it to both the client's admin panel and the user's email.
🛠️ Tech Stack
 * Frontend: React, Tailwind CSS, Vapi Web SDK.
 * Backend (RP2A): FastAPI, Python, MCP (SSE Transport).
 * Cloud Infrastructure: Google Cloud Platform (GKE, Artifact Registry, Secret Manager).
 * Persistence: Supabase (PostgreSQL + Realtime).
 * Operations: Resend/SendGrid for automated orchestration receipts.
📊 Observability & Monitoring
The RP2A system is integrated with:
 * Loki/Grafana: Centralized logging for tracking tool-call success rates.
 * GCP Monitoring: Uptime checks and latency tracking for the MCP endpoints.
🔒 Security & Compliance
All sensitive data, including API keys for FoodTec and Vapi, are managed via External Secrets Operator in Kubernetes, ensuring that no credentials are stored in the source code. The demo uses 16-digit validation for mock payment data to demonstrate logic without handling actual PCI-compliant data.
© 2026 Zayup.ai. Technical Alignment for Total Automation.
