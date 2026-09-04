import { Link } from "react-router";
import { cartStore } from "../store/cart";
import { Stars } from "./shared";
import type { Product } from "../data/products";

export default function ProductCard({ product }: { product: Product }) {
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.addItem({ productId: product.id, quantity: 1 });
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card bg-white rounded-lg overflow-hidden group block">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-[#0A1931] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm font-outfit">{product.badge}</span>
        )}
        {product.colors && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-sm">{product.colors}+ Colors</span>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[12px] leading-4 text-gray-800 line-clamp-2 mb-1.5">{product.title}</p>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[#0A1931] font-bold text-[14px] font-outfit">${product.price.toFixed(2)}</span>
            <span className="text-gray-400 text-[11px] line-through">${product.originalPrice.toFixed(2)}</span>
          </div>
          <button onClick={handleAdd} className="w-7 h-7 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        <div className="flex items-center gap-1 mb-1.5">
          <svg className="w-3 h-3 text-[#F97316]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
          <span className="text-[#F97316] text-[11px] font-medium">{product.sold}</span>
        </div>
        {product.merit && (
          <p className="text-[#F97316] text-[10px] flex items-center gap-1 mb-1.5">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="truncate">{product.merit}</span>
          </p>
        )}
        <div className="flex items-center gap-1 mb-1.5">
          <Stars rating={product.rating} />
          <span className="text-gray-400 text-[10px]">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {product.brand && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.brand}</span>}
          {product.starSeller && (
            <span className="text-[10px] bg-[#F97316] text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              Top Rated
            </span>
          )}
          <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Factory Direct
          </span>
        </div>
      </div>
    </Link>
  );
}
