/**
 * Utilitários para formatação e manipulação de datas no fuso horário de Brasília (UTC-3).
 * Formato padrão: dia/mês/ano (DD/MM/YYYY) e horário oficial de Brasília.
 */

export const TIMEZONE_BRASILIA = 'America/Sao_Paulo';

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
  } else if (str.includes("T") || str.includes(":") || str.includes("Z")) {
    date = new Date(str);
  } else if (str.includes("/")) {
    const parts = str.split(" ")[0].split("/");
    if (parts.length === 3) {
      if (parts[2].length === 4) return parts.join("/");
      if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  if (!date || isNaN(date.getTime())) {
    return str;
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: TIMEZONE_BRASILIA,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return str;
  }
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
  } else if (str.includes("T") || str.includes("Z")) {
    date = new Date(str);
  } else if (str.includes(" ")) {
    // Formato "YYYY-MM-DD HH:mm:ss" ou "DD/MM/YYYY HH:mm:ss"
    const [dPart, tPart] = str.split(" ");
    if (dPart.includes("-")) {
      date = new Date(`${dPart}T${tPart || "00:00:00"}`);
    } else if (dPart.includes("/")) {
      const [d, m, y] = dPart.split("/");
      date = new Date(`${y}-${m}-${d}T${tPart || "00:00:00"}`);
    }
  }

  if (!date || isNaN(date.getTime())) {
    // Tenta fallback com Date parse direto
    const fallback = new Date(str);
    if (!isNaN(fallback.getTime())) {
      date = fallback;
    } else {
      return str;
    }
  }

  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: TIMEZONE_BRASILIA,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: false
    });

    return formatter.format(date).replace(',', '');
  } catch (e) {
    return str;
  }
}

/**
 * Retorna o valor atual local no formato ISO para inputs datetime-local (YYYY-MM-DDTHH:mm).
 */
export function getBrasiliaIsoNow(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Converte a data atual para o fuso de Brasília
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_BRASILIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
  
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
}

/**
 * Retorna a data atual de Brasília no formato YYYY-MM-DD.
 */
export function getBrasiliaDateNow(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_BRASILIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now);
}
