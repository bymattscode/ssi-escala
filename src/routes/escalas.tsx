import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockSchedules, mockMembers } from "@/lib/mockData";
import { CalendarDays, Settings2, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/escalas")({
  component: EscalasPage,
});

function getMemberNick(memberId: string) {
  return mockMembers.find((m) => m.id === memberId)?.nick || "Desconhecido";
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pendente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Concluído: "bg-green-500/10 text-green-500 border-green-500/20",
    Atrasado: "bg-red-500/10 text-red-500 border-red-500/20",
    "Justificativa Enviada": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-secondary text-foreground border-border"}`}>
      {status}
    </span>
  );
}

function EscalasPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Escalas</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento das escalas semanais da equipe.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors border border-border">
            <Settings2 className="h-4 w-4" />
            Configurar
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <CalendarDays className="h-4 w-4" />
            Gerar Automática
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-1">
        <Tabs defaultValue="fiscalizadores" className="w-full">
          <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border">
            <TabsList className="bg-secondary/50 border border-border">
              <TabsTrigger value="fiscalizadores" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-transparent">
                Fiscalizadores
              </TabsTrigger>
              <TabsTrigger value="diretores" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-transparent">
                Diretores
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center bg-secondary/50 border border-border rounded-md px-3 py-1.5 focus-within:border-primary/50 transition-colors w-64">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <input 
                type="text" 
                placeholder="Buscar membro..." 
                className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <TabsContent value="fiscalizadores" className="p-0 m-0 border-none outline-none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Semana</th>
                    <th className="px-6 py-4 font-medium">Membro</th>
                    <th className="px-6 py-4 font-medium">Dia da Semana</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSchedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{schedule.week}</td>
                      <td className="px-6 py-4 text-foreground">{getMemberNick(schedule.memberId)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{schedule.dayOfWeek}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={schedule.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 font-medium">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {mockSchedules.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhuma escala gerada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="diretores" className="p-0 m-0 border-none outline-none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Semana</th>
                    <th className="px-6 py-4 font-medium">Diretor</th>
                    <th className="px-6 py-4 font-medium">Dia da Semana</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhuma escala de diretores nesta semana.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
