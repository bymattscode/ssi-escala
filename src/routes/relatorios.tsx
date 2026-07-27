import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { getAuditLogs, getMembers, getCases, getWarnings, getSchedules } from "../lib/store";
import { AuditLog, Member, Case, Warning, Schedule } from "../lib/types";
import { BarChart3, Filter, History, Download, Printer, Users, ShieldAlert, ShieldCheck, FileWarning, CheckCircle2, AlertTriangle, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [activeTab, setActiveTab] = useState("auditoria");
  const [periodFilter, setPeriodFilter] = useState("Todos");
  const [moduleFilter, setModuleFilter] = useState("Todos");
  const [memberFilter, setMemberFilter] = useState("Todos");
  
  const { role } = useAuth();
  const isAdmin = role === "Presidente" || role === "Vice-Presidente";

  useEffect(() => {
    async function fetchData() {
      const l = await getAuditLogs();
      const m = await getMembers();
      const c = await getCases();
      const w = await getWarnings();
      const s = await getSchedules();
      setLogs(Array.isArray(l) ? l : []);
      setMembers(Array.isArray(m) ? m : []);
      setCases(Array.isArray(c) ? c : []);
      setWarnings(Array.isArray(w) ? w : []);
      setSchedules(Array.isArray(s) ? s : []);
    }
    fetchData();
  }, []);

  const getMemberDetails = (id: string) => members.find(m => m.id === id) || null;

  // Simple stats for reports
  const stats = useMemo(() => {
    const activeMembers = members.filter(m => m.status === "Ativo").length;
    const resolvedCases = cases.filter(c => c.status === "Resolvido").length;
    const totalWarnings = warnings.length;
    
    // Member performance (mock logic for report)
    const productivity = members.filter(m => m.status === "Ativo").map(m => {
      const memberCases = cases.filter(c => c.creatorId === m.id).length;
      const memberWarnings = warnings.filter(w => w.offenderNick === m.nick).length;
      const memberSchedules = schedules.filter(s => s.memberId === m.id).length;
      const delayedSchedules = schedules.filter(s => s.memberId === m.id && s.status === "Atrasado").length;
      return { member: m, memberCases, memberWarnings, memberSchedules, delayedSchedules };
    });

    return { activeMembers, resolvedCases, totalWarnings, productivity };
  }, [members, cases, warnings, schedules]);

  const filteredLogs = useMemo(() => {
    let result = [...logs];
    
    // Filter by Module
    if (moduleFilter !== "Todos") {
      result = result.filter(log => log.module === moduleFilter);
    }
    
    // Filter by Member (UserId)
    if (memberFilter !== "Todos") {
      result = result.filter(log => log.userId === memberFilter);
    }

    // Filter by Date
    if (periodFilter !== "Todos") {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      result = result.filter(log => {
        const diff = now - log.timestamp;
        if (periodFilter === "Hoje") return diff <= oneDay;
        if (periodFilter === "7D") return diff <= 7 * oneDay;
        if (periodFilter === "30D") return diff <= 30 * oneDay;
        return true;
      });
    }
    
    // Sort descending by timestamp
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, moduleFilter, memberFilter, periodFilter]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Acesso Negado</h2>
        <p className="text-muted-foreground mt-2 max-w-md">Esta área é restrita à Presidente e Vice-Presidente para fins de auditoria e relatórios avançados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Relatórios e Auditoria
          </h1>
          <p className="text-muted-foreground mt-1">Análise de métricas e histórico de ações no sistema.</p>
        </div>
      </div>

      <Tabs defaultValue="auditoria" className="w-full mt-2" onValueChange={setActiveTab}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="auditoria" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <History className="h-4 w-4 mr-2" />
              Auditoria do Sistema
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios Operacionais
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap lg:flex-nowrap justify-start sm:justify-end items-center gap-3 w-full lg:w-auto mt-4 sm:mt-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Módulo:</span>
              <select 
                value={moduleFilter} 
                onChange={e => setModuleFilter(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="Todos">Todos</option>
                <option value="Membros">Membros</option>
                <option value="Escalas">Escalas</option>
                <option value="Casos">Casos</option>
                <option value="Punições">Punições</option>
                <option value="Sistema">Sistema</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Responsável:</span>
              <select 
                value={memberFilter} 
                onChange={e => setMemberFilter(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 max-w-[150px] truncate"
              >
                <option value="Todos">Todos os Membros</option>
                {members.filter(m => m.role === "Presidente" || m.role === "Vice-Presidente" || m.role === "Diretor").map(m => (
                  <option key={m.id} value={m.id}>{m.nick}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Período:</span>
              <select 
                value={periodFilter} 
                onChange={e => setPeriodFilter(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="Todos">Todo o Histórico</option>
                <option value="Hoje">Hoje</option>
                <option value="7D">Últimos 7 dias</option>
                <option value="30D">Últimos 30 dias</option>
              </select>
            </div>
          </div>
        </div>

        <TabsContent value="auditoria" className="pt-4 border-none outline-none">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Data/Hora</th>
                    <th className="px-6 py-4 font-medium">Usuário</th>
                    <th className="px-6 py-4 font-medium">Ação</th>
                    <th className="px-6 py-4 font-medium">Módulo</th>
                    <th className="px-6 py-4 font-medium">Detalhes</th>
                    <th className="px-6 py-4 font-medium">Ref ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const user = getMemberDetails(log.userId);
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{String(log.date || log.timestamp || "-")}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{String(user?.nick || "Sistema")}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-secondary/50 border border-border rounded-md text-xs font-medium text-foreground">
                            {String(log.action || "-")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-muted-foreground">{String(log.module || "-")}</td>
                        <td className="px-6 py-4 text-muted-foreground truncate max-w-xs" title={typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || "")}>
                          {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || "-")}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{String(log.targetId || "-")}</td>
                      </tr>
                    );
                  })}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        Nenhum registro de auditoria encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="pt-4 border-none outline-none flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-2 text-blue-500">
                <UserCheck className="h-5 w-5" />
                <h3 className="font-bold">Membros Ativos</h3>
              </div>
              <p className="text-4xl font-black text-foreground mt-2">{stats.activeMembers}</p>
              <p className="text-sm text-muted-foreground mt-1">Total de fiscais e diretores ativos</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-bold">Casos Resolvidos</h3>
              </div>
              <p className="text-4xl font-black text-foreground mt-2">{stats.resolvedCases}</p>
              <p className="text-sm text-muted-foreground mt-1">Do total de {cases.length} abertos</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileWarning className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-2 text-orange-500">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold">Punições Aplicadas</h3>
              </div>
              <p className="text-4xl font-black text-foreground mt-2">{stats.totalWarnings}</p>
              <p className="text-sm text-muted-foreground mt-1">Registros totais acumulados</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-secondary/10">
              <h3 className="font-bold text-foreground">Relatório de Produtividade (Membros Ativos)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Membro</th>
                    <th className="px-6 py-4 font-medium">Cargo</th>
                    <th className="px-6 py-4 font-medium text-center">Casos Abertos</th>
                    <th className="px-6 py-4 font-medium text-center">Escalas Cump.</th>
                    <th className="px-6 py-4 font-medium text-center">Escalas Atrasadas</th>
                    <th className="px-6 py-4 font-medium text-center">Infrações Sofridas</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.productivity.map((p) => (
                    <tr key={p.member.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{p.member.nick}</td>
                      <td className="px-6 py-4 text-muted-foreground">{p.member.role}</td>
                      <td className="px-6 py-4 text-center font-medium">{p.memberCases}</td>
                      <td className="px-6 py-4 text-center font-medium text-green-500">{p.memberSchedules - p.delayedSchedules}</td>
                      <td className="px-6 py-4 text-center font-medium text-red-500">{p.delayedSchedules}</td>
                      <td className="px-6 py-4 text-center font-medium text-orange-500">{p.memberWarnings}</td>
                    </tr>
                  ))}
                  {stats.productivity.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        Nenhum membro ativo para relatório.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
