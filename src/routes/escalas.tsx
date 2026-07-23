import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Search, RotateCcw, AlertTriangle, CheckCircle2, Clock, XCircle, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSchedules, getMembers, updateSchedule } from "../lib/store";
import { Schedule, Member } from "../lib/types";
import { generateWeeklySchedule } from "../lib/scheduler";
import { toast } from "sonner";

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

function EscalaTable({ 
  schedules, 
  members, 
  onStatusUpdate,
  isAdmin,
  onMemberChange
}: { 
  schedules: Schedule[], 
  members: Member[], 
  onStatusUpdate: (id: string, currentStatus: string) => void,
  isAdmin: boolean,
  onMemberChange: (scheduleId: string, newMemberId: string) => void
}) {
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
            <th className="px-6 py-4 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => {
            const member = getMemberDetails(schedule.memberId, members);
            const roleMembers = members.filter(m => m.role === schedule.type && m.status === "Ativo");
            return (
              <tr key={schedule.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {member?.nick?.charAt(0) || "?"}
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
                </td>
                <td className="px-6 py-4 text-muted-foreground">{schedule.type}</td>
                <td className="px-6 py-4 text-foreground font-medium">{schedule.referenceDay}</td>
                <td className="px-6 py-4 text-muted-foreground">{schedule.deadline}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={schedule.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onStatusUpdate(schedule.id, schedule.status)} className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Mudar Status
                  </button>
                </td>
              </tr>
            );
          })}
          {schedules.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { role } = useAuth();
  const isAdmin = role === "Presidência" || role === "Vice-Presidência";
  
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 }); // Saturday
  const weekDisplay = `Semana: Dom ${format(weekStart, "dd/MM")} a Sáb ${format(weekEnd, "dd/MM")}`;
  
  const weekNumber = format(weekStart, "I"); 
  const selectedWeek = `${format(weekStart, "yyyy")}-W${weekNumber}`;

  const fetchSchedules = async () => {
    const data = await getSchedules();
    setSchedules(data);
  };

  const fetchMembers = async () => {
    const data = await getMembers();
    setMembers(data);
  };

  useEffect(() => {
    fetchSchedules();
    fetchMembers();
  }, []);

  const handleGenerate = async () => {
    if (!isAdmin) return;
    setIsGenerating(true);
    toast.info("Gerando escala automática...");
    
    try {
      await generateWeeklySchedule(weekStart, members, "Fiscalizador", "1");
      await generateWeeklySchedule(weekStart, members, "Diretor", "1");
      await fetchSchedules();
      toast.success("Escalas geradas com sucesso para a semana!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const nextStatusMap: any = {
      "Pendente": "Concluído",
      "Concluído": "Atrasado",
      "Atrasado": "Justificativa Enviada",
      "Justificativa Enviada": "Pendente",
    };
    const next = nextStatusMap[currentStatus];
    await updateSchedule(id, { status: next });
    toast.success(`Status atualizado para ${next}`);
    fetchSchedules();
  };

  const handleMemberChange = async (scheduleId: string, newMemberId: string) => {
    await updateSchedule(scheduleId, { memberId: newMemberId });
    toast.success("Membro atribuído com sucesso!");
    fetchSchedules();
  };
  
  const filteredSchedules = schedules.filter(s => {
    if (s.week !== selectedWeek) return false;
    if (!searchQuery) return true;
    
    const member = getMemberDetails(s.memberId, members);
    return member?.nick.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const fiscalizadoresSchedules = filteredSchedules.filter(s => s.type === "Fiscalizador");
  const diretoresSchedules = filteredSchedules.filter(s => s.type === "Diretor");
  
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
            <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors border border-border shadow-sm">
              <RotateCcw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regerar Escala
            </button>
            <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-all ">
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
            <TabsList className="bg-secondary/50 border border-border rounded-lg p-1">
              <TabsTrigger value="fiscalizadores" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4">
                 Escala dos Fiscalizadores
               </TabsTrigger>
               {role !== "Fiscalizador" && (
                 <TabsTrigger value="diretores" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4">
                   Escala dos Diretores
                 </TabsTrigger>
               )}
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
             <EscalaTable schedules={fiscalizadoresSchedules} members={members} onStatusUpdate={handleStatusUpdate} isAdmin={isAdmin} onMemberChange={handleMemberChange} />
           </TabsContent>
 
           {role !== "Fiscalizador" && (
             <TabsContent value="diretores" className="p-0 m-0 border-none outline-none">
               <EscalaTable schedules={diretoresSchedules} members={members} onStatusUpdate={handleStatusUpdate} isAdmin={isAdmin} onMemberChange={handleMemberChange} />
             </TabsContent>
           )}
         </Tabs>
      </div>
    </div>
  );
}

