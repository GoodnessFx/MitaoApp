import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import ProductCard from "../components/ProductCard";
import { catalogStore } from "../store/catalog";

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";
  const [sort, setSort] = useState("popular");
  const [importUrl, setImportUrl] = useState("");
  const [products, setProducts] = useState(catalogStore.getAll());

  useEffect(() => catalogStore.subscribe(() => setProducts(catalogStore.getAll())), []);

  let results = products.filter((p) =>
    p.title.toLowerCase().includes(q.toLowerCase()) ||
    p.category.toLowerCase().includes(q.toLowerCase()) ||
    p.brand?.toLowerCase().includes(q.toLowerCase()) ||
    p.description.toLowerCase().includes(q.toLowerCase())
  );

  if (sort === "price-asc") results = [...results].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") results = [...results].sort((a, b) => b.price - a.price);
  else if (sort === "rating") results = [...results].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* 1688 import shortcut (keeps Mitao UI; no embedding) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Import a 1688 product link</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Paste a supplier link and shop it inside Mitao (cart, checkout, chat, and tracking stay in-app).
              </p>
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://detail.1688.com/offer/..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
              />
              <button
                onClick={() => {
                  if (!importUrl.trim()) return;
                  navigate(`/import/1688?url=${encodeURIComponent(importUrl.trim())}`);
                }}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-outfit font-bold px-4 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                Import
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="font-outfit font-bold text-xl text-gray-900">
              {results.length > 0 ? `Results for "${q}"` : `No results for "${q}"`}
            </h1>
            <p className="text-xs text-gray-400">{results.length} items found</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#2563EB]">
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
      </div>
    </div>
  );
}
