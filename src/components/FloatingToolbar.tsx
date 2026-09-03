import { useNavigate } from "react-router";

export default function FloatingToolbar() {
  const navigate = useNavigate();
  return (
    <div className="fixed right-4 bottom-20 z-40 flex flex-col gap-2">
      <button onClick={() => navigate("/chat")} title="Messages" className="w-10 h-10 bg-white hover:bg-gray-50 shadow-lg rounded-xl flex items-center justify-center text-gray-600 hover:text-[#0A1931] transition-colors border border-gray-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      </button>
      <button onClick={() => navigate("/support")} title="Feedback" className="w-10 h-10 bg-white hover:bg-gray-50 shadow-lg rounded-xl flex items-center justify-center text-gray-600 hover:text-[#0A1931] transition-colors border border-gray-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </button>
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top" className="w-10 h-10 bg-white hover:bg-gray-50 shadow-lg rounded-xl flex items-center justify-center text-gray-600 hover:text-[#0A1931] transition-colors border border-gray-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
      </button>
    </div>
  );
}
