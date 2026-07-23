import { createFileRoute } from "@tanstack/react-router";
import { mockCases, mockMembers } from "@/lib/mockData";
import { Plus, Search, Filter, AlertCircle, CheckCircle2, ChevronRight, Ban } from "lucide-react";

export const Route = createFileRoute("/casos")({
  component: CasosPage,
});

function getMemberNick(memberId: string) {
  return mockMembers.find((m) => m.id === memberId)?.nick || "Desconhecido";
}

function CaseStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string, icon: any }> = {
    Aberto: { bg: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertCircle },
    "Em Análise": { bg: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: AlertCircle },
    Resolvido: { bg: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
    Cancelado: { bg: "bg-secondary text-muted-foreground border-border", icon: Ban },
  };
  
  const Icon = styles[status]?.icon || AlertCircle;
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${styles[status]?.bg}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function CasosPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Casos</h1>
          <p className="text-muted-foreground mt-1">Gestão de infrações e resoluções.</p>
        </div>
        <button className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground px-4 py-2 rounded-md font-medium transition-all shadow-sm">
          <Plus className="h-4 w-4" />
          Abrir Novo Caso
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
          <div className="flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:border-primary/50 transition-colors w-80">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input 
              type="text" 
              placeholder="Buscar caso, infrator..." 
              className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
            />
          </div>
          
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border bg-background px-3 py-1.5 rounded-md transition-colors">
            <Filter className="h-4 w-4" />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Infrator</th>
                <th className="px-6 py-4 font-medium">Infração</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Fiscalizador</th>
                <th className="px-6 py-4 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody>
              {mockCases.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-secondary/20 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{c.date}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{c.offenderNick}</td>
                  <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">{c.description}</td>
                  <td className="px-6 py-4">
                    <CaseStatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{getMemberNick(c.creatorId)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-muted-foreground group-hover:text-primary transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
