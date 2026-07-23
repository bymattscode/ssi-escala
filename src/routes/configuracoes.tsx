import { createFileRoute } from "@tanstack/react-router";
import { Settings, Database, HardDrive, RefreshCw, CheckCircle2, AlertCircle, FileSpreadsheet, Key, History } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getConfig, updateConfig, addSyncLog, SyncLog } from "../lib/store";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [config, setConfig] = useState({
    sheetUrl: "",
    googleConnected: false,
    lastRead: "",
    lastWrite: "",
    logs: [] as SyncLog[]
  });
  const [sheetUrlInput, setSheetUrlInput] = useState("");

  const loadConfig = async () => {
    const data = await getConfig();
    setConfig(data);
    setSheetUrlInput(data.sheetUrl);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSync = async () => {
    if (!config.googleConnected) {
      toast.error("É necessário conectar a planilha primeiro.");
      return;
    }

    setIsSyncing(true);
    toast.info("Iniciando sincronização com banco de dados...");
    
    // Simulate sync
    setTimeout(async () => {
      const now = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
      await updateConfig({ lastRead: now });
      await addSyncLog({ type: "info", message: "Sincronização automática com Google Sheets (Leitura)." });
      
      await loadConfig();
      setIsSyncing(false);
      toast.success("Dados sincronizados com sucesso!");
    }, 2000);
  };

  const handleConnectGoogle = async () => {
    if (!sheetUrlInput) {
      toast.error("Por favor, insira a URL ou ID da planilha do Google Sheets.");
      return;
    }
    toast.info("Conectando ao Google Sheets...");
    setTimeout(async () => {
      await updateConfig({ googleConnected: true, sheetUrl: sheetUrlInput });
      await addSyncLog({ type: "success", message: "Planilha conectada e autenticada com sucesso." });
      await loadConfig();
      toast.success("Planilha conectada e autenticada com sucesso!");
    }, 1500);
  };

  const handleDisconnectGoogle = async () => {
    await updateConfig({ googleConnected: false, sheetUrl: "" });
    await addSyncLog({ type: "warning", message: "Conexão com Google Sheets removida." });
    await loadConfig();
    setSheetUrlInput("");
    toast.info("Conexão removida.");
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Configurações e Integrações
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os parâmetros do sistema e a sincronização de dados.</p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all w-full sm:w-auto ${isSyncing
              ? "bg-primary/20 text-primary border border-primary/50 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            }`}
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bloco de Integração com Google Sheets */}
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center gap-3">
            <div className="h-10 w-10 bg-green-500/10 border border-green-500/20 rounded-md flex items-center justify-center text-green-500">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Google Sheets API</h2>
              <p className="text-xs text-muted-foreground">Integração bidirecional com a planilha base.</p>
            </div>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                URL ou ID da Planilha
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sheetUrlInput}
                  onChange={(e) => setSheetUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors flex-1"
                  disabled={config.googleConnected}
                />
                {!config.googleConnected ? (
                  <button
                    onClick={handleConnectGoogle}
                    className="bg-secondary text-foreground hover:bg-secondary/80 border border-border px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Conectar
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnectGoogle}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border/50 bg-background/50 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">Status da Sincronização</h3>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conexão:</span>
                {config.googleConnected ? (
                  <span className="text-sm font-medium text-green-500 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Ativa</span>
                ) : (
                  <span className="text-sm font-medium text-yellow-500 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> Pendente</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última Leitura:</span>
                <span className="text-sm font-medium text-foreground">{config.lastRead || "-"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última Escrita (Backup):</span>
                <span className="text-sm font-medium text-foreground">{config.lastWrite || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logs de Sistema */}
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center text-primary">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Logs de Sistema</h2>
                <p className="text-xs text-muted-foreground">Registro de ações de backup e exportação.</p>
              </div>
            </div>
            <button className="text-xs text-primary hover:underline font-medium">Ver todos</button>
          </div>

          <div className="p-0 flex-1 flex flex-col">
            <div className="flex flex-col">
              {config.logs.map(log => (
                <div key={log.id} className="flex gap-4 p-4 border-b border-border hover:bg-secondary/20 transition-colors">
                  <div className={`mt-0.5 ${log.type === "success" ? "text-green-500" : log.type === "info" ? "text-blue-500" : log.type === "warning" ? "text-yellow-500" : "text-red-500"}`}>
                    {log.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : log.type === "info" ? <RefreshCw className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-foreground">{log.message}</p>
                    <span className="text-xs text-muted-foreground mt-0.5">{log.date}</span>
                  </div>
                </div>
              ))}
              
              {config.logs.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Nenhum log registrado ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
