import { createBrowserRouter } from "react-router-dom";
import { LoginForm } from "../pages/LoginForm";
import { MainPage } from "../pages/Main";
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
            path: "customers",
            element: <MainPage activeTab="customers" />,
          },
          {
            path: "business-partners",
            element: <MainPage activeTab="business-partners" />,
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
          {
            path: "entity",
            element: <MainPage activeTab="entity" />,
          },
          {
            path: "contratos",
            element: <MainPage activeTab="contratos" />,
          },
        ],
      },
      // {
      //   path: "customers",
      //   element: <ProtectedRoute />,
      //   children: [
      //     {
      //       index: true,
      //       element: <NotExists title="Cadastro de Clientes" />,
      //     },
      //   ],
      // },
    ],
  },
]);

export default router;
