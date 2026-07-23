import { Member, Schedule, Case, Warning } from './types';

export const mockMembers: Member[] = [
  { id: "1", nick: "Admin", role: "Presidência", status: "Ativo", entryDate: "2024-01-01", notes: "Líder" },
  { id: "2", nick: "ViceAdmin", role: "Vice-Presidência", status: "Ativo", entryDate: "2024-03-01", promotionDate: "2025-01-15", notes: "Braço direito" },
  { id: "3", nick: "Alpha", role: "Diretor", status: "Ativo", entryDate: "2025-02-01", promotionDate: "2025-10-10", notes: "" },
  { id: "4", nick: "Bravo", role: "Diretor", status: "Inativo", entryDate: "2025-02-15", notes: "" },
  { id: "5", nick: "Charlie", role: "Fiscalizador", status: "Ativo", entryDate: "2025-03-10", notes: "" },
  { id: "6", nick: "Delta", role: "Fiscalizador", status: "Ativo", entryDate: "2025-03-20", notes: "" },
  { id: "7", nick: "Echo", role: "Fiscalizador", status: "Ativo", entryDate: "2025-04-05", notes: "" },
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
    id: "c1", creationDate: "2026-07-20 14:30", creatorId: "5", offenderNick: "Echo", 
    description: "Desrespeito às regras na sala principal, ofendendo outros usuários.", orientation: "Advertir verbalmente", 
    status: "Aberto", proofAttachment: "print_chat.png"
  },
  { 
    id: "c2", creationDate: "2026-07-18 09:15", creatorId: "6", offenderNick: "Foxtrot", 
    description: "Ausência sem justificativa no posto designado.", orientation: "Punir", 
    status: "Resolvido", resolverId: "2", resolutionDate: "2026-07-19 10:00", 
    punishmentApplied: "Advertência Interna", orderNumber: "ORD-2026-001",
    crimeCommitted: "Insubordinação", resolutionAttachment: "relatorio_final.pdf"
  },
  { 
    id: "c3", creationDate: "2026-07-22 18:45", creatorId: "7", offenderNick: "Golf", 
    description: "Abuso de poder com membros novatos.", orientation: "Análise profunda", 
    status: "Resolvido", resolverId: "3"
  }
];

export const mockWarnings: Warning[] = [
  {
    id: "w1", date: "2026-07-19", offenderNick: "Foxtrot", 
    punishmentType: "Advertência Interna", reason: "Ausência sem justificativa repetida",
    directorId: "2", caseId: "c2", notes: "Membro avisado pela terceira vez sobre a falta na escala."
  },
  {
    id: "w2", date: "2026-07-21", offenderNick: "Echo", 
    punishmentType: "Observação", reason: "Uso incorreto da formatação",
    directorId: "3", notes: "Orientado a ler o manual novamente."
  },
  {
    id: "w3", date: "2026-07-22", offenderNick: "Delta", 
    punishmentType: "Medalhas Negativas", reason: "Atraso no relatório semanal",
    directorId: "2", caseId: "c3"
  },
  {
    id: "w4", date: "2026-07-22", offenderNick: "Golf", 
    punishmentType: "Expulsão", reason: "Vazamento de informações restritas",
    directorId: "1", notes: "Banido do sistema."
  }
];
