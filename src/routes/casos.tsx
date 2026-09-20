import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { Case, CaseStatus, Member, Warning, PunishmentType } from "@/lib/types";
import { Search, Plus, Filter, AlertCircle, CheckCircle2, Clock, XCircle, MoreVertical, FileText, Gavel, X, AlertTriangle, Trash2, FileWarning } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getCases, getMembers, addCase, updateCase, deleteCase, addAuditLog, addWarning } from "../lib/store";
import { fetchAllFromRemote } from "../lib/syncManager";
import { toast } from "sonner";
import { EmptyState, SkeletonTable, ConfirmModal } from "../components/ui/ux";
import { formatBrasiliaDate, formatBrasiliaDateTime, getBrasiliaIsoNow, getBrasiliaDateNow } from "../lib/dateUtils";

interface CasosSearchParams {
  highlight?: string;
}

export const Route = createFileRoute("/casos")({
  component: CasosPage,
  validateSearch: (search: Record<string, unknown>): CasosSearchParams => ({
    highlight: typeof search.highlight === "string" ? search.highlight : undefined,
  }),
});

function getMemberDetails(memberId?: any, members: Member[] = []) {
  if (!memberId) return null;
  return (members || []).find((m) => m && String(m.id) === String(memberId)) || null;
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const styles: Record<string, { bg: string, icon: any }> = {
    "Aberto": { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: AlertCircle },
    "Resolvido": { bg: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
    "Cancelado": { bg: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
  };
  const safeStatus = String(status || "Aberto");
  const Icon = styles[safeStatus]?.icon || AlertCircle;
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${styles[safeStatus]?.bg || "bg-secondary text-muted-foreground border-border"}`}>
      <Icon className="h-3.5 w-3.5" />
      {safeStatus}
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

function getNickDisplay(idOrNick?: any, explicitNick?: any, members: Member[] = []): string {
  if (explicitNick !== undefined && explicitNick !== null && String(explicitNick).trim() !== "" && String(explicitNick) !== "-" && String(explicitNick) !== "1") {
    return String(explicitNick);
  }
  if (idOrNick === undefined || idOrNick === null || String(idOrNick).trim() === "" || String(idOrNick) === "-" || String(idOrNick) === "1") {
    return "-";
  }
  const target = String(idOrNick).trim().toLowerCase();
  const found = (members || []).find(m => m && (String(m.id || "").trim().toLowerCase() === target || String(m.nick || "").trim().toLowerCase() === target));
  if (found && found.nick) {
    return String(found.nick);
  }
  return String(idOrNick);
}

function CasosPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [cases, setCases] = useState<Case[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, role, userName } = useAuth();
  const isFiscalizador = role === "Fiscalizador";
  const isPresidencia = role === "Ministério" || role === "Presidente" || role === "Vice-Presidente";
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resolveCase, setResolveCase] = useState<Case | null>(null);
  const [viewCase, setViewCase] = useState<Case | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  
  // Create state
  const [newOffender, setNewOffender] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState(getBrasiliaIsoNow());
  const [newOrientation, setNewOrientation] = useState("Sim");
  const [newProof, setNewProof] = useState("");
  
  // Resolve state
  const [resCrime, setResCrime] = useState("");
  const [resOrder, setResOrder] = useState("");
  const [resPunishment, setResPunishment] = useState("Sem Punição");
  const [resDecision, setResDecision] = useState("Resolver");
  const [resAttachment, setResAttachment] = useState("");
  const [resNotes, setResNotes] = useState("");
  const [resCancelReason, setResCancelReason] = useState("");
  const [showConfirmResolve, setShowConfirmResolve] = useState(false);

  const { highlight } = useSearch({ from: "/casos" });
  const highlightHandled = useRef(false);

  const fetchData = async () => {
    setIsLoading(true);
    const c = await getCases();
    const m = await getMembers();
    setCases(c);
    setMembers(m);
    setIsLoading(false);

    // Auto-open case detail modal when navigating from linked case
    if (highlight && !highlightHandled.current) {
      highlightHandled.current = true;
      const cleanHighlight = String(highlight).trim().toLowerCase();
      const found = c.find(
        (cs) => String(cs.id).trim().toLowerCase() === cleanHighlight
      );
      if (found) {
        setViewCase(found);
      } else {
        toast.info(`Caso "${highlight}" não encontrado na base de dados atual.`);
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchAllFromRemote().then(() => fetchData()).catch(console.error);

    const handleSync = () => {
      fetchData();
    };
    window.addEventListener('ssi-data-updated', handleSync);
    return () => {
      window.removeEventListener('ssi-data-updated', handleSync);
    };
  }, []);

  const handleCreate = async () => {
    if (!newOffender.trim() || !newDesc.trim()) {
      toast.error("Obrigatório: Preencha o nick do infrator e a descrição do caso.");
      return;
    }
    if (newOffender.trim().length < 2) {
      toast.error("Erro no formulário: O nick do infrator deve conter pelo menos 2 caracteres.");
      return;
    }
    if (newDesc.trim().length < 5) {
      toast.error("Dados mínimos insuficientes: Detalhe adequadamente a descrição da infração (mínimo 5 caracteres).");
      return;
    }
    const creatorIdValue = user?.id || userName || "Desconhecido";
    const creatorNickValue = userName || user?.nick || "Desconhecido";

    const newCase: Case = {
      id: `SSI-CASO-${Date.now().toString(36).toUpperCase()}`,
      status: "Aberto",
      creatorId: creatorIdValue,
      creatorNick: creatorNickValue,
      offenderNick: newOffender,
      description: newDesc,
      creationDate: newDate.replace('T', ' '),
      orientation: newOrientation,
      proofAttachment: newProof
    };
    await addCase(newCase);
    await addAuditLog(creatorIdValue, role, "Abertura de Caso", "Casos", `Caso #${newCase.id} aberto contra ${newOffender} por ${creatorNickValue}.`, newCase.id);
    setIsCreateOpen(false);
    toast.success("Caso aberto com sucesso!");
    fetchData();
    // Reset
    setNewOffender("");
    setNewDesc("");
    setNewDate(getBrasiliaIsoNow());
    setNewOrientation("Sim");
    setNewProof("");
  };

  const validateAndPromptResolve = () => {
    if (!resolveCase) return;
    
    if (resDecision === "Cancelar" && (!resCancelReason || !resCancelReason.trim())) {
      toast.error("Obrigatório: Para cancelar um caso, informe o motivo do cancelamento.");
      return;
    }
    if (resDecision === "Resolver" && (!resCrime || !resCrime.trim())) {
      toast.error("Obrigatório: Para resolver e julgar o caso, você deve especificar o campo 'Crime Cometido'.");
      return;
    }

    setShowConfirmResolve(true);
  };

  const handleResolve = async () => {
    if (!resolveCase) return;
    setShowConfirmResolve(false);
    
    const resolverIdValue = user?.id || userName || "Desconhecido";
    const resolverNickValue = userName || user?.nick || "Desconhecido";

    await updateCase(resolveCase.id, {
      status: resDecision === "Resolver" ? "Resolvido" : "Cancelado",
      resolverId: resolverIdValue,
      resolverNick: resolverNickValue,
      resolutionDate: new Date().toISOString(),
      punishmentApplied: resDecision === "Resolver" ? resPunishment : undefined,
      crimeCommitted: resDecision === "Resolver" ? resCrime.trim() : undefined,
      orderNumber: resDecision === "Resolver" ? resOrder : undefined,
      resolutionAttachment: resAttachment || undefined,
      cancellationReason: resDecision === "Cancelar" ? resCancelReason.trim() : undefined
    });
    
    await addAuditLog(
      resolverIdValue, 
      role, 
      resDecision === "Resolver" ? "Resolução de Caso" : "Cancelamento de Caso", 
      "Casos", 
      `Caso #${resolveCase.id} foi ${resDecision === "Resolver" ? "resolvido" : "cancelado"} por ${resolverNickValue}.`, 
      resolveCase.id
    );

    // Se o caso foi resolvido com aplicação de punição, gera automaticamente o registro em Punições (advertências)
    if (resDecision === "Resolver" && resPunishment !== "Sem Punição") {
      const warningNotes = [
        resNotes ? resNotes.trim() : "",
        resAttachment ? `Anexo da resolução: ${resAttachment.trim()}` : ""
      ].filter(Boolean).join(" | ");

      const newWarning: Warning = {
        id: `SSI-PUN-${Date.now().toString(36).toUpperCase()}`,
        date: getBrasiliaDateNow(),
        offenderNick: resolveCase.offenderNick.trim(),
        punishmentType: resPunishment as PunishmentType,
        reason: resCrime.trim(),
        directorId: resolverIdValue,
        directorNick: resolverNickValue,
        caseId: resolveCase.id,
        notes: warningNotes || undefined
      };

      await addWarning(newWarning);
      await addAuditLog(
        resolverIdValue,
        role,
        "Registro de Punição",
        "Punições",
        `Punição (${resPunishment}) gerada automaticamente a partir da resolução do Caso #${resolveCase.id} para ${resolveCase.offenderNick} por ${resolverNickValue}.`,
        newWarning.id
      );
    }
    
    setResolveCase(null);
    if (resDecision === "Resolver") {
      if (resPunishment !== "Sem Punição") {
        toast.success(`Caso resolvido! Punição (${resPunishment}) lançada automaticamente no Registro de Punições.`);
      } else {
        toast.success("Análise concluída: Caso resolvido com sucesso (Sem Punição).");
      }
    } else {
      toast.success("Caso cancelado e arquivado no histórico.");
    }
    fetchData();
    
    // Reset
    setResCrime("");
    setResOrder("");
    setResPunishment("Sem Punição");
    setResDecision("Resolver");
    setResAttachment("");
    setResNotes("");
    setResCancelReason("");
  };

  const handleDeleteCase = async () => {
    if (!caseToDelete) return;
    const actorId = user?.id || userName || "Desconhecido";
    const actorNick = userName || user?.nick || "Desconhecido";
    await deleteCase(caseToDelete.id);
    await addAuditLog(actorId, role, "Exclusão de Caso" as any, "Casos", `Caso #${caseToDelete.id} foi excluído definitivamente por ${actorNick}.`, caseToDelete.id);
    setCaseToDelete(null);
    toast.success("Caso excluído permanentemente com sucesso!");
    fetchData();
  };

  const filteredCases = (cases || []).filter(c => {
    if (!c) return false;
    const term = String(searchTerm || "").toLowerCase();
    const matchesSearch = String(c.offenderNick || "").toLowerCase().includes(term) || 
                          String(c.id || "").toLowerCase().includes(term);
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
          {isLoading ? <SkeletonTable rows={5} /> : (
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
                 const creatorNick = getNickDisplay(c.creatorId, c.creatorNick, members);
                 const resolverNick = getNickDisplay(c.resolverId, c.resolverNick, members);
                 return (
                    <tr key={c.id} className="border-b border-border hover:bg-secondary/20 transition-colors group">
                      <td className="px-6 py-4 font-medium text-foreground">#{String(c.id || "").toUpperCase()}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatBrasiliaDateTime(c.creationDate)}</td>
                      <td className="px-6 py-4 font-bold text-foreground">{String(c.offenderNick || "-")}</td>
                     <td className="px-6 py-4 font-medium text-primary/90">{creatorNick}</td>
                     <td className="px-6 py-4">
                       <StatusBadge status={c.status} />
                     </td>
                     <td className="px-6 py-4 font-medium text-foreground">{resolverNick}</td>
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
                        {isPresidencia && (
                          <button 
                            onClick={() => setCaseToDelete(c)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 bg-background rounded-md border border-border hover:border-red-500/30 transition-colors" 
                            title="Excluir Caso (Presidência)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                   </tr>
                 );
               })}
               {filteredCases.length === 0 && (
                 <tr>
                   <td colSpan={7} className="px-6 py-8">
                     <EmptyState 
                       icon={AlertCircle} 
                       title="Nenhum caso registrado" 
                       description="Não encontramos nenhum caso aberto, resolvido ou correspondente ao filtro atual." 
                     />
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
          )}
        </div>
      </div>

      {/* MODAL CRIAR CASO */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Abrir Novo Caso (Fiscalizador)">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-md text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Fiscalizador Responsável:</span>
              <strong className="text-primary font-bold">{userName}</strong>
            </div>
            <span className="text-xs text-muted-foreground bg-background/60 px-2 py-0.5 rounded border border-border/50">Conta Sincronizada</span>
          </div>

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
          <div className="bg-secondary/30 p-3 rounded-md border border-border/50 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-muted-foreground">Você está analisando a infração de <strong className="text-foreground">{resolveCase?.offenderNick}</strong>.</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Diretor Responsável:</span>
              <strong className="text-primary font-semibold">{userName}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Crime Cometido</label>
              <input type="text" disabled={resDecision === "Cancelar"} value={resCrime} onChange={e => setResCrime(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50" placeholder="Ex: Insubordinação, Ausência..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Punição Aplicada</label>
              <select disabled={resDecision === "Cancelar"} value={resPunishment} onChange={e => setResPunishment(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50">
                <option value="Sem Punição" className="bg-background text-foreground">Sem Punição</option>
                <option value="Observação" className="bg-background text-foreground">Observação</option>
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

          {resDecision === "Resolver" && resPunishment !== "Sem Punição" && (
            <div className="bg-primary/10 border border-primary/20 rounded-md p-2.5 text-xs text-primary flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Esta punição será <strong>lançada automaticamente</strong> no Registro de Punições vinculada a este caso.</span>
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Anexo da Resolução (opcional)</label>
            <input type="text" value={resAttachment} onChange={e => setResAttachment(e.target.value)} className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" placeholder="URL do relatório ou provas..." />
          </div>

          {resDecision === "Resolver" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Observações / Orientações (opcional)</label>
              <textarea 
                value={resNotes} 
                onChange={e => setResNotes(e.target.value)} 
                className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors min-h-[60px]" 
                placeholder="Observações adicionais para o infrator ou para o registro de punição..." 
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
             <button onClick={() => setResolveCase(null)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-secondary transition-colors">
               Voltar
             </button>
             <button onClick={validateAndPromptResolve} className="px-4 py-2 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all ">
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
                 <p className="text-sm text-muted-foreground mt-1">Aberto por {getNickDisplay(viewCase.creatorId, viewCase.creatorNick, members)} em {formatBrasiliaDateTime(viewCase.creationDate)}</p>
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
                   Resolução (Por {getNickDisplay(viewCase.resolverId, viewCase.resolverNick, members)})
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
                    <span className="text-xs text-muted-foreground">Data da Resolução</span>
                    <span className="text-sm font-medium text-foreground">{formatBrasiliaDateTime(viewCase.resolutionDate)}</span>
                  </div>
                </div>
                {/* Relatório de resolução removido conforme solicitação */}

                {viewCase.punishmentApplied && viewCase.punishmentApplied !== "Sem Punição" && (
                  <div className="mt-2 pt-2 border-t border-border/40">
                    <button
                      onClick={() => {
                        setViewCase(null);
                        navigate({ to: "/advertencias" });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:bg-primary/20 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                      title="Abrir o Registro de Punições"
                    >
                      <FileWarning className="h-3.5 w-3.5" />
                      Ver Punição em Registro de Punições
                    </button>
                  </div>
                )}
              </div>
            )}

            {viewCase.status === "Cancelado" && (
              <div className="flex flex-col gap-4 border-t border-border/50 pt-4 mt-2">
                <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                   <XCircle className="h-4 w-4" />
                   Cancelado (Por {getNickDisplay(viewCase.resolverId, viewCase.resolverNick, members)})
                 </h4>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Motivo do Cancelamento</span>
                  <span className="text-sm font-medium text-foreground">{viewCase.cancellationReason || "-"}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Data da Decisão</span>
                  <span className="text-sm font-medium text-foreground">{formatBrasiliaDateTime(viewCase.resolutionDate)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showConfirmResolve}
        title={resDecision === "Resolver" ? "Confirmar Resolução de Caso?" : "Confirmar Cancelamento de Caso?"}
        description={
          resDecision === "Resolver" 
            ? `Deseja encerrar este caso aplicando a decisão: "${resCrime}" com punição "${resPunishment}" para ${resolveCase?.offenderNick}?${resPunishment !== "Sem Punição" ? " A punição será lançada automaticamente no Registro de Punições." : ""}` 
            : `Deseja cancelar e invalidar este caso? Esta ação será registrada no histórico de auditoria.`
        }
        confirmText={resDecision === "Resolver" ? "Confirmar Decisão" : "Confirmar Cancelamento"}
        variant={resDecision === "Resolver" ? "warning" : "danger"}
        onConfirm={handleResolve}
        onClose={() => setShowConfirmResolve(false)}
      />

      <ConfirmModal
        isOpen={!!caseToDelete}
        title="Excluir Caso Definitivamente?"
        description={`Tem certeza que deseja apagar o caso #${caseToDelete ? String(caseToDelete.id).toUpperCase() : ""} contra ${caseToDelete?.offenderNick}? Esta ação não poderá ser desfeita.`}
        confirmText="Excluir Definitivamente"
        variant="danger"
        onConfirm={handleDeleteCase}
        onClose={() => setCaseToDelete(null)}
      />

    </div>
  );
}
