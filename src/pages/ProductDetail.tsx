import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { PRODUCTS } from "../data/products";
import { cartStore } from "../store/cart";
import { import1688Store } from "../store/import1688";
import { Stars } from "../components/shared";
import ProductCard from "../components/ProductCard";
import { useLocaleStore } from "../store/locale";
import { formatCurrency } from "../lib/currency";
import { getCategoryLabel, getProductBadge, getProductDescription, getProductShipping, getProductSold, getProductTitle } from "../lib/productLocale";

const REVIEWS = [
  { name: "Sarah M.", rating: 5, date: "Aug 14, 2026", text: "Absolutely love this! The quality exceeded my expectations for the price. Fast shipping too.", verified: true },
  { name: "James T.", rating: 4, date: "Aug 10, 2026", text: "Great product, fits well. Color is exactly as pictured. Would definitely order again.", verified: true },
  { name: "Priya K.", rating: 5, date: "Aug 5, 2026", text: "Incredible value. I bought two — one for myself and one as a gift. Both arrived quickly and packed well.", verified: true },
  { name: "David L.", rating: 4, date: "Jul 29, 2026", text: "Good quality overall. Slight difference in shade from the photo but still looks great.", verified: false },
  { name: "Emma W.", rating: 5, date: "Jul 22, 2026", text: "This is my third purchase on Mitao. Always reliable and top quality. Highly recommend!", verified: true },
];

export default function ProductDetail() {
  const currency = useLocaleStore((s) => s.currency);
  const language = useLocaleStore((s) => s.language);
  const { id } = useParams();
  const navigate = useNavigate();
  const pid = Number(id);
  const product =
    Number.isFinite(pid) ? PRODUCTS.find((p) => p.id === pid) || import1688Store.getById(pid) : undefined;
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-400 text-lg">Product not found</p>
        <Link to="/" className="text-[#0A1931] underline">Return home</Link>
      </div>
    );
  }

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 5);
  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const isClothing = product.category.includes("Clothing") || product.category.includes("Dress");
  const sourceLink = product.tag?.startsWith("Source link: ") ? product.tag.replace("Source link: ", "") : null;

  const handleAddToCart = () => {
    cartStore.addItem({ productId: product.id, quantity: qty, size: isClothing ? selectedSize : undefined });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    cartStore.addItem({ productId: product.id, quantity: qty, size: isClothing ? selectedSize : undefined });
    navigate("/cart");
  };

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const title = getProductTitle(product, language);
  const badge = getProductBadge(product, language);
  const sold = getProductSold(product, language);
  const shipping = getProductShipping(product, language);
  const description = getProductDescription(product, language);
  const categoryLabel = getCategoryLabel(product.category, language);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#0A1931]">Home</Link>
          <span>/</span>
          <Link to={`/categories?cat=${encodeURIComponent(product.category)}`} className="hover:text-[#0A1931]">{categoryLabel}</Link>
          <span>/</span>
          <span className="text-gray-800 truncate max-w-xs">{title}</span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Images */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors bg-gray-100 flex-shrink-0 ${selectedImg === i ? "border-[#0A1931]" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img src={product.images[selectedImg]} alt={title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl p-5">
            {/* Title & badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {badge && <span className="text-[11px] bg-[#0A1931] text-white px-2 py-0.5 rounded-sm font-bold font-outfit">{badge}</span>}
              <span className="text-[11px] bg-[#FEF3C7] text-orange-700 px-2 py-0.5 rounded-sm font-semibold">-{discount}% OFF</span>
              <span className="text-[11px] bg-green-100 text-green-800 px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {language === "zh" ? "认证 · 工厂直发" : "Verified Factory Direct"}
              </span>
            </div>
            <h1 className="font-outfit font-bold text-gray-900 text-xl leading-snug mb-3">{title}</h1>
            {sourceLink && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-gray-400">Source:</span>
                <a
                  href={sourceLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#0A1931] hover:underline truncate max-w-[320px]"
                  title={sourceLink}
                >
                  View on 1688
                </a>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <Stars rating={product.rating} size="md" />
              <span className="text-[#0A1931] text-sm font-semibold">{product.rating}</span>
              <span className="text-gray-400 text-sm">({product.reviews.toLocaleString()} {language === "zh" ? "条评价" : "reviews"})</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#F97316] text-sm font-medium">{sold}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="font-outfit font-black text-3xl text-[#0A1931]">{formatCurrency(product.price, currency)}</span>
              <span className="text-gray-400 line-through text-base">{formatCurrency(product.originalPrice, currency)}</span>
              <span className="text-green-600 font-semibold text-sm">Save {formatCurrency(product.originalPrice - product.price, currency)}</span>
            </div>

            {/* Shipping */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l-1 9a1 1 0 001 1h13a1 1 0 001-1L19 8M10 12h4" /></svg>
              <span className="text-green-600 font-medium">{shipping}</span>
            </div>

            {/* Stock warning */}
            {product.stock < 10 && (
              <div className="flex items-center gap-2 mb-4 bg-red-50 border border-red-100 rounded-lg p-2.5 text-sm text-red-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Only {product.stock} left in stock — order soon!
              </div>
            )}

            {/* Colors */}
            {product.colorOptions && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Color: <span className="font-normal text-gray-500">{product.colors}+ options</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.colorOptions.map((c, i) => (
                    <button key={c} onClick={() => setSelectedColor(i)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === i ? "border-[#0A1931] scale-110" : "border-transparent hover:border-gray-300"}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {isClothing && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Size: <span className="font-normal text-gray-500">{selectedSize}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {SIZES.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 border rounded-lg text-sm transition-colors ${selectedSize === s ? "border-[#0A1931] bg-[#0A1931] text-white" : "border-gray-200 text-gray-700 hover:border-[#0A1931]"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-3 mb-5">
              <p className="text-sm font-semibold text-gray-700">Quantity:</p>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 mb-5">
              <button onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-xl font-outfit font-bold text-sm transition-all ${addedToCart ? "bg-green-500 text-white" : "bg-[#F97316] hover:bg-[#EA580C] text-white"}`}>
                {addedToCart ? "✓ Added to Cart" : "Add to Cart"}
              </button>
              <button onClick={handleBuyNow} className="flex-1 py-3 rounded-xl font-outfit font-bold text-sm bg-[#0A1931] hover:bg-[#061021] text-white transition-colors">
                Buy Now
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
              {[["🔒","Secure\nPayment"],["↩️","90-Day\nReturns"],["✅","Purchase\nProtection"]].map(([icon,label])=>(
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <span className="text-xl">{icon}</span>
                  <span className="text-[10px] text-gray-500 whitespace-pre-line leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fulfillment & support */}
        <div className="bg-white rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0A1931] flex items-center justify-center text-white font-bold font-outfit text-lg">
              M
            </div>
            <div>
              <p className="font-outfit font-bold text-gray-900">Fulfilled by Mitao</p>
              <p className="text-sm text-gray-500">
                Sourced via 1688 · Procurement & quality checks handled by Mitao
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Questions? Chat with our team. Typically responds in under 1 hour.</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              to={`/chat?product=${encodeURIComponent(String(product.id))}`}
              className="flex items-center gap-2 border border-[#0A1931] text-[#0A1931] hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Chat with Mitao
            </Link>
            <Link
              to="/purchase-protection"
              className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Purchase protection
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl overflow-hidden mb-6">
          <div className="flex border-b border-gray-100">
            {(["description","specs","reviews"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "text-[#0A1931] border-b-2 border-[#0A1931]" : "text-gray-500 hover:text-gray-700"}`}>
                {tab === "reviews" ? `Reviews (${product.reviews.toLocaleString()})` : tab}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === "description" && (
              <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
            )}
            {activeTab === "specs" && (
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([k, v]) => (
                    <tr key={k} className="border-b border-gray-50">
                      <td className="py-2.5 pr-4 text-gray-500 font-medium w-40">{k}</td>
                      <td className="py-2.5 text-gray-800">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <p className="font-outfit font-black text-5xl text-[#0A1931]">{product.rating}</p>
                    <Stars rating={product.rating} size="md" />
                    <p className="text-xs text-gray-500 mt-1">{product.reviews.toLocaleString()} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5,4,3,2,1].map((star) => {
                      const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1;
                      return (
                        <div key={star} className="flex items-center gap-2 mb-1">
                          <span className="text-xs w-4">{star}</span>
                          <svg className="w-3 h-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-8">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {REVIEWS.map((r, i) => (
                    <div key={i} className="border-b border-gray-50 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#0A1931] text-xs font-bold flex items-center justify-center">{r.name[0]}</div>
                          <span className="text-sm font-semibold text-gray-800">{r.name}</span>
                          {r.verified && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">Verified purchase</span>}
                        </div>
                        <span className="text-xs text-gray-400">{r.date}</span>
                      </div>
                      <Stars rating={r.rating} />
                      <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-[#F97316] rounded-full" />
              <h2 className="font-outfit font-bold text-gray-900 text-lg">Related Items</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
