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

export const fetchGoogleSheets = async (payload: SyncPayload): Promise<SyncResponse> => {
  const config = await getConfig();
  const targetUrl = config.sheetUrl || "https://script.google.com/macros/s/AKfycbyyw4ID-BPhtYZq7S6O6IYMdYwOg-ke_RJaqUKw_n47qKaH6C_KrOTfLInkDC3yjAagTg/exec";
  
  if (!targetUrl) {
    return { success: false, error: "Nenhuma URL configurada." };
  }
  
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
    return data;
  } catch (error: any) {
    console.error("Google Sheets API Error:", error);
    return { success: false, error: error.message || "Erro desconhecido ao conectar com a planilha." };
  }
};
