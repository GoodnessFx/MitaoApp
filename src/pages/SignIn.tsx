import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../lib/auth-context";
import { fetchApi } from "../lib/api";

export default function SignIn() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [form, setForm] = useState({ email: "", password: "", name: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register" && form.password !== form.confirm) {
      return setError("Passwords do not match");
    }
    
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetchApi<{ accessToken: string, refreshToken: string }>("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email: form.email, password: form.password, name: form.name }),
        });
        await login(res.accessToken, res.refreshToken);
      } else {
        const res = await fetchApi<{ accessToken: string, refreshToken: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        await login(res.accessToken, res.refreshToken);
      }
      navigate("/account");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex flex-col items-center gap-3">
            <img src="/logo.png" alt="Mitao" className="h-16 w-16 object-contain rounded-2xl shadow-sm" />
            <span className="font-outfit font-black text-2xl text-[#0A1931]">Mitao</span>
          </Link>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setMode("signin")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === "signin" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            Sign In
          </button>
          <button onClick={() => setMode("register")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            Register
          </button>
        </div>

        <h2 className="font-outfit font-bold text-gray-900 text-xl mb-1 text-center">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          {mode === "signin" ? "Sign in for the best experience" : "Join millions of happy shoppers"}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* Google */}
        <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors mb-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0A1931] transition-colors" placeholder="Jamie Chen" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email address</label>
            <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0A1931] transition-colors" placeholder="you@email.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0A1931] transition-colors" placeholder="••••••••" />
          </div>
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm password</label>
              <input type="password" required value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0A1931] transition-colors" placeholder="••••••••" />
            </div>
          )}
          {mode === "signin" && (
            <Link to="/support" className="text-xs text-[#0A1931] self-end hover:underline">
              Forgot password? Contact support
            </Link>
          )}
          <button type="submit" disabled={loading} className="w-full bg-[#0A1931] hover:bg-[#061021] text-white font-outfit font-bold py-3 rounded-xl transition-colors mt-1 disabled:opacity-70">
            {loading ? "Please wait..." : (mode === "signin" ? "Sign In" : "Create Account")}
          </button>
        </form>

        <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="text-[#0A1931]">Terms of Use</Link> and{" "}
          <Link to="/privacy" className="text-[#0A1931]">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
