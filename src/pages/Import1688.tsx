import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import ProductCard from "../components/ProductCard";
import { import1688Store } from "../store/import1688";

export default function Import1688() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get("url") || "";

  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imports, setImports] = useState(() => import1688Store.getAll());

  useEffect(() => import1688Store.subscribe(() => setImports([...import1688Store.getAll()])), []);

  const canImport = useMemo(() => url.trim().length > 10, [url]);

  const doImport = async (override?: string) => {
    const v = (override ?? url).trim();
    setError(null);
    setLoading(true);
    try {
      const product = await import1688Store.importFromUrl(v);
      navigate(`/product/${product.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-run import if someone pasted a link into search and landed here with ?url=...
  useEffect(() => {
    if (initialUrl && initialUrl.trim().length > 10) {
      void doImport(initialUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-[#F97316] rounded-full" />
          <h1 className="font-outfit font-black text-2xl text-gray-900">Import from 1688</h1>
          <span className="text-gray-400 text-sm ml-1">Shop 1688 inside Mitao, the clean way</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 mb-2">Paste a 1688 product link</p>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://detail.1688.com/offer/..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0A1931]"
              />
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                This creates a Mitao-native product record so you can add to cart, checkout, track orders, and chat with the seller inside Mitao.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => import1688Store.clear()}
                className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl text-sm transition-colors"
                type="button"
              >
                Clear
              </button>
              <button
                disabled={!canImport || loading}
                onClick={() => void doImport()}
                className="bg-[#0A1931] hover:bg-[#061021] disabled:opacity-40 text-white font-outfit font-bold px-6 py-3 rounded-xl transition-colors text-sm"
                type="button"
              >
                {loading ? "Importing…" : "Import product"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ["✅", "Mitao checkout", "Cart + payment stay inside your app"],
              ["💬", "Chat & support", "Talk to seller/support in one thread"],
              ["🧾", "Clear policies", "Purchase protection + returns flow"],
            ].map(([icon, title, desc]) => (
              <div key={title} className="bg-[#F5F5F5] rounded-xl p-4 border border-gray-100">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#F97316] rounded-full" />
            <h2 className="font-outfit font-bold text-gray-900 text-lg">Imported items</h2>
          </div>
          <Link to="/search?q=1688" className="text-[#0A1931] text-sm hover:underline">
            Browse Mitao catalog
          </Link>
        </div>

        {imports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#0A1931] flex items-center justify-center text-2xl font-bold mb-3">88</div>
            <p className="font-outfit font-bold text-gray-900">No imports yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              Paste a 1688 product link above. Once imported, it behaves like a normal product in Mitao: product page, add to cart, checkout, and chat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-10">
            {imports.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

