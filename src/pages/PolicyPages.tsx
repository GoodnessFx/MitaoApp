import { useState } from "react";
import { Link } from "react-router";
import { PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";

function PolicyLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-[#2563EB] text-white py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-outfit font-black text-3xl">{title}</h1>
          <p className="text-blue-200 text-sm mt-1">Last updated: September 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl p-8">{children}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="font-outfit font-bold text-gray-900 text-lg mb-2">{title}</h2>
      <div className="text-sm leading-relaxed text-gray-600">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

export function Privacy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <Section title="1. Information We Collect">
        We collect information you provide directly to us when you create an account, make a purchase, or contact support. This includes your name, email, shipping address, and payment information. We also collect usage data automatically, including browsing activity and device identifiers.
      </Section>
      <Section title="2. How We Use Your Information">
        We use the information we collect to process transactions, deliver products, send order confirmations, provide customer support, personalize your shopping experience, and improve our services.
      </Section>
      <Section title="3. Information Sharing">
        We do not sell your personal information. We share data only with partners needed to provide services (payment processors, shipping carriers), or when required by law.
      </Section>
      <Section title="4. Cookies and Tracking">
        We use cookies and similar technologies to maintain sessions, remember preferences, analyze traffic, and serve relevant advertisements. Manage preferences via our Cookie Settings page.
      </Section>
      <Section title="5. Your Rights">
        Depending on your location, you may have rights to access, correct, delete, or port your personal data. Contact <a href="mailto:privacy@mitao.com" className="text-[#2563EB]">privacy@mitao.com</a> to exercise these rights.
      </Section>
      <Section title="6. Data Retention">
        We retain personal data as long as necessary to provide services and meet legal obligations. Order records are retained for 7 years.
      </Section>
      <Section title="7. Contact">
        Questions? Contact us at <a href="mailto:privacy@mitao.com" className="text-[#2563EB]">privacy@mitao.com</a> or our <Link to="/support" className="text-[#2563EB]">support center</Link>.
      </Section>
    </PolicyLayout>
  );
}

export function Terms() {
  return (
    <PolicyLayout title="Terms of Use">
      <Section title="1. Acceptance of Terms">
        By accessing or using Mitao, you agree to be bound by these Terms of Use. If you disagree with any part, you may not access the Service.
      </Section>
      <Section title="2. User Accounts">
        When you create an account, you must provide accurate and complete information. You are responsible for all activities under your account. Notify us immediately of any unauthorized use.
      </Section>
      <Section title="3. Purchases">
        All purchases are subject to product availability. Prices are in USD and may change without notice. By placing an order, you represent you have the right to use your payment method.
      </Section>
      <Section title="4. Prohibited Activities">
        You may not use our platform to transmit unlawful or harmful content, impersonate others, violate applicable laws, or use automated scripts to collect information.
      </Section>
      <Section title="5. Intellectual Property">
        All content, features, and functionality on Mitao are the exclusive property of Mitao Inc. and protected by copyright and other laws.
      </Section>
      <Section title="6. Limitation of Liability">
        Mitao shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
      </Section>
      <Section title="7. Changes to Terms">
        We may update these Terms at any time. Material changes will be communicated with at least 30 days' notice before taking effect.
      </Section>
    </PolicyLayout>
  );
}

export function Safety() {
  return (
    <PolicyLayout title="Safety Center">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          { icon: "🔒", title: "Secure Payments", desc: "All transactions encrypted with 256-bit SSL. We never store your full card number." },
          { icon: "✅", title: "Purchase Protection", desc: "Shop with confidence. If your item doesn't arrive, we'll refund you in full." },
          { icon: "↩️", title: "90-Day Returns", desc: "Not satisfied? Return any item within 90 days for a full refund." },
          { icon: "🛡️", title: "Verified Sellers", desc: "Every seller is vetted and rated. Bad actors are removed immediately." },
        ].map((card) => (
          <div key={card.title} className="border border-gray-100 rounded-xl p-4">
            <span className="text-2xl mb-2 block">{card.icon}</span>
            <h3 className="font-outfit font-bold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-600">{card.desc}</p>
          </div>
        ))}
      </div>
      <Section title="Reporting Suspicious Activity">
        If you encounter a suspicious seller or listing, report it via <a href="mailto:safety@mitao.com" className="text-[#2563EB]">safety@mitao.com</a>. We investigate all reports within 24 hours.
      </Section>
      <Section title="Scam Awareness">
        Mitao will never ask for your password or payment card details outside of our official platform. Be cautious of emails or messages requesting sensitive information.
      </Section>
      <Section title="Counterfeit Policy">
        We have zero tolerance for counterfeit goods. Report suspected fakes for an immediate investigation, listing removal, and full refund.
      </Section>
    </PolicyLayout>
  );
}

export function Support() {
  const faqs = [
    { q: "How do I track my order?", a: "Go to My Orders in your account dashboard. Click on any order to see real-time tracking and estimated delivery date." },
    { q: "What is Mitao's return policy?", a: "We offer a 90-day return window from purchase date. Items must be in original condition. Start a return from your Orders page." },
    { q: "How long does shipping take?", a: "Most orders ship within 1-2 business days. Delivery takes 5-15 business days depending on location. Express options available at checkout." },
    { q: "How do I contact a seller?", a: "Go to the product page and click 'Chat with seller' to ask about the product, customizations, or shipping." },
    { q: "My order never arrived. What do I do?", a: "Visit your Orders page and click 'Contact Support'. We'll investigate and resolve within 48 hours." },
    { q: "How do I get a refund?", a: "Submit a refund request from your Orders page. Approved refunds are processed within 3-5 business days." },
    { q: "Can I change or cancel my order?", a: "Orders can be modified or cancelled within 1 hour. After that, wait for delivery and initiate a return." },
    { q: "Is Mitao safe to shop on?", a: "Absolutely. All payments use 256-bit SSL encryption, and Purchase Protection covers every order." },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-[#2563EB] text-white py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-outfit font-black text-3xl mb-2">Support Center</h1>
          <p className="text-blue-200 text-sm mb-4">Find answers fast or chat with our team.</p>
          <div className="flex items-center bg-white rounded-xl overflow-hidden max-w-lg">
            <svg className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search for help..." className="flex-1 px-3 py-3 text-gray-800 text-sm outline-none" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: "📦", label: "Track order", path: "/orders" },
            { icon: "↩️", label: "Return item", path: "/orders" },
            { icon: "💬", label: "Live chat", path: "/chat" },
            { icon: "📋", label: "My orders", path: "/orders" },
          ].map((a) => (
            <Link key={a.label} to={a.path} className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow border border-gray-100">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold text-gray-700 text-center">{a.label}</span>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-outfit font-bold text-gray-900 text-lg">Frequently Asked Questions</h2>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-50 last:border-0">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-3 ${open === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {open === i && <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>}
            </div>
          ))}
        </div>

        <div className="bg-[#EFF6FF] rounded-2xl p-6 text-center border border-blue-100">
          <p className="font-outfit font-bold text-gray-900 mb-1">Still need help?</p>
          <p className="text-sm text-gray-600 mb-4">Our support team is available 24/7.</p>
          <Link to="/chat" className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Chat with us now
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PurchaseProtection() {
  return (
    <PolicyLayout title="Mitao Purchase Protection">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-3xl">✅</span>
        <div>
          <p className="font-outfit font-bold text-gray-900">Every order on Mitao is protected</p>
          <p className="text-sm text-gray-600">Shop with complete confidence.</p>
        </div>
      </div>
      <Section title="What's Covered">
        <ul className="list-disc list-inside space-y-1.5">
          <li>Item not received by estimated delivery date</li>
          <li>Item significantly different from the product description</li>
          <li>Item arrives damaged or defective</li>
          <li>Counterfeit or inauthentic items</li>
          <li>Unauthorized transactions on your account</li>
        </ul>
      </Section>
      <Section title="How to File a Claim">
        Go to your Orders page, find the order, and click "Request Protection Claim." Provide details and photos. Our team reviews claims within 48 hours.
      </Section>
      <Section title="Refund Timeline">
        Approved refunds are processed to your original payment method within 3-5 business days.
      </Section>
      <Section title="Exclusions">
        Purchase Protection does not cover items that were accurately described, buyer's remorse past 90 days, or items damaged through customer misuse.
      </Section>
    </PolicyLayout>
  );
}

export function Returns() {
  return (
    <PolicyLayout title="Return & Refund Policy">
      <Section title="90-Day Return Window">
        All items are eligible for return within 90 days of purchase. Items must be in original condition — unworn, unwashed, with all tags attached.
      </Section>
      <Section title="How to Initiate a Return">
        <ol className="list-decimal list-inside space-y-1.5">
          <li>Go to My Orders and find your order</li>
          <li>Click "Request Return" on the item</li>
          <li>Select a reason and upload photos if damaged</li>
          <li>Print the prepaid return label we send you</li>
          <li>Drop off at any courier location</li>
        </ol>
      </Section>
      <Section title="Refund Processing">
        Once we receive and inspect the return (3-5 business days), your refund is processed to your original payment method within another 3-5 business days.
      </Section>
      <Section title="Non-Returnable Items">
        Intimate apparel, swimwear, perishable goods, digital downloads, and customized items cannot be returned.
      </Section>
    </PolicyLayout>
  );
}

export function Shipping() {
  return (
    <PolicyLayout title="Shipping Information">
      <Section title="Free Shipping on All Orders">
        Mitao offers completely free shipping on every order — no minimum required and no hidden fees.
      </Section>
      <Section title="Estimated Delivery Times">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="bg-gray-50"><th className="text-left py-2 px-3 font-semibold text-gray-700">Destination</th><th className="text-left py-2 px-3 font-semibold text-gray-700">Estimated Time</th></tr></thead>
          <tbody>
            {[["United States","5-10 business days"],["United Kingdom","7-12 business days"],["Europe","8-14 business days"],["Canada","7-12 business days"],["Australia","10-18 business days"],["Rest of World","12-25 business days"]].map(([dest,time])=>(
              <tr key={dest} className="border-t border-gray-100"><td className="py-2 px-3 text-gray-700">{dest}</td><td className="py-2 px-3 text-gray-700">{time}</td></tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Order Processing">
        Most orders are processed within 1-2 business days. You'll receive a shipping confirmation email with a tracking number once your order ships.
      </Section>
      <Section title="Express Shipping">
        Express options available at checkout. Express orders typically arrive in 3-5 business days.
      </Section>
    </PolicyLayout>
  );
}

export function NewIn() {
  const newProducts = [...PRODUCTS].reverse().slice(0, 10);
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white py-8 px-6 mb-4">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="font-outfit font-black text-3xl">New In</h1>
          <p className="text-blue-200 text-sm mt-1">Fresh arrivals updated daily</p>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {newProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}

export function BestSelling() {
  const sorted = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews);
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white py-8 px-6 mb-4">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="font-outfit font-black text-3xl">Best-Selling Items</h1>
          <p className="text-orange-100 text-sm mt-1">Top picks loved by millions of shoppers</p>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}

export function TopRated() {
  const sorted = [...PRODUCTS].filter((p) => p.rating >= 4.7).sort((a, b) => b.rating - a.rating);
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white py-8 px-6 mb-4">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="font-outfit font-black text-3xl">5-Star Rated</h1>
          <p className="text-purple-200 text-sm mt-1">Only the highest-rated products make this list</p>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center gap-4">
      <div className="text-8xl font-outfit font-black text-[#2563EB]">404</div>
      <h1 className="font-outfit font-bold text-2xl text-gray-900">Page not found</h1>
      <p className="text-gray-400">The page you're looking for doesn't exist.</p>
      <Link to="/" className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-8 py-3 rounded-xl transition-colors font-outfit">
        Back to Home
      </Link>
    </div>
  );
}

export function CookieSettings() {
  return (
    <PolicyLayout title="Cookie Settings">
      <Section title="1. Your choices">
        You can control non-essential cookies used for personalization and analytics. Essential cookies are required for core features like login, cart, and secure checkout.
      </Section>
      <Section title="2. Cookie categories">
        <BulletList
          items={[
            "Essential: login sessions, fraud prevention, and checkout security.",
            "Preferences: language, currency, and basic UI settings.",
            "Analytics: aggregated usage to improve performance and UX.",
            "Marketing: optional ads measurement and retargeting.",
          ]}
        />
      </Section>
      <Section title="3. Manage cookies">
        In this demo build, cookie preferences are not persisted across browsers. In production, these toggles should be stored server-side and applied to analytics/ads SDK initialization.
      </Section>
      <Section title="Need help?">
        Visit our <Link to="/support" className="text-[#2563EB]">support center</Link> or contact <a className="text-[#2563EB]" href="mailto:privacy@mitao.com">privacy@mitao.com</a>.
      </Section>
    </PolicyLayout>
  );
}

export function About() {
  return (
    <PolicyLayout title="About Mitao">
      <Section title="What Mitao is">
        Mitao is a premium, mobile-first marketplace built for clarity, trust, and speed. We keep the “dense discovery” experience people love, but we remove the chaos, fake urgency, and noisy interfaces that make shopping feel cheap.
      </Section>
      <Section title="What we believe">
        <BulletList
          items={[
            "Trust first: clear policies, honest product information, and purchase protection.",
            "Fast shopping: quick-add, clean product pages, and a checkout that stays smooth.",
            "Real support: a human support path whenever you need it.",
          ]}
        />
      </Section>
      <Section title="Contact">
        For press or partnerships, use <a className="text-[#2563EB]" href="mailto:hello@mitao.com">hello@mitao.com</a>. For order help, use the <Link to="/support" className="text-[#2563EB]">support center</Link>.
      </Section>
    </PolicyLayout>
  );
}

export function Affiliate() {
  return (
    <PolicyLayout title="Affiliate & Influencer Program">
      <Section title="How it works">
        Share Mitao products with your audience and earn commissions on completed purchases tracked through your referral links.
      </Section>
      <Section title="Program basics">
        <BulletList
          items={[
            "Transparent attribution rules and payout schedules.",
            "Brand-safe creative guidelines (no misleading claims).",
            "Support for custom campaigns and tracking for top partners.",
          ]}
        />
      </Section>
      <Section title="Apply">
        Email <a className="text-[#2563EB]" href="mailto:affiliates@mitao.com">affiliates@mitao.com</a> with your social links and audience stats.
      </Section>
    </PolicyLayout>
  );
}

export function Careers() {
  return (
    <PolicyLayout title="Careers">
      <Section title="Build the future of trustworthy ecommerce">
        We’re building a marketplace where shoppers can move fast without losing confidence. If you care about craftsmanship, performance, and clean UX, you’ll fit in.
      </Section>
      <Section title="How to apply">
        Send your portfolio/LinkedIn and role interests to <a className="text-[#2563EB]" href="mailto:careers@mitao.com">careers@mitao.com</a>.
      </Section>
    </PolicyLayout>
  );
}

export function Press() {
  return (
    <PolicyLayout title="Press">
      <Section title="Media enquiries">
        For media requests, interviews, or brand assets, contact <a className="text-[#2563EB]" href="mailto:press@mitao.com">press@mitao.com</a>.
      </Section>
      <Section title="Brand assets">
        Use our name as “Mitao” (no extra punctuation). Don’t alter the wordmark colors in a way that reduces readability.
      </Section>
    </PolicyLayout>
  );
}

export function Environment() {
  return (
    <PolicyLayout title="Mitao's Tree Planting Program">
      <Section title="Our commitment">
        We fund verified tree-planting and reforestation projects as part of our sustainability program. Project reporting and verification details are shared periodically.
      </Section>
      <Section title="How it’s measured">
        We report in aggregate: funds contributed, estimated trees planted, and project partners. We do not make personal “per-order” claims unless the program is explicitly tied to your purchase at checkout.
      </Section>
    </PolicyLayout>
  );
}

export function IPPolicy() {
  return (
    <PolicyLayout title="Intellectual Property Policy">
      <Section title="Respect for IP">
        Mitao does not allow listings that infringe trademarks, copyrights, patents, or trade dress. We investigate valid notices and remove infringing listings quickly.
      </Section>
      <Section title="How to report">
        Send reports to <a className="text-[#2563EB]" href="mailto:ip@mitao.com">ip@mitao.com</a> with evidence of ownership and links to the listings.
      </Section>
      <Section title="Repeat violations">
        Sellers who repeatedly violate IP rules may be suspended or permanently banned.
      </Section>
    </PolicyLayout>
  );
}

export function ReportSuspicious() {
  return (
    <PolicyLayout title="Report Suspicious Activity">
      <Section title="What to report">
        <BulletList
          items={[
            "Suspicious sellers, fake tracking updates, or counterfeit claims.",
            "Requests to pay outside Mitao checkout.",
            "Phishing messages asking for passwords or card details.",
          ]}
        />
      </Section>
      <Section title="How to report">
        Email <a className="text-[#2563EB]" href="mailto:safety@mitao.com">safety@mitao.com</a> with screenshots and order IDs. You can also start a thread in <Link to="/chat" className="text-[#2563EB]">chat</Link>.
      </Section>
    </PolicyLayout>
  );
}

export function Partner() {
  return (
    <PolicyLayout title="Partner with Mitao">
      <Section title="Who we work with">
        We partner with suppliers, logistics providers, creators, and brands that can meet quality, consistency, and customer-care expectations.
      </Section>
      <Section title="Get in touch">
        Contact <a className="text-[#2563EB]" href="mailto:partners@mitao.com">partners@mitao.com</a> with your company profile and the kind of partnership you’re proposing.
      </Section>
    </PolicyLayout>
  );
}

export function AdChoices() {
  return (
    <PolicyLayout title="Ad Choices">
      <Section title="How ads work on Mitao">
        Mitao may use optional marketing cookies to measure performance and show more relevant promotions. We do not sell personal data as a product.
      </Section>
      <Section title="Control your preferences">
        You can manage marketing cookies in <Link to="/cookie-settings" className="text-[#2563EB]">Cookie Settings</Link>. If you turn marketing cookies off, you may still see ads, but they will be less relevant.
      </Section>
      <Section title="Questions">
        Contact <a className="text-[#2563EB]" href="mailto:privacy@mitao.com">privacy@mitao.com</a>.
      </Section>
    </PolicyLayout>
  );
}
