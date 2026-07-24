export type Role = "Presidente" | "Vice-Presidente" | "Diretor" | "Fiscalizador" | "Convidado";
export type UserGroup = "SSI" | "GATE" | "CSI" | "Supremacia" | "Ministério";
export type ModulePermission = "Dashboard" | "Escala Semanal" | "Listagem de Membros" | "Gestão de Casos" | "Registro de Punições" | "Relatórios e Auditoria" | "Configurações";
export type CaseStatus = "Aberto" | "Resolvido" | "Cancelado";
export type ScheduleStatus = "Pendente" | "Concluído" | "Atrasado" | "Justificativa Enviada";

export interface Member {
  id: string;
  nick: string;
  role: Role;
  status: "Ativo" | "Inativo" | "Licença";
  entryDate: string;
  promotionDate?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  avatarUrl?: string;
  group?: UserGroup;
  accessLevel?: string;
  permissions?: ModulePermission[];
}

export interface AuthorizedUser {
  habboNick: string;
  group: UserGroup;
  role: Role;
  status: "Ativo" | "Inativo";
  permissions: string[];
}

export interface Schedule {
  id: string;
  week: string; // e.g. "2026-W30"
  memberId: string;
  referenceDay: string; // "Domingo", "Segunda", etc.
  deadline: string; // data/hora ou texto "+2 dias"
  status: ScheduleStatus;
  responsibleId?: string; // Presidente que gerou
  observations?: string;
  type: "Fiscalizador" | "Diretor";
  
  // Justificativas
  justificationReason?: string;
  justificationText?: string;
  justificationAttachment?: string;
  justificationOccurrenceDate?: string;
  justificationStatus?: "Pendente" | "Aprovada" | "Recusada";
  justificationDate?: string;
  justificationReviewerId?: string;
}

export interface Case {
  id: string;
  status: CaseStatus;

  // Campos de Abertura (Fiscalizador)
  creatorId: string;
  offenderNick: string;
  description: string;
  creationDate: string;
  proofAttachment?: string;
  orientation: string;

  // Campos de Resolução (Diretor)
  orderNumber?: string;
  crimeCommitted?: string;
  resolutionAttachment?: string;
  punishmentApplied?: string;
  resolutionDate?: string;
  resolverId?: string;
  cancellationReason?: string;
}

export type PunishmentType = "Observação" | "Medalhas Negativas" | "Advertência Interna" | "Rebaixamento" | "Expulsão" | "Sem Punição";

export interface Warning {
  id: string;
  date: string;
  offenderNick: string;
  punishmentType: PunishmentType;
  reason: string;
  directorId: string;
  caseId?: string;
  notes?: string;
}

export type AuditAction = 
  | "Criação de Membro" | "Edição de Membro" | "Alteração de Status"
  | "Geração de Escala" | "Regeneração de Escala" | "Envio de Justificativa" | "Análise de Justificativa"
  | "Abertura de Caso" | "Resolução de Caso" | "Cancelamento de Caso"
  | "Registro de Punição" | "Sincronização" | "Backup Executado"
  | "Retorno de Licença" | "Membro em Licença" | "Desligamento de Membro";

export type AuditModule = "Membros" | "Escalas" | "Casos" | "Punições" | "Sistema";

export interface AuditLog {
  id: string;
  date: string;
  timestamp: number;
  userId: string; // Quem fez a ação
  userRole: Role;
  action: AuditAction;
  module: AuditModule;
  details: string;
  targetId?: string; // ID do registro afetado (ex: id do caso, id do membro)
}
