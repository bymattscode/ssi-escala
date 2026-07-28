import { Member, Schedule, Case, Warning, AuditLog, AuditAction, AuditModule, Role, AuthorizedUser } from './types';
import { mockMembers, mockSchedules, mockCases, mockWarnings } from './mockData';

export const AUTHORIZED_USERS: AuthorizedUser[] = [
  { habboNick: 'Admin', group: 'SSI', role: 'Presidente', status: 'Ativo', permissions: ['all'] },
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
      // Limpar automaticamente dados fictícios de testes passados do cache e garantir membros oficiais
      try {
        const fictional = ['viceadmin', 'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'policial123', 'ministério', 'ministerio'];
        let existing: Member[] = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
        const cleanList = existing.filter(m => !m.nick || !fictional.includes(String(m.nick).trim().toLowerCase()));
        
        // Injetar ou atualizar contas essenciais (Admin, Min. Instrutores, e membros oficiais caso faltem no dispositivo)
        for (const official of mockMembers) {
          const found = cleanList.find(m => String(m.nick).trim().toLowerCase() === String(official.nick).trim().toLowerCase() || m.id === official.id);
          if (!found) {
            cleanList.push(official);
          } else if (official.id === 'SSI-MEM-MIN001' || official.nick === 'Admin' || official.nick === 'Min. Instrutores') {
            found.nick = official.nick;
            found.role = official.role;
            found.accessCode = official.accessCode;
            found.group = official.group;
          }
        }
        
        if (JSON.stringify(cleanList) !== JSON.stringify(existing)) {
          localStorage.setItem(KEYS.MEMBERS, JSON.stringify(cleanList));
        }
      } catch (e) {}
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

// Automate sync to cloud whenever local state changes, with a sequential queue to prevent concurrent lock timeout errors
const autoSyncTimers: Record<string, NodeJS.Timeout | number> = {};
const syncQueue: string[] = [];
let isSyncingQueue = false;

const processSyncQueue = async () => {
  if (isSyncingQueue || syncQueue.length === 0) return;
  isSyncingQueue = true;
  try {
    const m = await import("./syncManager");
    while (syncQueue.length > 0) {
      const moduleName = syncQueue.shift();
      if (moduleName) {
        await m.syncModule(moduleName);
        await new Promise(r => setTimeout(r, 450)); // Pausa anti-concorrência para o Apps Script
      }
    }
  } catch (e) {
    console.error("Falha ao processar fila de sincronização:", e);
  } finally {
    isSyncingQueue = false;
    if (syncQueue.length > 0) {
      setTimeout(processSyncQueue, 300);
    }
  }
};

const triggerAutoSync = (module: string) => {
  if (typeof window !== "undefined") {
    if (autoSyncTimers[module]) {
      clearTimeout(autoSyncTimers[module] as any);
    }
    autoSyncTimers[module] = setTimeout(() => {
      if (!syncQueue.includes(module)) {
        syncQueue.push(module);
      }
      processSyncQueue();
    }, 400);
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
    triggerAutoSync("logs");
  }
};

// --- DELETION BLACKLIST (TOMBSTONES) ---
export const getDeletedKeys = (): string[] => {
  const list = getParsedData<string[]>("SSI_DELETED_KEYS", []);
  return list.filter(k => !String(k).toLowerCase().includes("esc") && !String(k).toLowerCase().includes("teste"));
};

export const addDeletedKey = (key?: string | number): void => {
  if (key === undefined || key === null) return;
  const list = getDeletedKeys();
  const clean = String(key).trim().toLowerCase();
  if (!list.includes(clean)) {
    list.push(clean);
    if (typeof window !== "undefined") {
      localStorage.setItem("SSI_DELETED_KEYS", JSON.stringify(list));
    }
  }
};

export const removeDeletedKey = (key?: string | number): void => {
  if (key === undefined || key === null) return;
  const list = getDeletedKeys();
  const clean = String(key).trim().toLowerCase();
  const next = list.filter(k => k !== clean);
  if (typeof window !== "undefined") {
    localStorage.setItem("SSI_DELETED_KEYS", JSON.stringify(next));
  }
};

// --- HIERARCHY & ARRIVAL DATE SORTING ---
export const getRoleRank = (role?: string): number => {
  const r = String(role || "").trim().toLowerCase();
  if (r.includes("ministério") || r.includes("ministerio")) return 0;
  if (r.includes("presidente") && !r.includes("vice")) return 1;
  if (r.includes("vice")) return 2;
  if (r.includes("diretor")) return 3;
  if (r.includes("fiscalizador")) return 4;
  return 5;
};

const parseDateToTimestamp = (dateStr?: string): number => {
  if (!dateStr) return Infinity;
  const clean = String(dateStr).split('T')[0].trim();
  if (!clean || clean === "-") return Infinity;
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T00:00:00`).getTime();
    }
  }
  const t = new Date(clean + (clean.includes(':') ? '' : 'T00:00:00')).getTime();
  return isNaN(t) ? Infinity : t;
};

export const sortMembers = (members: any[]): any[] => {
  return [...members].sort((a, b) => {
    // 1º critério: Hierarquia (Presidente > Vice > Diretor > Fiscalizador)
    const rankA = getRoleRank(a.role);
    const rankB = getRoleRank(b.role);
    if (rankA !== rankB) return rankA - rankB;
    
    // 2º critério: Ordem de chegada (Data de entrada mais antiga na frente)
    const timeA = parseDateToTimestamp(a.entryDate);
    const timeB = parseDateToTimestamp(b.entryDate);
    if (timeA !== timeB) return timeA - timeB;
    
    // 3º critério: Ordem alfabética do nick
    return String(a.nick || "").localeCompare(String(b.nick || ""), 'pt-BR', { sensitivity: 'base' });
  });
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
    const cleanNick = String(m.nick).trim().toLowerCase();
    const cleanId = m.id !== undefined && m.id !== null ? String(m.id).trim().toLowerCase() : "";
    
    // Se foi desligado ou excluído anteriormente, ignorar para sempre!
    if (deletedKeys.includes(cleanId) || deletedKeys.includes(cleanNick)) continue;

    const cleanEntry = m.entryDate ? String(m.entryDate).split('T')[0] : "";
    const cleanPromo = m.promotionDate ? String(m.promotionDate).split('T')[0] : "";
    const isMinistryAccount = m.id === "SSI-MEM-MIN001" || cleanNick === "ministério" || cleanNick === "ministerio" || cleanNick === "min. instrutores" || m.role === "Ministério";
    const cleanedMember: Member = {
      ...m,
      nick: isMinistryAccount ? "Min. Instrutores" : m.nick,
      role: isMinistryAccount ? "Ministério" : m.role,
      accessCode: isMinistryAccount ? "MIN-INSTRUTORES" : m.accessCode,
      entryDate: cleanEntry,
      promotionDate: cleanPromo,
      group: m.group || "SSI",
      permissions: m.permissions || (
        m.role === "Ministério" || m.role === "Presidente" || m.role === "Vice-Presidente" ? ["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos", "Registro de Punições", "Relatórios e Auditoria", "Configurações"] :
        m.role === "Diretor" ? ["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos", "Registro de Punições"] :
        m.role === "Fiscalizador" ? ["Dashboard", "Escala Semanal", "Listagem de Membros", "Gestão de Casos"] :
        ["Dashboard"]
      ),
      updatedAt: m.updatedAt || Date.now()
    };

    const targetNick = isMinistryAccount ? "min. instrutores" : cleanNick;
    const existing = seenMap.get(targetNick);
    if (!existing) {
      seenMap.set(targetNick, cleanedMember);
    } else {
      // Se houver duplicata, manter a versão que possui código de acesso ou status mais completo
      if ((!existing.accessCode && cleanedMember.accessCode) || (existing.syncStatus !== 'synced' && cleanedMember.syncStatus === 'synced')) {
        seenMap.set(targetNick, { ...existing, ...cleanedMember });
      } else if (cleanedMember.accessCode && !existing.accessCode) {
        existing.accessCode = cleanedMember.accessCode;
      }
    }
  }
  
  const members = sortMembers(Array.from(seenMap.values()));
  
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
  const deletedKeys = getDeletedKeys().map(k => String(k).trim().toLowerCase());
  const validMembers = getParsedData<Member[]>(KEYS.MEMBERS, []);
  const memberIdSet = new Set(validMembers.map(m => m.id));
  
  const filtered = schedules.filter(s => {
    if (!s || !s.id) return false;
    // Ignorar e remover imediatamente qualquer item simulado ou de teste do sistema
    if (String(s.id).toUpperCase().includes("TESTE") || String(s.memberId).toUpperCase().includes("TESTE")) {
      return false;
    }
    if (deletedKeys.includes(String(s.id).trim().toLowerCase())) return false;
    // Remove escalas vinculadas aos antigos IDs numéricos de teste que não existem mais na base
    if (s.memberId && s.memberId.length <= 3 && !memberIdSet.has(s.memberId)) {
      addDeletedKey(s.id);
      needsSave = true;
      return false;
    }
    return true;
  });

  const normalized = filtered.map(s => {
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
    
    // Normalizar nomenclaturas das funções extras de fiscalização
    if (updated.type === "Fiscalização dos Avaliadores" || (updated.referenceDay === "Semanal" && updated.id.includes("AVAL"))) {
      needsSave = true;
      updated.type = "Fiscalizador" as any;
      updated.referenceDay = "Avaliadores";
      updated.deadline = "Terça-feira (23:59)";
    }
    if (updated.type === "Fiscalização dos Capacitadores" || (updated.referenceDay === "Semanal" && updated.id.includes("CAP"))) {
      needsSave = true;
      updated.type = "Fiscalizador" as any;
      updated.referenceDay = "Capacitadores";
      updated.deadline = "Terça-feira (23:59)";
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
  
  // Deduplicação estrita: garantir que exista apenas 1 registro por cargo e por dia de referência na mesma semana!
  const deduplicatedMap = new Map<string, Schedule>();
  for (const item of normalized) {
    const key = `${item.week || ""}-${item.type || ""}-${item.referenceDay || ""}`.toLowerCase();
    const existing = deduplicatedMap.get(key);
    if (!existing) {
      deduplicatedMap.set(key, item);
    } else {
      needsSave = true;
      // Manter a escala concluída/justificada ou a que foi atualizada mais recentemente
      if (item.status === "Concluído" || item.status === "Justificado" || ((item.updatedAt || 0) > (existing.updatedAt || 0))) {
        addDeletedKey(existing.id);
        deduplicatedMap.set(key, item);
      } else {
        addDeletedKey(item.id);
      }
    }
  }
  const cleanSchedules = Array.from(deduplicatedMap.values());

  // Ordenar de Domingo a Sábado para apresentação impecável, colocando funções semanais extras no final
  const dayOrder: Record<string, number> = {
    "Domingo": 0,
    "Segunda": 1, "Segunda-feira": 1,
    "Terça": 2, "Terça-feira": 2,
    "Quarta": 3, "Quarta-feira": 3,
    "Quinta": 4, "Quinta-feira": 4,
    "Sexta": 5, "Sexta-feira": 5,
    "Sábado": 6,
    "Avaliadores": 7,
    "Capacitadores": 8,
    "Semanal": 9
  };
  const typeOrder: Record<string, number> = {
    "Fiscalizador": 0,
    "Diretor": 0
  };
  cleanSchedules.sort((a, b) => {
    const dayDiff = (dayOrder[a.referenceDay] ?? 10) - (dayOrder[b.referenceDay] ?? 10);
    if (dayDiff !== 0) return dayDiff;
    return (typeOrder[a.type || ""] ?? 0) - (typeOrder[b.type || ""] ?? 0);
  });
  
  if (needsSave && typeof window !== "undefined") {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(cleanSchedules));
    triggerAutoSync("escalas");
  }
  
  return cleanSchedules;
};

export const addSchedules = async (newSchedules: Schedule[]): Promise<void> => {
  await delay(200);
  const schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  
  const schedulesToSave = newSchedules.map(s => {
    if (s.id) removeDeletedKey(s.id);
    return { ...s, updatedAt: Date.now(), syncStatus: "pending" as const };
  });
  
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
  const toDelete = schedules.filter(s => s.week === week);
  toDelete.forEach(s => addDeletedKey(s.id));
  schedules = schedules.filter(s => s.week !== week);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
    triggerAutoSync("escalas");
  }
}

export const deleteSchedulesForWeekAndType = async (week: string, type: string): Promise<void> => {
  await delay(200);
  let schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  const toDelete = schedules.filter(s => s.type === type || (s.week && s.week !== week));
  toDelete.forEach(s => addDeletedKey(s.id));
  schedules = schedules.filter(s => !(s.type === type || (s.week && s.week !== week)));
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
    triggerAutoSync("escalas");
  }
}

// --- CASES ---
export const getCases = async (): Promise<Case[]> => {
  await delay(200);
  const raw = getParsedData<Case[]>(KEYS.CASES, []);
  const deletedKeys = getDeletedKeys();
  return raw.filter(c => c && c.id && !deletedKeys.includes(String(c.id).trim().toLowerCase()));
};

export const addCase = async (newCase: Case): Promise<void> => {
  await delay(200);
  if (newCase.id) removeDeletedKey(newCase.id);
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

export const deleteCase = async (id: string): Promise<void> => {
  await delay(200);
  let cases = getParsedData<Case[]>(KEYS.CASES, []);
  cases = cases.filter(c => c.id !== id);
  addDeletedKey(id);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
    triggerAutoSync("casos");
  }
};

// --- WARNINGS ---
export const getWarnings = async (): Promise<Warning[]> => {
  await delay(200);
  const raw = getParsedData<Warning[]>(KEYS.WARNINGS, []);
  const deletedKeys = getDeletedKeys();
  return raw.filter(w => w && w.id && !deletedKeys.includes(String(w.id).trim().toLowerCase()));
};

export const addWarning = async (newWarning: Warning): Promise<void> => {
  await delay(200);
  if (newWarning.id) removeDeletedKey(newWarning.id);
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

export const deleteWarning = async (id: string): Promise<void> => {
  await delay(200);
  let warnings = getParsedData<Warning[]>(KEYS.WARNINGS, []);
  warnings = warnings.filter(w => w.id !== id);
  addDeletedKey(id);
  if (typeof window !== "undefined") {
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
