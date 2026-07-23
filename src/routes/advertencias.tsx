import { createFileRoute } from "@tanstack/react-router";
import { Warning, PunishmentType, Member } from "@/lib/types";
import { Search, Plus, Filter, FileWarning, Eye, AlertTriangle, ShieldOff, Skull, Link as LinkIcon, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getWarnings, getMembers, addWarning, addAuditLog } from "../lib/store";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/advertencias")({
  component: AdvertenciasPage,
});

function getMemberDetails(memberId: string, members: Member[]) {
  return members.find((m) => m.id === memberId) || null;
}

const punishmentConfig: Record<PunishmentType, { color: string, icon: any, label: string }> = {
  "Observação": { color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: Eye, label: "Observação" },
  "Medalhas Negativas": { color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: AlertTriangle, label: "Medalhas Negativas" },
  "Advertência Interna": { color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: FileWarning, label: "Advertência" },
  "Rebaixamento": { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: ShieldOff, label: "Rebaixamento" },
  "Expulsão": { color: "text-red-700 bg-red-700/10 border-red-700/20", icon: Skull, label: "Expulsão" },
  "Sem Punição": { color: "text-muted-foreground bg-secondary/50 border-border", icon: FileWarning, label: "Sem Punição" }
};

function PunishmentBadge({ type }: { type: PunishmentType }) {
  const config = punishmentConfig[type] || punishmentConfig["Sem Punição"];
  const Icon = config.icon;
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${config.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function AdvertenciasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Todas");
  const [directorFilter, setDirectorFilter] = useState<string>("Todos");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewWarning, setViewWarning] = useState<Warning | null>(null);

  // Create states
  const [newOffender, setNewOffender] = useState("");
  const [newType, setNewType] = useState<PunishmentType>("Observação");
  const [newReason, setNewReason] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newCaseId, setNewCaseId] = useState("");

  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const { role } = useAuth();
  const isAdminOrDir = role !== "Fiscalizador";

  const fetchData = async () => {
    setWarnings(await getWarnings());
    setMembers(await getMembers());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!newOffender || !newReason) {
      toast.error("Preencha os campos obrigatórios (Infrator e Motivo).");
      return;
    }
    
    const newWarning: Warning = {
      id: `w${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      offenderNick: newOffender,
      punishmentType: newType,
      reason: newReason,
      directorId: "1", // Mock current user
      caseId: newCaseId || undefined,
      notes: newNotes || undefined
    };

    await addWarning(newWarning);
    await addAuditLog("1", role, "Registro de Punição", "Advertências", `Punição (${newType}) registrada para ${newOffender}.`, newWarning.id);
    toast.success("Advertência registrada com sucesso!");
    setIsCreateOpen(false);
    fetchData();
    
    // Reset
    setNewOffender("");
    setNewType("Observação");
    setNewReason("");
    setNewNotes("");
    setNewCaseId("");
  };

  const filteredWarnings = useMemo(() => {
    return warnings.filter(w => {
      const matchesSearch = w.offenderNick.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "Todas" || w.punishmentType === typeFilter;
      const matchesDirector = directorFilter === "Todos" || w.directorId === directorFilter;
      return matchesSearch && matchesType && matchesDirector;
    });
  }, [searchTerm, typeFilter, directorFilter, warnings]);

  // Estatísticas
  const stats = useMemo(() => {
    const s = {
      total: warnings.length,
      observacoes: warnings.filter(w => w.punishmentType === "Observação").length,
      medalhas: warnings.filter(w => w.punishmentType === "Medalhas Negativas").length,
      advertencias: warnings.filter(w => w.punishmentType === "Advertência Interna").length,
      graves: warnings.filter(w => w.punishmentType === "Rebaixamento" || w.punishmentType === "Expulsão").length,
    };
    return s;
  }, [warnings]);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileWarning className="h-8 w-8 text-primary" />
            Registro de Punições
          </h1>
          <p className="text-muted-foreground mt-1">Gestão exclusiva de Diretores e Presidente sobre advertências.</p>
        </div>
        {isAdminOrDir && (
           <button 
             onClick={() => setIsCreateOpen(true)}
             className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-all w-full sm:w-auto"
           >
             <Plus className="h-4 w-4" />
             Registrar Advertência
           </button>
         )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm col-span-2 md:col-span-1">
          <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
          <h3 className="text-3xl font-bold text-foreground mt-2">{stats.total}</h3>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Observações</p>
            <Eye className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-blue-500 mt-2">{stats.observacoes}</h3>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Medalhas Neg.</p>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </div>
          <h3 className="text-2xl font-bold text-yellow-500 mt-2">{stats.medalhas}</h3>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Advs Internas</p>
            <FileWarning className="h-4 w-4 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-orange-500 mt-2">{stats.advertencias}</h3>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Casos Graves</p>
            <Skull className="h-4 w-4 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-red-500 mt-2">{stats.graves}</h3>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden mt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border gap-4 bg-secondary/10">
          
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
            >
              <option className="bg-background text-foreground" value="Todas">Todas as Punições</option>
              {Object.keys(punishmentConfig)
                .filter(type => type !== "Sem Punição")
                .map(type => (
                <option className="bg-background text-foreground" key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select 
              value={directorFilter}
              onChange={(e) => setDirectorFilter(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
            >
              <option className="bg-background text-foreground" value="Todos">Qualquer Responsável</option>
              {members.filter(m => m.role === "Diretor" || m.role === "Presidente").map(m => (
                <option className="bg-background text-foreground" key={m.id} value={m.id}>{m.nick}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:border-primary/50 transition-colors flex-1 sm:w-64 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <input 
                type="text" 
                placeholder="Buscar por nick do infrator..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
              />
            </div>
            <button className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border bg-background hover:bg-secondary/50 px-3 py-1.5 rounded-md transition-colors">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Infrator</th>
                <th className="px-6 py-4 font-medium">Punição</th>
                <th className="px-6 py-4 font-medium">Motivo</th>
                <th className="px-6 py-4 font-medium">Responsável</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarnings.map((w) => {
                 const director = getMemberDetails(w.directorId, members);
                 return (
                  <tr key={w.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">#{String(w.id).toUpperCase()}</td>
                    <td className="px-6 py-4 text-muted-foreground">{w.date}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{w.offenderNick}</td>
                    <td className="px-6 py-4">
                      <PunishmentBadge type={w.punishmentType} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]" title={w.reason}>
                      {w.reason}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{director?.nick || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setViewWarning(w)}
                        className="p-1.5 text-muted-foreground hover:text-primary bg-background rounded-md border border-border hover:border-primary/30 transition-colors inline-flex" 
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredWarnings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhuma advertência encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR ADVERTÊNCIA */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Registrar Nova Advertência">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Infrator (Nick)</label>
              <select value={newOffender} onChange={e => setNewOffender(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                <option value="" disabled className="bg-background text-foreground">Selecione o membro...</option>
                {members.filter(m => m.status === "Ativo").map(m => (
                  <option key={m.id} value={m.nick} className="bg-background text-foreground">{m.nick}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Tipo de Punição</label>
              <select value={newType} onChange={e => setNewType(e.target.value as PunishmentType)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                <option value="Observação" className="bg-background text-foreground">Observação</option>
                <option value="Medalhas Negativas" className="bg-background text-foreground">Medalhas Negativas</option>
                <option value="Advertência Interna" className="bg-background text-foreground">Advertência Interna</option>
                <option value="Rebaixamento" className="bg-background text-foreground">Rebaixamento</option>
                <option value="Expulsão" className="bg-background text-foreground">Expulsão</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Motivo</label>
            <textarea value={newReason} onChange={e => setNewReason(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors min-h-[80px]" placeholder="Motivo da punição..."></textarea>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Observações / Orientações</label>
            <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors min-h-[60px]" placeholder="Observações adicionais (opcional)..."></textarea>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Vincular a um Caso? (ID do Caso - opcional)</label>
            <div className="flex items-center relative">
              <LinkIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input type="text" value={newCaseId} onChange={e => setNewCaseId(e.target.value)} className="bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm text-foreground w-full focus:outline-none focus:border-primary/50 transition-colors" placeholder="Ex: C2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Se esta punição foi originada de um caso aberto no painel de casos.</p>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
            <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button onClick={handleCreate} className="px-4 py-2 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all ">
              Registrar
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL DETALHES ADVERTÊNCIA */}
      <Modal isOpen={!!viewWarning} onClose={() => setViewWarning(null)} title={`Detalhes do Registro #${viewWarning ? String(viewWarning.id).toUpperCase() : ""}`}>
        {viewWarning && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-foreground">Infrator: {viewWarning.offenderNick}</h3>
                 <p className="text-sm text-muted-foreground mt-1">Registrado por {getMemberDetails(viewWarning.directorId, members)?.nick} em {viewWarning.date}</p>
              </div>
              <PunishmentBadge type={viewWarning.punishmentType} />
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Motivo</h4>
              <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md border border-border/50">
                {viewWarning.reason}
              </p>
            </div>

            {viewWarning.notes && (
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Observações do Diretor</h4>
                <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-md border border-primary/20">
                  {viewWarning.notes}
                </p>
              </div>
            )}

            {viewWarning.caseId && (
              <div className="flex flex-col gap-2 border-t border-border/50 pt-4 mt-2">
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Caso Vinculado
                </h4>
                <p className="text-sm text-muted-foreground">
                  Esta advertência originou-se do caso <strong className="text-foreground">#{String(viewWarning.caseId).toUpperCase()}</strong>.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
