import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import ProductCard from "../components/ProductCard";
import { catalogStore } from "../store/catalog";
import { buildSearchBlob } from "../lib/productLocale";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL?.toString() || (typeof window !== "undefined" && window.location.hostname !== "localhost" ? `${window.location.origin}/api` : "http://localhost:3001/api");

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";
  const isImageMode = searchParams.get("image") === "1";
  const [sort, setSort] = useState("popular");
  const [importUrl, setImportUrl] = useState("");
  const [products, setProducts] = useState(catalogStore.getAll());
  const [imageResults, setImageResults] = useState<any[] | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => catalogStore.subscribe(() => setProducts(catalogStore.getAll())), []);

  useEffect(() => {
    try {
      const p = sessionStorage.getItem("mitao:imageSearchPreview");
      if (p) setPreview(p);
    } catch {}
    if (!isImageMode) return;
    let pending: string | null = null;
    try { pending = sessionStorage.getItem("mitao:imageSearchPending"); } catch {}
    if (!pending) return;
    void runImageSearch(pending);
  }, [isImageMode]);

  async function runImageSearch(imageBase64: string) {
    setImageLoading(true);
    setImageError(null);
    setImageResults(null);
    try {
      const res = await fetch(`${API_BASE}/onebound/image-search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64 }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Image search failed");
      const items = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      setIsDemo(!!json?.demo);
      setImageResults(items);
      try { sessionStorage.removeItem("mitao:imageSearchPending"); } catch {}
      const previewStore = typeof window !== "undefined" ? sessionStorage.getItem("mitao:imageSearchPreview") : null;
      if (previewStore) setPreview(previewStore);
      else setPreview(imageBase64);
    } catch (e: any) {
      setImageError(e.message || "Image search failed");
      setImageResults([]);
    } finally { setImageLoading(false); }
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const b64 = r.result as string;
      try { sessionStorage.setItem("mitao:imageSearchPreview", b64); sessionStorage.setItem("mitao:imageSearchPending", b64); } catch {}
      setPreview(b64);
      if (isImageMode) void runImageSearch(b64);
      else navigate("/search?image=1");
    };
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const [remoteResults, setRemoteResults] = useState<any[] | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteDemo, setRemoteDemo] = useState(false);
  useEffect(() => {
    if (isImageMode || !q.trim()) { setRemoteResults(null); return; }
    const ctrl = new AbortController();
    setRemoteLoading(true);
    fetch(`${API_BASE}/onebound/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) throw new Error(j?.error || "search failed");
        const items = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        if (items.length) { setRemoteResults(items); setRemoteDemo(!!j?.demo); }
        else setRemoteResults(null);
      })
      .catch(() => setRemoteResults(null))
      .finally(() => setRemoteLoading(false));
    return () => ctrl.abort();
  }, [q, isImageMode]);

  const query = q.trim().toLowerCase();
  let baseResults: any[] = remoteResults !== null ? remoteResults : (query ? products.filter((p) => buildSearchBlob(p).includes(query)) : products);
  const verifiedFirst = (a: any, b: any) => Number(b.seller?.verified !== false) - Number(a.seller?.verified !== false) || (b.seller?.rating ?? b.rating ?? 0) - (a.seller?.rating ?? a.rating ?? 0);
  let results = [...baseResults].sort(verifiedFirst);
  if (sort === "price-asc") results = [...results].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") results = [...results].sort((a, b) => b.price - a.price);
  else if (sort === "rating") results = [...results].sort((a, b) => (b.seller?.rating ?? b.rating) - (a.seller?.rating ?? a.rating));
  const effectiveDemo = isImageMode ? isDemo : remoteDemo;
  const showImage = isImageMode;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Import a 1688 product link</p>
              <p className="text-xs text-gray-400 mt-0.5">Paste a supplier link and shop it inside Mitao (cart, checkout, chat, and tracking stay in-app).</p>
            </div>
            <div className="flex-1 flex gap-2">
              <input value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://detail.1688.com/offer/..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0A1931]" />
              <button onClick={() => { if (!importUrl.trim()) return; navigate(`/import/1688?url=${encodeURIComponent(importUrl.trim())}`); }} className="bg-[#0A1931] hover:bg-[#061021] text-white font-outfit font-bold px-4 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap">Import</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Search by image</p>
            <p className="text-xs text-gray-400">Upload a photo or use your camera to find similar products on 1688.</p>
          </div>
          <div className="flex items-center gap-2">
            {preview && <img src={preview} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />}
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V8a2 2 0 00-2-2h-2l-2-2H10l-2 2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /><circle cx="12" cy="12" r="3" /></svg>
              {showImage ? "Change image" : "Upload image"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
          </div>
        </div>

        {showImage ? (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h1 className="font-outfit font-bold text-xl text-gray-900 flex items-center gap-2">Image search {isDemo && <span className="bg-yellow-300 text-black text-[10px] font-bold px-2 py-0.5 rounded">Demo not real 1688 listings</span>}</h1>
                <p className="text-xs text-gray-400">{imageLoading ? "Searching…" : imageResults ? `${imageResults.length} matched by image` : "Upload a photo to see matches"}</p>
              </div>
              <button onClick={() => navigate("/search")} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">Back to text search</button>
            </div>
            {imageLoading && <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gray-200 border-t-[#0A1931] rounded-full animate-spin" /></div>}
            {!imageLoading && imageError && <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm">{imageError}</div>}
            {!imageLoading && !imageError && imageResults && imageResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
                <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V8a2 2 0 00-2-2h-2l-2-2H10l-2 2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <p className="text-gray-900 font-semibold">No matches found</p>
                <p className="text-gray-400 text-sm">We didn’t find similar products for this image. Try another photo or a different angle.</p>
              </div>
            )}
            {!imageLoading && imageResults && imageResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {imageResults.map((p: any) => (
                  <div key={p.id} className="relative">
                    <ProductCard product={p} />
                    <span className="absolute top-2 left-2 bg-[#0A1931] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">matched by image</span>
                  </div>
                ))}
              </div>
            )}
            {!imageLoading && imageResults === null && !imageError && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
                <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V8a2 2 0 00-2-2h-2l-2-2H10l-2 2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <p className="text-gray-400 font-medium">Upload a photo to search</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h1 className="font-outfit font-bold text-xl text-gray-900 flex items-center gap-2">{results.length > 0 ? `Results for "${q || "all"}"` : `No results for "${q}"`} {effectiveDemo && <span className="bg-yellow-300 text-black text-[10px] font-bold px-2 py-0.5 rounded">Demo 1688</span>} {remoteLoading && <span className="w-4 h-4 border-2 border-gray-200 border-t-[#0A1931] rounded-full animate-spin inline-block" />}</h1>
                <p className="text-xs text-gray-400">{results.length} items found price in Yuan default, switch to USD/NGN in header verified suppliers prioritized</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort:</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#0A1931]">
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {results.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <p className="text-gray-400 font-medium">No products match your search</p>
                <p className="text-gray-400 text-sm">Try different keywords or browse categories</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

