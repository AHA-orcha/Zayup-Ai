import { Mail, ArrowRight } from "lucide-react";
import { useState } from "react";

interface EmailCaptureProps {
  isVisible: boolean;
}

const EmailCapture = ({ isVisible }: EmailCaptureProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-sm">
      <div className="glass rounded-2xl p-4 border border-primary/20">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>Get your receipt via email</span>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-2 text-primary py-2">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Receipt will be sent to {email}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailCapture;
