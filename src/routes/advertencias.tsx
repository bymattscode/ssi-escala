import { createFileRoute } from "@tanstack/react-router";
import { mockWarnings, mockMembers } from "@/lib/mockData";
import { Search, Filter, FileWarning, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/advertencias")({
  component: AdvertenciasPage,
});

function getMemberNick(memberId: string) {
  return mockMembers.find((m) => m.id === memberId)?.nick || "Desconhecido";
}

function PunishmentBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    "Observação": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Medalhas Negativas": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "Advertência Interna": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "Rebaixamento": "bg-red-500/10 text-red-500 border-red-500/20",
    "Expulsão": "bg-destructive/10 text-destructive border-destructive/20 font-bold",
    "Sem Punição": "bg-secondary text-muted-foreground border-border",
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${styles[type] || "bg-secondary text-foreground border-border"}`}>
      {type}
    </span>
  );
}

function AdvertenciasPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Advertências</h1>
          <p className="text-muted-foreground mt-1">Histórico de punições e observações aplicadas.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-md font-medium transition-all shadow-sm">
          <FileWarning className="h-4 w-4" />
          Registrar Advertência
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
          <div className="flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:border-primary/50 transition-colors w-80">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input 
              type="text" 
              placeholder="Buscar por nick..." 
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
                <th className="px-6 py-4 font-medium">Tipo de Punição</th>
                <th className="px-6 py-4 font-medium">Motivo</th>
                <th className="px-6 py-4 font-medium">Diretor Responsável</th>
              </tr>
            </thead>
            <tbody>
              {mockWarnings.map((w) => (
                <tr key={w.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{w.date}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{w.offenderNick}</td>
                  <td className="px-6 py-4">
                    <PunishmentBadge type={w.punishmentType} />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{w.reason}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                      {getMemberNick(w.directorId)}
                    </div>
                  </td>
                </tr>
              ))}
              {mockWarnings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhuma advertência registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
