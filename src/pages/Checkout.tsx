import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { cartStore, type CartItem } from "../store/cart";
import { PRODUCTS } from "../data/products";
import { import1688Store } from "../store/import1688";

export default function Checkout() {
  const [items, setItems] = useState<CartItem[]>(cartStore.getItems());
  const [step, setStep] = useState<"info" | "payment" | "confirm">("info");
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", zip: "", country: "United States", card: "", expiry: "", cvv: "" });
  const navigate = useNavigate();

  useEffect(() => cartStore.subscribe(() => setItems([...cartStore.getItems()])), []);

  const cartProducts = items
    .map((item) => ({
      item,
      product: PRODUCTS.find((p) => p.id === item.productId) || import1688Store.getById(item.productId),
    }))
    .filter((x) => x.product);
  const subtotal = cartProducts.reduce((s, { item, product }) => s + product!.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    cartStore.clearCart();
    navigate("/orders?success=true");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/cart" className="text-[#0A1931] hover:underline text-sm">← Back to cart</Link>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {(["info","payment","confirm"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === s || (step === "payment" && i < 1) || (step === "confirm" && i < 2) ? "bg-[#0A1931] text-white" : "bg-gray-200 text-gray-500"}`}>{i + 1}</div>
              <span className={`text-sm capitalize hidden sm:block ${step === s ? "text-[#0A1931] font-semibold" : "text-gray-400"}`}>{s === "info" ? "Shipping" : s}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === "info" && (
              <div className="bg-white rounded-xl p-6">
                <h2 className="font-outfit font-bold text-xl text-gray-900 mb-5">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[["Full name","name","text"],["Email address","email","email"],["Street address","address","text"],["City","city","text"],["ZIP / Postal code","zip","text"]].map(([label,field,type])=>(
                    <div key={field} className={field === "address" ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                      <input type={type} value={(form as any)[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0A1931] transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                    <select value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0A1931]">
                      {["United States","United Kingdom","Canada","Australia","Germany","France","Nigeria","South Africa","India","Brazil"].map((c)=>(
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={() => setStep("payment")} className="mt-6 w-full bg-[#0A1931] hover:bg-[#061021] text-white font-outfit font-bold py-3 rounded-xl transition-colors">
                  Continue to Payment
                </button>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white rounded-xl p-6">
                <h2 className="font-outfit font-bold text-xl text-gray-900 mb-5">Payment</h2>
                <div className="flex gap-3 mb-5">
                  {["💳 Card","🍎 Apple Pay","🔵 PayPal"].map((m)=>(
                    <button key={m} className={`flex-1 py-2.5 border rounded-lg text-sm transition-colors ${m.includes("Card") ? "border-[#0A1931] bg-blue-50 text-[#0A1931] font-semibold" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>{m}</button>
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Card number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" value={form.card} onChange={(e) => setForm((f) => ({ ...f, card: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0A1931]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry date</label>
                      <input type="text" placeholder="MM / YY" value={form.expiry} onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0A1931]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">CVV</label>
                      <input type="text" placeholder="123" value={form.cvv} onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0A1931]" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep("info")} className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={() => setStep("confirm")} className="flex-1 bg-[#0A1931] hover:bg-[#061021] text-white font-outfit font-bold py-3 rounded-xl transition-colors">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="bg-white rounded-xl p-6">
                <h2 className="font-outfit font-bold text-xl text-gray-900 mb-5">Review & Place Order</h2>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">SHIPPING TO</p>
                  <p className="text-sm text-gray-800">{form.name || "Jamie Chen"} · {form.email || "jamie@email.com"}</p>
                  <p className="text-sm text-gray-600">{form.address || "123 Example Street"}, {form.city || "New York"}, {form.zip || "10001"}</p>
                  <p className="text-sm text-gray-600">{form.country}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-gray-500 mb-2">PAYMENT</p>
                  <p className="text-sm text-gray-800">•••• •••• •••• {form.card.slice(-4) || "3456"}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("payment")} className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={handlePlaceOrder} className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-outfit font-bold py-3 rounded-xl transition-colors">
                    Place Order — ${subtotal.toFixed(2)}
                  </button>
                </div>
              </div>
            )}
            {/* Security Badges */}
            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4 border border-gray-100 mt-6">
              <h3 className="font-outfit font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Secure Checkout
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" /></svg>
                  256-bit SSL Encryption
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" /></svg>
                  Mitao Purchase Protection
                </div>
              </div>
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="bg-white rounded-xl p-5 h-fit">
            <h3 className="font-outfit font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="flex flex-col gap-3 mb-4">
              {cartProducts.map(({ item, product }) => (
                <div key={item.productId} className="flex gap-3">
                  <img src={product!.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2">{product!.title}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#0A1931] flex-shrink-0">${(product!.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-green-600"><span>Shipping</span><span>FREE</span></div>
              <div className="flex justify-between font-outfit font-bold text-base pt-2 border-t border-gray-100 mt-1">
                <span>Total</span><span className="text-[#0A1931]">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
