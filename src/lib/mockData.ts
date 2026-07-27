import { Member, Schedule, Case, Warning } from './types';

export const mockMembers: Member[] = [
  { id: "1", nick: "Admin", role: "Presidente", status: "Ativo", entryDate: "2024-01-01", accessCode: "SSI-MASTER", group: "SSI" },
  { id: "SSI-MEM-MIN001", nick: "Ministério", role: "Ministério", status: "Ativo", entryDate: "2024-01-01", accessCode: "SSI-MINISTERIO", group: "Ministério" },
  { id: "SSI-MEM-MS0OA5FF", nick: "-:Lisboa", role: "Presidente", status: "Ativo", entryDate: "2024-05-20", group: "SSI" },
  { id: "SSI-MEM-MRZXZ2ZJ", nick: "tchaumateu21", role: "Vice-Presidente", status: "Ativo", entryDate: "2025-12-14", accessCode: "SSI-PXWXYE", group: "SSI" },
  { id: "SSI-MEM-MS0OBUP0", nick: "zZq", role: "Diretor", status: "Ativo", entryDate: "2026-02-21", group: "SSI" },
  { id: "SSI-MEM-MS0ODO81", nick: "yycecedilha", role: "Diretor", status: "Ativo", entryDate: "2026-05-24", accessCode: "SSI-48D25E", group: "SSI" },
  { id: "SSI-MEM-MS0OCLYB", nick: "_brant", role: "Diretor", status: "Ativo", entryDate: "2026-05-25", group: "SSI" },
  { id: "SSI-MEM-MS0ONG4I", nick: "lgbq1234", role: "Fiscalizador", status: "Ativo", entryDate: "2026-05-08", group: "SSI" },
  { id: "SSI-MEM-MS0OEO90", nick: "matheus88795", role: "Fiscalizador", status: "Licença", entryDate: "2026-06-16", group: "SSI" },
  { id: "SSI-MEM-MS0OF5T5", nick: "@Bann_ID", role: "Fiscalizador", status: "Licença", entryDate: "2026-06-23", group: "SSI" },
  { id: "SSI-MEM-MS0OG4X6", nick: "Tenseoh", role: "Fiscalizador", status: "Ativo", entryDate: "2026-07-03", group: "SSI" },
  { id: "SSI-MEM-MS0OINZT", nick: "mineirinhash", role: "Fiscalizador", status: "Ativo", entryDate: "2026-07-19", group: "SSI" },
  { id: "SSI-MEM-MS0OJFJE", nick: "-Magon", role: "Fiscalizador", status: "Ativo", entryDate: "2026-07-22", group: "SSI" },
  { id: "SSI-MEM-MS0OJ6FQ", nick: "RomanBellic", role: "Fiscalizador", status: "Ativo", entryDate: "2026-07-22", group: "SSI" }
];

export const mockSchedules: Schedule[] = [];

export const mockCases: Case[] = [];

export const mockWarnings: Warning[] = [];
