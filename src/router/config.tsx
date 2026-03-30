import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import LoyaltyPage from "../pages/loyalty/page";
import AdminCardsPage from "../pages/loyalty/admin/page";
import AdminScanPage from "../pages/loyalty/admin-scan/page";
import GamesPage from "../pages/games/page";
import AdminPage from "../pages/admin/page";
import PricesPage from "../pages/prices/page";
import ForumPage from "../pages/forum/page";
import CategoryPage from "../pages/forum/category/page";
import ThreadPage from "../pages/forum/thread/page";

const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/games", element: <GamesPage /> },
  { path: "/prices", element: <PricesPage /> },
  { path: "/loyalty", element: <LoyaltyPage /> },
  { path: "/loyalty/admin", element: <AdminCardsPage /> },
  { path: "/loyalty/admin-scan", element: <AdminScanPage /> },
  { path: "/admin", element: <AdminPage /> },
  { path: "/forum", element: <ForumPage /> },
  { path: "/forum/category/:slug", element: <CategoryPage /> },
  { path: "/forum/thread/:id", element: <ThreadPage /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
