/**
 * Utilitários para formatação e manipulação de datas no fuso horário de Brasília (UTC-3).
 * Formato padrão: dia/mês/ano (DD/MM/YYYY) e horário oficial de Brasília.
 * 
 * Implementação puramente determinística baseada no offset fixo UTC-3 (Horário Oficial do Brasil,
 * sem horário de verão desde 2019), garantindo compatibilidade total em qualquer navegador,
 * ambiente SSR, mobile e Cloudflare Workers sem risco de falhas de tabelas ICU.
 */

export const TIMEZONE_BRASILIA = 'America/Sao_Paulo';

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Formata apenas a data para o padrão brasileiro: DD/MM/YYYY.
 */
export function formatBrasiliaDate(val?: any): string {
  if (!val || val === "-" || val === "") return "-";

  const str = String(val).trim();

  // Já formatado em DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  // Se já for DD/MM/YYYY HH:mm... retorna apenas o dia
  if (/^\d{2}\/\d{2}\/\d{4}\s+/.test(str)) {
    return str.split(/\s+/)[0];
  }

  // Data pura no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
  }

  // Se for ISO com meia-noite UTC (ex: data pura do Google Sheets serializada com T00:00:00 ou T03:00:00)
  if (str.includes("T00:00:00") || str.includes("T03:00:00")) {
    const datePart = str.split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  let date: Date | null = null;
  if (typeof val === "number" || /^\d{11,}$/.test(str)) {
    date = new Date(Number(val));
  } else if (str.includes("T") || str.endsWith("Z")) {
    date = new Date(str);
  } else if (str.includes("/")) {
    const parts = str.split(" ")[0].split("/");
    if (parts.length === 3) {
      if (parts[2].length === 4) return parts.join("/");
      if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  if (!date || isNaN(date.getTime())) {
    const fallback = new Date(str);
    if (!isNaN(fallback.getTime())) {
      date = fallback;
    } else {
      return str;
    }
  }

  // Converte deterministamente para UTC-3
  const b = new Date(date.getTime() - 3 * 3600 * 1000);
  return `${pad(b.getUTCDate())}/${pad(b.getUTCMonth() + 1)}/${b.getUTCFullYear()}`;
}

/**
 * Formata data e hora no horário oficial de Brasília.
 * Retorna: "DD/MM/YYYY HH:mm" (ou "DD/MM/YYYY HH:mm:ss" se includeSeconds for true).
 * Se a entrada não possuir informação de hora, retorna apenas "DD/MM/YYYY".
 */
export function formatBrasiliaDateTime(val?: any, includeSeconds = false): string {
  if (!val || val === "-" || val === "") return "-";

  const str = String(val).trim();

  // Se já for DD/MM/YYYY e não tiver hora
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  // Se já for DD/MM/YYYY HH:mm ou DD/MM/YYYY HH:mm:ss
  if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    if (includeSeconds && str.split(":").length === 2) {
      return `${str}:00`;
    }
    if (!includeSeconds && str.split(":").length === 3) {
      return str.substring(0, str.lastIndexOf(":"));
    }
    return str;
  }

  // Data pura YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
  }

  // Datas puras com sufixo UTC padrão gerado pelo Google Sheets (sem hora útil)
  if (str.endsWith("T00:00:00.000Z") || str.endsWith("T03:00:00.000Z")) {
    const datePart = str.split("T")[0];
    const [y, m, d] = datePart.split("-");
    return `${d}/${m}/${y}`;
  }

  let date: Date | null = null;
  if (typeof val === "number" || /^\d{11,}$/.test(str)) {
    date = new Date(Number(val));
  } else if (str.includes("T") || str.endsWith("Z")) {
    date = new Date(str);
  } else if (str.includes(" ")) {
    // Formato "YYYY-MM-DD HH:mm:ss" ou "DD/MM/YYYY HH:mm:ss"
    const [dPart, tPart] = str.split(/\s+/);
    if (dPart.includes("-")) {
      date = new Date(`${dPart}T${tPart || "00:00:00"}-03:00`);
    } else if (dPart.includes("/")) {
      const parts = dPart.split("/");
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}T${tPart || "00:00:00"}-03:00`);
        } else {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${tPart || "00:00:00"}-03:00`);
        }
      }
    }
  }

  if (!date || isNaN(date.getTime())) {
    const fallback = new Date(str);
    if (!isNaN(fallback.getTime())) {
      date = fallback;
    } else {
      return str;
    }
  }

  // Converte deterministamente para UTC-3 (Horário Oficial de Brasília)
  const b = new Date(date.getTime() - 3 * 3600 * 1000);
  const day = pad(b.getUTCDate());
  const month = pad(b.getUTCMonth() + 1);
  const year = b.getUTCFullYear();
  const hours = pad(b.getUTCHours());
  const minutes = pad(b.getUTCMinutes());
  const seconds = pad(b.getUTCSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}${includeSeconds ? `:${seconds}` : ''}`;
}

/**
 * Retorna o valor atual local no formato ISO para inputs datetime-local (YYYY-MM-DDTHH:mm).
 */
export function getBrasiliaIsoNow(): string {
  const now = new Date();
  const b = new Date(now.getTime() - 3 * 3600 * 1000);
  return `${b.getUTCFullYear()}-${pad(b.getUTCMonth() + 1)}-${pad(b.getUTCDate())}T${pad(b.getUTCHours())}:${pad(b.getUTCMinutes())}`;
}

/**
 * Retorna a data atual de Brasília no formato YYYY-MM-DD.
 */
export function getBrasiliaDateNow(): string {
  const now = new Date();
  const b = new Date(now.getTime() - 3 * 3600 * 1000);
  return `${b.getUTCFullYear()}-${pad(b.getUTCMonth() + 1)}-${pad(b.getUTCDate())}`;
}
