export type Role = "Presidência" | "Vice-Presidência" | "Diretor" | "Fiscalizador";
export type CaseStatus = "Aberto" | "Em Análise" | "Resolvido" | "Cancelado";
export type ScheduleStatus = "Pendente" | "Concluído" | "Atrasado" | "Justificativa Enviada";

export interface Member {
  id: string;
  nick: string;
  role: Role;
  status: "Ativo" | "Inativo";
  entryDate: string;
  promotionDate?: string;
  notes: string;
  avatarUrl?: string;
}

export interface Schedule {
  id: string;
  week: string; // e.g. "2026-W30"
  memberId: string;
  referenceDay: string; // "Domingo", "Segunda", etc.
  deadline: string; // data/hora ou texto "+2 dias"
  status: ScheduleStatus;
  responsibleId?: string; // Presidência que gerou
  observations?: string;
  type: "Fiscalizador" | "Diretor";
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

export interface Warning {
  id: string;
  date: string;
  offenderNick: string;
  punishmentType: "Observação" | "Medalhas Negativas" | "Advertência Interna" | "Rebaixamento" | "Expulsão" | "Sem Punição";
  reason: string;
  directorId: string;
}
