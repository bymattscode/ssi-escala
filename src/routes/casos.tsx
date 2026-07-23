import { createFileRoute } from "@tanstack/react-router";
import { Case, CaseStatus, Member } from "@/lib/types";
import { Search, Plus, Filter, AlertCircle, CheckCircle2, Clock, XCircle, MoreVertical, FileText, Gavel, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getCases, getMembers, addCase, updateCase, addAuditLog } from "../lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/casos")({
  component: CasosPage,
});

function getMemberDetails(memberId: string, members: Member[]) {
  return members.find((m) => m.id === memberId) || null;
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const styles: Record<Exclude<CaseStatus, "Em Análise">, { bg: string, icon: any }> = {
    "Aberto": { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: AlertCircle },
    "Resolvido": { bg: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
    "Cancelado": { bg: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
  };
  const Icon = styles[status]?.icon || AlertCircle;
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${styles[status]?.bg}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

// Simple Modal wrapper
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

function CasosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [cases, setCases] = useState<Case[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  const { role } = useAuth();
  const isFiscalizador = role === "Fiscalizador";
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resolveCase, setResolveCase] = useState<Case | null>(null);
  const [viewCase, setViewCase] = useState<Case | null>(null);
  
  // Create state
  const [newOffender, setNewOffender] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 16));
  const [newOrientation, setNewOrientation] = useState("Sim");
  const [newProof, setNewProof] = useState("");
  
  // Resolve state
  const [resCrime, setResCrime] = useState("");
  const [resOrder, setResOrder] = useState("");
  const [resPunishment, setResPunishment] = useState("Sem Punição");
  const [resDecision, setResDecision] = useState("Resolver");
  const [resAttachment, setResAttachment] = useState("");
  const [resCancelReason, setResCancelReason] = useState("");

  const fetchData = async () => {
    const c = await getCases();
    const m = await getMembers();
    setCases(c);
    setMembers(m);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!newOffender || !newDesc) return;
    const newCase: Case = {
      id: `c${Date.now()}`,
      status: "Aberto",
      creatorId: "1", // Mock ID of logged user
      offenderNick: newOffender,
      description: newDesc,
      creationDate: newDate.replace('T', ' '),
      orientation: newOrientation,
      proofAttachment: newProof
    };
    await addCase(newCase);
    await addAuditLog("1", role, "Abertura de Caso", "Casos", `Caso #${newCase.id} aberto contra ${newOffender}.`, newCase.id);
    setIsCreateOpen(false);
    toast.success("Caso aberto com sucesso!");
    fetchData();
    // Reset
    setNewOffender("");
    setNewDesc("");
    setNewDate(new Date().toISOString().slice(0, 16));
    setNewOrientation("Sim");
    setNewProof("");
  };

  const handleResolve = async () => {
    if (!resolveCase) return;
    
    if (resDecision === "Cancelar" && !resCancelReason) {
      toast.error("Por favor, preencha o motivo do cancelamento.");
      return;
    }
    
    await updateCase(resolveCase.id, {
      status: resDecision === "Resolver" ? "Resolvido" : "Cancelado",
      resolverId: "1",
      resolutionDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      punishmentApplied: resDecision === "Resolver" ? resPunishment : undefined,
      crimeCommitted: resDecision === "Resolver" ? resCrime : undefined,
      orderNumber: resDecision === "Resolver" ? resOrder : undefined,
      resolutionAttachment: resAttachment || undefined,
      cancellationReason: resDecision === "Cancelar" ? resCancelReason : undefined
    });
    
    await addAuditLog(
      "1", 
      role, 
      resDecision === "Resolver" ? "Resolução de Caso" : "Cancelamento de Caso", 
      "Casos", 
      `Caso #${resolveCase.id} foi ${resDecision === "Resolver" ? "resolvido" : "cancelado"}.`, 
      resolveCase.id
    );
    
    setResolveCase(null);
    toast.success(`Caso ${resDecision === "Resolver" ? "resolvido" : "cancelado"}.`);
    fetchData();
    
    // Reset
    setResCrime("");
    setResOrder("");
    setResPunishment("Sem Punição");
    setResDecision("Resolver");
    setResAttachment("");
    setResCancelReason("");
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.offenderNick.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Gestão de Casos</h1>
          <p className="text-muted-foreground mt-1">Abertura e resolução de infrações da equipe.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Abrir Novo Caso
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden mt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border gap-4 bg-secondary/10">
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {["Todos", "Aberto", "Resolvido", "Cancelado"].map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  statusFilter === status 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent hover:border-border"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:border-primary/50 transition-colors flex-1 sm:w-64 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <input 
                type="text" 
                placeholder="Buscar por ID ou Infrator..." 
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
                <th className="px-6 py-4 font-medium">Data / Hora</th>
                <th className="px-6 py-4 font-medium">Infrator</th>
                <th className="px-6 py-4 font-medium">Fiscalizador</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Responsável</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => {
                const creator = getMemberDetails(c.creatorId, members);
                const resolver = c.resolverId ? getMemberDetails(c.resolverId, members) : null;
                return (
                  <tr key={c.id} className="border-b border-border hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground">#{String(c.id).toUpperCase()}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.creationDate}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{c.offenderNick}</td>
                    <td className="px-6 py-4 text-muted-foreground">{creator?.nick || "-"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{resolver?.nick || "-"}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setViewCase(c)}
                        className="p-1.5 text-muted-foreground hover:text-primary bg-background rounded-md border border-border hover:border-primary/30 transition-colors" 
                        title="Ver Histórico"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      {(c.status === "Aberto" && !isFiscalizador) && (
                        <button 
                          onClick={() => setResolveCase(c)}
                          className="p-1.5 text-muted-foreground hover:text-green-500 bg-background rounded-md border border-border hover:border-green-500/30 transition-colors" 
                          title="Resolver Caso (Diretores)"
                        >
                          <Gavel className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhum caso encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CRIAR CASO */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Abrir Novo Caso (Fiscalizador)">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-foreground">Infrator (Nick)</label>
               <input type="text" value={newOffender} onChange={e => setNewOffender(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" placeholder="Ex: Bravo" />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-foreground">Data/Hora da Infração</label>
               <input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
             </div>
           </div>
           
           <div className="flex flex-col gap-1.5">
             <label className="text-sm font-medium text-foreground">Descrição da Infração</label>
             <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors min-h-[100px]" placeholder="Descreva os acontecimentos com clareza..."></textarea>
           </div>
 
           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-foreground">Orientação Cabível</label>
               <select value={newOrientation} onChange={e => setNewOrientation(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                 <option value="Sim" className="bg-background text-foreground">Sim</option>
                 <option value="Não" className="bg-background text-foreground">Não</option>
               </select>
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-foreground">Anexo / Prova (URL)</label>
               <input type="text" value={newProof} onChange={e => setNewProof(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" placeholder="https://imgur.com/..." />
             </div>
           </div>
 
           <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
             <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-secondary transition-colors">
               Cancelar
             </button>
             <button onClick={handleCreate} className="px-4 py-2 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all ">
               Enviar Caso
             </button>
           </div>
        </div>
      </Modal>

      {/* MODAL RESOLVER CASO */}
      <Modal isOpen={!!resolveCase} onClose={() => setResolveCase(null)} title={`Resolver Caso #${resolveCase ? String(resolveCase.id).toUpperCase() : ""}`}>
        <div className="flex flex-col gap-4">
          <div className="bg-secondary/30 p-3 rounded-md border border-border/50 text-sm">
            <p className="text-muted-foreground">Você está analisando a infração de <strong className="text-foreground">{resolveCase?.offenderNick}</strong>.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Crime Cometido</label>
              <input type="text" disabled={resDecision === "Cancelar"} value={resCrime} onChange={e => setResCrime(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50" placeholder="Ex: Insubordinação, Ausência..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Número da Ordem (se houver)</label>
              <input type="text" disabled={resDecision === "Cancelar"} value={resOrder} onChange={e => setResOrder(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50" placeholder="Ex: ORD-2026-001" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Punição Aplicada</label>
              <select disabled={resDecision === "Cancelar"} value={resPunishment} onChange={e => setResPunishment(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50">
                <option value="Sem Punição" className="bg-background text-foreground">Sem Punição</option>
                <option value="Advertência Interna" className="bg-background text-foreground">Advertência Interna</option>
                <option value="Medalhas Negativas" className="bg-background text-foreground">Medalhas Negativas</option>
                <option value="Rebaixamento" className="bg-background text-foreground">Rebaixamento</option>
                <option value="Expulsão" className="bg-background text-foreground">Expulsão</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Decisão do Caso</label>
              <select value={resDecision} onChange={e => setResDecision(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                <option value="Resolver" className="bg-background text-foreground">Resolver (Aplicar)</option>
                <option value="Cancelar" className="bg-background text-foreground">Cancelar Caso (Inválido)</option>
              </select>
            </div>
          </div>
          
          {resDecision === "Cancelar" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Motivo do Cancelamento</label>
              <input type="text" value={resCancelReason} onChange={e => setResCancelReason(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors border-red-500/50" placeholder="Ex: Provas insuficientes..." />
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Anexo da Resolução (opcional)</label>
            <input type="text" value={resAttachment} onChange={e => setResAttachment(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" placeholder="URL do relatório ou provas..." />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
             <button onClick={() => setResolveCase(null)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-secondary transition-colors">
               Voltar
             </button>
             <button onClick={handleResolve} className="px-4 py-2 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all ">
               Concluir Análise
             </button>
           </div>
        </div>
      </Modal>

      {/* MODAL VISUALIZAR CASO */}
      <Modal isOpen={!!viewCase} onClose={() => setViewCase(null)} title={`Detalhes do Caso #${viewCase ? String(viewCase.id).toUpperCase() : ""}`}>
        {viewCase && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-foreground">Infrator: {viewCase.offenderNick}</h3>
                 <p className="text-sm text-muted-foreground mt-1">Aberto por {getMemberDetails(viewCase.creatorId, members)?.nick} em {viewCase.creationDate}</p>
              </div>
              <StatusBadge status={viewCase.status} />
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Descrição da Infração</h4>
              <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md border border-border/50">
                {viewCase.description}
              </p>
            </div>

            {viewCase.proofAttachment && (
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Provas Anexadas</h4>
                <a href={viewCase.proofAttachment} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline bg-primary/10 p-2 rounded-md border border-primary/20 w-fit">
                  Visualizar Anexo da Infração
                </a>
              </div>
            )}

            {viewCase.status === "Resolvido" && (
              <div className="flex flex-col gap-4 border-t border-border/50 pt-4 mt-2">
                <h4 className="text-sm font-bold text-green-500 uppercase tracking-wider flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4" />
                   Resolução (Por {getMemberDetails(viewCase.resolverId!, members)?.nick || "Desconhecido"})
                 </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Crime Cometido</span>
                    <span className="text-sm font-medium text-foreground">{viewCase.crimeCommitted || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Punição</span>
                    <span className="text-sm font-medium text-foreground">{viewCase.punishmentApplied || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Número da Ordem</span>
                    <span className="text-sm font-medium text-foreground">{viewCase.orderNumber || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Data da Resolução</span>
                    <span className="text-sm font-medium text-foreground">{viewCase.resolutionDate || "-"}</span>
                  </div>
                </div>

                {viewCase.resolutionAttachment && (
                  <div className="mt-2">
                    <a href={viewCase.resolutionAttachment} target="_blank" rel="noreferrer" className="text-sm text-green-500 hover:underline bg-green-500/10 p-2 rounded-md border border-green-500/20 w-fit block">
                      Visualizar Relatório de Resolução
                    </a>
                  </div>
                )}
              </div>
            )}

            {viewCase.status === "Cancelado" && (
              <div className="flex flex-col gap-4 border-t border-border/50 pt-4 mt-2">
                <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                   <XCircle className="h-4 w-4" />
                   Cancelado (Por {getMemberDetails(viewCase.resolverId!, members)?.nick || "Desconhecido"})
                 </h4>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Motivo do Cancelamento</span>
                  <span className="text-sm font-medium text-foreground">{viewCase.cancellationReason || "-"}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Data da Decisão</span>
                  <span className="text-sm font-medium text-foreground">{viewCase.resolutionDate || "-"}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
