import { useState } from "react";
import { supabase } from "../utils/supabase";
import { Link } from "react-router-dom";

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const fn =
      mode === "signup"
        ? supabase.auth.signUp
        : supabase.auth.signInWithPassword;
    const { error } = await fn({ email, password });
    setLoading(false);
    setMsg(error ? error.message : "Check your email to continue.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="card p-6 w-80 text-center space-y-4">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Nova</span>Chat
        </h2>
        <h3 className="text-lg">
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h3>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm"
          />
          <button
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : mode === "signup"
              ? "Sign Up"
              : "Login"}
          </button>
        </form>
        {msg && <p className="text-slate-400 text-sm">{msg}</p>}
        
        <div className="text-sm text-slate-400">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand-400 hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-brand-400 hover:underline">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}