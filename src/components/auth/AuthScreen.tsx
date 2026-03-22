import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Zap, ArrowLeft, Mail } from "lucide-react";
import { storage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/report";

interface AuthScreenProps {
  onAuthenticated: (user: User) => void;
}

type AuthView = "login" | "signup" | "forgotPassword" | "emailSent" | "verifyEmail";

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setError("");
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.full_name || email.split("@")[0],
        };
        storage.saveUser(user);
        storage.setAuthenticated(true);
        onAuthenticated(user);
      }
    } catch (e: unknown) {
      setError((e as Error).message || "Login failed");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name || email.split("@")[0] },
        },
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      // If user is returned but not confirmed, show verify email screen
      if (data.user && !data.session) {
        setView("verifyEmail");
      } else if (data.user && data.session) {
        // Auto-confirmed (e.g. email confirmation disabled)
        const user: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: name || email.split("@")[0],
        };
        storage.saveUser(user);
        storage.setAuthenticated(true);
        onAuthenticated(user);
      }
    } catch (e: unknown) {
      setError((e as Error).message || "Signup failed");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setView("emailSent");
      }
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to send reset email");
    }
    setLoading(false);
  };

  const bgGrid = (
    <>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,201,167,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,201,167,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#112233] to-[#0D1B2A] opacity-90" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00C9A7]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1E90FF]/5 rounded-full blur-3xl" />
    </>
  );

  const logo = (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00C9A7] to-[#1E90FF] flex items-center justify-center shadow-lg shadow-[#00C9A7]/20">
          <Zap className="w-6 h-6 text-[#0D1B2A]" />
        </div>
        <div className="text-left">
          <div className="font-black text-white text-xl tracking-wider" style={{ fontFamily: "system-ui" }}>
            TM INDUSTRIAL
          </div>
          <div className="text-[#00C9A7] text-xs tracking-[0.2em] font-medium">REPORT SOLUTION</div>
        </div>
      </div>
      <p className="text-[#4A6B8A] text-sm">Professional Dynamic Balancing Reports</p>
    </div>
  );

  const inputClass =
    "w-full bg-[#0D1B2A] border border-[#1E3A5F] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] transition-colors placeholder-[#2A4A6A]";
  const labelClass = "block text-[#8BA8C4] text-xs font-semibold tracking-wider mb-1.5";
  const primaryBtn =
    "w-full bg-gradient-to-r from-[#00C9A7] to-[#1E90FF] text-[#0D1B2A] font-bold py-3 rounded-xl text-sm tracking-wide hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 mt-2";

  // ── Verify Email Screen ──
  if (view === "verifyEmail") {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center relative overflow-hidden">
        {bgGrid}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          {logo}
          <div className="bg-[#162032] border border-[#1E3A5F] rounded-2xl p-8 shadow-2xl shadow-black/50 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/30 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#00C9A7]" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Verify Your Email</h2>
            <p className="text-[#4A6B8A] text-sm mb-6">
              We've sent a verification link to <span className="text-[#00C9A7]">{email}</span>.<br />
              Please check your inbox and click the link to activate your account.
            </p>
            <button
              onClick={() => { setView("login"); resetForm(); }}
              className="text-[#00C9A7] text-sm hover:underline"
            >
              ← Back to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Email Sent Screen (forgot password) ──
  if (view === "emailSent") {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center relative overflow-hidden">
        {bgGrid}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          {logo}
          <div className="bg-[#162032] border border-[#1E3A5F] rounded-2xl p-8 shadow-2xl shadow-black/50 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/30 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#00C9A7]" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Check Your Email</h2>
            <p className="text-[#4A6B8A] text-sm mb-6">
              A password reset link has been sent to <span className="text-[#00C9A7]">{email}</span>.<br />
              Follow the link in the email to reset your password.
            </p>
            <button
              onClick={() => { setView("login"); resetForm(); }}
              className="text-[#00C9A7] text-sm hover:underline"
            >
              ← Back to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Forgot Password Screen ──
  if (view === "forgotPassword") {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center relative overflow-hidden">
        {bgGrid}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          {logo}
          <div className="bg-[#162032] border border-[#1E3A5F] rounded-2xl p-8 shadow-2xl shadow-black/50">
            <button
              onClick={() => { setView("login"); resetForm(); }}
              className="flex items-center gap-1.5 text-[#4A6B8A] hover:text-[#00C9A7] text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </button>
            <h2 className="text-white font-bold text-lg mb-1">Reset Password</h2>
            <p className="text-[#4A6B8A] text-sm mb-6">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className={labelClass}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  required
                  className={inputClass}
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button type="submit" disabled={loading} className={primaryBtn}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A] rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Login / Signup Screen ──
  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center relative overflow-hidden">
      {bgGrid}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {logo}

        <div className="bg-[#162032] border border-[#1E3A5F] rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Tabs */}
          <div className="flex bg-[#0D1B2A] rounded-xl p-1 mb-6">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setView(t); resetForm(); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  view === t
                    ? "bg-[#00C9A7] text-[#0D1B2A]"
                    : "text-[#4A6B8A] hover:text-white"
                }`}
              >
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className={labelClass}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@company.com"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A6B8A] hover:text-[#00C9A7] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setView("forgotPassword"); setError(""); }}
                    className="text-[#4A6B8A] hover:text-[#00C9A7] text-xs transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A] rounded-full animate-spin" />
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </motion.form>
            )}

            {view === "signup" && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div>
                  <label className={labelClass}>FULL NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Engineer"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@company.com"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A6B8A] hover:text-[#00C9A7] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A] rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <p className="text-[#4A6B8A] text-xs text-center">
                  By signing up, you'll receive a verification email.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-[#2A4A6A] text-xs mt-6">
          Dynamic Balancing Report Management System
        </p>
      </motion.div>
    </div>
  );
}
