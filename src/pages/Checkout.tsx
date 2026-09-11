import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { cartStore, type CartItem } from "../store/cart";
import { PRODUCTS } from "../data/products";
import { import1688Store } from "../store/import1688";
import { useLocaleStore } from "../store/locale";
import { formatCurrency } from "../lib/currency";
import { fetchApi } from "../lib/api";

export default function Checkout() {
  const [items, setItems] = useState<CartItem[]>(cartStore.getItems());
  const [step, setStep] = useState<"info" | "payment" | "confirm">("info");
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", zip: "", country: "United States" });
  const [selectedProvider, setSelectedProvider] = useState<"paystack" | "flutterwave" | "stripe">("paystack");
  const [paymentError, setPaymentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currency = useLocaleStore((s) => s.currency);
  const navigate = useNavigate();

  useEffect(() => cartStore.subscribe(() => setItems([...cartStore.getItems()])), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success" || params.get("reference") || params.get("trxref") || params.get("transaction_id")) {
      setStep("confirm");
    }
  }, []);

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

  const validateShipping = () => {
    return true;
  };

  const handleHostedCheckout = async () => {
    if (!items.length) {
      setPaymentError("Your cart is empty.");
      return;
    }

    setPaymentError("");
    setIsSubmitting(true);

    try {
      const order = await fetchApi<{ id: string; orderNumber: string; total: number; currency: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            name: form.name.trim() || "Guest User",
            email: form.email.trim() || "guest@mitao.app",
            address: form.address.trim() || "No address provided",
            city: form.city.trim() || "Lagos",
            zip: form.zip.trim() || "100001",
            country: form.country.trim() || "Nigeria",
          },
          paymentMethodLabel: selectedProvider,
        }),
      });

      const init = await fetchApi<{ url?: string; authorization_url?: string; checkoutUrl?: string; status?: string; provider?: string; redirectUrl?: string; message?: string }>('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          provider: selectedProvider,
        }),
      });

      const redirectUrl = init.url || init.authorization_url || init.checkoutUrl || init.redirectUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      setStep('confirm');
      setPaymentError(init.message || 'Payment provider is not configured yet.');
    } catch (error: any) {
      const msg = error?.message || "";
      const status = error?.status;
      if (status === 404 || msg.toLowerCase().includes("route not found") || msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setPaymentError("Backend not reachable at " + (import.meta as any).env?.VITE_API_BASE_URL + " Ensure PXXL backend is deployed and VITE_API_BASE_URL points to it");
      } else {
        setPaymentError(msg || 'Unable to start hosted checkout.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
                <h2 className="font-outfit font-bold text-xl text-gray-900 mb-2">Payment</h2>
                <p className="text-xs text-gray-500 mb-5">Choose Paystack or Flutterwave. You will be redirected to complete payment, then return automatically. Payment must succeed before order is confirmed.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { id: "paystack", name: "Paystack", desc: "Card, Bank, USSD, Mobile Money", icon: "M12 2.5A9.5 9.5 0 1021.5 12 9.5 9.5 0 0012 2.5zm0 17A7.5 7.5 0 1119.5 12 7.5 7.5 0 0112 19.5zM11 7h2v6h-2zm0 8h2v2h-2z" },
                    { id: "flutterwave", name: "Flutterwave", desc: "Card, Barter, Bank Transfer", icon: "M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8zm-1-9h2v6h-2zm1-4a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" },
                  ].map((p) => (
                    <button key={p.id} onClick={() => setSelectedProvider(p.id as any)} className={`text-left p-4 border rounded-xl transition-colors flex gap-3 items-start ${selectedProvider === p.id ? "border-[#0A1931] bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                      <svg className={`w-6 h-6 flex-shrink-0 ${selectedProvider === p.id ? "text-[#0A1931]" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={p.icon} /></svg>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${selectedProvider === p.id ? "text-[#0A1931]" : "text-gray-800"}`}>{p.name}</p>
                        <p className="text-xs text-gray-500">{p.desc}</p>
                        <p className="text-[11px] text-gray-400 mt-1">Amount: {formatCurrency(subtotal, currency)}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedProvider === p.id ? "border-[#0A1931] bg-[#0A1931]" : "border-gray-300"}`}>{selectedProvider === p.id && <span className="w-2 h-2 bg-white rounded-full" />}</div>
                    </button>
                  ))}
                </div>
                {paymentError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-3 mb-4">{paymentError.includes("route not found") ? "Payment backend not reachable at this URL Please check VITE_API_BASE_URL and ensure backend is deployed on PXXL" : paymentError}</div>}
                <div className="flex gap-3">
                  <button onClick={() => setStep("info")} className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={handleHostedCheckout} disabled={isSubmitting} className="flex-1 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 text-white font-outfit font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {isSubmitting ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
                    {isSubmitting ? "Redirecting..." : `Pay ${formatCurrency(subtotal, currency)} with ${selectedProvider === "paystack" ? "Paystack" : "Flutterwave"}`}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-3 text-center">Secure redirect do not close before payment completes. Webhook will confirm order.</p>
              </div>
            )}

            {step === "confirm" && (
              <div className="bg-white rounded-xl p-6">
                <h2 className="font-outfit font-bold text-xl text-gray-900 mb-5">Review & Place Order</h2>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">SHIPPING TO</p>
                  <p className="text-sm text-gray-800">{form.name || "Jamie Chen"} {form.email || "jamie@email.com"}</p>
                  <p className="text-sm text-gray-600">{form.address || "123 Example Street"}, {form.city || "New York"}, {form.zip || "10001"}</p>
                  <p className="text-sm text-gray-600">{form.country}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-gray-500 mb-2">PAYMENT</p>
                  <p className="text-sm text-gray-800">Hosted checkout via {selectedProvider}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("payment")} className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={handlePlaceOrder} className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-outfit font-bold py-3 rounded-xl transition-colors">
                    Place Order {formatCurrency(subtotal, currency)}
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
                  <span className="text-sm font-semibold text-[#0A1931] flex-shrink-0">{formatCurrency(product!.price * item.quantity, currency)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
              <div className="flex justify-between text-green-600"><span>Shipping</span><span>FREE</span></div>
              <div className="flex justify-between font-outfit font-bold text-base pt-2 border-t border-gray-100 mt-1">
                <span>Total</span><span className="text-[#0A1931]">{formatCurrency(subtotal, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

