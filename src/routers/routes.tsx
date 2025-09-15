import { createBrowserRouter } from "react-router-dom";
import { LoginForm } from "../pages/LoginForm";
import { MainPage } from "../pages/Main";
import { SupplierManagement } from "../pages/SupplierManagement";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "./AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <LoginForm />,
      },
      {
        path: "login",
        element: <LoginForm />,
      },
      {
        path: "main",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <MainPage />,
          },
          {
            path: "overview",
            element: <MainPage activeTab="overview" />,
          },
          {
            path: "suppliers",
            element: <MainPage activeTab="suppliers" />,
          },
          {
            path: "products",
            element: <MainPage activeTab="products" />,
          },
          {
            path: "reports",
            element: <MainPage activeTab="reports" />,
          },
          {
            path: "users",
            element: <MainPage activeTab="users" />,
          },
          {
            path: "partners",
            element: <MainPage activeTab="partners" />,
          },
          {
            path: "management",
            element: <MainPage activeTab="management" />,
          },
        ],
      },
      {
        path: "suppliers",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <SupplierManagement />,
          },
        ],
      },
    ],
  },
]);

export default router;
