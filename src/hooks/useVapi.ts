import { useState, useEffect, useCallback, useRef } from "react";
import Vapi from "@vapi-ai/web";

export type VapiStatus = "idle" | "connecting" | "listening" | "processing";

interface VapiMessage {
  type: string;
  role?: string;
  transcript?: string;
  functionCall?: {
    name: string;
    parameters: Record<string, unknown>;
  };
}

interface UseVapiOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onMessage?: (message: VapiMessage) => void;
  onFunctionCall?: (name: string, params: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

export const useVapi = (options: UseVapiOptions = {}) => {
  const [status, setStatus] = useState<VapiStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    
    if (!publicKey) {
      console.error("VAPI_PUBLIC_KEY not found in environment variables");
      return;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    // Event listeners
    vapi.on("call-start", () => {
      setStatus("listening");
      options.onCallStart?.();
    });

    vapi.on("call-end", () => {
      setStatus("idle");
      options.onCallEnd?.();
    });

    vapi.on("speech-start", () => {
      setStatus("listening");
      options.onSpeechStart?.();
    });

    vapi.on("speech-end", () => {
      setStatus("processing");
      options.onSpeechEnd?.();
    });

    vapi.on("message", (message: VapiMessage) => {
      options.onMessage?.(message);
      
      // Handle function calls from the assistant
      if (message.type === "function-call" && message.functionCall) {
        options.onFunctionCall?.(
          message.functionCall.name,
          message.functionCall.parameters
        );
      }
    });

    vapi.on("error", (error: Error) => {
      console.error("Vapi error:", error);
      options.onError?.(error);
      setStatus("idle");
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const startCall = useCallback(async (assistantId: string) => {
    if (!vapiRef.current) return;
    
    setStatus("connecting");
    try {
      await vapiRef.current.start(assistantId);
    } catch (error) {
      console.error("Failed to start Vapi call:", error);
      setStatus("idle");
      options.onError?.(error as Error);
    }
  }, [options]);

  const stopCall = useCallback(() => {
    if (!vapiRef.current) return;
    vapiRef.current.stop();
    setStatus("idle");
  }, []);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;
    const newMutedState = !isMuted;
    vapiRef.current.setMuted(newMutedState);
    setIsMuted(newMutedState);
  }, [isMuted]);

  const sendMessage = useCallback((message: string) => {
    if (!vapiRef.current) return;
    vapiRef.current.send({
      type: "add-message",
      message: {
        role: "user",
        content: message,
      },
    });
  }, []);

  return {
    status,
    isMuted,
    startCall,
    stopCall,
    toggleMute,
    sendMessage,
  };
};
