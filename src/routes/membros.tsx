import { createFileRoute } from "@tanstack/react-router";
import { Member, Role, UserGroup, ModulePermission } from "../lib/types";
import { Search, UserPlus, Filter, History, Edit, PowerOff, Power, Crown, Star, ShieldCheck, ShieldAlert, X, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMembers, updateMemberStatus, updateMember, deleteMember, addMember, addAuditLog } from "../lib/store";
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

// Simple Modal wrapper
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
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

function MemberCard({ member, isAdmin, onEdit, onDeactivate, onReactivate, onRevokeAccess }: { 
  member: Member; 
  isAdmin: boolean; 
  onEdit: (m: Member) => void;
  onDeactivate: (m: Member) => void;
  onReactivate: (m: Member) => void;
  onRevokeAccess?: (m: Member) => void;
}) {
  return (
    <div className={`bg-card/50 border ${member.status === "Ativo" ? "border-border" : "border-border/50 opacity-70"} rounded-xl p-4 flex flex-col hover:border-primary/40 hover:bg-secondary/40 transition-all duration-300 shadow-sm relative group`}>
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         {/* Acesso total: Presidente e Vice (mock visual) */}
         {isAdmin && (
           <>
             <button className="p-1.5 text-muted-foreground hover:text-primary bg-background rounded-md border border-border hover:border-primary/30 transition-colors" title="Ver Histórico">
               <History className="h-4 w-4" />
             </button>
             <button onClick={() => onEdit(member)} className="p-1.5 text-muted-foreground hover:text-primary bg-background rounded-md border border-border hover:border-primary/30 transition-colors" title="Editar Cargo">
               <Edit className="h-4 w-4" />
             </button>
             {member.accessCode && onRevokeAccess && (
               <button onClick={() => onRevokeAccess(member)} className="p-1.5 text-muted-foreground hover:text-orange-500 bg-background rounded-md border border-border hover:border-orange-500/30 transition-colors" title="Revogar Código de Acesso">
                 <Key className="h-4 w-4" />
               </button>
             )}
             {member.status === "Ativo" ? (
               <button onClick={() => onDeactivate(member)} className="p-1.5 bg-background rounded-md border border-border transition-colors text-muted-foreground hover:text-destructive hover:border-destructive/30" title="Inativar ou Licença">
                 <PowerOff className="h-4 w-4" />
               </button>
             ) : (
               <button onClick={() => onReactivate(member)} className="p-1.5 bg-background rounded-md border border-border transition-colors text-muted-foreground hover:text-green-500 hover:border-green-500/30" title="Reativar">
                 <Power className="h-4 w-4" />
               </button>
             )}
           </>
         )}
      </div>

      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg overflow-hidden shrink-0">
          <img 
            src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${member.nick}&action=std&direction=2&head_direction=2&gesture=sml&size=m`} 
            alt={member.nick} 
            className="h-[3.5rem] w-[3.5rem] max-w-none object-cover mt-2"
            onError={(e) => { 
              e.currentTarget.style.display = 'none'; 
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; 
              }
            }} 
          />
          <span className="hidden">{member.nick.charAt(0)}</span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-foreground text-lg leading-tight break-all">{member.nick}</h3>
            <div className="shrink-0">
              <StatusBadge status={member.status} />
            </div>
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
        {member.status === "Licença" && member.leaveStartDate && member.leaveEndDate && (
          <div className="flex flex-col col-span-2 mt-1 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
            <span className="text-[10px] uppercase tracking-wider text-yellow-600 font-bold">Em Licença</span>
            <span className="text-sm text-yellow-600 truncate">
              {member.leaveStartDate} até {member.leaveEndDate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function RoleSection({ title, icon: Icon, members, isAdmin, onEdit, onDeactivate, onReactivate, onRevokeAccess }: { title: string, icon: any, members: Member[], isAdmin: boolean, onEdit: (m: Member) => void, onDeactivate: (m: Member) => void, onReactivate: (m: Member) => void, onRevokeAccess?: (m: Member) => void }) {
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
        {members.map(m => <MemberCard key={m.id} member={m} isAdmin={isAdmin} onEdit={onEdit} onDeactivate={onDeactivate} onReactivate={onReactivate} onRevokeAccess={onRevokeAccess} />)}
      </div>
    </div>
  );
}

function MembrosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const { role } = useAuth();
  
  const isAdmin = role === "Presidente" || role === "Vice-Presidente";

  const fetchMembers = async () => {
    const data = await getMembers();
    setMembers(data);
  };

  const ALL_PERMISSIONS: ModulePermission[] = ["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos", "Registro de Punições", "Relatórios e Auditoria", "Configurações"];

  const togglePermission = (perm: ModulePermission, current: ModulePermission[], set: (v: ModulePermission[]) => void) => {
    if (current.includes(perm)) {
      set(current.filter(p => p !== perm));
    } else {
      set([...current, perm]);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editRole, setEditRole] = useState<Role>("Fiscalizador");
  const [editEntryDate, setEditEntryDate] = useState("");
  const [editPromotionDate, setEditPromotionDate] = useState("");
  const [editGroup, setEditGroup] = useState<UserGroup>("SSI");
  const [editPermissions, setEditPermissions] = useState<ModulePermission[]>([]);

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberNick, setNewMemberNick] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Role>("Fiscalizador");
  const [newMemberEntryDate, setNewMemberEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [newMemberGroup, setNewMemberGroup] = useState<UserGroup>("SSI");
  const [newMemberPermissions, setNewMemberPermissions] = useState<ModulePermission[]>([]);

  const [deactivateMember, setDeactivateMember] = useState<Member | null>(null);
  const [deactivateType, setDeactivateType] = useState<"Inativo" | "Licença">("Inativo");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");

  const handleEdit = (m: Member) => {
    setEditMember(m);
    setEditRole(m.role);
    setEditEntryDate(m.entryDate || "");
    setEditPromotionDate(m.promotionDate || "");
    setEditGroup(m.group || "SSI");
    setEditPermissions(m.permissions || []);
  };

  const handleDeactivate = (m: Member) => {
    setDeactivateMember(m);
    setDeactivateType("Inativo");
    setLeaveStart("");
    setLeaveEnd("");
  };

  const handleReactivate = async (m: Member) => {
    if (!isAdmin) return;
    await updateMemberStatus(m.id, "Ativo");
    await addAuditLog("1", role, "Retorno de Licença", "Membros", `O membro ${m.nick} retornou da licença.`, m.id);
    toast.success("Membro reativado com sucesso!");
    fetchMembers();
  };

  const handleRevokeAccess = async (m: Member) => {
    if (!isAdmin) return;
    if (confirm(`Tem certeza que deseja revogar o código de acesso de ${m.nick}? Isso forçará uma nova validação pelo Habbo.`)) {
      await updateMember(m.id, { accessCode: "" }); // Remove accessCode via vazio
      await addAuditLog("1", role, "Revogação de Acesso", "Membros", `O código de acesso de ${m.nick} foi revogado.`, m.id);
      toast.success("Código de acesso revogado!");
      fetchMembers();
    }
  };

  const submitEditRole = async () => {
    if (!editMember) return;
    if (editRole === "Vice-Presidente") {
      const vps = members.filter(m => m.role === "Vice-Presidente" && m.id !== editMember.id);
      if (vps.length >= 3) {
        toast.error("O limite máximo de Vice-Presidentes é 3.");
        return;
      }
    }
    
    await updateMember(editMember.id, { 
      role: editRole,
      entryDate: editEntryDate || editMember.entryDate,
      promotionDate: editPromotionDate || undefined,
      group: editGroup,
      permissions: editPermissions
    });
    await addAuditLog("1", role, "Edição de Membro", "Membros", `Os dados do membro ${editMember.nick} foram atualizados.`, editMember.id);
    toast.success("Membro atualizado com sucesso!");
    setEditMember(null);
    fetchMembers();
  };

  const submitDeactivate = async () => {
    if (!deactivateMember) return;
    
    if (deactivateType === "Licença" && (!leaveStart || !leaveEnd)) {
      toast.error("Preencha a data de início e fim da licença.");
      return;
    }
    
    if (deactivateType === "Licença") {
      await updateMember(deactivateMember.id, { 
        status: "Licença",
        leaveStartDate: leaveStart,
        leaveEndDate: leaveEnd
      });
      await addAuditLog("1", role, "Membro em Licença", "Membros", `O membro ${deactivateMember.nick} entrou em licença de ${leaveStart} até ${leaveEnd}.`, deactivateMember.id);
      toast.success("Membro colocado em licença!");
    } else {
      await deleteMember(deactivateMember.id);
      await addAuditLog("1", role, "Desligamento de Membro", "Membros", `O membro ${deactivateMember.nick} foi desligado do setor.`, deactivateMember.id);
      toast.success("Membro desligado do setor!");
    }
    setDeactivateMember(null);
    fetchMembers();
  };

  const handleToggleStatus = async (id: string, current: string) => {
    if (!isAdmin) return;
    const next = current === "Ativo" ? "Inativo" : "Ativo";
    await updateMemberStatus(id, next as "Ativo" | "Inativo");
    await addAuditLog("1", role, "Alteração de Status", "Membros", `O status do membro foi alterado para ${next}.`, id);
    toast.success(`Membro marcado como ${next}`);
    fetchMembers();
  };

  const handleOpenAddMember = () => {
    setNewMemberNick("");
    setNewMemberRole("Fiscalizador");
    setNewMemberEntryDate(new Date().toISOString().split("T")[0]);
    setNewMemberGroup("SSI");
    setNewMemberPermissions(["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos"]);
    setIsAddingMember(true);
  };

  const submitAddMember = async () => {
    if (!newMemberNick.trim()) {
      toast.error("Preencha o nick do membro.");
      return;
    }
    const newMember: Member = {
      id: `m${Date.now()}`,
      nick: newMemberNick.trim(),
      role: newMemberRole,
      status: "Ativo",
      entryDate: newMemberEntryDate || new Date().toISOString().split("T")[0],
      group: newMemberGroup,
      permissions: newMemberPermissions
    };
    await addMember(newMember);
    await addAuditLog("1", role, "Criação de Membro", "Membros", `O membro ${newMember.nick} foi adicionado como ${newMemberRole}.`, newMember.id);
    toast.success("Membro adicionado!");
    setIsAddingMember(false);
    fetchMembers();
  };

  const filteredMembers = members.filter(m => 
    m.nick.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presidencia = filteredMembers.filter(m => m.role === "Presidente");
  const vice = filteredMembers.filter(m => m.role === "Vice-Presidente");
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
          <button onClick={handleOpenAddMember} className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-all w-full sm:w-auto">
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
        <RoleSection title="Presidente" icon={Crown} members={presidencia} isAdmin={isAdmin} onEdit={handleEdit} onDeactivate={handleDeactivate} onReactivate={handleReactivate} onRevokeAccess={handleRevokeAccess} />
        <RoleSection title="Vice-Presidente" icon={Star} members={vice} isAdmin={isAdmin} onEdit={handleEdit} onDeactivate={handleDeactivate} onReactivate={handleReactivate} onRevokeAccess={handleRevokeAccess} />
        <RoleSection title="Diretores" icon={ShieldCheck} members={diretores} isAdmin={isAdmin} onEdit={handleEdit} onDeactivate={handleDeactivate} onReactivate={handleReactivate} onRevokeAccess={handleRevokeAccess} />
        <RoleSection title="Fiscalizadores" icon={ShieldAlert} members={fiscalizadores} isAdmin={isAdmin} onEdit={handleEdit} onDeactivate={handleDeactivate} onReactivate={handleReactivate} onRevokeAccess={handleRevokeAccess} />
        {filteredMembers.length === 0 && (
          <div className="py-12 text-center text-muted-foreground bg-card border border-border border-dashed rounded-xl">
            Nenhum membro encontrado com os filtros atuais.
          </div>
        )}
      </div>

      <Modal isOpen={isAddingMember} onClose={() => setIsAddingMember(false)} title="Cadastrar Novo Membro">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Nick</label>
            <input 
              type="text"
              value={newMemberNick}
              onChange={e => setNewMemberNick(e.target.value)}
              placeholder="Ex: joaozinho123"
              className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Cargo Inicial</label>
            <select 
              value={newMemberRole} 
              onChange={e => setNewMemberRole(e.target.value as Role)}
              className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="Fiscalizador">Fiscalizador</option>
              <option value="Diretor">Diretor</option>
              <option value="Vice-Presidente">Vice-Presidente</option>
              <option value="Presidente">Presidente</option>
              <option value="Convidado">Convidado (Ministério, GATE...)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Data de Entrada</label>
            <input 
              type="date"
              value={newMemberEntryDate}
              onChange={e => setNewMemberEntryDate(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Grupo</label>
              <select value={newMemberGroup} onChange={e => setNewMemberGroup(e.target.value as UserGroup)} className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Grupo</label>
            <select value={newMemberGroup} onChange={e => setNewMemberGroup(e.target.value as UserGroup)} className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50">
              <option value="SSI">SSI</option>
              <option value="GATE">GATE</option>
              <option value="CSI">CSI</option>
              <option value="Supremacia">Supremacia</option>
              <option value="Ministério">Ministério</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-medium text-foreground">Módulos Liberados</label>
            <div className="grid grid-cols-2 gap-2 bg-secondary/20 p-3 rounded-md border border-border">
              {ALL_PERMISSIONS.map(perm => (
                <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary/40 p-1 rounded transition-colors">
                  <input type="checkbox" checked={newMemberPermissions.includes(perm)} onChange={() => togglePermission(perm, newMemberPermissions, setNewMemberPermissions)} className="rounded border-border text-primary focus:ring-primary" />
                  <span className="text-muted-foreground select-none">{perm}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setIsAddingMember(false)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-secondary transition-colors text-sm">
              Cancelar
            </button>
            <button onClick={submitAddMember} className="px-4 py-2 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm">
              Cadastrar
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editMember} onClose={() => setEditMember(null)} title="Editar Dados do Membro">
        {editMember && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Cargo de <span className="font-bold text-primary">{editMember.nick}</span></label>
                <select 
                  value={editRole} 
                  onChange={e => setEditRole(e.target.value as Role)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                >
                  <option value="Fiscalizador">Fiscalizador</option>
                  <option value="Diretor">Diretor</option>
                  <option value="Vice-Presidente">Vice-Presidente</option>
                  <option value="Presidente">Presidente</option>
                  <option value="Convidado">Convidado (Ministério, GATE...)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Data de Entrada</label>
                <input 
                  type="date"
                  value={editEntryDate}
                  onChange={e => setEditEntryDate(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Data de Promoção</label>
                <input 
                  type="date"
                  value={editPromotionDate}
                  onChange={e => setEditPromotionDate(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Grupo</label>
                <select value={editGroup} onChange={e => setEditGroup(e.target.value as UserGroup)} className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50">
                  <option value="SSI">SSI</option>
                  <option value="GATE">GATE</option>
                  <option value="CSI">CSI</option>
                  <option value="Supremacia">Supremacia</option>
                  <option value="Ministério">Ministério</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-foreground">Módulos Liberados</label>
                <div className="grid grid-cols-2 gap-2 bg-secondary/20 p-3 rounded-md border border-border">
                  {ALL_PERMISSIONS.map(perm => (
                    <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary/40 p-1 rounded transition-colors">
                      <input type="checkbox" checked={editPermissions.includes(perm)} onChange={() => togglePermission(perm, editPermissions, setEditPermissions)} className="rounded border-border text-primary focus:ring-primary" />
                      <span className="text-muted-foreground select-none">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
               <button onClick={() => setEditMember(null)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-secondary transition-colors text-sm">
                 Cancelar
               </button>
               <button onClick={submitEditRole} className="px-4 py-2 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm">
                 Salvar
               </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deactivateMember} onClose={() => setDeactivateMember(null)} title="Desligar ou Colocar em Licença">
        {deactivateMember && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Tipo de Ação</label>
              <select 
                value={deactivateType} 
                onChange={e => setDeactivateType(e.target.value as "Inativo" | "Licença")}
                className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="Inativo">Desligamento do Setor</option>
                <option value="Licença">Licença</option>
              </select>
            </div>

            {deactivateType === "Licença" && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Data de Início</label>
                  <input 
                    type="date"
                    value={leaveStart}
                    onChange={e => setLeaveStart(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Data de Fim</label>
                  <input 
                    type="date"
                    value={leaveEnd}
                    onChange={e => setLeaveEnd(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
               <button onClick={() => setDeactivateMember(null)} className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-secondary transition-colors text-sm">
                 Cancelar
               </button>
               <button onClick={submitDeactivate} className="px-4 py-2 rounded-md font-medium bg-red-600 text-white hover:bg-red-700 transition-all text-sm">
                 Confirmar
               </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
