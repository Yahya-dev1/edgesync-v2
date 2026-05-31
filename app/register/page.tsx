"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!fullName.trim()) return setError("Full name is required.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      // Email confirmation disabled — session exists immediately
      router.push("/dashboard");
    } else {
      // Email confirmation required
      setInfo(
        "Account created! Check your email and click the confirmation link to activate your account."
      );
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    const supabase = createClient();

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
    // On success, browser is redirected — no cleanup needed
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-[#00C896]">
              <TrendingUp className="w-5 h-5 text-[#080d1a]" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              EdgeSync <span className="text-[#00C896]">Markets</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#0d1526] border border-white/8 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-7">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00C896] hover:underline">
              Sign in
            </Link>
          </p>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-white/10 bg-white/4 text-sm font-medium text-white hover:bg-white/8 hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[#00C896]/10 border border-[#00C896]/20 text-[#00C896] text-sm">
              {info}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-[#080d1a] border border-white/10 text-white placeholder-slate-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C896]/50 focus:ring-1 focus:ring-[#00C896]/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-[#080d1a] border border-white/10 text-white placeholder-slate-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C896]/50 focus:ring-1 focus:ring-[#00C896]/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-[#080d1a] border border-white/10 text-white placeholder-slate-600 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#00C896]/50 focus:ring-1 focus:ring-[#00C896]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-[#080d1a] border border-white/10 text-white placeholder-slate-600 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#00C896]/50 focus:ring-1 focus:ring-[#00C896]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold bg-[#00C896] text-[#080d1a] hover:bg-[#00b084] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-xs text-slate-600 text-center mt-6">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-slate-400 hover:text-[#00C896]">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-slate-400 hover:text-[#00C896]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
