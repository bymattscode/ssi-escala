import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockSchedules, mockMembers } from "@/lib/mockData";
import { CalendarDays, Settings2, Search, Filter, RotateCcw, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/escalas")({
  component: EscalasPage,
});

function getMemberDetails(memberId: string) {
  return mockMembers.find((m) => m.id === memberId) || null;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string, icon: any }> = {
    Pendente: { bg: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
    Concluído: { bg: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
    Atrasado: { bg: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
    "Justificativa Enviada": { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: AlertTriangle },
  };
  
  const Icon = styles[status]?.icon || Clock;
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${styles[status]?.bg}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function EscalaTable({ schedules }: { schedules: typeof mockSchedules }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
          <tr>
            <th className="px-6 py-4 font-medium">Membro</th>
            <th className="px-6 py-4 font-medium">Cargo</th>
            <th className="px-6 py-4 font-medium">Dia Ref.</th>
            <th className="px-6 py-4 font-medium">Prazo</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Responsável</th>
            <th className="px-6 py-4 font-medium">Observações</th>
            <th className="px-6 py-4 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => {
            const member = getMemberDetails(schedule.memberId);
            const resp = schedule.responsibleId ? getMemberDetails(schedule.responsibleId) : null;
            return (
              <tr key={schedule.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {member?.nick?.charAt(0) || "?"}
                  </div>
                  {member?.nick || "Desconhecido"}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{member?.role || "-"}</td>
                <td className="px-6 py-4 text-foreground font-medium">{schedule.referenceDay}</td>
                <td className="px-6 py-4 text-muted-foreground">{schedule.deadline}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={schedule.status} />
                </td>
                <td className="px-6 py-4 text-muted-foreground">{resp?.nick || "-"}</td>
                <td className="px-6 py-4 text-muted-foreground truncate max-w-[150px]" title={schedule.observations}>
                  {schedule.observations || "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Editar
                  </button>
                </td>
              </tr>
            );
          })}
          {schedules.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                Nenhuma escala encontrada para este período.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EscalasPage() {
  const [selectedWeek, setSelectedWeek] = useState("2026-W30");
  
  const fiscalizadoresSchedules = mockSchedules.filter(s => s.type === "Fiscalizador" && s.week === selectedWeek);
  const diretoresSchedules = mockSchedules.filter(s => s.type === "Diretor" && s.week === selectedWeek);
  
  const total = mockSchedules.filter(s => s.week === selectedWeek).length;
  const pendentes = mockSchedules.filter(s => s.week === selectedWeek && s.status === "Pendente").length;
  const concluidos = mockSchedules.filter(s => s.week === selectedWeek && s.status === "Concluído").length;
  const atrasados = mockSchedules.filter(s => s.week === selectedWeek && s.status === "Atrasado").length;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Escalas da Equipe</h1>
          <p className="text-muted-foreground mt-1">Gerencie atribuições, prazos e acompanhe o progresso semanal.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors border border-border shadow-sm">
            <RotateCcw className="h-4 w-4" />
            Regerar Escala
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-all ">
            <CalendarDays className="h-4 w-4" />
            Gerar Automática
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total na Semana</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{total}</h3>
          </div>
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
            <h3 className="text-2xl font-bold text-green-500 mt-1">{concluidos}</h3>
          </div>
          <div className="h-10 w-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
            <h3 className="text-2xl font-bold text-yellow-500 mt-1">{pendentes}</h3>
          </div>
          <div className="h-10 w-10 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Atrasados</p>
            <h3 className="text-2xl font-bold text-red-500 mt-1">{atrasados}</h3>
          </div>
          <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden mt-2">
        <Tabs defaultValue="fiscalizadores" className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 pt-4 pb-3 border-b border-border gap-4 bg-secondary/10">
            <TabsList className="bg-secondary/50 border border-border rounded-lg p-1">
              <TabsTrigger value="fiscalizadores" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4">
                Escala dos Fiscalizadores
              </TabsTrigger>
              <TabsTrigger value="diretores" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4">
                Escala dos Diretores
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:border-primary/50 transition-colors flex-1 sm:w-64">
                <select 
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-foreground w-full appearance-none"
                >
                  <option className="bg-background text-foreground" value="2026-W28">Semana: Dom 12/07 a Sáb 18/07</option>
                  <option className="bg-background text-foreground" value="2026-W29">Semana: Dom 19/07 a Sáb 25/07</option>
                  <option className="bg-background text-foreground" value="2026-W30">Semana: Dom 26/07 a Sáb 01/08 (Atual)</option>
                  <option className="bg-background text-foreground" value="2026-W31">Semana: Dom 02/08 a Sáb 08/08</option>
                </select>
              </div>
              <div className="flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:border-primary/50 transition-colors flex-1 sm:w-64 shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input 
                  type="text" 
                  placeholder="Buscar membro..." 
                  className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <TabsContent value="fiscalizadores" className="p-0 m-0 border-none outline-none">
            <EscalaTable schedules={fiscalizadoresSchedules} />
          </TabsContent>

          <TabsContent value="diretores" className="p-0 m-0 border-none outline-none">
            <EscalaTable schedules={diretoresSchedules} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
