import { Member, Schedule, Case, Warning } from './types';

export const mockMembers: Member[] = [
  { id: "1", nick: "Admin", role: "Presidência", status: "Ativo", entryDate: "2025-01-01", notes: "Líder" },
  { id: "2", nick: "Alpha", role: "Diretor", status: "Ativo", entryDate: "2025-02-01", notes: "" },
  { id: "3", nick: "Bravo", role: "Diretor", status: "Ativo", entryDate: "2025-02-15", notes: "" },
  { id: "4", nick: "Charlie", role: "Fiscalizador", status: "Ativo", entryDate: "2025-03-10", notes: "" },
  { id: "5", nick: "Delta", role: "Fiscalizador", status: "Ativo", entryDate: "2025-03-20", notes: "" },
  { id: "6", nick: "Echo", role: "Fiscalizador", status: "Ativo", entryDate: "2025-04-05", notes: "" },
];

export const mockSchedules: Schedule[] = [
  { id: "s1", week: "2026-W30", memberId: "4", referenceDay: "Domingo", deadline: "Terça-feira (23:59)", status: "Concluído", responsibleId: "1", type: "Fiscalizador" },
  { id: "s2", week: "2026-W30", memberId: "5", referenceDay: "Terça", deadline: "Quinta-feira (23:59)", status: "Pendente", responsibleId: "1", type: "Fiscalizador" },
  { id: "s3", week: "2026-W30", memberId: "6", referenceDay: "Sexta", deadline: "Domingo (23:59)", status: "Atrasado", responsibleId: "1", type: "Fiscalizador", observations: "Membro ausente sem aviso" },
  { id: "s4", week: "2026-W30", memberId: "2", referenceDay: "Segunda", deadline: "Quarta-feira (23:59)", status: "Justificativa Enviada", responsibleId: "1", type: "Diretor", observations: "Problemas médicos" },
  { id: "s5", week: "2026-W30", memberId: "3", referenceDay: "Quinta", deadline: "Sábado (23:59)", status: "Pendente", responsibleId: "1", type: "Diretor" },
];

export const mockCases: Case[] = [
  { 
    id: "c1", date: "2026-07-20", creatorId: "4", offenderNick: "Echo", 
    description: "Desrespeito às regras na sala.", orientation: "Advertir verbalmente", 
    status: "Aberto" 
  },
  { 
    id: "c2", date: "2026-07-18", creatorId: "5", offenderNick: "Foxtrot", 
    description: "Ausência sem justificativa", orientation: "Punir", 
    status: "Resolvido", resolverId: "2", resolutionDate: "2026-07-19", 
    punishmentApplied: "Advertência Interna" 
  }
];

export const mockWarnings: Warning[] = [
  {
    id: "w1", date: "2026-07-19", offenderNick: "Foxtrot", 
    punishmentType: "Advertência Interna", reason: "Ausência sem justificativa repetida",
    directorId: "2"
  }
];
