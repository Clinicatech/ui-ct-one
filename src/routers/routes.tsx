import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "./AppLayout";

// Lazy loading para otimizar o bundle
const LoginForm = lazy(() =>
  import("../pages/LoginForm").then((m) => ({ default: m.LoginForm }))
);
const MainPage = lazy(() =>
  import("../pages/Main").then((m) => ({ default: m.MainPage }))
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <LoginForm />
          </Suspense>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <LoginForm />
          </Suspense>
        ),
      },
      {
        path: "main",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <MainPage />
              </Suspense>
            ),
          },
          {
            path: "overview",
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <MainPage activeTab="overview" />
              </Suspense>
            ),
          },
          {
            path: "customers",
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <MainPage activeTab="customers" />
              </Suspense>
            ),
          },
          {
            path: "business-partners",
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <MainPage activeTab="business-partners" />
              </Suspense>
            ),
          },
          {
            path: "reports",
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <MainPage activeTab="reports" />
              </Suspense>
            ),
          },
          {
            path: "users",
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <MainPage activeTab="users" />
              </Suspense>
            ),
          },
          {
            path: "partners",
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <MainPage activeTab="partners" />
              </Suspense>
            ),
          },
          {
            path: "management",
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <MainPage activeTab="management" />
              </Suspense>
            ),
          },
          {
            path: "entity",
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <MainPage activeTab="entity" />
              </Suspense>
            ),
          },
          {
            path: "contratos",
            element: (
              <Suspense fallback={<div>Carregando...</div>}>
                <MainPage activeTab="contratos" />
              </Suspense>
            ),
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
