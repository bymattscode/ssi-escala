import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, AlertTriangle, FileWarning, CalendarDays, ShieldAlert, BadgeCheck, Book, ExternalLink, HardDrive } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { getMembers, getCases, getWarnings, getConfig } from "../lib/store";

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

// Helper to calculate next Sunday
function getNextSunday() {
  const d = new Date();
  d.setDate(d.getDate() + (7 - d.getDay()));
  d.setHours(0, 0, 0, 0);
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
}

function Dashboard() {
  const { role } = useAuth();
  
  const [stats, setStats] = useState({
    activeInspectors: 0,
    openCases: 0,
    resolvedCases: 0,
    punishments: 0,
    lastBackup: "-"
  });
  
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const nextSunday = getNextSunday();

  useEffect(() => {
    const fetchStats = async () => {
      const members = await getMembers();
      const cases = await getCases();
      const warnings = await getWarnings();
      const config = await getConfig();

      setStats({
        activeInspectors: members.filter(m => m.role === "Fiscalizador" && m.status === "Ativo").length,
        openCases: cases.filter(c => c.status === "Aberto").length,
        resolvedCases: cases.filter(c => c.status === "Resolvido").length,
        punishments: warnings.length,
        lastBackup: config.lastWrite || "-"
      });

      // Format activities
      const activities: any[] = [];
      
      cases.forEach(c => {
        activities.push({
          id: c.id,
          type: "Caso Aberto",
          title: `Caso #${c.id.toUpperCase()} aberto contra ${c.offenderNick}`,
          date: c.creationDate,
          rawDate: new Date(c.creationDate.replace(' ', 'T')).getTime()
        });
        
        if (c.status === "Resolvido" && c.resolutionDate) {
          activities.push({
            id: c.id + "_res",
            type: "Caso Resolvido",
            title: `Caso #${c.id.toUpperCase()} resolvido`,
            date: c.resolutionDate,
            rawDate: new Date(c.resolutionDate.replace(' ', 'T')).getTime()
          });
        }
      });
      
      warnings.forEach(w => {
        // Convert dd/mm/yyyy to parsable for sorting
        const parts = w.date.split('/');
        const rawDate = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00`).getTime() : Date.now();
        
        activities.push({
          id: w.id,
          type: "Punição",
          title: `${w.punishmentType} registrada para ${w.offenderNick}`,
          date: w.date,
          rawDate: rawDate
        });
      });
      
      activities.sort((a, b) => b.rawDate - a.rawDate);
      setRecentActivities(activities.slice(0, 5));
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral do Setor de Segurança dos Instrutores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Fiscalizadores Ativos" value={stats.activeInspectors} icon={Users} description="Total atual" />
        <StatCard title="Casos Abertos" value={stats.openCases} icon={AlertTriangle} description="Requer atenção da diretoria" />
        <StatCard title="Casos Resolvidos" value={stats.resolvedCases} icon={BadgeCheck} description="Total histórico" />
        {role !== "Fiscalizador" && (
           <StatCard title="Punições Aplicadas" value={stats.punishments} icon={FileWarning} description="Total de registros" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Acesso Rápido</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
             {role === "Fiscalizador" && (
               <Link to="/casos" className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-secondary transition-all group">
                  <div className="bg-destructive/10 p-3 rounded-md text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors shrink-0">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">Abrir Novo Caso</h3>
                    <p className="text-sm text-muted-foreground truncate">Exclusivo para Fiscalizadores</p>
                  </div>
               </Link>
             )}
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
             {role !== "Fiscalizador" && (
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
             )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-6">Status do Sistema</h2>
            <div className="flex-1 flex flex-col items-center justify-center text-center mb-6">
              <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center text-primary mb-4 border border-primary/20">
                <CalendarDays className="h-10 w-10" />
              </div>
              <p className="text-foreground font-medium mb-1 capitalize">{nextSunday}</p>
              <p className="text-sm text-muted-foreground">Próxima escala automática.</p>
            </div>
          </div>
          <div className="border-t border-border pt-4 mt-auto">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-muted-foreground">
                 <HardDrive className="h-4 w-4" />
                 <span className="text-sm font-medium">Último Backup:</span>
               </div>
               <span className="text-sm font-medium text-foreground">{stats.lastBackup}</span>
             </div>
          </div>
        </div>
      </div>
      
      {/* Atividades Recentes */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Atividades Recentes</h2>
        <div className="flex flex-col gap-3">
          {recentActivities.map((act) => (
            <div key={act.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${
                  act.type === "Caso Aberto" ? "bg-blue-500/10 text-blue-500" :
                  act.type === "Caso Resolvido" ? "bg-green-500/10 text-green-500" :
                  "bg-orange-500/10 text-orange-500"
                }`}>
                  {act.type === "Caso Aberto" ? <AlertTriangle className="h-4 w-4" /> :
                   act.type === "Caso Resolvido" ? <BadgeCheck className="h-4 w-4" /> :
                   <FileWarning className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{act.title}</p>
                  <p className="text-xs text-muted-foreground">{act.type}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{act.date}</span>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade registrada ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
