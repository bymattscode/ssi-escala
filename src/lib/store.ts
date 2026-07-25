import { Member, Schedule, Case, Warning, AuditLog, AuditAction, AuditModule, Role, AuthorizedUser } from './types';
import { mockMembers, mockSchedules, mockCases, mockWarnings } from './mockData';

export const AUTHORIZED_USERS: AuthorizedUser[] = [
  { habboNick: 'Admin', group: 'SSI', role: 'Presidente', status: 'Ativo', permissions: ['all'] },
  { habboNick: 'tchaumateu21', group: 'SSI', role: 'Presidente', status: 'Ativo', permissions: ['all'] },
  { habboNick: 'mateus21deus', group: 'SSI', role: 'Presidente', status: 'Ativo', permissions: ['all'] },
  { habboNick: 'mateus21', group: 'SSI', role: 'Presidente', status: 'Ativo', permissions: ['all'] },
  { habboNick: 'GaloCego', group: 'SSI', role: 'Presidente', status: 'Ativo', permissions: ['all'] },
  { habboNick: 'Brunom2a', group: 'SSI', role: 'Presidente', status: 'Ativo', permissions: ['all'] },
  { habboNick: 'mattscode', group: 'SSI', role: 'Diretor', status: 'Ativo', permissions: ['casos', 'escalas'] },
  { habboNick: ',raity', group: 'SSI', role: 'Diretor', status: 'Ativo', permissions: ['casos', 'escalas'] },
  { habboNick: 'FiscalSSI', group: 'SSI', role: 'Fiscalizador', status: 'Ativo', permissions: ['casos', 'escalas'] },
  { habboNick: 'lgbq1234', group: 'SSI', role: 'Fiscalizador', status: 'Ativo', permissions: ['casos', 'escalas'] },
  { habboNick: 'Policial123', group: 'GATE', role: 'Convidado', status: 'Ativo', permissions: ['read_only'] },
];

export const KEYS = {
  MEMBERS: 'ssi_members',
  SCHEDULES: 'ssi_schedules',
  CASES: 'ssi_cases',
  WARNINGS: 'ssi_warnings',
  CONFIG: 'ssi_config',
  AUDIT: 'ssi_audit'
};

// Helper for localStorage
const getParsedData = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error parsing data for key ${key}:`, e);
    return defaultValue;
  }
};

// Initialize localStorage with mockData if empty
const initialize = () => {
  if (typeof window === "undefined") return;
  
  try {
    if (!localStorage.getItem(KEYS.MEMBERS)) {
      localStorage.setItem(KEYS.MEMBERS, JSON.stringify(mockMembers));
    } else {
      // Garante que líderes fundamentais como tchaumateu21 estejam sempre no cache local caso o cache antigo não os tenha
      try {
        const existing: Member[] = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
        let modified = false;
        for (const mock of mockMembers) {
          if (!existing.some(m => m.nick.trim().toLowerCase() === mock.nick.trim().toLowerCase())) {
            existing.push(mock);
            modified = true;
          }
        }
        if (modified) localStorage.setItem(KEYS.MEMBERS, JSON.stringify(existing));
      } catch(e) {}
    }
    if (!localStorage.getItem(KEYS.SCHEDULES)) localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(mockSchedules));
    if (!localStorage.getItem(KEYS.CASES)) localStorage.setItem(KEYS.CASES, JSON.stringify(mockCases));
    if (!localStorage.getItem(KEYS.WARNINGS)) localStorage.setItem(KEYS.WARNINGS, JSON.stringify(mockWarnings));
    
    const NEW_URL = "https://script.google.com/macros/s/AKfycbz1jvDrxlyp3p5kGCQanlPeFC-XXmMz4Jy0gjCKrtDUiBV5sKJGrlxraxvpV05tzWAZ1A/exec";
    const DEFAULT_CONFIG = {
      sheetUrl: NEW_URL,
      googleConnected: true,
      lastRead: "",
      lastWrite: "",
      logs: []
    };
    const savedConfig = localStorage.getItem(KEYS.CONFIG);
    if (!savedConfig) {
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    } else if (savedConfig.includes("AKfycbyyw4ID-BPhtYZq7S6O6IYMdYwOg-ke_RJaqUKw_n47qKaH6C_KrOTfLInkDC3yjAagTg")) {
      try {
        const parsed = JSON.parse(savedConfig);
        parsed.sheetUrl = NEW_URL;
        localStorage.setItem(KEYS.CONFIG, JSON.stringify(parsed));
      } catch(e){}
    }
    if (!localStorage.getItem(KEYS.AUDIT)) localStorage.setItem(KEYS.AUDIT, JSON.stringify([]));
  } catch (e) {
    console.error("Failed to initialize localStorage:", e);
  }
};

initialize();

// Zerar todo o sistema (hard reset)
export const wipeAllData = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.MEMBERS, "[]");
    localStorage.setItem(KEYS.SCHEDULES, "[]");
    localStorage.setItem(KEYS.CASES, "[]");
    localStorage.setItem(KEYS.WARNINGS, "[]");
    localStorage.setItem(KEYS.AUDIT, "[]");
    window.location.reload();
  }
};

// Zero latency for snappy interface
const delay = (_ms: number) => Promise.resolve();

// Automate sync to cloud whenever local state changes
const triggerAutoSync = (module: string) => {
  if (typeof window !== "undefined") {
    setTimeout(() => {
      import("./syncManager").then(m => m.syncModule(module)).catch(e => console.error(`Falha no auto-sync de ${module}:`, e));
    }, 150);
  }
};

// --- AUDIT ---
export const getAuditLogs = async (): Promise<AuditLog[]> => {
  await delay(100);
  return getParsedData<AuditLog[]>(KEYS.AUDIT, []);
};

export const addAuditLog = async (
  userId: string,
  userRole: Role,
  action: AuditAction,
  module: AuditModule,
  details: string,
  targetId?: string
): Promise<void> => {
  const logs = getParsedData<AuditLog[]>(KEYS.AUDIT, []);
  
  const newLog: AuditLog = {
    id: `SSI-LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
    date: new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }),
    timestamp: Date.now(),
    userId,
    userRole,
    action,
    module,
    details,
    targetId
  };
  
  logs.unshift(newLog); // prepend
  
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.AUDIT, JSON.stringify(logs));
  }
};

// --- DELETION BLACKLIST (TOMBSTONES) ---
export const getDeletedKeys = (): string[] => {
  return getParsedData<string[]>("SSI_DELETED_KEYS", []);
};

export const addDeletedKey = (key?: string): void => {
  if (!key) return;
  const list = getDeletedKeys();
  const clean = key.trim().toLowerCase();
  if (!list.includes(clean)) {
    list.push(clean);
    if (typeof window !== "undefined") {
      localStorage.setItem("SSI_DELETED_KEYS", JSON.stringify(list));
    }
  }
};

export const removeDeletedKey = (key?: string): void => {
  if (!key) return;
  const list = getDeletedKeys();
  const clean = key.trim().toLowerCase();
  const next = list.filter(k => k !== clean);
  if (typeof window !== "undefined") {
    localStorage.setItem("SSI_DELETED_KEYS", JSON.stringify(next));
  }
};

// --- MEMBERS ---
export const getMembers = async (): Promise<Member[]> => {
  await delay(200);
  const rawMembers = getParsedData<Member[]>(KEYS.MEMBERS, []);
  const deletedKeys = getDeletedKeys();
  
  // Deduplicação automática pelo nick e exclusão definitiva de itens deletados (Tombstones)
  const seenMap = new Map<string, Member>();
  for (const m of rawMembers) {
    if (!m || !m.nick) continue;
    const cleanNick = m.nick.trim().toLowerCase();
    const cleanId = (m.id || "").trim().toLowerCase();
    
    // Se foi desligado ou excluído anteriormente, ignorar para sempre!
    if (deletedKeys.includes(cleanId) || deletedKeys.includes(cleanNick)) continue;

    const cleanEntry = m.entryDate ? m.entryDate.toString().split('T')[0] : "";
    const cleanPromo = m.promotionDate ? m.promotionDate.toString().split('T')[0] : "";
    const cleanedMember: Member = {
      ...m,
      entryDate: cleanEntry,
      promotionDate: cleanPromo,
      group: m.group || "SSI",
      permissions: m.permissions || (
        m.role === "Presidente" || m.role === "Vice-Presidente" ? ["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos", "Registro de Punições", "Relatórios e Auditoria", "Configurações"] :
        m.role === "Diretor" ? ["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos", "Registro de Punições"] :
        m.role === "Fiscalizador" ? ["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos"] :
        ["Dashboard"]
      ),
      updatedAt: m.updatedAt || Date.now()
    };

    const existing = seenMap.get(cleanNick);
    if (!existing) {
      seenMap.set(cleanNick, cleanedMember);
    } else {
      // Se houver duplicata, manter a versão que possui código de acesso ou status mais completo
      if ((!existing.accessCode && cleanedMember.accessCode) || (existing.syncStatus !== 'synced' && cleanedMember.syncStatus === 'synced')) {
        seenMap.set(cleanNick, { ...existing, ...cleanedMember });
      } else if (cleanedMember.accessCode && !existing.accessCode) {
        existing.accessCode = cleanedMember.accessCode;
      }
    }
  }
  
  const members = Array.from(seenMap.values());
  
  if (members.length !== rawMembers.length || JSON.stringify(members) !== JSON.stringify(rawMembers)) {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
    }
  }

  return members;
};

export const updateMemberStatus = async (id: string, status: "Ativo" | "Inativo" | "Licença"): Promise<void> => {
  await delay(200);
  const members = getParsedData<Member[]>(KEYS.MEMBERS, []);
  const idx = members.findIndex(m => m.id === id);
  if (idx !== -1 && typeof window !== "undefined") {
    members[idx].status = status;
    members[idx].updatedAt = Date.now();
    members[idx].syncStatus = "pending";
    if (status === "Ativo") {
      delete members[idx].leaveStartDate;
      delete members[idx].leaveEndDate;
    }
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
    triggerAutoSync("membros");
  }
};

export const updateMember = async (id: string, data: Partial<Member>): Promise<void> => {
  await delay(200);
  const members = getParsedData<Member[]>(KEYS.MEMBERS, []);
  const idx = members.findIndex(m => m.id === id);
  if (idx !== -1 && typeof window !== "undefined") {
    members[idx] = { ...members[idx], ...data, updatedAt: Date.now(), syncStatus: "pending" };
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
    triggerAutoSync("membros");
  }
};

export const deleteMember = async (id: string): Promise<void> => {
  await delay(200);
  const members = getParsedData<Member[]>(KEYS.MEMBERS, []);
  const target = members.find(m => m.id === id);
  if (target) {
    addDeletedKey(target.id);
    if (target.nick) addDeletedKey(target.nick);
  }
  const newMembers = members.filter(m => m.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(newMembers));
    triggerAutoSync("membros");
  }
};

export const addMember = async (member: Member): Promise<void> => {
  await delay(200);
  if (member.id) removeDeletedKey(member.id);
  if (member.nick) removeDeletedKey(member.nick);
  const members = getParsedData<Member[]>(KEYS.MEMBERS, []);
  members.push({ ...member, updatedAt: Date.now(), syncStatus: "pending" });
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
    triggerAutoSync("membros");
  }
};

// --- SCHEDULES ---
export const getSchedules = async (): Promise<Schedule[]> => {
  await delay(200);
  const schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  
  let needsSave = false;
  const now = new Date();
  
  const normalized = schedules.map(s => {
    let updated = { ...s };
    
    // Normalizar status antigo
    if (updated.status === "Justificativa Enviada" as any) {
      needsSave = true;
      updated.status = "Justificado";
    }
    if (!updated.status || updated.status === "undefined" as any) {
      needsSave = true;
      updated.status = "Pendente";
    }
    
    // Automação: Atualizar status de escalas vencidas
    if (updated.status === "Pendente" && updated.deadlineDate) {
      const deadlineDate = new Date(updated.deadlineDate);
      if (deadlineDate < now) {
        needsSave = true;
        updated.status = "Atrasado";
        updated.updatedAt = Date.now();
        updated.syncStatus = "pending";
      }
    } else if (updated.status === "Atrasado" && updated.deadlineDate) {
      const deadlineDate = new Date(updated.deadlineDate);
      const hoursLate = (now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60);
      if (hoursLate > 24) {
        needsSave = true;
        updated.status = "Não Justificado";
        updated.updatedAt = Date.now();
        updated.syncStatus = "pending";
      }
    }
    
    return updated;
  });
  
  if (needsSave && typeof window !== "undefined") {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(normalized));
  }
  
  return normalized;
};

export const addSchedules = async (newSchedules: Schedule[]): Promise<void> => {
  await delay(200);
  const schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  
  const schedulesToSave = newSchedules.map(s => ({ ...s, updatedAt: Date.now(), syncStatus: "pending" as const }));
  
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify([...schedules, ...schedulesToSave]));
    triggerAutoSync("escalas");
  }
};

export const updateSchedule = async (id: string, updates: Partial<Schedule>): Promise<void> => {
  await delay(200);
  const schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  const idx = schedules.findIndex(s => s.id === id);
  if (idx !== -1 && typeof window !== "undefined") {
    schedules[idx] = { ...schedules[idx], ...updates, updatedAt: Date.now(), syncStatus: "pending" };
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
    triggerAutoSync("escalas");
  }
};

export const deleteSchedulesForWeek = async (week: string): Promise<void> => {
  await delay(200);
  let schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  schedules = schedules.filter(s => s.week !== week);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
    triggerAutoSync("escalas");
  }
}

export const deleteSchedulesForWeekAndType = async (week: string, type: "Fiscalizador" | "Diretor"): Promise<void> => {
  await delay(200);
  let schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  schedules = schedules.filter(s => !(s.week === week && s.type === type));
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
    triggerAutoSync("escalas");
  }
}

// --- CASES ---
export const getCases = async (): Promise<Case[]> => {
  await delay(200);
  return getParsedData<Case[]>(KEYS.CASES, []);
};

export const addCase = async (newCase: Case): Promise<void> => {
  await delay(200);
  const cases = getParsedData<Case[]>(KEYS.CASES, []);
  cases.push({ ...newCase, updatedAt: Date.now(), syncStatus: "pending" });
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
    triggerAutoSync("casos");
  }
};

export const updateCase = async (id: string, updates: Partial<Case>): Promise<void> => {
  await delay(200);
  const cases = getParsedData<Case[]>(KEYS.CASES, []);
  const idx = cases.findIndex(c => c.id === id);
  if (idx !== -1 && typeof window !== "undefined") {
    cases[idx] = { ...cases[idx], ...updates, updatedAt: Date.now(), syncStatus: "pending" };
    localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
    triggerAutoSync("casos");
  }
};

// --- WARNINGS ---
export const getWarnings = async (): Promise<Warning[]> => {
  await delay(200);
  return getParsedData<Warning[]>(KEYS.WARNINGS, []);
};

export const addWarning = async (newWarning: Warning): Promise<void> => {
  await delay(200);
  const warnings = getParsedData<Warning[]>(KEYS.WARNINGS, []);
  warnings.push({ ...newWarning, updatedAt: Date.now(), syncStatus: "pending" });
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.WARNINGS, JSON.stringify(warnings));
    triggerAutoSync("advertencias");
  }
};

export const updateWarning = async (id: string, updates: Partial<Warning>): Promise<void> => {
  await delay(200);
  const warnings = getParsedData<Warning[]>(KEYS.WARNINGS, []);
  const idx = warnings.findIndex(w => w.id === id);
  if (idx !== -1 && typeof window !== "undefined") {
    warnings[idx] = { ...warnings[idx], ...updates, updatedAt: Date.now(), syncStatus: "pending" };
    localStorage.setItem(KEYS.WARNINGS, JSON.stringify(warnings));
    triggerAutoSync("advertencias");
  }
};

// --- CONFIG ---
export interface SyncLog {
  id: string;
  type: "success" | "info" | "warning" | "error";
  message: string;
  date: string;
}

interface SystemConfig {
  sheetUrl: string;
  googleConnected: boolean;
  lastRead: string;
  lastWrite: string;
  logs: SyncLog[];
}

export const getConfig = async (): Promise<SystemConfig> => {
  await delay(100);
  const cfg = getParsedData<SystemConfig>(KEYS.CONFIG, {
    sheetUrl: "https://script.google.com/macros/s/AKfycbz1jvDrxlyp3p5kGCQanlPeFC-XXmMz4Jy0gjCKrtDUiBV5sKJGrlxraxvpV05tzWAZ1A/exec",
    googleConnected: true,
    lastRead: "",
    lastWrite: "",
    logs: []
  });
  if (cfg.sheetUrl.includes("AKfycbyyw4ID-BPhtYZq7S6O6IYMdYwOg-ke_RJaqUKw_n47qKaH6C_KrOTfLInkDC3yjAagTg")) {
    cfg.sheetUrl = "https://script.google.com/macros/s/AKfycbz1jvDrxlyp3p5kGCQanlPeFC-XXmMz4Jy0gjCKrtDUiBV5sKJGrlxraxvpV05tzWAZ1A/exec";
  }
  return cfg;
};

export const updateConfig = async (updates: Partial<SystemConfig>): Promise<void> => {
  await delay(200);
  const config = await getConfig();
  const newConfig = { ...config, ...updates };
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(newConfig));
  }
};

export const addSyncLog = async (logData: Omit<SyncLog, "id" | "date">): Promise<void> => {
  const config = await getConfig();
  const newLog: SyncLog = {
    ...logData,
    id: `SSI-SYNC-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })
  };
  
  const updatedLogs = [newLog, ...config.logs].slice(0, 50); // Keep last 50 logs
  await updateConfig({ logs: updatedLogs });
};

export const getPendingCount = async (): Promise<number> => {
  const members = getParsedData<Member[]>(KEYS.MEMBERS, []);
  const schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  const cases = getParsedData<Case[]>(KEYS.CASES, []);
  const warnings = getParsedData<Warning[]>(KEYS.WARNINGS, []);
  
  let count = 0;
  count += members.filter(m => m.syncStatus === 'pending').length;
  count += schedules.filter(s => s.syncStatus === 'pending').length;
  count += cases.filter(c => c.syncStatus === 'pending').length;
  count += warnings.filter(w => w.syncStatus === 'pending').length;
  
  return count;
};
