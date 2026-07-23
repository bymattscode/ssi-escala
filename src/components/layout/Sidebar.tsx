import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Users, AlertTriangle, FileWarning, Settings } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: CalendarDays, label: "Escalas", href: "/escalas" },
  { icon: Users, label: "Listagem de Membros", href: "/membros" },
  { icon: AlertTriangle, label: "Gestão de Casos", href: "/casos" },
  { icon: FileWarning, label: "Registro de Punições", href: "/advertencias" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card/95 backdrop-blur-md border-r border-border h-[calc(100vh-4rem)] flex flex-col fixed left-0 top-16 z-20 ">
      <nav className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-2">Menu Principal</div>
        {navItems.map((item, idx) => {
          // O item é ativo se a rota for igual ao href dele. 
          // (Tratamento especial para as escalas poderia ser feito com state/params)
          const isActive = location.pathname === item.href && (item.href !== "/escalas" || idx === 1); // Simplificação
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? "bg-primary/15 text-primary font-medium border border-primary/30 " 
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"></div>
              )}
              <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110 drop-" : "group-hover:scale-110 group-hover:text-primary"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
