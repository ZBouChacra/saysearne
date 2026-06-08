import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

type Mode = "login" | "register";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => { window.location.href = "/"; },
    onError: (err) => toast.error(err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Account created! Please sign in.");
      setMode("login");
      setPassword("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (mode === "login") {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, password, name });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="login-root">
      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          background: var(--background);
          overflow: hidden;
          position: relative;
        }

        /* Decorative left panel */
        .login-panel {
          display: none;
          flex: 1;
          position: relative;
          background: oklch(0.18 0.10 300);
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .login-panel { display: flex; flex-direction: column; justify-content: flex-end; padding: 3rem; }
        }

        .panel-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, oklch(0.50 0.10 165 / 0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 10%, oklch(0.74 0.12 80 / 0.18) 0%, transparent 55%),
            radial-gradient(ellipse 50% 70% at 50% 50%, oklch(0.25 0.14 300 / 0.8) 0%, transparent 80%);
        }

        .panel-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(oklch(0.60 0.10 165 / 0.06) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.60 0.10 165 / 0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .panel-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.4;
        }
        .panel-orb-1 {
          width: 300px; height: 300px;
          top: -80px; right: -80px;
          background: oklch(0.74 0.12 80 / 0.3);
        }
        .panel-orb-2 {
          width: 200px; height: 200px;
          bottom: 120px; left: -40px;
          background: oklch(0.60 0.10 165 / 0.4);
        }

        .panel-content {
          position: relative;
          z-index: 2;
        }

        .panel-ship {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          display: block;
          filter: drop-shadow(0 0 24px oklch(0.74 0.12 80 / 0.6));
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .panel-quote {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: oklch(0.94 0.01 80);
          line-height: 1.3;
          margin-bottom: 1rem;
        }

        .panel-sub {
          font-size: 0.9rem;
          color: oklch(0.60 0.05 300);
          line-height: 1.6;
          max-width: 320px;
        }

        .panel-dots {
          display: flex;
          gap: 6px;
          margin-top: 2rem;
        }
        .panel-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: oklch(0.60 0.10 165 / 0.5);
        }
        .panel-dot.active {
          width: 20px;
          border-radius: 3px;
          background: oklch(0.74 0.12 80);
        }

        /* Right form side */
        .login-form-side {
          flex: 0 0 auto;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          position: relative;
        }
        @media (min-width: 1024px) {
          .login-form-side { width: 480px; padding: 3rem; }
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          opacity: 0;
          transform: translateY(16px);
          animation: cardIn 0.5s ease forwards;
        }
        .login-card.mounted { opacity: 1; transform: translateY(0); }

        @keyframes cardIn {
          to { opacity: 1; transform: translateY(0); }
        }

        .login-logo {
          margin-bottom: 2.5rem;
        }

        .login-logo-mark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 0.5rem;
        }

        .logo-ship {
          font-size: 1.6rem;
          filter: drop-shadow(0 0 8px oklch(0.74 0.12 80 / 0.5));
        }

        .logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
          letter-spacing: -0.02em;
        }

        .logo-name span {
          color: oklch(0.50 0.10 165);
        }

        .login-heading {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--foreground);
          margin: 0 0 0.4rem;
          line-height: 1.2;
        }

        .login-subheading {
          font-size: 0.875rem;
          color: var(--muted-foreground);
          margin: 0 0 2rem;
        }

        .form-group {
          margin-bottom: 1.1rem;
        }

        .form-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--foreground);
          margin-bottom: 0.4rem;
          letter-spacing: 0.01em;
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap input {
          width: 100%;
          height: 44px;
          padding: 0 2.75rem 0 0.875rem;
          font-size: 0.9rem;
          border-radius: 0.5rem;
          background: var(--card);
          border: 1.5px solid var(--border);
          color: var(--foreground);
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          box-sizing: border-box;
        }

        .input-wrap input:focus {
          border-color: oklch(0.50 0.10 165);
          box-shadow: 0 0 0 3px oklch(0.50 0.10 165 / 0.12);
        }

        .input-wrap input::placeholder {
          color: var(--muted-foreground);
          opacity: 0.7;
        }

        .input-wrap input:not([type="password"]) {
          padding-right: 0.875rem;
        }

        .pw-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .pw-toggle:hover { color: var(--foreground); }

        .submit-btn {
          width: 100%;
          height: 44px;
          background: oklch(0.50 0.10 165);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 1.4rem;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          letter-spacing: 0.01em;
        }
        .submit-btn:hover:not(:disabled) {
          background: oklch(0.45 0.10 165);
          box-shadow: 0 4px 16px oklch(0.50 0.10 165 / 0.35);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(1px); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.4rem 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .divider-text {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .google-btn {
          width: 100%;
          height: 44px;
          background: var(--card);
          border: 1.5px solid var(--border);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--foreground);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
        }
        .google-btn:hover:not(:disabled) {
          background: var(--muted);
          border-color: var(--ring);
          box-shadow: 0 2px 8px oklch(0 0 0 / 0.06);
        }
        .google-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .mode-toggle {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.845rem;
          color: var(--muted-foreground);
        }

        .mode-toggle button {
          background: none;
          border: none;
          padding: 0;
          font-size: inherit;
          font-weight: 600;
          color: oklch(0.50 0.10 165);
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
        }
        .mode-toggle button:hover { color: oklch(0.40 0.10 165); }

        .field-slide-enter {
          animation: fieldIn 0.25s ease forwards;
        }
        @keyframes fieldIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Gold accent bar at top of card */
        .gold-bar {
          height: 3px;
          width: 48px;
          background: linear-gradient(90deg, oklch(0.74 0.12 80), oklch(0.62 0.12 75));
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }
      `}</style>

      {/* Left decorative panel */}
      <div className="login-panel">
        <div className="panel-bg" />
        <div className="panel-grid" />
        <div className="panel-orb panel-orb-1" />
        <div className="panel-orb panel-orb-2" />
        <div className="panel-content">
          <span className="panel-ship">⛵</span>
          <div className="panel-quote">
            Find the professionals<br />who move your world.
          </div>
          <p className="panel-sub">
            SaySerné connects you with verified experts across Lebanon and beyond. From legal counsel to creative professionals.
          </p>
          <div className="panel-dots">
            <div className="panel-dot active" />
            <div className="panel-dot" />
            <div className="panel-dot" />
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-side">
        <div className={`login-card ${mounted ? "mounted" : ""}`}>

          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-mark">
              <span className="logo-ship">⛵</span>
              <span className="logo-name">Say<span>Serné</span></span>
            </div>
          </div>

          {/* Heading */}
          <div className="gold-bar" />
          <h1 className="login-heading">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="login-subheading">
            {mode === "login"
              ? "Sign in to continue to your account"
              : "Join thousands of professionals and clients"}
          </p>

          {/* Name field (register only) */}
          {mode === "register" && (
            <div className="form-group field-slide-enter">
              <label className="form-label" htmlFor="name">Full name</label>
              <div className="input-wrap">
                <input
                  id="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <div className="input-wrap">
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{ paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword
                  ? <EyeOff size={16} />
                  : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Please wait…</>
            ) : mode === "login" ? (
              <>Sign in <ArrowRight size={15} /></>
            ) : (
              <>Create account <ArrowRight size={15} /></>
            )}
          </button>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          {/* Google */}
          <button
            className="google-btn"
            onClick={() => { window.location.href = "/api/oauth/google"; }}
            disabled={isPending}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Mode toggle */}
          <p className="mode-toggle">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setPassword("");
            }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
