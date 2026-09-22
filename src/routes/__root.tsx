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

  const handleResetStorage = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-lg text-center bg-card/60 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl">
        <div className="h-14 w-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground mb-2">
          Falha ao carregar a página
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          Ocorreu uma instabilidade temporária ao processar os dados desta tela.
        </p>

        {error?.message && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-left text-xs font-mono text-red-400 overflow-x-auto max-h-32 select-all">
            <span className="font-bold block mb-1">Erro detectado:</span>
            {error.message}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
          >
            Tentar novamente
          </button>
          <button
            onClick={handleResetStorage}
            className="inline-flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2.5 text-sm font-medium border border-border transition-colors shadow-sm"
          >
            Limpar cache e reiniciar
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

// Polyfill anti-crash para Google Tradutor e extensões de navegador
if (typeof window !== "undefined" && typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child && child.parentNode !== this) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[Anti-Crash] Prevenida tentativa de removeChild de nó que não pertence a este pai.", child);
      }
      return child;
    }
    return originalRemoveChild.apply(this, [child]) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[Anti-Crash] Prevenida tentativa de insertBefore de nó com pai divergente.", referenceNode);
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
  };
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google", content: "notranslate" },
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
    <html lang="pt-BR" translate="no" className="notranslate">
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ssi-sidebar-collapsed") === "true";
    }
    return false;
  });
  const location = useLocation();

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("ssi-sidebar-collapsed", String(next));
      }
      return next;
    });
  };

  const handleMenuToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileMenuOpen((prev) => !prev);
    } else {
      toggleSidebarCollapse();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isFirstSync = true;
    const runAutoBackgroundSync = async () => {
      try {
        const { getConfig, getPendingCount } = await import("../lib/store");

        // Skip full sync if there are pending local changes being pushed by individual module sync
        const pendingCount = await getPendingCount();
        if (pendingCount > 0) {
          console.log(`[AutoSync Background] ${pendingCount} item(s) pendente(s) — aguardando sync individual completar.`);
          return;
        }

        const config = await getConfig();
        if (config.googleConnected) {
          console.log("[AutoSync Background] Sincronização automática ativa no app.");
          const { fetchAllFromRemote } = await import("../lib/syncManager");
          await fetchAllFromRemote();
        }
      } catch (e) {
        console.error("Falha na sincronização silenciosa de fundo:", e);
      }
    };

    // Initial delay to let module-level auto-syncs complete first
    const initialTimer = setTimeout(() => {
      runAutoBackgroundSync();
      isFirstSync = false;
    }, 5000);

    const interval = setInterval(runAutoBackgroundSync, 30000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
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
  const routeRoleRules: Record<string, { roles: string[]; perm?: string }> = {
    '/casos': { roles: ['Fiscalizador', 'Diretor', 'Presidente', 'Vice-Presidente', 'Ministério'], perm: 'Gestão de Casos' },
    '/relatorio-avaliacoes': { roles: ['Fiscalizador', 'Diretor', 'Presidente', 'Vice-Presidente', 'Ministério'], perm: 'Relatório de Fiscalização' },
    '/advertencias': { roles: ['Diretor', 'Presidente', 'Vice-Presidente', 'Ministério'], perm: 'Registro de Punições' },
    '/mensagens-privadas': { roles: ['Diretor', 'Presidente', 'Vice-Presidente', 'Ministério'], perm: 'Central de Mensagens Privadas' },
    '/relatorios': { roles: ['Presidente', 'Vice-Presidente', 'Ministério'], perm: 'Relatórios e Auditoria' },
    '/configuracoes': { roles: ['Presidente', 'Vice-Presidente', 'Ministério'], perm: 'Configurações' },
  };

  const rule = routeRoleRules[location.pathname];
  if (rule && user) {
    const isAdmin = user.role === "Ministério" || user.role === "Presidente" || user.role === "Vice-Presidente";
    const perms = (user.permissions as string[]) || [];
    const hasRole = rule.roles.includes(user.role);
    const hasPerm = isAdmin || hasRole || perms.includes('all') || (
      rule.perm && (
        perms.includes(rule.perm) || 
        (rule.perm === 'Relatório de Fiscalização' && perms.includes('Relatório de Avaliações'))
      )
    );
    if (!hasPerm) {
      setTimeout(() => console.warn(`Acesso restrito ao módulo ${location.pathname}`), 100);
      return <Navigate to="/" />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background font-sans text-foreground">
      <TopBar onMenuToggle={handleMenuToggle} isCollapsed={isSidebarCollapsed} />
      <div className="flex flex-1 mt-16 w-full relative">
        <Sidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          isCollapsed={isSidebarCollapsed}
        />
        
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 top-16 bg-background/80 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        <main className={`flex-1 p-4 sm:p-6 md:p-8 ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"} transition-all duration-300 ease-in-out w-full relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background`}>
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
