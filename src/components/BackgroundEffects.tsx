interface BackgroundEffectsProps {
  isActive: boolean;
}

const BackgroundEffects = ({ isActive }: BackgroundEffectsProps) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient mesh background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, hsl(var(--primary) / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, hsl(250 80% 50% / 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 50% 80%, hsl(var(--primary) / 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Active state center glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isActive ? "opacity-30" : "opacity-10"}`}
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
        }}
      />
    </div>
  );
};

export default BackgroundEffects;
