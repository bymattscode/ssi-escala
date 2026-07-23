import { createFileRoute } from "@tanstack/react-router";
import { Settings, Save } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1">Ajustes do sistema e integrações.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Save className="h-4 w-4" />
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Escala Automática
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Dia da geração</label>
              <select className="bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors">
                <option>Domingo</option>
                <option>Segunda-feira</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Dias de antecedência</label>
              <input type="number" defaultValue={2} className="bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Google Sheets</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">ID da Planilha (Spreadsheet ID)</label>
              <input type="text" placeholder="1A2B3C4D5E6F7G8H9I0J" className="bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground">
              A Service Account deve ter permissão de edição nesta planilha.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
