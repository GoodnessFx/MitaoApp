import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("mitao_splash_seen");
    if (!hasSeen) {
      setShow(true);
      sessionStorage.setItem("mitao_splash_seen", "true");
      
      // Start fade out after 1.5s
      setTimeout(() => setFade(true), 1500);
      
      // Remove completely after 2s
      setTimeout(() => setShow(false), 2000);
    }
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A1931] transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}>
      <div className="animate-bounce">
        <img src="/logo.png" alt="Mitao" className="h-28 w-28 object-contain rounded-[2rem] shadow-2xl border-4 border-white/10" />
      </div>
      <h1 className="text-white font-outfit font-black text-4xl mt-6 tracking-tight">Mitao</h1>
    </div>
  );
}
