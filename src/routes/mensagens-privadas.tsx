import { createFileRoute } from "@tanstack/react-router";
import { 
  MessageSquareLock, 
  Copy, 
  Check, 
  Calendar, 
  ExternalLink, 
  Eye, 
  Code2, 
  RotateCcw,
  ShieldAlert,
  Send,
  FileText
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/mensagens-privadas")({
  component: MensagensPrivadasPage,
});

type TabType = "convocacao" | "punicao" | "orientacao";

const MONTHS_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

function getTodayFormatted(): string {
  const now = new Date();
  // Horário de Brasília (UTC-3)
  const b = new Date(now.getTime() - 3 * 3600 * 1000);
  const day = String(b.getUTCDate()).padStart(2, "0");
  const month = MONTHS_PT[b.getUTCMonth()];
  const year = b.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export function MensagensPrivadasPage() {
  const [activeTab, setActiveTab] = useState<TabType>("convocacao");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");

  // Campos do formulário
  const [data, setData] = useState<string>(getTodayFormatted());
  const [provas, setProvas] = useState<string>("");
  const [username, setUsername] = useState<string>("{USERNAME}");
  
  // Campos específicos de Punição
  const [descricao, setDescricao] = useState<string>("");
  const [orientacoes, setOrientacoes] = useState<string>("");
  const [tipoPunicao, setTipoPunicao] = useState<string>("");
  const [crime, setCrime] = useState<string>("");
  const [secao, setSecao] = useState<string>("");

  // Campos específicos de Notificação de Orientação
  const [descOrientacao, setDescOrientacao] = useState<string>("");
  const [oriOrientacao, setOriOrientacao] = useState<string>("");

  const handleSetToday = () => {
    const today = getTodayFormatted();
    setData(today);
    toast.info(`Data atualizada para ${today}`);
  };

  const handleClear = () => {
    setProvas("");
    setDescricao("");
    setOrientacoes("");
    setTipoPunicao("");
    setCrime("");
    setSecao("");
    setDescOrientacao("");
    setOriOrientacao("");
    toast.info("Campos limpos com sucesso.");
  };

  // Geradores de BBCode fieis aos modelos originais
  const generatedBBCode = useMemo(() => {
    const dateStr = data.trim() || getTodayFormatted();
    const userStr = username.trim() || "{USERNAME}";

    if (activeTab === "convocacao") {
      const linkStr = provas.trim() || "INSERIR LINK";
      return `[center][table style="border-collapse: collapse; border-radius: 20px; overflow: hidden; width:100%; height:100%; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 4px solid #333333;" bgcolor="#1e2a4d"][tr][td][img]https://i.imgur.com/WVgmuES.gif[/img]

[center][table bgcolor="#f8f8ff" style="border-radius: 16px; overflow: hidden; width: 100%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td][font=Poppins][center][table bgcolor="#1e2a4d" style="border-radius: 14px 5px; overflow: hidden; width: 100%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td][color=#ffffff][size=18][b]CONVOCAÇÃO[/b][/size][/color][/td][/tr][/table][/center]

Saudações, [b]${userStr}[/b]!

O [b][color=#1e2a4d]Setor de Segurança dos Instrutores[/color][/b], por meio de uma fiscalização dos formulários de aulas, observou que alguns erros foram cometidos na postagem de sua aplicação ao longo da semana, na data de [b]${dateStr}[/b].

[center][table bgcolor="C5D7F2" style="border-radius: 14px; overflow: hidden; width: 100%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td][left][b]➥ Provas da infração:[/b] ${linkStr} [/left][/td][/tr][/table][/center]

[justify]➥ Através desta Mensagem Privada, você está sendo convocado a procurar o membro que lhe enviou essa mensagem privada, por meio do habbo hotel, em quaisquer dependências da polícia ou mesmo via console, em até 24 horas após o recebimento deste contato. Caso não o faça, será devidamente punido pelo crime cometido de acordo com o Código Penal dos Instrutores. Em caso de dúvidas, [b]contate um membro do Setor de Segurança dos Instrutores[/b].

[/justify][/center][/td][/tr][/table][/center][/font]
[font=Poppins][size=12][color=#f8f8ff][b]Reservam-se os direitos à Companhia dos Instrutores[/b][/color][/size][/font][/td][/tr][/table][/center]`;
    }

    if (activeTab === "punicao") {
      const linkStr = provas.trim() || "INSERIR LINK";
      const descStr = descricao.trim() || "DESCRIÇÃO";
      const oriStr = orientacoes.trim() || "ORIENTAÇÃO";
      const punStr = tipoPunicao.trim() || "INFORMAR PUNIÇÃO";
      const crimeStr = crime.trim() || "INFORMAR CRIME";
      const secStr = secao.trim() || "INFORMAR SEÇÃO";

      return `[center][table style="border-collapse: collapse; border-radius: 20px; overflow: hidden; width:100%; height:100%; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 4px solid #333333;" bgcolor="#1e2a4d"][tr][td][img]https://i.imgur.com/WVgmuES.gif[/img]

[center][table bgcolor="#f8f8ff" style="border-radius: 16px; overflow: hidden; width: 100%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td][font=Poppins][center][table bgcolor="#1e2a4d" style="border-radius: 14px 5px; overflow: hidden; width: 100%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td][color=#ffffff][size=18][b]PUNIÇÃO POR INFRAÇÃO[/b][/size][/color][/td][/tr][/table][/center]

Saudações, [b]${userStr}[/b]!

O [color=#1e2a4d]Setor de Segurança dos Instrutores[/color], por meio de uma fiscalização dos formulários de aulas, observou que alguns erros foram cometidos na postagem de sua aplicação ao longo da semana, na data de [b]${dateStr}[/b].

[center][table bgcolor="C5D7F2" style="border-radius: 14px; overflow: hidden; width: 100%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td][center][table bgcolor="1e2a4d" style="border-radius: 14px 5px; overflow: hidden; width: 40%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td style="padding: 9px;"][color=#ffffff][b]RESOLUÇÃO[/b][/color][/td][/tr][/table][/center]

[left]➥ [b]Descrição da infração:[/b] ${descStr} [/left]
[left]➥ [b]Provas da infração:[/b] ${linkStr} [/left]
[left]➥ [b]Orientações:[/b] ${oriStr} [/left]
[/td][/tr][/table][/center]

➥ Através desta Mensagem Privada, você está sendo notificado que foi punido com [b]${punStr}[/b] pelo crime de [b]${crimeStr}[/b], disposto na seção [b]${secStr}[/b] do Código Penal dos Instrutores. Em caso de dúvidas sobre a punição, [b]procure um membro do Setor de Segurança dos Instrutores[/b].
[/td][/tr][/table][/center][/font]
[font=Poppins][size=12][color=#f8f8ff][b] Reservam-se os direitos à Companhia dos Instrutores[/b][/color][/size][/font][/td][/tr][/table][/center]`;
    }

    // Tab Notificação de Orientação
    const linkStr = provas.trim() || "INSERIR LINK";
    const descStr = descOrientacao.trim();
    const oriStr = oriOrientacao.trim();

    let middleBoxContent = "";
    if (!descStr && !oriStr) {
      middleBoxContent = `[b][left]DESCRIÇÃO:[/left][/b][b][left]PROVAS: ${linkStr}[/left][/b][b][left]ORIENTAÇÃO:[/left][/b]`;
    } else {
      middleBoxContent = `[b][left]DESCRIÇÃO:[/left][/b] ${descStr || "DESCRIÇÃO"}\n[b][left]PROVAS: ${linkStr}[/left][/b]\n[b][left]ORIENTAÇÃO:[/left][/b] ${oriStr || "ORIENTAÇÃO"}`;
    }

    return `[center][table style="border-collapse: collapse; border-radius: 20px; overflow: hidden; width:100%; height:100%; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 4px solid #333333;" bgcolor="#1e2a4d"][tr][td][img]https://i.imgur.com/WVgmuES.gif[/img]

[center][table bgcolor="#f8f8ff" style="border-radius: 16px; overflow: hidden; width: 100%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td][font=Poppins][center][table bgcolor="#1e2a4d" style="border-radius: 14px 5px; overflow: hidden; width: 100%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td][color=#ffffff][size=18][b]NOTIFICAÇÃO DE ORIENTAÇÃO[/b][/size][/color][/td][/tr][/table][/center]

Saudações, [b][color=#1e2a4d]instrutor[/color] ${userStr}[/b]!

Por meio desta Mensagem Privada, informa-se que você está sendo orientado em relação a uma conduta errônea identificada na [b][color=#1e2a4d]Companhia dos Instrutores[/color][/b]. A seguir, serão apresentadas as informações e evidências referentes ao ocorrido:

[center][table bgcolor="C5D7F2" style="border-radius: 14px; overflow: hidden; width: 100%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td]${middleBoxContent}[/td][/tr][/table][/center]

É necessário destacar que essa Mensagem Privada não se configura como uma notificação formal de uma punição, mas sim uma notificação com o intuito de orientar acerca de um erro cometido.

[center][table bgcolor="C5D7F2" style="border-radius: 14px; overflow: hidden; width: 100%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td][center][table bgcolor="1e2a4d" style="border-radius: 14px 5px; overflow: hidden; width: 40%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);"][tr][td style="padding: 9px;"][color=#ffffff][b]ORIENTAÇÕES[/b][/color][/td][/tr][/table][/center]

[justify][color=#1e2a4d]➥[/color] Caso possua alguma dúvida sobre sua meta ou a companhia no geral, você pode responder esta Mensagem Privada com sua dúvida, bem como procurar algum superior na companhia para saná-la;

[color=#1e2a4d]➥[/color] Caso necessário, lembre-se de reler o script de formação referente ao seu cargo, de modo a lembrar-se de eventuais detalhes e procedimentos a serem realizados.[/justify][/td][/tr][/table][/center][/td][/tr][/table][/center][/font]
[font=Poppins][size=12][color=#f8f8ff][b]Reservam-se os direitos à Companhia dos Instrutores[/b][/color][/size][/font][/td][/tr][/table][/center]`;
  }, [activeTab, data, provas, username, descricao, orientacoes, tipoPunicao, crime, secao, descOrientacao, oriOrientacao]);

  const handleCopy = useCallback(() => {
    if (!navigator.clipboard) {
      toast.error("Área de transferência indisponível no navegador.");
      return;
    }
    navigator.clipboard.writeText(generatedBBCode).then(() => {
      setCopied(true);
      toast.success("BBCode gerado e copiado com sucesso para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      toast.error("Erro ao copiar BBCode.");
    });
  }, [generatedBBCode]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm shadow-primary/10">
            <MessageSquareLock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              Central de Mensagens Privadas
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Gerador Oficial
              </span>
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Gerador padronizado de BBCode para envio de Mensagens Privadas no Fórum da RCC.
            </p>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/40 hover:bg-secondary border border-border/70 rounded-xl flex items-center gap-1.5 transition-all"
            title="Limpar todos os campos"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl flex items-center gap-2 shadow-sm shadow-primary/20 transition-all active:scale-95"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado!" : "Copiar BBCode"}
          </button>
        </div>
      </div>

      {/* Main Generator Card */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        {/* Banner com Identidade Visual dos Instrutores */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#0e172e] via-[#091022] to-[#060b17] border-b border-border/80 pt-8 pb-6 px-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1e2a4d]/70 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-950/50 mb-3 overflow-hidden">
              <img 
                src="https://i.imgur.com/WVgmuES.gif" 
                alt="Insignia dos Instrutores" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase drop-shadow-md">
              INSTRUTORES
            </h2>
            <p className="text-xs text-blue-400/90 font-medium tracking-wide mt-0.5">
              Setor de Segurança dos Instrutores • Gerador de MPs
            </p>
          </div>
        </div>

        {/* Tab Navigation (Idêntico ao Gerador Original) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-2.5 bg-[#080d1a] border-b border-border/70">
          <button
            type="button"
            onClick={() => setActiveTab("convocacao")}
            className={cn(
              "py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border",
              activeTab === "convocacao"
                ? "bg-gradient-to-r from-blue-600/30 to-sky-600/20 text-white border-blue-500 shadow-md shadow-blue-500/10 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-transparent"
            )}
          >
            <Send className="h-4 w-4" />
            Convocação
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("punicao")}
            className={cn(
              "py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border",
              activeTab === "punicao"
                ? "bg-gradient-to-r from-blue-600/30 to-sky-600/20 text-white border-blue-500 shadow-md shadow-blue-500/10 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-transparent"
            )}
          >
            <ShieldAlert className="h-4 w-4" />
            Punição por Infração
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orientacao")}
            className={cn(
              "py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border",
              activeTab === "orientacao"
                ? "bg-gradient-to-r from-blue-600/30 to-sky-600/20 text-white border-blue-500 shadow-md shadow-blue-500/10 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-transparent"
            )}
          >
            <FileText className="h-4 w-4" />
            Notificação de Orientação
          </button>
        </div>

        {/* Formulário Principal */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Campo de Data (Comum a todas as abas) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              Data (DD MMM AAAA):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder="Ex: 21 Set 2026"
                className="flex-1 bg-secondary/40 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all font-mono"
              />
              <button
                type="button"
                onClick={handleSetToday}
                className="px-4 py-3 bg-secondary/60 hover:bg-secondary border border-border/80 rounded-xl text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all hover:border-primary/50 shadow-sm"
                title="Inserir data atual de Brasília"
              >
                <Calendar className="h-4 w-4 text-primary" />
                <span>Hoje</span>
              </button>
            </div>
          </div>

          {/* Campo de Provas (Comum a todas as abas) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Provas da Infração (Link):</span>
              {provas.startsWith("http") && (
                <a
                  href={provas}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-normal lowercase"
                >
                  abrir link <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </label>
            <input
              type="text"
              value={provas}
              onChange={(e) => setProvas(e.target.value)}
              placeholder="https://imgur.com/..."
              className="w-full bg-secondary/40 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all font-mono"
            />
          </div>

          {/* Campos Específicos: PUNIÇÃO POR INFRAÇÃO */}
          {activeTab === "punicao" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Descrição da Infração */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Descrição da Infração:
                </label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o erro cometido..."
                  className="w-full bg-secondary/40 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/50 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all resize-none"
                />
              </div>

              {/* Orientações da Punição */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Orientações da Punição:
                </label>
                <input
                  type="text"
                  value={orientacoes}
                  onChange={(e) => setOrientacoes(e.target.value)}
                  placeholder="Ex: Evitar postagem duplicada"
                  className="w-full bg-secondary/40 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
                />
              </div>

              {/* Tipo de Punição */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo de Punição:
                </label>
                <input
                  type="text"
                  value={tipoPunicao}
                  onChange={(e) => setTipoPunicao(e.target.value)}
                  placeholder="Ex: Advertência Escrita"
                  className="w-full bg-secondary/40 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
                />
                {/* Sugestões Rápidas */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Observação", "Advertência Escrita", "Advertência Interna", "Rebaixamento", "Expulsão"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTipoPunicao(p)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-secondary/60 hover:bg-primary/20 hover:text-primary border border-border/70 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crime Cometido */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Crime cometido:
                </label>
                <input
                  type="text"
                  value={crime}
                  onChange={(e) => setCrime(e.target.value)}
                  placeholder="Ex: Postagem incorreta"
                  className="w-full bg-secondary/40 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
                />
                {/* Sugestões Rápidas de Crimes do CPI */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Postagem incorreta", "Ausência injustificada", "Erro de aplicação", "Insubordinação", "Dano Institucional"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCrime(c)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-secondary/60 hover:bg-primary/20 hover:text-primary border border-border/70 transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seção do Código Penal */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Seção do Código Penal:
                </label>
                <input
                  type="text"
                  value={secao}
                  onChange={(e) => setSecao(e.target.value)}
                  placeholder="Ex: Capítulo III, Seção I, Art. 2°"
                  className="w-full bg-secondary/40 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
                />
                {/* Sugestões Rápidas de Seções */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Capítulo II, Seção I, Art. 5° (Observação)",
                    "Capítulo II, Seção II, Art. 6° (Erro de Postagem)",
                    "Capítulo II, Seção III, Art. 7° (Advertência)",
                    "Capítulo III, Art. 10 (Crimes)"
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSecao(s.split(" (")[0])}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-secondary/60 hover:bg-primary/20 hover:text-primary border border-border/70 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Campos Específicos: NOTIFICAÇÃO DE ORIENTAÇÃO */}
          {activeTab === "orientacao" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Descrição da Conduta / Erro:
                </label>
                <textarea
                  rows={3}
                  value={descOrientacao}
                  onChange={(e) => setDescOrientacao(e.target.value)}
                  placeholder="Descreva a conduta ou erro observado..."
                  className="w-full bg-secondary/40 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/50 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Orientações:
                </label>
                <input
                  type="text"
                  value={oriOrientacao}
                  onChange={(e) => setOriOrientacao(e.target.value)}
                  placeholder="Ex: Reler atentamente o script de formação antes de aplicar a aula..."
                  className="w-full bg-secondary/40 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
                />
              </div>
            </div>
          )}

          {/* Botão Principal em Destaque: GERAR E COPIAR BBCODE */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-4 px-6 rounded-xl font-bold text-white tracking-widest text-sm sm:text-base uppercase bg-gradient-to-r from-[#0284c7] via-[#2563eb] to-[#1d4ed8] hover:from-[#0369a1] hover:to-[#1e40af] shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-3 border border-blue-400/30 group cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 text-emerald-300 animate-bounce" />
                  <span>BBCODE COPIADO COM SUCESSO!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 text-blue-200 group-hover:scale-110 transition-transform" />
                  <span>GERAR E COPIAR BBCODE</span>
                </>
              )}
            </button>
          </div>

          {/* Visualização de Saída (BBCode & Pré-visualização do Fórum) */}
          <div className="pt-4 border-t border-border/60 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {viewMode === "code" ? "BBCode Gerado" : "Pré-visualização no Fórum"}
                </label>
                <span className="text-[11px] text-muted-foreground/70 font-mono bg-secondary/60 px-2 py-0.5 rounded">
                  {generatedBBCode.length} caracteres
                </span>
              </div>

              {/* Alternador Código / Prévia */}
              <div className="flex items-center bg-secondary/40 border border-border/70 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("code")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                    viewMode === "code"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Código
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                    viewMode === "preview"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Prévia Fórum
                </button>
              </div>
            </div>

            {viewMode === "code" ? (
              <div className="relative">
                <textarea
                  readOnly
                  rows={9}
                  value={generatedBBCode}
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  className="w-full bg-[#070c17] border border-[#1e2a4d] rounded-xl p-4 font-mono text-xs sm:text-[13px] text-sky-200/90 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-y select-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-sm shadow-sm cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            ) : (
              /* Pré-visualização autêntica de como fica no fórum phpBB da RCC */
              <div className="bg-[#0b1120] border border-[#1e2a4d] rounded-xl p-4 sm:p-6 overflow-x-auto">
                <div className="max-w-[620px] mx-auto bg-[#1e2a4d] border-4 border-[#333333] rounded-[20px] overflow-hidden shadow-2xl p-0.5 text-slate-800">
                  {/* GIF Header */}
                  <div className="w-full flex justify-center bg-[#1e2a4d] p-1">
                    <img 
                      src="https://i.imgur.com/WVgmuES.gif" 
                      alt="Banner" 
                      className="max-w-full h-auto"
                      onError={(e) => { e.currentTarget.style.display = "none"; }} 
                    />
                  </div>

                  {/* White Card */}
                  <div className="bg-[#f8f8ff] rounded-[16px] p-5 shadow-md m-2 font-sans text-left">
                    {/* Header Title Badge */}
                    <div className="bg-[#1e2a4d] text-white text-center py-2 px-4 rounded-[14px] shadow-sm mb-4 font-bold text-base tracking-wider uppercase">
                      {activeTab === "convocacao" && "CONVOCAÇÃO"}
                      {activeTab === "punicao" && "PUNIÇÃO POR INFRAÇÃO"}
                      {activeTab === "orientacao" && "NOTIFICAÇÃO DE ORIENTAÇÃO"}
                    </div>

                    {/* Greeting */}
                    <p className="text-sm text-slate-900 font-semibold mb-3">
                      Saudações, <span className="text-[#1e2a4d] font-bold">{activeTab === "orientacao" ? "instrutor " : ""}{username || "{USERNAME}"}</span>!
                    </p>

                    {/* Intro paragraph */}
                    {activeTab === "orientacao" ? (
                      <p className="text-xs leading-relaxed text-slate-700 mb-3">
                        Por meio desta Mensagem Privada, informa-se que você está sendo orientado em relação a uma conduta errônea identificada na <b className="text-[#1e2a4d]">Companhia dos Instrutores</b>. A seguir, serão apresentadas as informações e evidências referentes ao ocorrido:
                      </p>
                    ) : (
                      <p className="text-xs leading-relaxed text-slate-700 mb-3">
                        O <b className="text-[#1e2a4d]">Setor de Segurança dos Instrutores</b>, por meio de uma fiscalização dos formulários de aulas, observou que alguns erros foram cometidos na postagem de sua aplicação ao longo da semana, na data de <b>{data || getTodayFormatted()}</b>.
                      </p>
                    )}

                    {/* Blue Details Box */}
                    <div className="bg-[#C5D7F2] rounded-[14px] p-4 text-xs shadow-sm mb-3 space-y-2 text-slate-900">
                      {activeTab === "convocacao" && (
                        <p><b>➥ Provas da infração:</b> {provas.trim() || "INSERIR LINK"}</p>
                      )}

                      {activeTab === "punicao" && (
                        <>
                          <div className="flex justify-center mb-2">
                            <div className="bg-[#1e2a4d] text-white text-center py-1.5 px-6 rounded-[14px] text-xs font-bold w-48 shadow-sm">
                              RESOLUÇÃO
                            </div>
                          </div>
                          <p><b>➥ Descrição da infração:</b> {descricao.trim() || "DESCRIÇÃO"}</p>
                          <p><b>➥ Provas da infração:</b> {provas.trim() || "INSERIR LINK"}</p>
                          <p><b>➥ Orientações:</b> {orientacoes.trim() || "ORIENTAÇÃO"}</p>
                        </>
                      )}

                      {activeTab === "orientacao" && (
                        <>
                          <p><b>DESCRIÇÃO:</b> {descOrientacao.trim() || "Descreva a conduta..."}</p>
                          <p><b>PROVAS:</b> {provas.trim() || "INSERIR LINK"}</p>
                          <p><b>ORIENTAÇÃO:</b> {oriOrientacao.trim() || "Orientações..."}</p>
                        </>
                      )}
                    </div>

                    {/* Closing body text */}
                    {activeTab === "convocacao" && (
                      <p className="text-xs leading-relaxed text-slate-700 text-justify mb-2">
                        ➥ Através desta Mensagem Privada, você está sendo convocado a procurar o membro que lhe enviou essa mensagem privada, por meio do habbo hotel, em quaisquer dependências da polícia ou mesmo via console, em até 24 horas após o recebimento deste contato. Caso não o faça, será devidamente punido pelo crime cometido de acordo com o Código Penal dos Instrutores. Em caso de dúvidas, <b>contate um membro do Setor de Segurança dos Instrutores</b>.
                      </p>
                    )}

                    {activeTab === "punicao" && (
                      <p className="text-xs leading-relaxed text-slate-700 text-justify mb-2">
                        ➥ Através desta Mensagem Privada, você está sendo notificado que foi punido com <b>{tipoPunicao.trim() || "INFORMAR PUNIÇÃO"}</b> pelo crime de <b>{crime.trim() || "INFORMAR CRIME"}</b>, disposto na seção <b>{secao.trim() || "INFORMAR SEÇÃO"}</b> do Código Penal dos Instrutores. Em caso de dúvidas sobre a punição, <b>procure um membro do Setor de Segurança dos Instrutores</b>.
                      </p>
                    )}

                    {activeTab === "orientacao" && (
                      <>
                        <p className="text-xs leading-relaxed text-slate-700 mb-3">
                          É necessário destacar que essa Mensagem Privada não se configura como uma notificação formal de uma punição, mas sim uma notificação com o intuito de orientar acerca de um erro cometido.
                        </p>
                        <div className="bg-[#C5D7F2] rounded-[14px] p-4 text-xs shadow-sm mb-2 text-slate-900 space-y-2">
                          <div className="flex justify-center mb-1">
                            <div className="bg-[#1e2a4d] text-white text-center py-1 px-6 rounded-[14px] text-xs font-bold w-48 shadow-sm">
                              ORIENTAÇÕES
                            </div>
                          </div>
                          <p className="text-justify leading-relaxed">
                            <span className="text-[#1e2a4d] font-bold">➥</span> Caso possua alguma dúvida sobre sua meta ou a companhia no geral, você pode responder esta Mensagem Privada com sua dúvida, bem como procurar algum superior na companhia para saná-la;
                          </p>
                          <p className="text-justify leading-relaxed">
                            <span className="text-[#1e2a4d] font-bold">➥</span> Caso necessário, lembre-se de reler o script de formação referente ao seu cargo, de modo a lembrar-se de eventuais detalhes e procedimentos a serem realizados.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="text-center py-2 text-[11px] text-[#f8f8ff] font-semibold">
                    Reservam-se os direitos à Companhia dos Instrutores
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé e Créditos (Idêntico ao policiarcc.com) */}
          <div className="text-center pt-4 border-t border-border/50 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground/90">Desenvolvido por yycecedilha</p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Setor de Segurança dos Instrutores • Fórum Policial RCC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
