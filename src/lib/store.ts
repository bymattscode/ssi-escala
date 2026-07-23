import { Member, Schedule, Case, Warning } from './types';
import { mockMembers, mockSchedules, mockCases, mockWarnings } from './mockData';

// Constants for localStorage keys
const KEYS = {
  MEMBERS: 'ssi_members',
  SCHEDULES: 'ssi_schedules',
  CASES: 'ssi_cases',
  WARNINGS: 'ssi_warnings',
  CONFIG: 'ssi_config'
};

// Helper for localStorage
const getParsedData = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// Initialize localStorage with mockData if empty
const initialize = () => {
  if (typeof window === "undefined") return;
  
  if (!localStorage.getItem(KEYS.MEMBERS)) localStorage.setItem(KEYS.MEMBERS, JSON.stringify(mockMembers));
  if (!localStorage.getItem(KEYS.SCHEDULES)) localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(mockSchedules));
  if (!localStorage.getItem(KEYS.CASES)) localStorage.setItem(KEYS.CASES, JSON.stringify(mockCases));
  if (!localStorage.getItem(KEYS.WARNINGS)) localStorage.setItem(KEYS.WARNINGS, JSON.stringify(mockWarnings));
  
  const DEFAULT_CONFIG = {
    sheetUrl: "",
    googleConnected: false,
    lastSync: ""
  };
  if (!localStorage.getItem(KEYS.CONFIG)) localStorage.setItem(KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
};

initialize();

// Simulating network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- MEMBERS ---
export const getMembers = async (): Promise<Member[]> => {
  await delay(200);
  return getParsedData<Member[]>(KEYS.MEMBERS, []);
};

export const updateMemberStatus = async (id: string, status: "Ativo" | "Inativo"): Promise<void> => {
  await delay(200);
  const members = getParsedData<Member[]>(KEYS.MEMBERS, []);
  const idx = members.findIndex(m => m.id === id);
  if (idx !== -1 && typeof window !== "undefined") {
    members[idx].status = status;
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  }
};

export const addMember = async (member: Member): Promise<void> => {
  await delay(200);
  const members = getParsedData<Member[]>(KEYS.MEMBERS, []);
  members.push(member);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  }
};

// --- SCHEDULES ---
export const getSchedules = async (): Promise<Schedule[]> => {
  await delay(200);
  return getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
};

export const addSchedules = async (newSchedules: Schedule[]): Promise<void> => {
  await delay(200);
  const schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify([...schedules, ...newSchedules]));
  }
};

export const updateSchedule = async (id: string, updates: Partial<Schedule>): Promise<void> => {
  await delay(200);
  const schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  const idx = schedules.findIndex(s => s.id === id);
  if (idx !== -1 && typeof window !== "undefined") {
    schedules[idx] = { ...schedules[idx], ...updates };
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
  }
};

export const deleteSchedulesForWeek = async (week: string): Promise<void> => {
  await delay(200);
  let schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  schedules = schedules.filter(s => s.week !== week);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
  }
}

export const deleteSchedulesForWeekAndType = async (week: string, type: "Fiscalizador" | "Diretor"): Promise<void> => {
  await delay(200);
  let schedules = getParsedData<Schedule[]>(KEYS.SCHEDULES, []);
  schedules = schedules.filter(s => !(s.week === week && s.type === type));
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
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
  cases.push(newCase);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
  }
};

export const updateCase = async (id: string, updates: Partial<Case>): Promise<void> => {
  await delay(200);
  const cases = getParsedData<Case[]>(KEYS.CASES, []);
  const idx = cases.findIndex(c => c.id === id);
  if (idx !== -1 && typeof window !== "undefined") {
    cases[idx] = { ...cases[idx], ...updates };
    localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
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
  warnings.push(newWarning);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.WARNINGS, JSON.stringify(warnings));
  }
};

export const updateWarning = async (id: string, updates: Partial<Warning>): Promise<void> => {
  await delay(200);
  const warnings = getParsedData<Warning[]>(KEYS.WARNINGS, []);
  const idx = warnings.findIndex(w => w.id === id);
  if (idx !== -1 && typeof window !== "undefined") {
    warnings[idx] = { ...warnings[idx], ...updates };
    localStorage.setItem(KEYS.WARNINGS, JSON.stringify(warnings));
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
  return getParsedData<SystemConfig>(KEYS.CONFIG, {
    sheetUrl: "",
    googleConnected: false,
    lastRead: "",
    lastWrite: "",
    logs: []
  });
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
    id: `log-${Date.now()}`,
    date: new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })
  };
  
  const updatedLogs = [newLog, ...config.logs].slice(0, 50); // Keep last 50 logs
  await updateConfig({ logs: updatedLogs });
};
