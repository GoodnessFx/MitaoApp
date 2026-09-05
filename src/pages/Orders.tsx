import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { PRODUCTS } from "../data/products";
import { useLocaleStore } from "../store/locale";
import { formatCurrency } from "../lib/currency";

const MOCK_ORDERS = [
  { id: "MT-2026-8821", date: "Aug 15, 2026", status: "Delivered", items: [{ productId: 3, qty: 1 }, { productId: 6, qty: 2 }], total: 34.97, tracking: "1ZA23F890123456789" },
  { id: "MT-2026-7743", date: "Aug 8, 2026", status: "In Transit", items: [{ productId: 1, qty: 1 }], total: 12.99, tracking: "1ZA23F890987654321" },
  { id: "MT-2026-6612", date: "Jul 29, 2026", status: "Processing", items: [{ productId: 5, qty: 1 }, { productId: 14, qty: 3 }], total: 49.97, tracking: null },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-50 text-green-700",
  "In Transit": "bg-blue-50 text-[#0A1931]",
  Processing: "bg-orange-50 text-orange-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function Orders() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const [activeTab, setActiveTab] = useState<"all" | "processing" | "transit" | "delivered">("all");
  const currency = useLocaleStore((s) => s.currency);

  const filtered = MOCK_ORDERS.filter((o) => {
    if (activeTab === "all") return true;
    if (activeTab === "processing") return o.status === "Processing";
    if (activeTab === "transit") return o.status === "In Transit";
    if (activeTab === "delivered") return o.status === "Delivered";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="font-outfit font-bold text-green-800">Order placed successfully!</p>
              <p className="text-green-700 text-sm">You'll receive a confirmation email shortly.</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-[#F97316] rounded-full" />
          <h1 className="font-outfit font-black text-2xl text-gray-900">My Orders</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl mb-4 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {([["all","All Orders"],["processing","Processing"],["transit","In Transit"],["delivered","Delivered"]] as const).map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "text-[#0A1931] border-b-2 border-[#0A1931]" : "text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-gray-400">No orders in this category</p>
              <Link to="/" className="text-[#0A1931] text-sm hover:underline">Start shopping</Link>
            </div>
          )}
          {filtered.map((order) => {
            const orderProducts = order.items.map(({ productId, qty }) => ({ product: PRODUCTS.find((p) => p.id === productId), qty })).filter((x) => x.product);
            return (
              <div key={order.id} className="bg-white rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div><p className="text-xs text-gray-400">Order ID</p><p className="font-semibold text-gray-800">{order.id}</p></div>
                    <div><p className="text-xs text-gray-400">Placed on</p><p className="font-semibold text-gray-800">{order.date}</p></div>
                    <div><p className="text-xs text-gray-400">Total</p><p className="font-semibold text-[#0A1931] font-outfit">{formatCurrency(order.total, currency)}</p></div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                </div>

                <div className="p-5">
                  <div className="flex flex-col gap-3 mb-4">
                    {orderProducts.map(({ product, qty }) => (
                      <div key={product!.id} className="flex gap-3 items-center">
                        <Link to={`/product/${product!.id}`} className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={product!.image} alt={product!.title} className="w-full h-full object-cover" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${product!.id}`} className="text-sm text-gray-800 hover:text-[#0A1931] transition-colors line-clamp-1">{product!.title}</Link>
                          <p className="text-xs text-gray-400">Qty: {qty} · {formatCurrency(product!.price, currency)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.tracking && (
                    <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3 mb-3">
                      <svg className="w-4 h-4 text-[#0A1931]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l-1 9a1 1 0 001 1h13a1 1 0 001-1L19 8M10 12h4" /></svg>
                      <div>
                        <p className="text-xs text-gray-500">Tracking number</p>
                        <p className="text-sm font-mono font-semibold text-[#0A1931]">{order.tracking}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Link to={`/chat`} className="text-xs border border-[#0A1931] text-[#0A1931] hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors font-semibold">
                      Contact Support
                    </Link>
                    {order.status === "Delivered" && (
                      <button className="text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                        Request Return
                      </button>
                    )}
                    <button className="text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
