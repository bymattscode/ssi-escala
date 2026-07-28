import { fetchGoogleSheets } from './googleSheets';
import { 
  getMembers, 
  getSchedules, 
  getCases, 
  getWarnings, 
  addSyncLog,
  updateConfig,
  getDeletedKeys,
  sortMembers,
  KEYS
} from './store';
import { toast } from 'sonner';

// Mapeamento de chaves (Frontend <-> Google Sheets)
const headerMaps = {
  membros: {
    id: "ID", nick: "Nick", role: "Cargo", status: "Status", entryDate: "Data de Entrada",
    promotionDate: "Data de Promoção", leaveStartDate: "Início da Licença", leaveEndDate: "Fim da Licença",
    avatarUrl: "URL do Avatar", group: "Grupo", permissions: "Permissões", accessCode: "Código de Acesso"
  },
  escalas: {
    id: "ID Interno", week: "Semana", memberId: "ID do Membro", referenceDay: "Dia de Referência",
    deadline: "Prazo", status: "Status", responsibleId: "ID do Responsável", observations: "Observações",
    type: "Cargo", deadlineDate: "Data do Prazo", conclusionId: "ID de Conclusão", comments: "Print da Função",
    casesLine: "Linha de Casos", justificationReason: "Motivo da Justificativa", justificationText: "Justificativa",
    justificationAttachment: "Anexo da Justificativa", justificationOccurrenceDate: "Data da Ocorrência (Just.)",
    justificationStatus: "Status da Justificativa", justificationDate: "Data da Justificativa",
    justificationReviewerId: "ID do Revisor (Just.)", scheduleDate: "Data da Escala", responseDate: "Data da Resposta"
  },
  casos: {
    id: "ID", status: "Veredito", creatorId: "Fiscalizador", creatorNick: "Fiscalizador", offenderNick: "Infrator",
    description: "Descrição", creationDate: "Data", proofAttachment: "Anexo da Prova",
    orientation: "Orientação", crimeCommitted: "Crime Cometido",
    resolutionAttachment: "Anexo da Resolução", punishmentApplied: "Punição Aplicada",
    resolverId: "Responsável", resolverNick: "Responsável", cancellationReason: "Motivo de Cancelamento"
  },
  advertencias: {
    id: "ID", date: "Data", offenderNick: "Nick do Infrator", punishmentType: "Tipo de Punição",
    reason: "Motivo", directorNick: "Responsável", caseId: "ID do Caso", notes: "Observações"
  },
  logs: {
    id: "ID", date: "Data", timestamp: "Data e Hora", userId: "ID do Usuário", userRole: "Cargo do Usuário",
    action: "Ação", module: "Módulo", details: "Detalhes", targetId: "ID Alvo"
  }
};

const cleanTimestampFromDate = (val: any, fieldName: string): any => {
  if (val === undefined || val === null) return val;
  const lowerField = fieldName.toLowerCase();
  const isDateField = lowerField.includes("date") || lowerField.includes("data") || lowerField === "date";
  
  if (typeof val === "string") {
    if ((isDateField || val.endsWith("Z") || val.includes("T00:") || val.includes("T03:")) && val.includes("T")) {
      return val.split("T")[0];
    }
  } else if (val instanceof Date || (typeof val === "object" && typeof val.toISOString === "function")) {
    return val.toISOString().split("T")[0];
  }
  return val;
};

const translateToPortuguese = (data: any[], module: keyof typeof headerMaps) => {
  const map = headerMaps[module];
  if (!map) return data;
  
  // Se for o módulo de membros, ordenar por hierarquia (Presidente > Vice > Diretor > Fiscalizador) e por data de chegada (mais antigas primeiro)
  let listToTranslate = [...data];
  if (module === "membros") {
    listToTranslate = sortMembers(listToTranslate);
  }

  if (module === "escalas") {
    const allMembers = getParsedDataLocally<any[]>(KEYS.MEMBERS, []);
    const memberMap = new Map(allMembers.map(m => [m.id, m.nick]));
    
    // Ordem estrita solicitada pelo usuário: Domingo em primeiro, depois Segunda, Terça, etc.
    const dayOrderMap: Record<string, number> = {
      "Domingo": 0,
      "Segunda": 1, "Segunda-feira": 1,
      "Terça": 2, "Terça-feira": 2,
      "Quarta": 3, "Quarta-feira": 3,
      "Quinta": 4, "Quinta-feira": 4,
      "Sexta": 5, "Sexta-feira": 5,
      "Sábado": 6,
      "Avaliadores": 7,
      "Capacitadores": 8
    };

    const sortedSchedules = [...listToTranslate].sort((a, b) => {
      if (a.week !== b.week) {
        return String(b.week || "").localeCompare(String(a.week || ""));
      }
      const orderA = dayOrderMap[String(a.referenceDay || "").trim()] ?? 99;
      const orderB = dayOrderMap[String(b.referenceDay || "").trim()] ?? 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return String(a.type || "").localeCompare(String(b.type || ""));
    });

    return sortedSchedules.map(item => {
      const nick = memberMap.get(item.memberId) || item.nick || "Desconhecido";
      // Coluna Data: Data real do dia da escala ("a data mesmo do dia referente a escala")
      let scaleDateStr = "-";
      if (item.scheduleDate) {
        let d: Date;
        if (typeof item.scheduleDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.scheduleDate)) {
          const [y, m, day] = item.scheduleDate.split("-").map(Number);
          scaleDateStr = `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
        } else {
          d = new Date(item.scheduleDate);
          if (!isNaN(d.getTime())) {
            const pad = (n: number) => n.toString().padStart(2, '0');
            scaleDateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
          }
        }
      }
      if ((!scaleDateStr || scaleDateStr === "-") && item.deadlineDate) {
        const d = new Date(item.deadlineDate);
        if (!isNaN(d.getTime())) {
          // O prazo (deadline) ao gerar escala é definido 2 dias após o dia da escala
          d.setDate(d.getDate() - 2);
          const pad = (n: number) => n.toString().padStart(2, '0');
          scaleDateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        } else if (typeof item.deadlineDate === "string" && item.deadlineDate.includes("-")) {
          const parts = item.deadlineDate.split("T")[0].split("-");
          if (parts.length === 3) {
            scaleDateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }
      }
      if (!scaleDateStr || scaleDateStr === "-") {
        if (item.week && typeof item.week === "string" && item.week.includes("-W")) {
          const [yrStr, wkStr] = item.week.split("-W");
          const yr = parseInt(yrStr, 10);
          const wk = parseInt(wkStr, 10);
          if (!isNaN(yr) && !isNaN(wk)) {
            const jan4 = new Date(yr, 0, 4);
            const jan4DayOfWeek = (jan4.getDay() + 6) % 7;
            const firstMonday = new Date(yr, 0, 4 - jan4DayOfWeek);
            const targetWeekStart = new Date(firstMonday.getTime() + (wk - 1) * 7 * 24 * 60 * 60 * 1000);
            
            const offsetMap: Record<string, number> = {
              "Domingo": -1,
              "Segunda": 0, "Segunda-feira": 0,
              "Terça": 1, "Terça-feira": 1,
              "Quarta": 2, "Quarta-feira": 2,
              "Quinta": 3, "Quinta-feira": 3,
              "Sexta": 4, "Sexta-feira": 4,
              "Sábado": 5,
              "Avaliadores": 1,
              "Capacitadores": 1
            };
            const offset = offsetMap[String(item.referenceDay || "").trim()] ?? 0;
            const calcDate = new Date(targetWeekStart.getTime() + offset * 24 * 60 * 60 * 1000);
            if (!isNaN(calcDate.getTime())) {
              const pad = (n: number) => n.toString().padStart(2, '0');
              scaleDateStr = `${pad(calcDate.getDate())}/${pad(calcDate.getMonth() + 1)}/${calcDate.getFullYear()}`;
            }
          }
        }
      }

      // Coluna ID/Resposta: Data em que a pessoa respondeu no aplicativo
      let responseDateStr = "-";
      if (item.status === "Concluído" || item.status === "Justificado" || item.responseDate || item.justificationDate) {
        const targetDate = item.responseDate || item.justificationDate || (item.updatedAt ? new Date(Number(item.updatedAt)).toISOString() : null);
        if (targetDate && targetDate !== "-") {
          const d = new Date(targetDate);
          if (!isNaN(d.getTime())) {
            const pad = (n: number) => n.toString().padStart(2, '0');
            responseDateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
          }
        }
      }

      // Ordem exata das colunas na planilha solicitada pelo usuário:
      return {
        "Nick": nick,
        "Cargo": item.type || "-",
        "Semana": item.week || "-",
        "Dia de Referência": item.referenceDay || "-",
        "Data da Escala": scaleDateStr,
        "Prazo": item.deadline || "-",
        "Print da Função": item.comments || "-",
        "Data da Resposta": responseDateStr,
        "Status": item.status || "Pendente",
        "Justificativa": item.justificationText || item.justificationReason || "-",
        // Campos de controle interno para manter vínculo na planilha sem quebras de sincronização:
        "ID Interno": item.id || "-",
        "ID do Membro": item.memberId || "-"
      };
    });
  }

  if (module === "membros") {
    return listToTranslate.map(item => ({
      "ID": item.id || "-",
      "Nick": item.nick || "-",
      "Cargo": item.role || "-",
      "Status": item.status || "Ativo",
      "Data de Entrada": cleanTimestampFromDate(item.entryDate, "entryDate") || "-",
      "Data de Promoção": cleanTimestampFromDate(item.promotionDate, "promotionDate") || "-",
      "Grupo": item.group || "SSI",
      "Permissões": Array.isArray(item.permissions) ? item.permissions.join(", ") : (item.permissions || "Gestão de Casos, Registro de Punições"),
      "Código de Acesso": item.accessCode || "-"
    }));
  }

  if (module === "casos") {
    const allMembers = getParsedDataLocally<any[]>(KEYS.MEMBERS, []);
    const memberMap = new Map(allMembers.map(m => [m.id, m.nick]));

    return listToTranslate.map(item => {
      const fiscalizador = item.creatorNick || memberMap.get(item.creatorId) || item.creatorId || "-";
      const responsavel = item.resolverNick || (item.resolverId ? (memberMap.get(item.resolverId) || item.resolverId) : "-");

      return {
        "Fiscalizador": fiscalizador,
        "Infrator": item.offenderNick || "-",
        "Descrição": item.description || "-",
        "Data": cleanTimestampFromDate(item.creationDate, "creationDate") || "-",
        "Orientação": item.orientation || "-",
        "Anexo da Prova": item.proofAttachment || "-",
        "Veredito": item.status || "Pendente",
        "Responsável": responsavel,
        "Punição Aplicada": item.punishmentApplied || "-",
        "Crime Cometido": item.crimeCommitted || "-",
        "Anexo da Resolução": item.resolutionAttachment || "-",
        "ID": item.id || "-"
      };
    });
  }

  if (module === "advertencias") {
    const allMembers = getParsedDataLocally<any[]>(KEYS.MEMBERS, []);
    const memberMap = new Map(allMembers.map(m => [m.id, m.nick]));

    return listToTranslate.map(item => {
      const responsavel = item.directorNick || memberMap.get(item.directorId) || item.directorId || "-";
      return {
        "ID": item.id || "-",
        "Data": cleanTimestampFromDate(item.date, "date") || "-",
        "Nick do Infrator": item.offenderNick || "-",
        "Tipo de Punição": item.punishmentType || "Observação",
        "Motivo": item.reason || "-",
        "Responsável": responsavel,
        "ID do Caso": item.caseId || "-",
        "Observações": item.notes || "-"
      };
    });
  }

  if (module === "logs") {
    const allMembers = getParsedDataLocally<any[]>(KEYS.MEMBERS, []);
    const memberMap = new Map(allMembers.map(m => [m.id, m.nick]));

    return listToTranslate.map(item => {
      let dateTimeStr = "-";
      const val = item.timestamp || item.date;
      if (val && typeof val === "number") {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          const pad = (n: number) => n.toString().padStart(2, '0');
          dateTimeStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }
      } else if (val) {
        const strVal = String(val);
        if (strVal.includes("/") || strVal.includes("-")) {
          const d = new Date(strVal);
          if (!isNaN(d.getTime()) && strVal.includes("T")) {
            const pad = (n: number) => n.toString().padStart(2, '0');
            dateTimeStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
          } else {
            dateTimeStr = strVal;
          }
        } else {
          const num = Number(val);
          if (!isNaN(num) && num > 100000000000) {
            const d = new Date(num);
            if (!isNaN(d.getTime())) {
              const pad = (n: number) => n.toString().padStart(2, '0');
              dateTimeStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            }
          } else {
            dateTimeStr = strVal;
          }
        }
      }

      const userNick = item.userNick || memberMap.get(item.userId) || item.userId || "-";

      return {
        "ID do Usuário": userNick,
        "ID": item.id || "-",
        "Cargo do Usuário": item.userRole || "-",
        "Data e Hora": dateTimeStr,
        "Timestamp": dateTimeStr,
        "Data": dateTimeStr,
        "Ação": item.action || "-",
        "Módulo": item.module || "-",
        "Detalhes": item.details || "-",
        "ID Alvo": item.targetId || "-"
      };
    });
  }

  return listToTranslate.map(item => {
    const translated: any = {};
    for (const key in item) {
      if (key === "syncStatus" || key === "updatedAt") continue;
      const ptKey = map[key as keyof typeof map] || key;
      let val = cleanTimestampFromDate(item[key], key);
      
      if (Array.isArray(val)) {
        val = val.join(", ");
      } else if (typeof val === "object" && val !== null) {
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
  
  if (module === "escalas") {
    const allMembers = getParsedDataLocally<any[]>(KEYS.MEMBERS, []);
    const nickMap = new Map(allMembers.map(m => [String(m.nick).trim().toLowerCase(), m.id]));

    return data.map((item: any) => {
      const internalId = item["ID Interno"] && item["ID Interno"] !== "-" ? item["ID Interno"] : (item["ID"] && String(item["ID"]).startsWith("SSI-") ? item["ID"] : undefined);
      const nick = item["Nick"] && item["Nick"] !== "-" ? String(item["Nick"]).trim() : "";
      const memberId = (item["ID do Membro"] && item["ID do Membro"] !== "-") ? item["ID do Membro"] : (nick ? (nickMap.get(nick.toLowerCase()) || "") : "");
      
      let type = item["Cargo"] && item["Cargo"] !== "-" ? item["Cargo"] : (item["Tipo"] || "Fiscalizador");
      let status = item["Status"] || "Pendente";
      let week = item["Semana"] && item["Semana"] !== "-" ? item["Semana"] : "2026-W30";
      let referenceDay = item["Dia de Referência"] && item["Dia de Referência"] !== "-" ? item["Dia de Referência"] : "Segunda";
      let responseDate: string | undefined = undefined;
      let conclusionId: string | undefined = undefined;
      const rawRespCol = item["Data e Hora da Resposta"] || item["Data da Resposta"] || item["ID de Conclusão"] || item["ID"];
      if (rawRespCol && rawRespCol !== "-" && rawRespCol !== referenceDay && !String(rawRespCol).startsWith("SSI-")) {
        if (String(rawRespCol).includes("/") || !isNaN(Date.parse(String(rawRespCol)))) {
          const parts = String(rawRespCol).trim().split(" ");
          const dateParts = parts[0].split("/");
          if (dateParts.length === 3) {
            responseDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}${parts[1] ? 'T' + parts[1] : 'T12:00:00.000Z'}`;
          } else {
            responseDate = String(rawRespCol);
          }
        } else {
          conclusionId = String(rawRespCol);
        }
      }

      let scheduleDate: string | undefined = undefined;
      const rawScaleDate = item["Data"] || item["Data e Hora"] || item["Data da Escala"] || item["Data do Dia da Escala"] || "-";
      if (rawScaleDate && rawScaleDate !== "-") {
        const dateParts = String(rawScaleDate).trim().split(" ")[0].split("/");
        if (dateParts.length === 3) {
          scheduleDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        } else {
          scheduleDate = String(rawScaleDate).split("T")[0];
        }
      }
      let comments = item["Print da Função"] || item["Print da função"] || item["Comentários"] || item["Comentário"] || undefined;
      if (comments === "-") comments = undefined;
      let justificationText = item["Justificativa"] && item["Justificativa"] !== "-" ? item["Justificativa"] : (item["Texto da Justificativa"] || undefined);
      
      const id = internalId || `SSI-ESC-${nick || "UNK"}-${week}-${String(type).replace(/\s+/g, '').substring(0,3).toUpperCase()}-${Math.random().toString(36).substring(2,6)}`;

      return {
        id,
        week,
        memberId,
        referenceDay,
        scheduleDate,
        responseDate,
        deadline: `${referenceDay} (23:59)`,
        status,
        type,
        conclusionId,
        comments,
        justificationText,
        updatedAt: item["Atualizado Em"] ? Number(item["Atualizado Em"]) : 0
      };
    });
  }

  if (module === "membros") {
    return data.map((item: any) => {
      let perms = item["Permissões"];
      if (typeof perms === "string") {
        if (perms.trim().startsWith("[")) {
          try { perms = JSON.parse(perms); } catch (e) {}
        } else {
          perms = perms.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }
      return {
        id: item["ID"] || `SSI-MEM-${Math.random().toString(36).substring(2,8).toUpperCase()}`,
        nick: item["Nick"] || "Desconhecido",
        role: item["Cargo"] || "Fiscalizador",
        status: item["Status"] || "Ativo",
        entryDate: cleanTimestampFromDate(item["Data de Entrada"], "entryDate") || "-",
        promotionDate: cleanTimestampFromDate(item["Data de Promoção"], "promotionDate") || "-",
        group: item["Grupo"] || "SSI",
        permissions: perms || ["Gestão de Casos", "Registro de Punições"],
        accessCode: item["Código de Acesso"] && item["Código de Acesso"] !== "-" ? item["Código de Acesso"] : undefined,
        updatedAt: item["Atualizado Em"] ? Number(item["Atualizado Em"]) : 0
      };
    });
  }

  if (module === "casos") {
    const allMembers = getParsedDataLocally<any[]>(KEYS.MEMBERS, []);
    const nickMap = new Map(allMembers.map(m => [String(m.nick).trim().toLowerCase(), m.id]));

    return data.map((item: any) => {
      const creatorNick = String(item["Fiscalizador"] || item["ID do Criador"] || "").trim();
      const creatorId = (creatorNick && creatorNick !== "-" ? (nickMap.get(creatorNick.toLowerCase()) || creatorNick) : "desconhecido");
      const resolverNick = item["Responsável"] || item["ID do Solucionador"] || undefined;
      const resolverId = resolverNick && resolverNick !== "-" ? (nickMap.get(String(resolverNick).trim().toLowerCase()) || resolverNick) : undefined;

      return {
        id: item["ID"] && item["ID"] !== "-" ? item["ID"] : `SSI-CASO-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
        status: item["Veredito"] || item["Status"] || "Pendente",
        creatorId,
        creatorNick: creatorNick !== "-" ? creatorNick : undefined,
        offenderNick: item["Infrator"] || item["Nick do Infrator"] || "-",
        description: item["Descrição"] || "-",
        creationDate: cleanTimestampFromDate(item["Data"] || item["Data de Criação"], "creationDate") || new Date().toISOString().split("T")[0],
        orientation: item["Orientação"] || "-",
        proofAttachment: item["Anexo da Prova"] || item["Anexo de Prova"] || undefined,
        resolverId,
        resolverNick: resolverNick && resolverNick !== "-" ? resolverNick : undefined,
        punishmentApplied: item["Punição Aplicada"] && item["Punição Aplicada"] !== "-" ? item["Punição Aplicada"] : undefined,
        crimeCommitted: item["Crime Cometido"] && item["Crime Cometido"] !== "-" ? item["Crime Cometido"] : undefined,
        resolutionAttachment: item["Anexo da Resolução"] || item["Anexo de Resolução"] || undefined,
        updatedAt: item["Atualizado Em"] ? Number(item["Atualizado Em"]) : 0
      };
    });
  }

  if (module === "advertencias") {
    const allMembers = getParsedDataLocally<any[]>(KEYS.MEMBERS, []);
    const nickMap = new Map(allMembers.map(m => [String(m.nick).trim().toLowerCase(), m.id]));

    return data.map((item: any) => {
      const respNick = String(item["Responsável"] || item["ID do Diretor"] || "").trim();
      const directorId = respNick !== "-" && respNick !== "" ? (nickMap.get(respNick.toLowerCase()) || respNick) : "desconhecido";

      return {
        id: item["ID"] && item["ID"] !== "-" ? item["ID"] : `SSI-PUN-${Date.now()}`,
        date: cleanTimestampFromDate(item["Data"], "date") || new Date().toISOString().split("T")[0],
        offenderNick: item["Nick do Infrator"] || "-",
        punishmentType: item["Tipo de Punição"] || "Observação",
        reason: item["Motivo"] || "-",
        directorId,
        directorNick: respNick !== "-" ? respNick : undefined,
        caseId: item["ID do Caso"] && item["ID do Caso"] !== "-" ? item["ID do Caso"] : undefined,
        notes: item["Observações"] && item["Observações"] !== "-" ? item["Observações"] : undefined,
        updatedAt: item["Atualizado Em"] ? Number(item["Atualizado Em"]) : 0
      };
    });
  }

  if (module === "logs") {
    const allMembers = getParsedDataLocally<any[]>(KEYS.MEMBERS, []);
    const nickMap = new Map(allMembers.map(m => [String(m.nick).trim().toLowerCase(), m.id]));

    return data.map((item: any) => {
      const uNick = String(item["ID do Usuário"] || "").trim();
      const userId = uNick !== "-" && uNick !== "" ? (nickMap.get(uNick.toLowerCase()) || uNick) : "desconhecido";
      
      const timeStr = item["Data e Hora"] || item["Timestamp"] || item["Data"] || "-";
      let timestamp = Date.now();
      if (typeof timeStr === "number" && timeStr > 100000000000) {
        timestamp = timeStr;
      } else if (typeof timeStr === "string" && (timeStr.includes("/") || timeStr.includes("-"))) {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
          timestamp = d.getTime();
        } else if (timeStr.includes("/")) {
          const [datePart, timePart = "00:00:00"] = timeStr.split(" ");
          const [day, month, year] = datePart.split("/").map(Number);
          const [h = 0, m = 0, s = 0] = timePart.split(":").map(Number);
          const dt = new Date(year, month - 1, day, h, m, s);
          if (!isNaN(dt.getTime())) timestamp = dt.getTime();
        }
      }

      return {
        id: item["ID"] && item["ID"] !== "-" ? item["ID"] : `SSI-LOG-${Date.now()}`,
        date: String(timeStr).split(" ")[0] || "-",
        timestamp,
        userId,
        userRole: item["Cargo do Usuário"] || "-",
        action: item["Ação"] || "-",
        module: item["Módulo"] || "-",
        details: item["Detalhes"] || "-",
        targetId: item["ID Alvo"] && item["ID Alvo"] !== "-" ? item["ID Alvo"] : undefined
      };
    });
  }
  
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
      if (enKey === "permissions" && typeof val === "string") {
        if (val.trim().startsWith("[")) {
          try { val = JSON.parse(val); } catch (e) {}
        } else {
          val = val.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      } else if (typeof val === "string" && ((val.startsWith("[") && val.endsWith("]")) || (val.startsWith("{") && val.endsWith("}")))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      
      val = cleanTimestampFromDate(val, enKey);
      translated[enKey] = val;
    }
    return translated;
  });
};

function cleanEscalasData(items: any[]): any[] {
  if (!items || !Array.isArray(items) || items.length === 0) return items;
  const deduplicationMap = new Map<string, any>();

  for (const item of items) {
    if (!item) continue;
    if (String(item.id || "").toUpperCase().includes("TESTE") || String(item.memberId || "").toUpperCase().includes("TESTE") || String(item["ID Interno"] || "").toUpperCase().includes("TESTE")) {
      continue;
    }

    const key = (item.id && String(item.id).trim() !== "")
      ? String(item.id).trim().toLowerCase()
      : `${item.week || ""}-${item.type || ""}-${item.referenceDay || ""}-${item.memberId || ""}`.toLowerCase();

    const existing = deduplicationMap.get(key);
    if (!existing) {
      deduplicationMap.set(key, item);
    } else {
      const itemTime = item.updatedAt || 0;
      const existingTime = existing.updatedAt || 0;
      if (item.syncStatus === "pending" || (existing.syncStatus !== "pending" && (itemTime >= existingTime || item.status === "Concluído" || item.status === "Justificado"))) {
        deduplicationMap.set(key, item);
      }
    }
  }
  return Array.from(deduplicationMap.values());
}

export const syncModule = async (moduleName: string): Promise<{ success: boolean; error?: string }> => {
  try {
    let localData: any[] = [];
    let localKey = "";

    if (moduleName === 'membros') { localData = await getMembers(); localKey = KEYS.MEMBERS; }
    else if (moduleName === 'escalas') { localData = await getSchedules(); localKey = KEYS.SCHEDULES; }
    else if (moduleName === 'casos') { localData = await getCases(); localKey = KEYS.CASES; }
    else if (moduleName === 'advertencias') { localData = await getWarnings(); localKey = KEYS.WARNINGS; }
    else if (moduleName === 'logs') { localData = getParsedDataLocally(KEYS.AUDIT, []); localKey = KEYS.AUDIT; }

    const finalData = moduleName === "escalas" ? cleanEscalasData(localData) : localData;

    // Push local state directly without slow readAll merges, ensuring instant real-time synchronization to Google Sheets
    const payload = {
      action: "sync" as const,
      module: moduleName,
      payload: translateToPortuguese(finalData, moduleName as keyof typeof headerMaps),
      deletedKeys: getDeletedKeys(),
      overwrite: true
    };
    
    const pushResponse = await fetchGoogleSheets(payload as any);
    
    if (pushResponse.success) {
      const syncedData = finalData.map(item => ({ ...item, syncStatus: "synced" }));
      if (typeof window !== "undefined" && localKey) {
        localStorage.setItem(localKey, JSON.stringify(syncedData));
      }

      const now = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
      await updateConfig({ lastWrite: now, lastRead: now });
      await addSyncLog({ type: "success", message: `Módulo '${moduleName}' sincronizado em tempo real.` });
      return { success: true };
    } else {
      const err = pushResponse.error || `Erro ao salvar ${moduleName} na planilha`;
      await addSyncLog({ type: "error", message: `Erro ao subir '${moduleName}': ${err}` });
      return { success: false, error: err };
    }
  } catch (error: any) {
    const err = error.message || "Erro inesperado ao sincronizar";
    await addSyncLog({ type: "error", message: `Erro inesperado na sincronização: ${err}` });
    return { success: false, error: err };
  }
};

export const syncAll = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const readResponse = await fetchGoogleSheets({ action: "readAll" });
    if (!readResponse.success) {
      const err = `Falha ao obter dados remotos: ${readResponse.error || "Sem resposta do Google Sheets"}`;
      toast.error(err);
      return { success: false, error: err };
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
    const mLogs = mergeArrays(logs, remoteData['logs'] || []);

    const cleanSchedulesMerged = cleanEscalasData(mSchedules.merged);

    const totalConflicts = mMembers.conflictCount + mSchedules.conflictCount + mCases.conflictCount + mWarnings.conflictCount;
    if (totalConflicts > 0) {
      await addSyncLog({ type: "warning", message: `⚠️ ${totalConflicts} conflito(s) resolvidos na sincronização total (Last-Write-Wins).` });
      toast.warning(`${totalConflicts} conflito(s) resolvido(s).`);
    }

    // 3. Push all merged data back module by module com intervalo entre eles e salvamento imediato por módulo
    const modulesToSync = [
      { name: 'membros', data: mMembers.merged, key: KEYS.MEMBERS },
      { name: 'escalas', data: cleanSchedulesMerged, key: KEYS.SCHEDULES },
      { name: 'casos', data: mCases.merged, key: KEYS.CASES },
      { name: 'advertencias', data: mWarnings.merged, key: KEYS.WARNINGS },
      { name: 'logs', data: mLogs.merged, key: KEYS.AUDIT }
    ];

    let allSuccess = true;
    let pushErrors: string[] = [];

    for (const mod of modulesToSync) {
      const pushResponse = await fetchGoogleSheets({
        action: "sync" as const,
        module: mod.name,
        payload: translateToPortuguese(mod.data, mod.name as keyof typeof headerMaps),
        deletedKeys: getDeletedKeys(),
        overwrite: true
      } as any);

      if (pushResponse.success) {
        // Salva imediatamente os itens como sincronizados para zerar pendências
        if (typeof window !== "undefined") {
          const syncedData = mod.data.map((i: any) => ({ ...i, syncStatus: 'synced' }));
          localStorage.setItem(mod.key, JSON.stringify(syncedData));
        }
        await addSyncLog({ type: "success", message: `Módulo '${mod.name}' sincronizado na sincronização geral.` });
      } else {
        allSuccess = false;
        const errDesc = `${mod.name}: ${pushResponse.error || "Sem resposta do servidor"}`;
        pushErrors.push(errDesc);
        await addSyncLog({ type: "error", message: `Erro ao sincronizar '${mod.name}': ${pushResponse.error}` });
      }

      // Pequena pausa de segurança para o Google Apps Script não bloquear por excesso de requisições paralelas / Lock Timeout
      await new Promise(r => setTimeout(r, 600));
    }
    
    const now = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
    await updateConfig({ lastWrite: now, lastRead: now });

    if (allSuccess) {
      await addSyncLog({ type: "success", message: "Todos os módulos sincronizados com sucesso." });
      return { success: true };
    } else {
      return { success: false, error: pushErrors.join("; ") };
    }
  } catch (error: any) {
    const err = error.message || "Erro inesperado ao executar Sincronizar Tudo";
    await addSyncLog({ type: "error", message: `Erro inesperado na sincronização total: ${err}` });
    return { success: false, error: err };
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
  const deletedKeys = getDeletedKeys();
  
  // Usar chave única de semana-cargo-dia para escalas, ou Nick (para membros), evitando duplicação em sincronização cruzada
  const getUniqueKey = (item: any) => {
    if (item.id !== undefined && item.id !== null && String(item.id).trim() !== "" && !String(item.id).toUpperCase().includes("TESTE")) {
      return String(item.id).trim().toLowerCase();
    }
    if (item.week && item.type && item.referenceDay && item.memberId) {
      return `${item.week}-${item.type}-${item.referenceDay}-${item.memberId}`.trim().toLowerCase();
    }
    if (item.nick !== undefined && item.nick !== null && String(item.nick).trim() !== "") {
      return String(item.nick).trim().toLowerCase();
    }
    return Math.random().toString(36);
  };
  
  const isDeleted = (item: T) => {
    if (item.id !== undefined && item.id !== null && deletedKeys.includes(String(item.id).trim().toLowerCase())) return true;
    if (item.nick !== undefined && item.nick !== null && deletedKeys.includes(String(item.nick).trim().toLowerCase())) return true;
    return false;
  };

  const isTestItem = (item: any) => {
    if (!item) return true;
    const strId = String(item.id || "").toUpperCase();
    const strMemberId = String(item.memberId || item["ID do Membro"] || "").toUpperCase();
    if (strId.includes("TESTE-0") || strId.includes("-TESTE-") || strMemberId.includes("TESTE-0") || strMemberId.includes("-TESTE-")) return true;
    return false;
  };

  for (const r of remote) {
    if (isDeleted(r) || isTestItem(r)) continue;
    const key = getUniqueKey(r);
    mergedMap.set(key, { ...r, syncStatus: 'synced' });
  }
  
  for (const l of local) {
    if (isDeleted(l) || isTestItem(l)) continue;
    const key = getUniqueKey(l);
    const r = mergedMap.get(key);
    if (!r) {
      mergedMap.set(key, l);
    } else {
      const localTime = l.updatedAt || 0;
      const remoteTime = r.updatedAt || 0;
      
      if (l.syncStatus === 'pending' || localTime >= remoteTime) {
        mergedMap.set(key, { ...r, ...l }); // Local vence: garante conservação e envio da escala gerada/editada localmente
      } else {
        conflictCount++;
        mergedMap.set(key, { ...l, ...r, syncStatus: 'synced' });
      }
    }
  }
  
  return { merged: Array.from(mergedMap.values()), conflictCount };
}
