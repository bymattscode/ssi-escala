import { createFileRoute } from "@tanstack/react-router";
import { BookMarked, GraduationCap, ShieldCheck, ShieldAlert, Sparkles, CheckSquare } from "lucide-react";

export const Route = createFileRoute("/manual-de-funcao")({
  component: ManualDeFuncaoPage,
});

function ManualDeFuncaoPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                Manual de Função
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Em Construção
                </span>
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Instruções operacionais, atribuições de cargos e procedimentos padrão de atuação.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder container */}
      <div className="bg-card border border-border/70 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <BookMarked className="w-64 h-64 text-foreground" />
        </div>

        <div className="h-20 w-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center text-primary mb-5 shadow-inner">
          <GraduationCap className="h-10 w-10" />
        </div>

        <h2 className="text-2xl font-bold text-foreground tracking-tight max-w-md">
          Manual de Função em Desenvolvimento
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mt-2 leading-relaxed">
          Esta área reunirá os guias de conduta, fluxos de fiscalização, preenchimento de escalas e análise de casos para cada nível hierárquico do setor. O conteúdo será adicionado em breve.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-8 pt-8 border-t border-border/50">
          <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Fiscalizadores</h3>
            <p className="text-xs text-muted-foreground">Postura em ronda, abertura de casos e envio de relatórios.</p>
            <span className="text-[10px] font-medium text-muted-foreground/80 bg-secondary px-2 py-0.5 rounded-full mt-1 border border-border/50">Aguardando envio</span>
          </div>

          <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-sm text-foreground">Diretores</h3>
            <p className="text-xs text-muted-foreground">Julgamento de casos, aplicação de sanções e auditoria.</p>
            <span className="text-[10px] font-medium text-muted-foreground/80 bg-secondary px-2 py-0.5 rounded-full mt-1 border border-border/50">Aguardando envio</span>
          </div>

          <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Gestão de Escalas</h3>
            <p className="text-xs text-muted-foreground">Prazos de envio de prints, justificativas e compensações.</p>
            <span className="text-[10px] font-medium text-muted-foreground/80 bg-secondary px-2 py-0.5 rounded-full mt-1 border border-border/50">Aguardando envio</span>
          </div>
        </div>
      </div>
    </div>
  );
}
