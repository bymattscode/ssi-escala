import { Member, Schedule, Case, Warning } from './types';

export const mockMembers: Member[] = [
  { id: "1", nick: "Admin", role: "Presidente", status: "Ativo", entryDate: "2024-01-01", accessCode: "SSI-MASTER", group: "SSI" },
  { id: "SSI-MEM-MIN001", nick: "Min. Instrutores", role: "Ministério", status: "Ativo", entryDate: "2024-01-01", accessCode: "MIN-INSTRUTORES", group: "Ministério" }
];

export const mockSchedules: Schedule[] = [];

export const mockCases: Case[] = [];

export const mockWarnings: Warning[] = [];
