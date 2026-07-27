import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  Navigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Setor de Segurança dos Instrutores" },
      { name: "description", content: "SSI: Your Command Center is a new application designed to manage your commands and orders." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Setor de Segurança dos Instrutores" },
      { property: "og:description", content: "SSI: Your Command Center is a new application designed to manage your commands and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Setor de Segurança dos Instrutores" },
      { name: "twitter:description", content: "SSI: Your Command Center is a new application designed to manage your commands and orders." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7c5fcc73-3643-455b-a4d6-59b44790dcfb/id-preview-0971a51d--7b22f844-8dd4-4ca0-8a82-e5fed0f52d4f.lovable.app-1784840521225.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7c5fcc73-3643-455b-a4d6-59b44790dcfb/id-preview-0971a51d--7b22f844-8dd4-4ca0-8a82-e5fed0f52d4f.lovable.app-1784840521225.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

    if (!isAuthenticated) return;
    const runAutoBackgroundSync = async () => {
      try {
        const { getConfig } = await import("../lib/store");
        const config = await getConfig();
        if (config.googleConnected) {
          console.log("[AutoSync Background] Sincronização automática ativa no app. Alinhando e salvando todas as escalas e módulos no Google Sheets...");
          const { syncAll } = await import("../lib/syncManager");
          await syncAll();
        }
      } catch (e) {
        console.error("Falha na sincronização silenciosa de fundo:", e);
      }
    };

    // Aciona imediatamente e de forma incondicional ao abrir/atualizar o app e a cada 30 segundos
    runAutoBackgroundSync();
    const interval = setInterval(runAutoBackgroundSync, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <div className="h-16 w-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center overflow-hidden p-2 mb-4 animate-pulse">
          <img src="/logo.png" alt="SSI Logo" className="h-full w-full object-contain" />
        </div>
        <p className="text-muted-foreground animate-pulse font-medium">Verificando credenciais e acesso seguro...</p>
      </div>
    );
  }

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }

  if (location.pathname === '/login') {
    return <Outlet />;
  }

  // --- SEGURANÇA DE FLUXO BY perfil: Bloqueio contra navegação direta indevida via URL ---
  const routePermissions: Record<string, string> = {
    '/escalas': 'Escala Semanal',
    '/membros': 'Listagem de Membros',
    '/casos': 'Gestão de Casos',
    '/advertencias': 'Registro de Punições',
    '/relatorios': 'Relatórios e Auditoria',
    '/configuracoes': 'Configurações'
  };

  const requiredPermission = routePermissions[location.pathname];
  if (requiredPermission && user && user.permissions) {
    const hasPerm = (user.permissions as string[]).includes(requiredPermission) || (user.permissions as string[]).includes('all');
    if (!hasPerm && user.role !== "Ministério" && user.role !== "Presidente" && user.role !== "Vice-Presidente") {
      setTimeout(() => console.warn(`Acesso restrito ao módulo ${requiredPermission}`), 100);
      return <Navigate to="/" />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background font-sans text-foreground">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex flex-1 mt-16 w-full relative">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 top-16 bg-background/80 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-64 w-full relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout />
        <Toaster theme="dark" position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
