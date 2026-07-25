import { fetchGoogleSheets } from './googleSheets';
import { 
  getMembers, 
  getSchedules, 
  getCases, 
  getWarnings, 
  addSyncLog,
  updateConfig,
  KEYS
} from './store';
import { toast } from 'sonner';

// Mapeamento de chaves (Frontend <-> Google Sheets)
const headerMaps = {
  membros: {
    id: "ID", nick: "Nick", role: "Cargo", status: "Status", entryDate: "Data de Entrada",
    promotionDate: "Data de Promoção", leaveStartDate: "Início da Licença", leaveEndDate: "Fim da Licença",
    avatarUrl: "URL do Avatar", group: "Grupo", permissions: "Permissões", accessCode: "Código de Acesso",
    updatedAt: "Atualizado Em"
  },
  escalas: {
    id: "ID", week: "Semana", memberId: "ID do Membro", referenceDay: "Dia de Referência",
    deadline: "Prazo", status: "Status", responsibleId: "ID do Responsável", observations: "Observações",
    type: "Tipo", deadlineDate: "Data do Prazo", conclusionId: "ID de Conclusão", comments: "Comentários",
    casesLine: "Linha de Casos", justificationReason: "Motivo da Justificativa", justificationText: "Texto da Justificativa",
    justificationAttachment: "Anexo da Justificativa", justificationOccurrenceDate: "Data da Ocorrência (Just.)",
    justificationStatus: "Status da Justificativa", justificationDate: "Data da Justificativa",
    justificationReviewerId: "ID do Revisor (Just.)", updatedAt: "Atualizado Em"
  },
  casos: {
    id: "ID", status: "Status", creatorId: "ID do Criador", offenderNick: "Nick do Infrator",
    description: "Descrição", creationDate: "Data de Criação", proofAttachment: "Anexo de Prova",
    orientation: "Orientação", orderNumber: "Número do Pedido", crimeCommitted: "Crime Cometido",
    resolutionAttachment: "Anexo de Resolução", punishmentApplied: "Punição Aplicada",
    resolutionDate: "Data de Resolução", resolverId: "ID do Solucionador", cancellationReason: "Motivo de Cancelamento",
    updatedAt: "Atualizado Em"
  },
  advertencias: {
    id: "ID", date: "Data", offenderNick: "Nick do Infrator", punishmentType: "Tipo de Punição",
    reason: "Motivo", directorId: "ID do Diretor", caseId: "ID do Caso", notes: "Observações",
    updatedAt: "Atualizado Em"
  },
  logs: {
    id: "ID", date: "Data", timestamp: "Timestamp", userId: "ID do Usuário", userRole: "Cargo do Usuário",
    action: "Ação", module: "Módulo", details: "Detalhes", targetId: "ID Alvo"
  }
};

const translateToPortuguese = (data: any[], module: keyof typeof headerMaps) => {
  const map = headerMaps[module];
  if (!map) return data;
  return data.map(item => {
    const translated: any = {};
    for (const key in item) {
      if (key === 'syncStatus') continue; // Ignorar campo interno
      const ptKey = map[key as keyof typeof map] || key;
      let val = item[key];
      if (Array.isArray(val)) {
        val = val.join(", ");
      } else if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      translated[ptKey] = val;
    }
    return translated;
  });
};

const translateToEnglish = (data: any[], module: keyof typeof headerMaps) => {
  const map = headerMaps[module];
  if (!map) return data;
  
  // Invert the map for reading
  const invertedMap: Record<string, string> = {};
  for (const [en, pt] of Object.entries(map)) {
    invertedMap[pt] = en;
  }
  
  return data.map(item => {
    const translated: any = {};
    for (const key in item) {
      const enKey = invertedMap[key] || key;
      let val = item[key];
      if (enKey === 'permissions' && typeof val === 'string') {
        if (val.trim().startsWith('[')) {
          try { val = JSON.parse(val); } catch (e) {}
        } else {
          val = val.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      } else if (typeof val === 'string' && ((val.startsWith('[') && val.endsWith(']')) || (val.startsWith('{') && val.endsWith('}')))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      translated[enKey] = val;
    }
    return translated;
  });
};

export const syncModule = async (moduleName: string): Promise<boolean> => {
  try {
    // 1. Pull remote state first
    const readResponse = await fetchGoogleSheets({ action: "readAll" });
    if (!readResponse.success) {
      toast.error(`Falha ao obter dados remotos: ${readResponse.error}`);
      return false; // Fallback: Mantém local como pending, usuário pode tentar de novo
    }

    const rawRemoteData = readResponse.data?.[moduleName] || [];
    const remoteData = translateToEnglish(rawRemoteData, moduleName as keyof typeof headerMaps);
    let localData: any[] = [];
    let localKey = "";

    if (moduleName === 'membros') { localData = await getMembers(); localKey = KEYS.MEMBERS; }
    else if (moduleName === 'escalas') { localData = await getSchedules(); localKey = KEYS.SCHEDULES; }
    else if (moduleName === 'casos') { localData = await getCases(); localKey = KEYS.CASES; }
    else if (moduleName === 'advertencias') { localData = await getWarnings(); localKey = KEYS.WARNINGS; }
    else if (moduleName === 'logs') { localData = getParsedDataLocally(KEYS.AUDIT, []); localKey = KEYS.AUDIT; }

    // 2. Merge local and remote
    const { merged, conflictCount } = mergeArrays(localData, remoteData);

    if (conflictCount > 0) {
      await addSyncLog({ type: "warning", message: `⚠️ ${conflictCount} conflito(s) resolvido(s) no módulo '${moduleName}' (Last-Write-Wins).` });
      toast.warning(`${conflictCount} conflito(s) resolvido(s) remotamente.`);
    }

    // 3. Push merged state
    const payload = {
      action: "sync" as const,
      module: moduleName,
      payload: translateToPortuguese(merged, moduleName as keyof typeof headerMaps)
    };
    
    const pushResponse = await fetchGoogleSheets(payload);
    
    if (pushResponse.success) {
      // 4. Update local state as synced
      const syncedData = merged.map(item => ({ ...item, syncStatus: "synced" }));
      if (typeof window !== "undefined") {
        localStorage.setItem(localKey, JSON.stringify(syncedData));
      }

      const now = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
      await updateConfig({ lastWrite: now, lastRead: now });
      await addSyncLog({ type: "success", message: `Módulo '${moduleName}' sincronizado com sucesso.` });
      return true;
    } else {
      await addSyncLog({ type: "error", message: `Erro ao subir '${moduleName}': ${pushResponse.error}` });
      return false;
    }
  } catch (error: any) {
    await addSyncLog({ type: "error", message: `Erro inesperado na sincronização: ${error.message}` });
    return false;
  }
};

export const syncAll = async (): Promise<boolean> => {
  try {
    const readResponse = await fetchGoogleSheets({ action: "readAll" });
    if (!readResponse.success) {
      toast.error(`Falha ao obter dados remotos: ${readResponse.error}`);
      return false; // Retorna false se falhar
    }

    const remoteData = {
      membros: translateToEnglish(readResponse.data?.['membros'] || [], 'membros'),
      escalas: translateToEnglish(readResponse.data?.['escalas'] || [], 'escalas'),
      casos: translateToEnglish(readResponse.data?.['casos'] || [], 'casos'),
      advertencias: translateToEnglish(readResponse.data?.['advertencias'] || [], 'advertencias'),
      logs: translateToEnglish(readResponse.data?.['logs'] || [], 'logs')
    };
    
    const members = await getMembers();
    const schedules = await getSchedules();
    const cases = await getCases();
    const warnings = await getWarnings();
    const logs = getParsedDataLocally(KEYS.AUDIT, []);
    
    const mMembers = mergeArrays(members, remoteData['membros'] || []);
    const mSchedules = mergeArrays(schedules, remoteData['escalas'] || []);
    const mCases = mergeArrays(cases, remoteData['casos'] || []);
    const mWarnings = mergeArrays(warnings, remoteData['advertencias'] || []);
    // Logs are just append, no conflicts to merge, but we can use mergeArrays safely.
    const mLogs = mergeArrays(logs, remoteData['logs'] || []);

    const totalConflicts = mMembers.conflictCount + mSchedules.conflictCount + mCases.conflictCount + mWarnings.conflictCount;
    if (totalConflicts > 0) {
      await addSyncLog({ type: "warning", message: `⚠️ ${totalConflicts} conflito(s) resolvidos na sincronização total (Last-Write-Wins).` });
      toast.warning(`${totalConflicts} conflito(s) resolvido(s).`);
    }

    // 3. Push all merged data back module by module
    const modulesToSync = [
      { name: 'membros', data: mMembers.merged },
      { name: 'escalas', data: mSchedules.merged },
      { name: 'casos', data: mCases.merged },
      { name: 'advertencias', data: mWarnings.merged },
      { name: 'logs', data: mLogs.merged }
    ];

    let allSuccess = true;
    let pushError = "";

    for (const mod of modulesToSync) {
      const pushResponse = await fetchGoogleSheets({
        action: "sync" as const,
        module: mod.name,
        payload: translateToPortuguese(mod.data, mod.name as keyof typeof headerMaps)
      });
      if (!pushResponse.success) {
        allSuccess = false;
        pushError = pushResponse.error || "Erro ao sincronizar módulo " + mod.name;
        break;
      }
    }
    
    if (allSuccess) {
      if (typeof window !== "undefined") {
        localStorage.setItem(KEYS.MEMBERS, JSON.stringify(mMembers.merged.map(i => ({...i, syncStatus: 'synced'}))));
        localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(mSchedules.merged.map(i => ({...i, syncStatus: 'synced'}))));
        localStorage.setItem(KEYS.CASES, JSON.stringify(mCases.merged.map(i => ({...i, syncStatus: 'synced'}))));
        localStorage.setItem(KEYS.WARNINGS, JSON.stringify(mWarnings.merged.map(i => ({...i, syncStatus: 'synced'}))));
        localStorage.setItem(KEYS.AUDIT, JSON.stringify(mLogs.merged.map(i => ({...i, syncStatus: 'synced'}))));
      }

      const now = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
      await updateConfig({ lastWrite: now, lastRead: now });
      await addSyncLog({ type: "success", message: "Todos os módulos sincronizados com sucesso." });
      return true;
    } else {
      await addSyncLog({ type: "error", message: `Erro na sincronização total: ${pushError}` });
      return false;
    }
  } catch (error: any) {
    await addSyncLog({ type: "error", message: `Erro inesperado na sincronização total: ${error.message}` });
    return false;
  }
};

export const fetchAllFromRemote = async (): Promise<boolean> => {
  const response = await fetchGoogleSheets({ action: "readAll" });
  
  if (response.success && response.data) {
    const { membros, escalas, casos, advertencias, logs } = response.data;
    const remoteData = {
      membros: translateToEnglish(membros || [], 'membros'),
      escalas: translateToEnglish(escalas || [], 'escalas'),
      casos: translateToEnglish(casos || [], 'casos'),
      advertencias: translateToEnglish(advertencias || [], 'advertencias'),
      logs: translateToEnglish(logs || [], 'logs')
    };
    
    // Fallback merge to avoid overwriting pending offline changes
    const localMembers = await getMembers();
    const mMembers = mergeArrays(localMembers, remoteData.membros);
    
    const localSchedules = await getSchedules();
    const mSchedules = mergeArrays(localSchedules, remoteData.escalas);

    const localCases = await getCases();
    const mCases = mergeArrays(localCases, remoteData.casos);

    const localWarnings = await getWarnings();
    const mWarnings = mergeArrays(localWarnings, remoteData.advertencias);

    const localLogs = getParsedDataLocally(KEYS.AUDIT, []);
    const mLogs = mergeArrays(localLogs, remoteData.logs);
    
    // Save to local storage without overriding syncStatus='pending' on items that were NOT resolved by remote
    if (typeof window !== "undefined") {
      localStorage.setItem(KEYS.MEMBERS, JSON.stringify(mMembers.merged));
      localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(mSchedules.merged));
      localStorage.setItem(KEYS.CASES, JSON.stringify(mCases.merged));
      localStorage.setItem(KEYS.WARNINGS, JSON.stringify(mWarnings.merged));
      localStorage.setItem(KEYS.AUDIT, JSON.stringify(mLogs.merged));
    }
    
    const now = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
    await updateConfig({ lastRead: now });
    await addSyncLog({ type: "success", message: "Dados baixados e consolidados com a nuvem." });
    return true;
  } else {
    await addSyncLog({ type: "error", message: `Erro ao buscar dados remotos: ${response.error}` });
    return false;
  }
};

export const backupToRemote = async (): Promise<boolean> => {
  const members = await getMembers();
  const schedules = await getSchedules();
  const cases = await getCases();
  const warnings = await getWarnings();
  
  const payload = {
    action: "backup" as const,
    payload: {
      membros: members,
      escalas: schedules,
      casos: cases,
      advertencias: warnings,
    }
  };
  
  const response = await fetchGoogleSheets(payload);
  if (response.success) {
    await addSyncLog({ type: "success", message: "Backup completo estruturado com sucesso na planilha 'logs'." });
    return true;
  } else {
    await addSyncLog({ type: "error", message: `Erro ao fazer backup: ${response.error}` });
    return false;
  }
};

// --- Helpers ---

function getParsedDataLocally<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function mergeArrays<T extends { id: string; nick?: string; updatedAt?: number; syncStatus?: string }>(
  local: T[], 
  remote: T[]
): { merged: T[]; conflictCount: number } {
  let conflictCount = 0;
  const mergedMap = new Map<string, T>();
  
  // Usar Nick (se for membro/usuário) ou ID para evitar duplicação em sincronização cruzada
  const getUniqueKey = (item: T) => item.nick ? item.nick.trim().toLowerCase() : item.id;

  for (const r of remote) {
    const key = getUniqueKey(r);
    mergedMap.set(key, { ...r, syncStatus: 'synced' });
  }
  
  for (const l of local) {
    const key = getUniqueKey(l);
    const r = mergedMap.get(key);
    if (!r) {
      mergedMap.set(key, l);
    } else {
      if (l.syncStatus === 'pending') {
        const localTime = l.updatedAt || 0;
        const remoteTime = r.updatedAt || 0;
        
        if (localTime > remoteTime) {
          mergedMap.set(key, { ...r, ...l }); // Local wins
        } else if (localTime < remoteTime) {
          conflictCount++;
          mergedMap.set(key, { ...l, ...r, syncStatus: 'synced' }); // Remote wins
        } else {
          mergedMap.set(key, { ...l, ...r });
        }
      } else {
        mergedMap.set(key, { ...l, ...r, syncStatus: 'synced' }); // Remote wins
      }
    }
  }
  
  return { merged: Array.from(mergedMap.values()), conflictCount };
}
