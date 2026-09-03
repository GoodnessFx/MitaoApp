import { createBrowserRouter, Outlet } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingToolbar from "../components/FloatingToolbar";

import Home from "../pages/Home";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Chat from "../pages/Chat";
import Orders from "../pages/Orders";
import Categories from "../pages/Categories";
import Search from "../pages/Search";
import SignIn from "../pages/SignIn";
import Account from "../pages/Account";
import Import1688 from "../pages/Import1688";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminSupport from "../pages/admin/AdminSupport";
import AdminReviews from "../pages/admin/AdminReviews";
import {
  Privacy, Terms, Safety, Support, PurchaseProtection,
  Returns, Shipping, NewIn, BestSelling, TopRated, NotFound,
  CookieSettings, About, Affiliate, Careers, Press, Environment, IPPolicy, ReportSuspicious, Partner, AdChoices,
} from "../pages/PolicyPages";

function Root() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="pt-[104px] flex-1 flex flex-col">
        <Outlet />
      </div>
      <Footer />
      <FloatingToolbar />
    </div>
  );
}

// Sign in page has its own full-screen layout (no header padding)
function SignInLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <SignIn />
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/admin/products",
    Component: AdminProducts,
  },
  {
    path: "/admin/orders",
    Component: AdminOrders,
  },
  {
    path: "/admin/customers",
    Component: AdminCustomers,
  },
  {
    path: "/admin/support",
    Component: AdminSupport,
  },
  {
    path: "/admin/reviews",
    Component: AdminReviews,
  },
  {
    path: "/signin",
    Component: SignInLayout,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "chat", Component: Chat },
      { path: "orders", Component: Orders },
      { path: "categories", Component: Categories },
      { path: "search", Component: Search },
      { path: "import/1688", Component: Import1688 },
      { path: "account", Component: Account },
      { path: "privacy", Component: Privacy },
      { path: "terms", Component: Terms },
      { path: "cookie-settings", Component: CookieSettings },
      { path: "safety", Component: Safety },
      { path: "support", Component: Support },
      { path: "purchase-protection", Component: PurchaseProtection },
      { path: "returns", Component: Returns },
      { path: "shipping", Component: Shipping },
      { path: "about", Component: About },
      { path: "affiliate", Component: Affiliate },
      { path: "careers", Component: Careers },
      { path: "press", Component: Press },
      { path: "environment", Component: Environment },
      { path: "ip-policy", Component: IPPolicy },
      { path: "report", Component: ReportSuspicious },
      { path: "partner", Component: Partner },
      { path: "ad-choices", Component: AdChoices },
      { path: "new-in", Component: NewIn },
      { path: "best-selling", Component: BestSelling },
      { path: "top-rated", Component: TopRated },
      { path: "*", Component: NotFound },
    ],
  },
]);
