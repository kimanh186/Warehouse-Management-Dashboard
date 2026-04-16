import { createBrowserRouter } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Categories from "./pages/Categories";
import ImportOrders from "./pages/ImportOrders";
import ExportOrders from "./pages/ExportOrders";
import Reports from "./pages/Reports";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "products", Component: Products },
      { path: "suppliers", Component: Suppliers },
      { path: "categories", Component: Categories },
      { path: "import-orders", Component: ImportOrders },
      { path: "export-orders", Component: ExportOrders },
      { path: "reports", Component: Reports },
    ],
  },
]);
