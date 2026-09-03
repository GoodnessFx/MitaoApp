# Mitao — Figma AI Build Prompt

Paste this into Figma AI / Figma Make (or any AI design tool). It's written as one complete brief so nothing gets missed.

---

## 1. Project Summary

Build a full ecommerce marketplace web app called **Mitao**, structurally modeled on Temu's UX (layout, information density, interaction patterns) but with Mitao's own brand identity: **blue and orange** as the primary palette instead of Temu's red and orange. Every screen, modal, and micro-interaction listed below must be included — this is a full clone of the flow, not just the homepage.

Design for **desktop web first (1920px)**, then a mobile-responsive pass. Style: dense, conversion-optimized marketplace UI — not minimalist. Rounded corners on cards and buttons (8-10px), small bold price typography, heavy use of badges/tags.

---

## 2. Brand & Color System

- **Primary accent (was Temu red):** Blue — use a strong, saturated blue (e.g. `#1D4ED8` / `#2563EB` range) for the header bar, primary CTAs, "Deal" ribbons swap to blue, links, active nav states.
- **Secondary accent (kept):** Orange (e.g. `#F97316` / `#FB923C`) — used for "Add to cart" buttons, urgency badges ("X sold", flame icons), "Accept All" style primary popup buttons, star-seller tags.
- **Neutral base:** Off-white background (`#F5F5F5`), white cards, near-black header/footer (`#111111`–`#1A1A1A`).
- **Success green:** keep green for "Free shipping" / delivery guarantee ticker text.
- **Price color:** current price in blue (not red), strikethrough original price in gray.
- Logo: wordmark "Mitao" in a rounded, friendly sans-serif, orange or blue depending on background, paired with a small basket/shopping icon mark (not Temu's mascot).

---

## 3. Global Header (sticky, appears on every page)

**Row 1 — utility bar (black background):**
- Left: truck icon + "Free shipping on all orders / Limited-time offer" (green text)
- Center: return icon + "Return within 90d / From purchase date" (or "Delivery guarantee / Refund for any issues" as an alternate rotating message)
- Right: phone icon + "Get the Mitao App"

**Row 2 — main nav bar (blue background, replacing Temu's red):**
- Logo (left)
- Nav links: "Best-Selling Items", "5-Star Rated", "New In", "Categories" (with chevron, opens mega menu)
- Center: search bar with placeholder text and search icon button
- Right, in order: "Sign in / Register" with account icon (stacks to "Orders & Account" on second line once signed in state is designed), "Support" with chevron, language/country selector with flag icon, cart icon with item-count badge

**Categories mega-menu (on hover/click of "Categories"):**
- Left column: scrollable list of top-level categories (Featured, Home & Kitchen, Women's Clothing, Women's Curve Clothing, Women's Shoes, Women's Lingerie & Loungewear, Men's Clothing, Men's Shoes, Men's Big & Tall, Men's Underwear & Sleepwear, Sports & Outdoors, Jewelry & Accessories, Beauty & Personal Care, Toys & Games, Automotive…) — active row highlighted with light gray background
- Right area: 3-row x 5-column grid of subcategory tiles, each a circular thumbnail image + label below, with an orange "HOT" ribbon badge on trending tiles

---

## 4. Auth Popovers

**A. Sign-in prompt (small popover, top right, no page navigation):**
- Header: "Sign in for the best experience"
- Full-width "Continue with Google" button (white bg, Google "G" icon, black text, subtle border)
- Full-width "Sign in / Register" button (white bg, black border, black text)
- Small print: "By continuing, you agree to our Terms of Use and acknowledge that you have read our Privacy Policy." with both as blue links

**B. Google account chooser popover (when Google is tapped):**
- Google "G" logo + "Sign in to mitao.com with google.com" + close (X)
- Account row: avatar circle with initial, name, email
- Full-width blue "Continue as [name]" button
- Disclosure text: "To continue, google.com will share your name, email address, and profile picture with this site. See this site's privacy policy and terms of service." with links underlined

---

## 5. Support Dropdown (opens from header "Support")

White card, black text, icon + label rows, top-aligned under the nav item:
- Support center
- Safety center
- Chat with Mitao
- Mitao purchase protection
- Privacy policy
- Terms of use

---

## 6. Cookie Consent Banner (bottom-left, on first load, dismissible)

- Card title: "Privacy & cookie setting"
- 2-3 sentence body text explaining cookie usage for service/experience/advertising, with an inline "Cookies and Similar Technologies Policy" link
- "Customise Cookies" text link (bottom left)
- Two pill buttons: "Reject All" (outlined) and "Accept All" (solid orange, primary)

---

## 7. Product Grid (homepage body)

5-column responsive grid of product cards. Each card contains, top to bottom:
1. Square product photo (some cards have an overlay ribbon like "Deal", a color-swatch strip like "5+ Colors", or a callout label like "90° elbow design")
2. Product title, 1-2 lines, truncated with ellipsis
3. Price row: current price (bold, blue), strikethrough original price (gray), flame icon + "X sold/X+ sold" in orange, small circular "add to cart" icon button (orange) aligned right
4. Optional merit line in orange text: "Best-Selling Item in [subcategory]" or "Top Rated in [subcategory]" or "Only 2 left" with an info icon
5. Star rating row: filled/half stars + review count
6. Tag row: brand name in a light-gray pill, and/or "Star seller" badge (orange fill, star icon), and/or "Brand Official Store: [name]" badge (dark fill)

Include a centered orange pill "See more ⌄" button beneath the last row of the grid to load more products.

---

## 8. Floating Right-Edge Toolbar (persists while scrolling, all pages)

Vertically stacked small icon buttons, white background, on the right edge of the viewport:
- Messages (chat bubble icon)
- Feedback (pencil/edit icon)
- Top (chevron-up icon, scroll-to-top)

---

## 9. Footer (black background, appears on every page)

Four-column layout:

**Column 1 — Company info:** About Mitao · Affiliate & Influencer Program: Join to Earn · Contact us · Careers · Press · Mitao's Tree Planting Program

**Column 2 — Customer service:** Return and refund policy · Intellectual property policy · Shipping info · Report suspicious activity

**Column 3 — Help:** Support center & FAQ · Safety center · Mitao purchase protection · Sitemap · Partner with Mitao

**Column 4 — Download the Mitao App:**
- Two-column feature checklist with icons: Price-drop alerts / Track orders any time / Faster & more secure checkout / Low stock items alerts / Exclusive offers / Coupons & offers alerts
- "Download on the App Store" and "Get it on Google Play" badge buttons

**Below the four columns — "Connect with Mitao":** row of social icons (Instagram, Facebook, X, TikTok, YouTube, Pinterest)

**Security certification row:** small logo badges (PCI DSS, Visa Secure, Mastercard ID Check, SafeKey, ProtectBuy, JCB J/Secure, APWG) — relabel/restyle as generic trust badges if exact marks aren't licensable

**We accept row:** payment logos (Verve, Visa, Mastercard, Amex, Discover, Maestro, Diners Club, JCB, Apple Pay, Google Pay, OPay)

**Bottom bar:** "© 2022 - [current year] Mitao Inc." + inline links: Terms of use · Privacy policy · Your privacy choices (with toggle icon) · Ad Choices

---

## 10. Interaction & State Notes

- Header nav bar and utility bar are both sticky/fixed on scroll (utility bar may collapse into the main bar past a scroll threshold).
- Categories mega-menu, Support dropdown, and Sign-in popover are all hover-or-click triggered overlays anchored to their nav item, with a soft drop shadow and 4-8px corner radius.
- Cart icon shows a live count badge (orange circle, white number) once items are added.
- Language/country selector opens a simple list overlay (flag + language name), not a full page.
- Cookie banner persists until "Accept All" or "Reject All" is chosen, then dismisses with a fade/slide-out.

---

## 11. Deliverables to Generate

1. Desktop homepage (all sections above, fully populated with placeholder product data)
2. Categories mega-menu state
3. Sign-in popover + Google chooser popover states
4. Support dropdown state
5. Cookie consent banner state
6. Mobile (390px) responsive version of the homepage
7. A reusable component set: Header, Product Card, Footer, Auth Popover, Mega Menu — so they can be dropped onto other pages (PDP, cart, checkout) later

---

## 12. Copy Rules

Do not use the word "Temu" anywhere in generated copy, layer names, or asset labels — everything should read "Mitao" natively, written as if Mitao designed it from scratch (not a reskin). Avoid em dashes in any generated marketing copy.