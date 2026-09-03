import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";

interface Message { id: number; from: "user" | "support" | "seller"; text: string; time: string; }

const SELLER_RESPONSES: Record<string, string[]> = {
  default: [
    "Hello! Thank you for reaching out. How can I help you today?",
    "That's a great question! Our products come with a 90-day return guarantee.",
    "We typically ship within 1-2 business days. You'll receive a tracking number via email.",
    "Yes, we offer bulk discounts for orders over 10 units. Please send me your requirements.",
    "I'm happy to help! Let me check that for you right away.",
  ],
  support: [
    "Welcome to Mitao Support! How can I assist you today?",
    "I can help with orders, returns, refunds, and account issues.",
    "Your order is currently being processed and will ship within 2 business days.",
    "For refunds, please submit a request through your Orders page. Refunds typically take 3-5 business days.",
    "Is there anything else I can help you with?",
  ],
};

const QUICK_REPLIES = ["Where is my order?","Can I return this?","Is this in stock?","Do you offer discounts?","What's the return policy?","How long does shipping take?"];

export default function Chat() {
  const [searchParams] = useSearchParams();
  const sellerName = searchParams.get("seller") || "Mitao Support";
  const isSupport = !searchParams.get("seller");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: isSupport ? "support" : "seller", text: isSupport ? "Welcome to Mitao Support! I'm here to help you 24/7. How can I assist you today?" : `Hi! I'm the seller of the product you're interested in. Feel free to ask me anything about it!`, time: "now" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const responseIdx = useRef(1);
  const responses = SELLER_RESPONSES[isSupport ? "support" : "default"];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), from: "user", text: text.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply = responses[responseIdx.current % responses.length];
      responseIdx.current++;
      setMessages((m) => [...m, { id: Date.now() + 1, from: isSupport ? "support" : "seller", text: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Chat header */}
        <div className="bg-white rounded-t-xl border-b border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0A1931] flex items-center justify-center text-white font-bold">
            {isSupport ? "M" : sellerName[0]}
          </div>
          <div>
            <p className="font-outfit font-bold text-gray-900 text-sm">{isSupport ? "Mitao Support" : sellerName}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400">{isSupport ? "Available 24/7" : "Typically responds in < 1 hour"}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <div className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#0A1931] cursor-pointer rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white min-h-96 max-h-[calc(100vh-320px)] overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} gap-2`}>
              {msg.from !== "user" && (
                <div className="w-7 h-7 rounded-full bg-[#0A1931] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-auto">
                  {isSupport ? "M" : sellerName[0]}
                </div>
              )}
              <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${msg.from === "user" ? "bg-[#0A1931] text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.from === "user" ? "text-blue-200" : "text-gray-400"}`}>{msg.time}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0A1931] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{isSupport ? "M" : sellerName[0]}</div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0,1,2].map((i)=>(
                    <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {QUICK_REPLIES.map((r) => (
              <button key={r} onClick={() => sendMessage(r)}
                className="flex-shrink-0 text-xs border border-[#0A1931] text-[#0A1931] px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors">
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-b-xl border-t border-gray-100 p-3 flex gap-2">
          <button className="text-gray-400 hover:text-[#0A1931] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Type a message..."
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim()}
            className="bg-[#0A1931] hover:bg-[#061021] disabled:opacity-40 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
