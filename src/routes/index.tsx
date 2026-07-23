import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, AlertTriangle, FileWarning, CalendarDays, ShieldAlert, BadgeCheck, Book, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function StatCard({ title, value, icon: Icon, description }: any) {
  return (
    <div className="bg-card border border-border p-6 rounded-xl flex flex-col hover:border-primary/50 transition-colors shadow-sm group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
    </div>
  );
}

function Dashboard() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral do Setor de Segurança dos Instrutores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Fiscalizadores Ativos" value="12" icon={Users} description="+2 desde a última semana" />
        <StatCard title="Casos Abertos" value="5" icon={AlertTriangle} description="Requer atenção da diretoria" />
        <StatCard title="Casos Resolvidos" value="48" icon={BadgeCheck} description="Neste mês" />
        <StatCard title="Advertências (Mês)" value="3" icon={FileWarning} description="Punições aplicadas" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Acesso Rápido</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Link to="/casos" className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-secondary transition-all group">
                <div className="bg-destructive/10 p-3 rounded-md text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">Abrir Novo Caso</h3>
                  <p className="text-sm text-muted-foreground truncate">Exclusivo para Fiscalizadores</p>
                </div>
             </Link>
             <Link to="/escalas" className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-secondary transition-all group">
                <div className="bg-primary/10 p-3 rounded-md text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">Minha Escala</h3>
                  <p className="text-sm text-muted-foreground truncate">Verifique seus dias e status</p>
                </div>
             </Link>
             <a href="https://sites.google.com/view/instrutores-da-rcc/c%C3%B3digo-penal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-secondary transition-all group">
                <div className="bg-orange-500/10 p-3 rounded-md text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                  <Book className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate flex items-center gap-1.5">
                    Código Penal <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">Consulta de regras</p>
                </div>
             </a>
             <a href="https://www.policiarcc.com/t38418-ins-quadro-de-advertencias" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-secondary transition-all group">
                <div className="bg-yellow-500/10 p-3 rounded-md text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors shrink-0">
                  <FileWarning className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate flex items-center gap-1.5">
                    Quadro de Advertências <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">Tópico no fórum oficial</p>
                </div>
             </a>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-foreground mb-6">Próxima Escala Automática</h2>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center text-primary mb-4 border border-primary/20">
              <CalendarDays className="h-10 w-10" />
            </div>
            <p className="text-foreground font-medium mb-1">Domingo, 00:00</p>
            <p className="text-sm text-muted-foreground">A escala da próxima semana será gerada automaticamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
