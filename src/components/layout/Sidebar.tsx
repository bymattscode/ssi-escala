import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Users, AlertTriangle, FileWarning, Settings, BarChart3 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: CalendarDays, label: "Escala Semanal", href: "/escalas" },
  { icon: Users, label: "Listagem de Membros", href: "/membros" },
  { icon: AlertTriangle, label: "Gestão de Casos", href: "/casos" },
  { icon: FileWarning, label: "Registro de Punições", href: "/advertencias" },
  { icon: BarChart3, label: "Relatórios e Auditoria", href: "/relatorios" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { role } = useAuth();

  // Presidente and Vice can see everything.
  // Diretor can't see Configurações. Fiscalizador can't see Configurações.
  const filteredNavItems = navItems.filter((item) => {
    if (role === "Presidente" || role === "Vice-Presidente") return true;
    
    if (role === "Diretor") {
      return !["Configurações", "Relatórios e Auditoria"].includes(item.label);
    }

    if (role === "Fiscalizador") {
      return ["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos"].includes(item.label);
    }
    
    return true;
  });

  return (
    <aside className={`w-64 bg-card/95 backdrop-blur-md border-r border-border h-[calc(100vh-4rem)] flex flex-col fixed left-0 top-16 z-20 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
      <nav className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-2">Menu Principal</div>
        {filteredNavItems.map((item, idx) => {
          // O item é ativo se a rota for igual ao href dele. 
          // (Tratamento especial para as escalas poderia ser feito com state/params)
          const isActive = location.pathname === item.href && (item.href !== "/escalas" || idx === 1); // Simplificação
          return (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => onClose?.()}
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
