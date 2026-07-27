import { getConfig } from './store';

export type SyncPayload = {
  action: "readAll" | "sync" | "backup" | "ping" | "validateHabbo";
  module?: string;
  payload?: any;
  nick?: string;
};

export type SyncResponse = {
  success: boolean;
  message?: string;
  data?: any;
  results?: any;
  error?: string;
};

export const fetchGoogleSheets = async (payload: SyncPayload, maxRetries = 2): Promise<SyncResponse> => {
  const config = await getConfig();
  let targetUrl = config.sheetUrl || "https://script.google.com/macros/s/AKfycbz1jvDrxlyp3p5kGCQanlPeFC-XXmMz4Jy0gjCKrtDUiBV5sKJGrlxraxvpV05tzWAZ1A/exec";
  
  if (targetUrl.includes("AKfycbyyw4ID-BPhtYZq7S6O6IYMdYwOg-ke_RJaqUKw_n47qKaH6C_KrOTfLInkDC3yjAagTg")) {
    targetUrl = "https://script.google.com/macros/s/AKfycbz1jvDrxlyp3p5kGCQanlPeFC-XXmMz4Jy0gjCKrtDUiBV5sKJGrlxraxvpV05tzWAZ1A/exec";
  }
  
  if (!targetUrl) {
    return { success: false, error: "Nenhuma URL configurada." };
  }
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success && attempt <= maxRetries && String(data.error || "").toLowerCase().includes("lock")) {
        await new Promise(r => setTimeout(r, 800 * attempt));
        continue;
      }
      return data;
    } catch (error: any) {
      if (attempt <= maxRetries) {
        await new Promise(r => setTimeout(r, 800 * attempt));
        continue;
      }
      console.error("Google Sheets API Error:", error);
      return { success: false, error: error.message || "Erro ao conectar com o Web App do Apps Script." };
    }
  }
  return { success: false, error: "Falha na comunicação após tentativas." };
};
