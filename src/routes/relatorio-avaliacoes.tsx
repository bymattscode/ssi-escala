import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Construction } from "lucide-react";

export const Route = createFileRoute("/relatorio-avaliacoes")({
  component: RelatorioAvaliacoesPage,
});

function RelatorioAvaliacoesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              Relatório de Avaliações
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Em Construção
              </span>
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Relatórios e métricas de avaliações dos fiscalizadores.
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo em branco para desenvolvimento futuro */}
      <div className="bg-card border border-border/70 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
        <Construction className="h-10 w-10 text-muted-foreground/60 mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Página em Branco</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Este espaço está reservado para a construção futura do Relatório de Avaliações.
        </p>
      </div>
    </div>
  );
}
