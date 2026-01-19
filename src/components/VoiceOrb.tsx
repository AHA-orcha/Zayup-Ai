import { Mic, Phone, PhoneOff } from "lucide-react";

interface VoiceOrbProps {
  isActive: boolean;
  status: "idle" | "listening" | "processing" | "connecting";
  currentAgent: "intro" | "demo";
  onStart: () => void;
  onStop: () => void;
}

const VoiceOrb = ({ isActive, status, currentAgent, onStart, onStop }: VoiceOrbProps) => {
  const isConnecting = status === "connecting";
  const isListening = status === "listening";

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Main orb container - clickable */}
      <button
        onClick={isActive ? onStop : onStart}
        className="relative w-40 h-40 rounded-full flex items-center justify-center cursor-pointer focus:outline-none group transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: isActive
            ? "radial-gradient(circle at 30% 30%, hsl(var(--primary)) 0%, hsl(187 100% 35%) 50%, hsl(187 100% 25%) 100%)"
            : "radial-gradient(circle at 30% 30%, hsl(220 30% 30%) 0%, hsl(220 30% 18%) 50%, hsl(220 30% 12%) 100%)",
          boxShadow: isActive
            ? "0 0 60px hsl(var(--primary) / 0.5), 0 0 120px hsl(var(--primary) / 0.3), inset 0 0 30px hsl(var(--primary) / 0.2)"
            : "0 0 30px hsl(220 30% 15% / 0.5), inset 0 0 20px hsl(220 30% 8% / 0.5)",
        }}
      >
        {/* Icon */}
        <div className="relative z-10">
          {status === "idle" ? (
            <Phone className="w-10 h-10 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : isConnecting ? (
            <Phone className="w-10 h-10 text-primary-foreground" />
          ) : (
            <Mic className="w-10 h-10 text-primary-foreground" />
          )}
        </div>
      </button>

      {/* Status text */}
      <div className="mt-8 text-center">
        <div className="flex flex-col items-center gap-2">
          {status === "idle" ? (
            <>
              <span className="text-lg font-medium text-foreground">Tap to Start</span>
              <span className="text-sm text-muted-foreground">Experience Zayup's Voice AI</span>
            </>
          ) : isConnecting ? (
            <>
              <span className="text-lg font-medium text-primary">Connecting...</span>
              <span className="text-sm text-muted-foreground">Establishing voice link</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isListening ? "bg-primary" : "bg-emerald-400"}`} />
                <span className="text-lg font-medium text-primary">
                  {currentAgent === "intro" ? "Zayup AI" : "Ava"} {isListening ? "Listening" : "Speaking"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentAgent === "intro" ? "Introduction Agent" : "Restaurant Demo Agent"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* End call indicator */}
      {isActive && (
        <div className="mt-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20">
            <PhoneOff className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">Tap orb to end call</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceOrb;
