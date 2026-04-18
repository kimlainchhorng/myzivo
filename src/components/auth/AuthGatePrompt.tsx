/**
 * AuthGatePrompt — bottom sheet shown when a guest tries to perform a
 * members-only action (like, follow, comment, message, buy, gift, etc.).
 * Returns the user to the same spot after they sign in.
 */
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withRedirectParam } from "@/lib/authRedirect";

interface AuthGatePromptProps {
  open: boolean;
  onClose: () => void;
  reason?: string;
}

export default function AuthGatePrompt({ open, onClose, reason = "continue" }: AuthGatePromptProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const goLogin = () => {
    const target = `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`;
    onClose();
    navigate(withRedirectParam("/login", target));
  };

  const goSignup = () => {
    const target = `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`;
    onClose();
    navigate(withRedirectParam("/signup", target));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[300]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[301] bg-card border-t border-border rounded-t-3xl pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-6 pt-2 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold leading-tight">Join ZIVO to {reason}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Free account · 30 seconds to set up
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 -mr-2 rounded-full hover:bg-muted flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <ul className="space-y-2 mb-5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Like, comment, share & message creators
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Send Z Coin gifts during live streams
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Book rides, food, hotels & flights
                </li>
              </ul>

              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="outline" className="h-12 rounded-xl font-semibold gap-2" onClick={goLogin}>
                  <LogIn className="w-4 h-4" />
                  Log in
                </Button>
                <Button className="h-12 rounded-xl font-bold gap-2" onClick={goSignup}>
                  <UserPlus className="w-4 h-4" />
                  Sign up
                </Button>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-3 text-xs text-muted-foreground/70 hover:text-foreground py-2"
              >
                Maybe later — keep browsing
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
