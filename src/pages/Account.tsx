import { Link } from "react-router";

export default function Account() {
  const menuItems = [
    { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", label: "My Orders", sub: "3 active orders", path: "/orders" },
    { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", label: "Wishlist", sub: "12 saved items", path: "/" },
    { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", label: "Saved Addresses", sub: "2 addresses", path: "/" },
    { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", label: "Payment Methods", sub: "Visa •••• 3456", path: "/" },
    { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", label: "Notifications", sub: "5 unread", path: "/" },
    { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label: "Chat with Mitao", sub: "Support & seller chats", path: "/chat" },
    { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Purchase Protection", sub: "All orders covered", path: "/purchase-protection" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Profile card */}
        <div className="bg-gradient-to-r from-[#0A1931] to-[#3B82F6] rounded-2xl p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-outfit font-black text-2xl">J</div>
          <div>
            <p className="font-outfit font-black text-white text-xl">Jamie Chen</p>
            <p className="text-blue-200 text-sm">jamie.chen@gmail.com</p>
            <div className="flex gap-3 mt-2">
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">3 orders</span>
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">Gold member</span>
            </div>
          </div>
          <button className="ml-auto bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg transition-colors">Edit profile</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[["$247.43","Total spent"],["12","Items ordered"],["4.8★","Avg. rating given"]].map(([v,l])=>(
            <div key={l} className="bg-white rounded-xl p-4 text-center">
              <p className="font-outfit font-black text-xl text-[#0A1931]">{v}</p>
              <p className="text-xs text-gray-400 mt-1">{l}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-xl overflow-hidden">
          {menuItems.map((item, i) => (
            <Link key={item.label} to={item.path}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${i < menuItems.length - 1 ? "border-b border-gray-50" : ""}`}>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#0A1931]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          ))}
        </div>

        <button className="mt-4 w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition-colors text-sm">
          Sign Out
        </button>
      </div>
    </div>
  );
}
