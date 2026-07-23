import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Users, AlertTriangle, FileWarning, Settings, HardDrive } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: CalendarDays, label: "Escalas", href: "/escalas" },
  { icon: Users, label: "Membros", href: "/membros" },
  { icon: AlertTriangle, label: "Casos", href: "/casos" },
  { icon: FileWarning, label: "Advertências", href: "/advertencias" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col fixed left-0 top-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-primary font-bold text-xl tracking-tight">SSI<span className="text-foreground">Panel</span></h1>
      </div>
      
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium border border-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="bg-secondary/50 rounded-lg p-4 flex flex-col items-center text-center border border-border">
          <HardDrive className="h-6 w-6 text-muted-foreground mb-2" />
          <span className="text-xs text-muted-foreground mb-3">Último backup:<br/>Hoje, 14:00</span>
          <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium py-2 rounded transition-colors border border-primary/20 hover:border-primary/40">
            Fazer Backup
          </button>
        </div>
      </div>
    </aside>
  );
}
