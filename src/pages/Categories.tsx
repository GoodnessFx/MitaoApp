import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { CATEGORIES, SUBCATEGORIES } from "../data/products";
import ProductCard from "../components/ProductCard";
import { catalogStore } from "../store/catalog";

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "All";
  const [selected, setSelected] = useState(initialCat);
  const [sort, setSort] = useState("popular");
  const [products, setProducts] = useState(catalogStore.getAll());

  useEffect(() => catalogStore.subscribe(() => setProducts(catalogStore.getAll())), []);

  const selectCat = (cat: string) => {
    setSelected(cat);
    setSearchParams({ cat });
  };

  let filtered = selected === "All" || selected === "Featured"
    ? products
    : products.filter((p) => p.category === selected || p.category.includes(selected) || selected.includes(p.category.split("'")[0]));

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Hero */}
      <div className="bg-[#0A1931] text-white py-8 px-6">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="font-outfit font-black text-3xl mb-1">Shop by Category</h1>
          <p className="text-blue-200 text-sm">Explore thousands of products at unbeatable prices</p>
        </div>
      </div>

      {/* Subcategory thumbnails */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            <div onClick={() => selectCat("All")}
              className={`flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 ${selected === "All" ? "opacity-100" : "opacity-70 hover:opacity-100"} transition-opacity`}>
              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center bg-[#EFF6FF] ${selected === "All" ? "border-[#0A1931]" : "border-transparent"}`}>
                <span className="text-xl">🛍️</span>
              </div>
              <span className="text-[10px] text-gray-700">All</span>
            </div>
            {SUBCATEGORIES.map((sub) => (
              <div key={sub.label} onClick={() => selectCat(sub.label)}
                className={`flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 ${selected === sub.label ? "opacity-100" : "opacity-70 hover:opacity-100"} transition-opacity`}>
                <div className={`relative w-14 h-14 rounded-full border-2 overflow-hidden bg-gray-100 ${selected === sub.label ? "border-[#0A1931]" : "border-transparent"}`}>
                  <img src={sub.img} alt={sub.label} className="w-full h-full object-cover" />
                  {sub.hot && <span className="absolute -top-0.5 -right-0.5 bg-[#F97316] text-white text-[7px] font-bold px-1 py-0.5 rounded-sm">HOT</span>}
                </div>
                <span className="text-[10px] text-gray-700 text-center w-14 truncate">{sub.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-4 flex gap-6">
        {/* Sidebar */}
        <div className="hidden md:block w-44 flex-shrink-0">
          <div className="bg-white rounded-xl overflow-hidden">
            <p className="px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50">Categories</p>
            {["All", ...CATEGORIES].map((cat) => (
              <button key={cat} onClick={() => selectCat(cat)}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${selected === cat ? "bg-blue-50 text-[#0A1931] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-outfit font-bold text-gray-900">{selected === "All" ? "All Products" : selected}</h2>
              <p className="text-xs text-gray-400">{filtered.length} items</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#0A1931]">
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-gray-400">No products found for this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
