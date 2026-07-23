import { createFileRoute } from "@tanstack/react-router";
import { mockMembers } from "@/lib/mockData";
import { Search, UserPlus, Filter, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/membros")({
  component: MembrosPage,
});

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    Presidência: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "Vice-Presidência": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    Diretor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Fiscalizador: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[role] || "bg-secondary text-foreground border-border"}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "Ativo";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1.5 ${isActive ? "text-green-500" : "text-muted-foreground"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-muted-foreground"}`}></span>
      {status}
    </span>
  );
}

function MembrosPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Membros</h1>
          <p className="text-muted-foreground mt-1">Gerencie a equipe, cargos e status.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <UserPlus className="h-4 w-4" />
          Novo Membro
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
                <th className="px-6 py-4 font-medium">Nick</th>
                <th className="px-6 py-4 font-medium">Cargo</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Data de Entrada</th>
                <th className="px-6 py-4 font-medium">Observações</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockMembers.map((member) => (
                <tr key={member.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {member.nick.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">{member.nick}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{member.entryDate}</td>
                  <td className="px-6 py-4 text-muted-foreground truncate max-w-[150px]">
                    {member.notes || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
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
