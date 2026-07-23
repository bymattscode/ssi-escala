export type Role = "Presidência" | "Vice-Presidência" | "Diretor" | "Fiscalizador";
export type CaseStatus = "Aberto" | "Em Análise" | "Resolvido" | "Cancelado";
export type ScheduleStatus = "Pendente" | "Concluído" | "Atrasado" | "Justificativa Enviada";

export interface Member {
  id: string;
  nick: string;
  role: Role;
  status: "Ativo" | "Inativo";
  entryDate: string;
  notes: string;
  avatarUrl?: string;
}

export interface Schedule {
  id: string;
  week: string; // e.g. "2026-W30"
  memberId: string;
  dayOfWeek: "Domingo" | "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado";
  status: ScheduleStatus;
  justification?: string;
}

export interface Case {
  id: string;
  date: string;
  creatorId: string; // Fiscalizador
  offenderNick: string;
  description: string;
  proofAttachment?: string;
  orientation: string;
  status: CaseStatus;
  resolverId?: string; // Diretor
  resolutionDate?: string;
  punishmentApplied?: string;
  resolutionAttachment?: string;
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
