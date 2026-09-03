import { useState } from "react";
import { useNavigate } from "react-router";
import { fetchApi } from "../../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi<{ accessToken: string, require2FA: boolean }>("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      if (res.require2FA) {
        // Handle 2FA step here (Phase 5)
        setError("2FA required but not implemented on frontend yet.");
      } else {
        localStorage.setItem("mitao_admin_token", res.accessToken);
        navigate("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Failed to login as admin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-outfit text-gray-900">Mitao Control Panel</h1>
          <p className="text-gray-500 text-sm mt-2">Authorized personnel only</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg transition-colors mt-2">
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}
