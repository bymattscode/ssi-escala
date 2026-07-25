import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Search, RotateCcw, AlertTriangle, CheckCircle2, Clock, XCircle, CalendarIcon, FileText, Gavel, X, ExternalLink } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSchedules, getMembers, updateSchedule, addAuditLog } from "../lib/store";
import { Schedule, Member } from "../lib/types";
import { generateWeeklySchedule } from "../lib/scheduler";
import { toast } from "sonner";
import { EmptyState, SkeletonTable, ConfirmModal } from "../components/ui/ux";

export const Route = createFileRoute("/escalas")({
  component: EscalasPage,
});

function getMemberDetails(memberId: string, members: Member[]) {
  return members.find((m) => m.id === memberId) || null;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string, icon: any }> = {
    Pendente: { bg: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
    Concluído: { bg: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
    Atrasado: { bg: "bg-red-500/10 text-red-500 border-red-500/20", icon: Clock },
    Justificado: { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: AlertTriangle },
    "Não Justificado": { bg: "bg-red-500 text-white border-red-600", icon: XCircle },
  };
  
  const Icon = styles[status]?.icon || Clock;
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit whitespace-nowrap ${styles[status]?.bg}`}>
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
        <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-secondary/30">
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

function EscalaTable({ 
  schedules, 
  members, 
  onStatusUpdate,
  isAdmin,
  onMemberChange,
  onJustify,
  onView,
  onRegisterFunction
}: { 
  schedules: Schedule[], 
  members: Member[], 
  onStatusUpdate: (id: string, currentStatus: string) => void,
  isAdmin: boolean,
  onMemberChange: (scheduleId: string, newMemberId: string) => void,
  onJustify: (schedule: Schedule) => void,
  onView: (schedule: Schedule) => void,
  onRegisterFunction: (schedule: Schedule) => void
}) {
  return (
    <div className="w-full">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
          <tr>
            <th className="px-4 py-4 font-medium">Membro</th>
            <th className="px-4 py-4 font-medium">Cargo</th>
            <th className="px-4 py-4 font-medium">Dia Ref.</th>
            <th className="px-4 py-4 font-medium">Prazo</th>
            <th className="px-4 py-4 font-medium">Status</th>
            <th className="px-4 py-4 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => {
            const member = getMemberDetails(schedule.memberId, members);
            const isSpecial = schedule.type === "Fiscalização de Avaliadores" || schedule.type === "Fiscalização de Capacitadores";
            const fiscMembers = members.filter(m => m.role === "Fiscalizador" && m.status === "Ativo");
            const roleMembers = (isSpecial && fiscMembers.length > 0) ? fiscMembers : members.filter(m => m.status === "Ativo");
            return (
              <tr key={schedule.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-4 font-medium text-foreground">
                  <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs overflow-hidden shrink-0">
                    {member ? (
                      <>
                        <img 
                          src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${member.nick}&action=std&direction=2&head_direction=2&gesture=sml&size=m`} 
                          alt={member.nick} 
                          className="h-[2.5rem] w-[2.5rem] max-w-none object-cover mt-1.5"
                          onError={(e) => { 
                            e.currentTarget.style.display = 'none'; 
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; 
                            }
                          }} 
                        />
                        <span className="hidden">{member.nick.charAt(0)}</span>
                      </>
                    ) : (
                      "?"
                    )}
                  </div>
                  {isAdmin ? (
                    <select
                      value={schedule.memberId}
                      onChange={(e) => onMemberChange(schedule.id, e.target.value)}
                      className="bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors w-full min-w-[120px]"
                    >
                      {roleMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.nick}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="truncate">{member?.nick || "Desconhecido"}</span>
                  )}
                  </div>
                </td>
                <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{schedule.type}</td>
                <td className="px-4 py-4 text-foreground font-medium whitespace-nowrap">{schedule.referenceDay}</td>
                <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                  <div className="flex flex-col items-start leading-tight">
                    <span>{schedule.deadline.split(' (')[0]}</span>
                    <span className="text-xs">({schedule.deadline.split('(')[1] || '23:59)'}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={schedule.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                  
                  {schedule.status === "Atrasado" && (
                    <button 
                      onClick={() => onJustify(schedule)}
                      className="text-xs bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 px-2 py-1 rounded-md border border-yellow-500/20 transition-colors font-medium"
                    >
                      Justificar
                    </button>
                  )}
                  
                  
                  {schedule.status !== "Não Justificado" && schedule.status !== "Concluído" && schedule.status !== "Justificado" && (
                    <button 
                      onClick={() => onRegisterFunction(schedule)}
                      className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md border border-primary/20 transition-colors font-medium flex items-center gap-1 ml-2 whitespace-nowrap"
                    >
                      <FileText className="h-3 w-3" /> Registrar Função
                    </button>
                  )}
                  
                  <div className="flex items-center gap-1 ml-2">
                    {isAdmin && (
                      <button onClick={() => onStatusUpdate(schedule.id, schedule.status)} className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors flex flex-col items-center leading-none gap-0.5 border border-primary/20 rounded px-2 py-1 bg-primary/5 shadow-sm hover:bg-primary/10">
                        <span>Ciclar</span>
                        <span>Status</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => onView(schedule)}
                      className="p-1.5 text-muted-foreground hover:text-primary bg-background rounded-md border border-border hover:border-primary/30 transition-colors shrink-0 shadow-sm" 
                      title="Ver Detalhes/Histórico"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                  
                  </div>
                </td>
              </tr>
            );
          })}
          {schedules.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8">
                <EmptyState
                  icon={CalendarDays}
                  title="Nenhuma escala registrada"
                  description="Ainda não existem escalas geradas ou correspondentes a este período ou filtro de busca."
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EscalasPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmGenerate, setShowConfirmGenerate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { role, userName } = useAuth();
  const isAdmin = role === "Presidente" || role === "Vice-Presidente";
  
  // Modals state
  const [justifyingSchedule, setJustifyingSchedule] = useState<Schedule | null>(null);
  const [justificationReason, setJustificationReason] = useState("");
  const [justificationText, setJustificationText] = useState("");
  const [justificationOccurrenceDate, setJustificationOccurrenceDate] = useState("");
  const [justificationAttachment, setJustificationAttachment] = useState("");
  
  
  const [viewSchedule, setViewSchedule] = useState<Schedule | null>(null);
  
  const [registeringSchedule, setRegisteringSchedule] = useState<Schedule | null>(null);
  const [registerComments, setRegisterComments] = useState("");
  const [registerConclusionId, setRegisterConclusionId] = useState("");
  
  const handleOpenRegister = (schedule: Schedule) => {
    setRegisteringSchedule(schedule);
    setRegisterComments(schedule.comments || "");
    setRegisterConclusionId(schedule.conclusionId || "");
  };
  
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 }); // Saturday
  const weekDisplay = `Semana: Dom ${format(weekStart, "dd/MM")} a Sáb ${format(weekEnd, "dd/MM")}`;
  
  const weekNumber = format(weekStart, "I"); 
  const selectedWeek = `${format(weekStart, "yyyy")}-W${weekNumber}`;

  const fetchSchedules = async (skipAutomation = true) => {
    setIsLoading(true);
    let data = await getSchedules();
    setSchedules(data);
    setIsLoading(false);
  };

  const runAutomation = async () => {
    let data = await getSchedules();
    const now = new Date();
    let hasUpdates = false;
    
    for (const schedule of data) {
      if (schedule.deadlineDate && (schedule.status === "Pendente" || schedule.status === "Atrasado")) {
        const deadline = new Date(schedule.deadlineDate);
        const diffMs = now.getTime() - deadline.getTime();
        
        if (schedule.status === "Pendente" && diffMs > 0) {
          await updateSchedule(schedule.id, { status: "Atrasado" });
          hasUpdates = true;
        } else if (schedule.status === "Atrasado" && diffMs > 24 * 60 * 60 * 1000) {
          await updateSchedule(schedule.id, { status: "Não Justificado" });
          hasUpdates = true;
        }
      }
    }
    
    if (hasUpdates) {
      fetchSchedules();
    }
  };

  const fetchMembers = async () => {
    const data = await getMembers();
    setMembers(data);
  };

  useEffect(() => {
    fetchSchedules().then(() => {
      runAutomation();
    });
    fetchMembers();
  }, []);

  const handleGenerate = async () => {
    if (!isAdmin) return;
    setIsGenerating(true);
    toast.info("Gerando escala automática...");
    
    try {
      await generateWeeklySchedule(weekStart, members, "Fiscalizador", "1");
      await generateWeeklySchedule(weekStart, members, "Diretor", "1");
      await generateWeeklySchedule(weekStart, members, "Fiscalização de Avaliadores", "1");
      await generateWeeklySchedule(weekStart, members, "Fiscalização de Capacitadores", "1");
      
      await addAuditLog("1", role, "Geração de Escala", "Escalas", `Escalas automáticas geradas para a semana ${selectedWeek}.`);
      
      await fetchSchedules();
      toast.success("Escalas geradas com sucesso para a semana!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
      setShowConfirmGenerate(false);
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    // Evitar status Justificado por clique direto: justificativa requer preenchimento de formulário auditável
    const nextStatusMap: any = {
      "Pendente": "Concluído",
      "Concluído": "Atrasado",
      "Atrasado": "Não Justificado",
      "Justificado": "Não Justificado",
      "Não Justificado": "Pendente",
    };
    const next = nextStatusMap[currentStatus] || "Pendente";
    await updateSchedule(id, { status: next });
    
    await addAuditLog("1", role, "Alteração de Status", "Escalas", `Status da escala #${id} alterado para ${next}.`, id);
    
    toast.success(`Status da escala atualizado para: ${next}`);
    fetchSchedules();
  };

  const handleMemberChange = async (scheduleId: string, newMemberId: string) => {
    await updateSchedule(scheduleId, { memberId: newMemberId });
    await addAuditLog("1", role, "Edição de Membro", "Escalas", `Membro atribuído à escala #${scheduleId}.`, scheduleId);
    toast.success("Membro atribuído com sucesso!");
    fetchSchedules();
  };

  const handleSubmitJustification = async () => {
    if (!justifyingSchedule || !justificationReason || !justificationText || !justificationOccurrenceDate) {
      toast.error("Obrigatório: Preencha o motivo, a data do ocorrido e as observações.");
      return;
    }
    if (!justificationText.trim() || justificationText.trim().length < 5) {
      toast.error("Dados mínimos insuficientes: Detalhe o motivo da justificativa com pelo menos 5 caracteres.");
      return;
    }
    
    await updateSchedule(justifyingSchedule.id, {
      status: "Justificado",
      justificationReason,
      justificationText: justificationText.trim(),
      justificationOccurrenceDate,
      justificationAttachment: justificationAttachment.trim() || undefined,
      justificationDate: new Date().toISOString()
    });
    
    await addAuditLog("1", role, "Envio de Justificativa", "Escalas", `Justificativa enviada para a escala #${justifyingSchedule.id}.`, justifyingSchedule.id);
    
    toast.success("Justificativa registrada com sucesso! Status da escala atualizado para Justificado.");
    setJustifyingSchedule(null);
    setJustificationReason("");
    setJustificationText("");
    setJustificationOccurrenceDate("");
    setJustificationAttachment("");
    fetchSchedules();
  };

  const handleRegisterSubmit = async () => {
    if (!registeringSchedule) return;
    if (!registerComments || !registerComments.trim() || registerComments.trim().length < 5) {
      toast.error("Obrigatório: Insira o link do print ou descrição detalhada comprovando a realização da função (mínimo 5 caracteres).");
      return;
    }
    
    await updateSchedule(registeringSchedule.id, {
      status: "Concluído",
      comments: registerComments.trim(),
      conclusionId: registerConclusionId.trim() || undefined,
    });
    
    await addAuditLog("1", role, "Alteração de Status", "Escalas", `Função registrada como Concluído na escala #${registeringSchedule.id}.`, registeringSchedule.id);
    
    toast.success("Registro operacional enviado e validado! Status atualizado para Concluído.");
    setRegisteringSchedule(null);
    setRegisterComments("");
    setRegisterConclusionId("");
    fetchSchedules();
  };
  
  const filteredSchedules = schedules.filter(s => {
    if (s.week !== selectedWeek) return false;
    if (!searchQuery) return true;
    
    const member = getMemberDetails(s.memberId, members);
    return member?.nick.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const fiscalizadoresSchedules = filteredSchedules.filter(s => s.type === "Fiscalizador" || (!s.type && s.id.includes("FIS")));
  const diretoresSchedules = filteredSchedules.filter(s => s.type === "Diretor");
  const avaliadoresSchedules = filteredSchedules.filter(s => s.type === "Fiscalização de Avaliadores");
  const capacitadoresSchedules = filteredSchedules.filter(s => s.type === "Fiscalização de Capacitadores");
  
  const pendentes = filteredSchedules.filter(s => s.status === "Pendente").length;
  const concluidos = filteredSchedules.filter(s => s.status === "Concluído").length;
  const atrasados = filteredSchedules.filter(s => s.status === "Atrasado").length;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Escalas da Equipe</h1>
          <p className="text-muted-foreground mt-1">Gerencie atribuições, prazos e acompanhe o progresso semanal.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button onClick={() => setShowConfirmGenerate(true)} disabled={isGenerating} className="flex items-center gap-2 bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors border border-border shadow-sm">
              <RotateCcw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regerar Escala
            </button>
            <button onClick={() => setShowConfirmGenerate(true)} disabled={isGenerating} className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-all shadow-md">
              <CalendarDays className="h-4 w-4" />
              Gerar Automática
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <TabsList className="bg-secondary/50 border border-border rounded-lg p-1 flex flex-wrap gap-1 h-auto">
              <TabsTrigger value="fiscalizadores" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-3 py-1.5 text-xs md:text-sm font-semibold transition-all">
                 Escala dos Fiscalizadores
               </TabsTrigger>
               <TabsTrigger value="diretores" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-3 py-1.5 text-xs md:text-sm font-semibold transition-all">
                 Escala dos Diretores
               </TabsTrigger>
             </TabsList>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center bg-background border border-border hover:border-primary/50 hover:bg-secondary/20 rounded-md px-3 py-1.5 transition-colors flex-1 sm:w-64 text-left justify-between">
                    <span className="text-sm text-foreground flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      {weekDisplay}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-border bg-card shadow-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:border-primary/50 transition-colors flex-1 sm:w-64 shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar membro..." 
                  className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <TabsContent value="fiscalizadores" className="p-0 m-0 border-none outline-none">
            {isLoading ? <SkeletonTable rows={5} /> : (
             <EscalaTable 
               schedules={fiscalizadoresSchedules} 
               members={members} 
               onStatusUpdate={handleStatusUpdate} 
               isAdmin={isAdmin} 
               onMemberChange={handleMemberChange} 
               onJustify={setJustifyingSchedule}
               onView={setViewSchedule}
               onRegisterFunction={handleOpenRegister}
             />
            )}
           </TabsContent>
  
           <TabsContent value="diretores" className="p-0 m-0 border-none outline-none">
            {isLoading ? <SkeletonTable rows={5} /> : (
             <EscalaTable 
               schedules={diretoresSchedules} 
               members={members} 
               onStatusUpdate={handleStatusUpdate} 
               isAdmin={isAdmin} 
               onMemberChange={handleMemberChange} 
               onJustify={setJustifyingSchedule}
               onView={setViewSchedule}
               onRegisterFunction={handleOpenRegister}
             />
            )}
           </TabsContent>
         </Tabs>
      </div>

      {/* SEÇÃO DE FISCALIZAÇÃO ESPECIAL ABAIXO DA TABELA PRINCIPAL */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-2">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              📌 Fiscalizações Operacionais Especiais
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Funções de monitoramento supervisionadas exclusivamente por <strong className="text-foreground">Fiscalizadores</strong>. Prazo para conclusão: <strong className="text-primary">Terça-feira (23:59)</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Fiscalização de Avaliadores */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-secondary/20 px-4 py-3 border-b border-border font-bold text-sm text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2 text-primary">
                🔍 Fiscalização de Avaliadores
              </span>
              <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                Prazo: Terça (23:59)
              </span>
            </div>
            <div className="p-0 overflow-x-auto flex-1">
              {isLoading ? <SkeletonTable rows={1} /> : (
                <EscalaTable 
                  schedules={avaliadoresSchedules} 
                  members={members} 
                  onStatusUpdate={handleStatusUpdate} 
                  isAdmin={isAdmin} 
                  onMemberChange={handleMemberChange} 
                  onJustify={setJustifyingSchedule}
                  onView={setViewSchedule}
                  onRegisterFunction={handleOpenRegister}
                />
              )}
            </div>
          </div>

          {/* Fiscalização de Capacitadores */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-secondary/20 px-4 py-3 border-b border-border font-bold text-sm text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2 text-primary">
                📚 Fiscalização de Capacitadores
              </span>
              <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                Prazo: Terça (23:59)
              </span>
            </div>
            <div className="p-0 overflow-x-auto flex-1">
              {isLoading ? <SkeletonTable rows={1} /> : (
                <EscalaTable 
                  schedules={capacitadoresSchedules} 
                  members={members} 
                  onStatusUpdate={handleStatusUpdate} 
                  isAdmin={isAdmin} 
                  onMemberChange={handleMemberChange} 
                  onJustify={setJustifyingSchedule}
                  onView={setViewSchedule}
                  onRegisterFunction={handleOpenRegister}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmGenerate}
        title="Gerar/Regerar Escalas da Semana?"
        description="Esta ação analisará a equipe ativa e distribuirá automaticamente as novas funções operacionais desta semana para Fiscalizadores e Diretores."
        confirmText="Gerar Escalas"
        variant="info"
        isLoading={isGenerating}
        onConfirm={handleGenerate}
        onClose={() => setShowConfirmGenerate(false)}
      />

      {/* MODAL ENVIAR JUSTIFICATIVA */}
      <Modal isOpen={!!justifyingSchedule} onClose={() => setJustifyingSchedule(null)} title="Justificar Atraso/Ausência">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Descreva o motivo pelo qual você não conseguiu cumprir o prazo da escala <strong className="text-foreground">{justifyingSchedule?.referenceDay}</strong>.
          </p>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Motivo Principal *</label>
            <select 
              value={justificationReason} 
              onChange={e => setJustificationReason(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="">Selecione o motivo...</option>
              <option value="Problemas Técnicos/Internet">Problemas Técnicos / Internet</option>
              <option value="Motivos Pessoais/Saúde">Motivos Pessoais / Saúde</option>
              <option value="Falta de Demanda (Sem membros para fiscalizar)">Falta de Demanda (Sem membros para fiscalizar)</option>
              <option value="Esquecimento">Esquecimento</option>
              <option value="Outro">Outro (Especifique nas observações)</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Data da Ocorrência *</label>
            <input 
              type="date"
              value={justificationOccurrenceDate}
              onChange={e => setJustificationOccurrenceDate(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Observações *</label>
            <textarea 
              value={justificationText}
              onChange={e => setJustificationText(e.target.value)}
              placeholder="Digite os detalhes da sua justificativa aqui..."
              className="bg-background border border-border rounded-md p-3 min-h-[100px] text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Anexo de Prova (Opcional)</label>
            <input 
              type="url"
              value={justificationAttachment}
              onChange={e => setJustificationAttachment(e.target.value)}
              placeholder="https://imgur.com/..."
              className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
            <span className="text-xs text-muted-foreground">Insira o link para a imagem ou documento que comprove o motivo (ex: Print de erro).</span>
          </div>

          <div className="flex justify-end gap-3 mt-4">
             <button onClick={() => setJustifyingSchedule(null)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-secondary transition-colors text-sm">
               Cancelar
             </button>
             <button onClick={handleSubmitJustification} className="px-4 py-2 rounded-md font-medium bg-yellow-600 text-white hover:bg-yellow-700 transition-all text-sm">
               Enviar Justificativa
             </button>
          </div>
        </div>
      </Modal>


      {/* MODAL DETALHES DA ESCALA */}
      <Modal isOpen={!!viewSchedule} onClose={() => setViewSchedule(null)} title="Detalhes da Escala">
        {viewSchedule && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-foreground">{getMemberDetails(viewSchedule.memberId, members)?.nick}</h3>
                 <p className="text-sm text-muted-foreground mt-1">Escala de {viewSchedule.type} - {viewSchedule.referenceDay}</p>
              </div>
              <StatusBadge status={viewSchedule.status} />
            </div>
            
            {viewSchedule.justificationText && (
              <div className="flex flex-col gap-2 bg-secondary/20 p-4 rounded-xl border border-border/50">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Histórico de Justificativa
                </h4>
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Enviado em</span>
                    <span className="text-sm font-medium text-foreground">{viewSchedule.justificationDate || "-"}</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Motivo</span>
                  <p className="text-sm text-foreground font-medium">{viewSchedule.justificationReason || "-"}</p>
                </div>
                {viewSchedule.justificationOccurrenceDate && (
                  <div className="mt-1 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Data da Ocorrência</span>
                    <p className="text-sm text-foreground">{viewSchedule.justificationOccurrenceDate}</p>
                  </div>
                )}
                <div className="mt-2 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Observações</span>
                  <p className="text-sm text-foreground bg-background p-2 rounded border border-border/50">{viewSchedule.justificationText}</p>
                </div>
                {viewSchedule.justificationAttachment && (
                  <div className="mt-2 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Anexo de Prova</span>
                    <a href={viewSchedule.justificationAttachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm break-all">
                      Acessar Anexo
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL REGISTRAR FUNÇÃO */}
      <Modal isOpen={!!registeringSchedule} onClose={() => setRegisteringSchedule(null)} title="REGISTRAR ESCALA">
        {registeringSchedule && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground mb-2 text-center">Selecione o status e informe os dados exatamente como aparecem na escala.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-foreground">Cargo:</label>
                <div className="bg-secondary/20 border border-border rounded-md px-3 py-2 text-sm text-muted-foreground flex items-center justify-between">
                  {registeringSchedule.type}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-foreground">Nick:</label>
                <div className="bg-secondary/20 border border-border rounded-md px-3 py-2 text-sm text-foreground font-medium h-9 flex items-center">
                  {getMemberDetails(registeringSchedule.memberId, members)?.nick || "Desconhecido"}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-bold text-foreground">Código da Função / ID (ex: BA01, FC01, AV01):</label>
              <input 
                type="text"
                value={registerConclusionId}
                onChange={e => setRegisterConclusionId(e.target.value.toUpperCase())}
                placeholder="Ex: BA01, FC01, MON1..."
                className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground font-semibold uppercase focus:outline-none focus:border-primary/50"
              />
            </div>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-bold text-foreground">Print da função:</label>
              <textarea 
                value={registerComments} 
                onChange={e => setRegisterComments(e.target.value)} 
                placeholder="Print da função realizada..." 
                className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 min-h-[100px] resize-y"
              />
            </div>
            
            <button onClick={handleRegisterSubmit} className="w-full mt-4 py-3 rounded-xl font-bold bg-[#1a2b4c] text-white hover:bg-[#1a2b4c]/90 transition-all shadow-md">
              ENVIAR REGISTRO
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
}

