import { createFileRoute } from "@tanstack/react-router";
import { Member, Role } from "@/lib/types";
import { Search, UserPlus, Filter, History, Edit, PowerOff, Power, Crown, Star, ShieldCheck, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMembers, updateMemberStatus, addMember } from "../lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/membros")({
  component: MembrosPage,
});

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "Ativo";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center w-fit gap-1 ${isActive ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-muted text-muted-foreground border border-border"}`}>
      {status}
    </span>
  );
}

function MemberCard({ member, isAdmin, onToggleStatus }: { member: Member, isAdmin: boolean, onToggleStatus: (id: string, current: string) => void }) {
  return (
    <div className={`bg-card/50 border ${member.status === "Ativo" ? "border-border" : "border-border/50 opacity-70"} rounded-xl p-4 flex flex-col hover:border-primary/40 hover:bg-secondary/40 transition-all duration-300 shadow-sm relative group`}>
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         {/* Acesso total: Presidência e Vice (mock visual) */}
         {isAdmin && (
           <>
             <button className="p-1.5 text-muted-foreground hover:text-primary bg-background rounded-md border border-border hover:border-primary/30 transition-colors" title="Ver Histórico">
               <History className="h-4 w-4" />
             </button>
             <button className="p-1.5 text-muted-foreground hover:text-primary bg-background rounded-md border border-border hover:border-primary/30 transition-colors" title="Editar">
               <Edit className="h-4 w-4" />
             </button>
             <button onClick={() => onToggleStatus(member.id, member.status)} className={`p-1.5 bg-background rounded-md border border-border transition-colors ${member.status === 'Ativo' ? 'text-muted-foreground hover:text-destructive hover:border-destructive/30' : 'text-muted-foreground hover:text-green-500 hover:border-green-500/30'}`} title={member.status === 'Ativo' ? "Inativar" : "Ativar"}>
               {member.status === "Ativo" ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
             </button>
           </>
         )}
      </div>

      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg overflow-hidden shrink-0">
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt={member.nick} className="h-full w-full object-cover" />
          ) : (
            member.nick.charAt(0)
          )}
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground text-lg leading-none">{member.nick}</h3>
            <StatusBadge status={member.status} />
          </div>
          <p className="text-sm text-primary/80 font-medium mt-1.5">{member.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/50">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Entrada</span>
          <span className="text-sm text-foreground">{member.entryDate}</span>
        </div>
        {member.promotionDate && (
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Última Promoção</span>
            <span className="text-sm text-foreground">{member.promotionDate}</span>
          </div>
        )}
        {member.notes && (
          <div className="flex flex-col col-span-2 mt-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Observações</span>
            <span className="text-sm text-muted-foreground truncate" title={member.notes}>{member.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RoleSection({ title, icon: Icon, members, isAdmin, onToggleStatus }: { title: string, icon: any, members: Member[], isAdmin: boolean, onToggleStatus: (id: string, current: string) => void }) {
  if (members.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <div className="h-8 w-8 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center text-primary ">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
        <span className="bg-secondary border border-border text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full ml-2">
          {members.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map(m => <MemberCard key={m.id} member={m} isAdmin={isAdmin} onToggleStatus={onToggleStatus} />)}
      </div>
    </div>
  );
}

function MembrosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const { role } = useAuth();
  
  const isAdmin = role === "Presidência" || role === "Vice-Presidência";

  const fetchMembers = async () => {
    const data = await getMembers();
    setMembers(data);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleToggleStatus = async (id: string, current: string) => {
    if (!isAdmin) return;
    const next = current === "Ativo" ? "Inativo" : "Ativo";
    await updateMemberStatus(id, next as "Ativo" | "Inativo");
    toast.success(`Membro marcado como ${next}`);
    fetchMembers();
  };

  const handleAddMockMember = async () => {
    const nick = prompt("Nick do membro:");
    if (!nick) return;
    const newMember: Member = {
      id: `m${Date.now()}`,
      nick,
      role: "Fiscalizador",
      status: "Ativo",
      entryDate: new Date().toISOString().split("T")[0],
      notes: "Criado via mock interface"
    };
    await addMember(newMember);
    toast.success("Membro adicionado!");
    fetchMembers();
  };

  const filteredMembers = members.filter(m => 
    m.nick.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presidencia = filteredMembers.filter(m => m.role === "Presidência");
  const vice = filteredMembers.filter(m => m.role === "Vice-Presidência");
  const diretores = filteredMembers.filter(m => m.role === "Diretor");
  const fiscalizadores = filteredMembers.filter(m => m.role === "Fiscalizador");

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Membros do SSI</h1>
          <p className="text-muted-foreground mt-1">Gestão hierárquica e controle da equipe de segurança.</p>
        </div>
        {isAdmin && (
          <button onClick={handleAddMockMember} className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-all w-full sm:w-auto">
            <UserPlus className="h-4 w-4" />
            Cadastrar Membro
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center bg-background border border-border rounded-md px-3 py-2 focus-within:border-primary/50 transition-colors w-full sm:w-96 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input 
            type="text" 
            placeholder="Buscar por nick ou cargo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
          />
        </div>
        
        <button className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border bg-background hover:bg-secondary/50 px-4 py-2 rounded-md transition-colors w-full sm:w-auto">
          <Filter className="h-4 w-4" />
          Mais Filtros
        </button>
      </div>

      <div className="flex flex-col gap-10">
        <RoleSection title="Presidência" icon={Crown} members={presidencia} isAdmin={isAdmin} onToggleStatus={handleToggleStatus} />
        <RoleSection title="Vice-Presidência" icon={Star} members={vice} isAdmin={isAdmin} onToggleStatus={handleToggleStatus} />
        <RoleSection title="Diretores" icon={ShieldCheck} members={diretores} isAdmin={isAdmin} onToggleStatus={handleToggleStatus} />
        <RoleSection title="Fiscalizadores" icon={ShieldAlert} members={fiscalizadores} isAdmin={isAdmin} onToggleStatus={handleToggleStatus} />
        
        {filteredMembers.length === 0 && (
          <div className="py-12 text-center text-muted-foreground bg-card border border-border border-dashed rounded-xl">
            Nenhum membro encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
}
