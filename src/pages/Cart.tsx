import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { cartStore, type CartItem } from "../store/cart";
import { PRODUCTS } from "../data/products";
import { import1688Store } from "../store/import1688";
import { useLocaleStore } from "../store/locale";
import { formatCurrency } from "../lib/currency";

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>(cartStore.getItems());
  const currency = useLocaleStore((s) => s.currency);
  const navigate = useNavigate();

  useEffect(() => cartStore.subscribe(() => setItems([...cartStore.getItems()])), []);

  const cartProducts = items
    .map((item) => ({
      item,
      product: PRODUCTS.find((p) => p.id === item.productId) || import1688Store.getById(item.productId),
    }))
    .filter((x) => x.product);
  const subtotal = cartProducts.reduce((s, { item, product }) => s + product!.price * item.quantity, 0);
  const savings = cartProducts.reduce((s, { item, product }) => s + (product!.originalPrice - product!.price) * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-[#F97316] rounded-full" />
          <h1 className="font-outfit font-black text-2xl text-gray-900">Shopping Cart</h1>
          <span className="text-gray-400 text-sm ml-1">({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
        </div>

        {cartProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg className="w-24 h-24 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <p className="font-outfit font-bold text-xl text-gray-400">Your cart is empty</p>
            <p className="text-gray-400 text-sm">Add items to get started</p>
            <Link to="/" className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-8 py-3 rounded-xl transition-colors font-outfit">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="bg-white rounded-xl p-4 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#0A1931]" />
                  Select all ({cartProducts.length})
                </label>
                <button onClick={() => cartStore.clearCart()} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                  Clear all
                </button>
              </div>

              {cartProducts.map(({ item, product }) => (
                <div key={`${item.productId}-${item.size}`} className="bg-white rounded-xl p-4 flex gap-4">
                  <input type="checkbox" defaultChecked className="accent-[#0A1931] mt-1 flex-shrink-0" />
                  <Link to={`/product/${product!.id}`} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={product!.image} alt={product!.title} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product!.id}`} className="text-sm text-gray-800 font-medium line-clamp-2 hover:text-[#0A1931] transition-colors">{product!.title}</Link>
                    {item.size && <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="text-[#0A1931] font-bold font-outfit text-base">{formatCurrency(product!.price, currency)}</span>
                        <span className="text-gray-400 line-through text-xs ml-2">{formatCurrency(product!.originalPrice, currency)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button onClick={() => cartStore.updateQty(item.productId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-sm">−</button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => cartStore.updateQty(item.productId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-sm">+</button>
                        </div>
                        <button onClick={() => cartStore.removeItem(item.productId)}
                          className="text-gray-300 hover:text-red-400 transition-colors p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Free shipping notice */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <p className="text-green-700 text-sm font-medium">Your order qualifies for free shipping!</p>
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-xl p-5">
                <h2 className="font-outfit font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
                <div className="flex flex-col gap-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({items.reduce((s,i)=>s+i.quantity,0)} items)</span>
                    <span className="font-semibold">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>You save</span>
                    <span className="font-semibold">-{formatCurrency(savings, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex justify-between font-outfit font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#0A1931]">{formatCurrency(subtotal, currency)}</span>
                  </div>
                </div>
                <button onClick={() => navigate("/checkout")} className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-outfit font-bold py-3.5 rounded-xl transition-colors text-base">
                  Checkout ({cartProducts.length} items)
                </button>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Secure checkout
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Have a coupon?</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter code" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0A1931]" />
                  <button className="bg-[#0A1931] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#061021] transition-colors">Apply</button>
                </div>
              </div>

              {/* Guarantees */}
              <div className="bg-white rounded-xl p-4 grid grid-cols-2 gap-3">
                {[["🔒","Secure Payment"],["↩️","90-Day Returns"],["✅","Purchase Protection"],["🚚","Free Shipping"]].map(([icon,label])=>(
                  <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{icon}</span><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
