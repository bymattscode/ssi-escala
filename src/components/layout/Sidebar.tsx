import { Link, useLocation } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  AlertTriangle, 
  FileWarning, 
  Settings, 
  BarChart3, 
  BookOpen, 
  BookMarked,
  type LucideIcon
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  isGeneral?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Geral",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    ],
  },
  {
    title: "Documentações",
    items: [
      { icon: BookOpen, label: "Documentações", href: "/documentacoes", isGeneral: true },
      { icon: BookMarked, label: "Manual de Função", href: "/manual-de-funcao", isGeneral: true },
    ],
  },
  {
    title: "Operacional",
    items: [
      { icon: CalendarDays, label: "Escala Semanal", href: "/escalas" },
      { icon: Users, label: "Listagem de Membros", href: "/membros" },
      { icon: AlertTriangle, label: "Gestão de Casos", href: "/casos" },
      { icon: FileWarning, label: "Registro de Punições", href: "/advertencias" },
    ],
  },
  {
    title: "Administrativo",
    items: [
      { icon: BarChart3, label: "Relatórios e Auditoria", href: "/relatorios" },
      { icon: Settings, label: "Configurações", href: "/configuracoes" },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed = false }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const canAccessItem = (item: NavItem) => {
    // Documentações, Manual de Função e Dashboard são acessíveis a todos os membros logados
    if (item.isGeneral || item.href === "/" || item.href === "/documentacoes" || item.href === "/manual-de-funcao") {
      return true;
    }
    if (!user || !user.permissions) {
      return item.label === "Dashboard";
    }
    const isAdmin = user.role === "Ministério" || user.role === "Presidente" || user.role === "Vice-Presidente";
    if (isAdmin || (user.permissions as string[]).includes('all')) return true;
    return user.permissions.includes(item.label as any);
  };

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(canAccessItem),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside 
      className={`${
        isCollapsed ? "md:w-20" : "md:w-64"
      } w-64 bg-card/95 backdrop-blur-md border-r border-border h-[calc(100vh-4rem)] flex flex-col fixed left-0 top-16 z-20 transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <nav className={`flex-1 py-4 ${isCollapsed ? "px-2" : "px-3"} flex flex-col gap-1 overflow-y-auto overflow-x-hidden transition-all duration-300`}>
        {filteredSections.map((section, sectionIdx) => (
          <div key={section.title} className="flex flex-col gap-1">
            {/* Divisor entre seções */}
            {sectionIdx > 0 && (
              isCollapsed ? (
                <div className="w-8 h-px bg-border/60 mx-auto my-2 shrink-0" />
              ) : (
                <div className="h-px bg-border/40 mx-2 my-2 shrink-0" />
              )
            )}

            {/* Cabeçalho da Seção */}
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider select-none">
                <span className="text-primary font-bold text-xs leading-none">•</span>
                <span>{section.title}</span>
              </div>
            )}

            {/* Itens de Navegação */}
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => onClose?.()}
                    title={isCollapsed ? `${section.title}: ${item.label}` : undefined}
                    className={`flex items-center ${
                      isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                    } rounded-lg transition-all duration-200 group relative select-none ${
                      isActive 
                        ? "bg-primary/15 text-primary font-medium border border-primary/30 shadow-sm" 
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent"
                    }`}
                  >
                    {isActive && (
                      <div 
                        className={`absolute left-0 ${
                          isCollapsed ? "top-1.5 bottom-1.5 w-1" : "top-0 bottom-0 w-1"
                        } bg-primary rounded-r-md`} 
                      />
                    )}
                    <item.icon 
                      className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                        isActive ? "scale-110 drop-shadow-sm text-primary" : "group-hover:scale-110 group-hover:text-primary"
                      }`} 
                    />
                    {!isCollapsed && (
                      <span className="truncate whitespace-nowrap text-sm leading-tight">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
