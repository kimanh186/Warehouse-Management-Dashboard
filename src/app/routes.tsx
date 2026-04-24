import { createBrowserRouter } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Categories from "./pages/Categories";
import ImportOrders from "./pages/ImportOrders";
import ExportOrders from "./pages/ExportOrders";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import ProtectedRoute from "./pages/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "products", element: <Products /> },
      { path: "suppliers", element: <Suppliers /> },
      { path: "categories", element: <Categories /> },
      { path: "import-orders", element: <ImportOrders /> },
      { path: "export-orders", element: <ExportOrders /> },
      { path: "reports", element: <Reports /> },
    ],
  },
]);