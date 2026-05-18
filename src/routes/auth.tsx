import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Habesha Manga" }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [ageOpen, setAgeOpen] = useState(true);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  useEffect(() => {
    if (user) nav({ to: "/dashboard" });
  }, [user, nav]);

  useEffect(() => {
    const confirmed = typeof window !== "undefined" && localStorage.getItem("age_confirmed_18") === "1";
    if (confirmed) setAgeOpen(false);
  }, []);

  const requireAge = (fn: () => void) => {
    if (typeof window !== "undefined" && localStorage.getItem("age_confirmed_18") === "1") return fn();
    setPendingAction(() => fn);
    setAgeOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    requireAge(async () => {
      setLoading(true);
      try {
        if (mode === "signup") {
          const { error } = await supabase.auth.signUp({
            email, password,
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`,
              data: { display_name: displayName || email.split("@")[0] },
            },
          });
          if (error) throw error;
          toast.success("Welcome! Check your email to verify your account.");
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          toast.success("Welcome back!");
          nav({ to: "/dashboard" });
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Authentication failed");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleGoogle = () => {
    requireAge(async () => {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (result.error) toast.error("Google sign-in failed");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/10 blur-3xl rounded-full" />

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-soft relative"
      >
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">
            Habesha<span className="text-gradient">Manga</span>
          </span>
        </div>

        <h1 className="font-display text-2xl font-bold text-center mb-2">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mode === "signup" ? "Start turning your stories into manga." : "Sign in to continue your story."}
        </p>

        <Button
          type="button" onClick={handleGoogle}
          variant="outline" className="w-full mb-4 border-border"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Aida T." />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald">
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-primary hover:underline font-medium">
            {mode === "signup" ? "Sign in" : "Create one"}
          </button>
        </p>
      </motion.div>

      <Dialog open={ageOpen} onOpenChange={setAgeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Age confirmation</DialogTitle>
            <DialogDescription>
              Habesha Manga features creative storytelling that may include mature themes. You must be 18 or older to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setAgeOpen(false); nav({ to: "/" }); }}>I'm under 18</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                localStorage.setItem("age_confirmed_18", "1");
                setAgeOpen(false);
                pendingAction?.();
                setPendingAction(null);
              }}
            >
              I'm 18 or older
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
