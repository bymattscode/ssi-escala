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
  FileText,
  Gavel,
  BookOpen
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/mensagens-privadas")({
  component: MensagensPrivadasPage,
});

type TabType = "convocacao" | "punicao" | "orientacao";

const MONTHS_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

interface CrimeCpiMapping {
  label: string;
  value: string;
  secao: string;
  punicaoPadrao: string;
}

const CRIMES_CPI: CrimeCpiMapping[] = [
  {
    label: "Postagem incorreta",
    value: "Postagem incorreta",
    secao: "Capítulo III, Seção I, Art. 2°",
    punicaoPadrao: "Observação",
  },
  {
    label: "Ausência injustificada",
    value: "Ausência injustificada",
    secao: "Capítulo III, Seção VII, Art. 1°",
    punicaoPadrao: "Rebaixamento",
  },
  {
    label: "Erro de aplicação",
    value: "Erro de aplicação",
    secao: "Capítulo III, Seção III, Art. 1°",
    punicaoPadrao: "Observação",
  },
  {
    label: "Manipulação de script",
    value: "Manipulação de script",
    secao: "Capítulo III, Seção II, Art. 1°",
    punicaoPadrao: "Advertência Interna",
  },
  {
    label: "Abandono de dever / Negligência",
    value: "Abandono de dever / Negligência",
    secao: "Capítulo III, Seção III, Art. 1°",
    punicaoPadrao: "Advertência Interna",
  },
  {
    label: "Conduta imprópria",
    value: "Conduta imprópria",
    secao: "Capítulo III, Seção IV, Art. 1°",
    punicaoPadrao: "Advertência Interna",
  },
  {
    label: "Insubordinação",
    value: "Insubordinação",
    secao: "Capítulo III, Seção IV, Art. 1°",
    punicaoPadrao: "Advertência Interna",
  },
  {
    label: "Dano Institucional",
    value: "Dano Institucional",
    secao: "Capítulo III, Seção IV, Art. 1°",
    punicaoPadrao: "Advertência Interna",
  },
  {
    label: "Abuso de poder",
    value: "Abuso de poder",
    secao: "Capítulo III, Seção V, Art. 1°",
    punicaoPadrao: "Advertência Interna",
  },
  {
    label: "Falsificação de informações",
    value: "Falsificação de informações",
    secao: "Capítulo III, Seção VI, Art. 1°",
    punicaoPadrao: "Advertência Interna",
  },
  {
    label: "Insuficiência para o cargo",
    value: "Insuficiência para o cargo",
    secao: "Capítulo III, Seção VII, Art. 1°",
    punicaoPadrao: "Rebaixamento",
  },
  {
    label: "Quebra de sigilo",
    value: "Quebra de sigilo",
    secao: "Capítulo III, Seção VIII, Art. 1°",
    punicaoPadrao: "Advertência Interna",
  },
  {
    label: "Perturbação à instrução",
    value: "Perturbação à instrução",
    secao: "Capítulo III, Seção IX, Art. 1°",
    punicaoPadrao: "Observação",
  },
  {
    label: "Obstrução à justiça",
    value: "Obstrução à justiça",
    secao: "Capítulo III, Seção X, Art. 1°",
    punicaoPadrao: "Advertência Interna",
  },
  {
    label: "Reincidência",
    value: "Reincidência",
    secao: "Capítulo II, Seção VI, Art. 1°",
    punicaoPadrao: "Advertência Interna",
  },
];

function findCrimeMapping(text: string): CrimeCpiMapping | undefined {
  const normalize = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const clean = normalize(text);
  if (!clean || clean.length < 3) return undefined;

  return CRIMES_CPI.find((c) => {
    const val = normalize(c.value);
    const lab = normalize(c.label);
    return clean === val || clean === lab || clean.includes(val) || val.includes(clean) || clean.includes(lab) || lab.includes(clean);
  });
}

function getTodayFormatted(): string {
  const now = new Date();
  // Horário de Brasília (UTC-3)
  const b = new Date(now.getTime() - 3 * 3600 * 1000);
  const day = String(b.getUTCDate()).padStart(2, "0");
  const month = MONTHS_PT[b.getUTCMonth()];
  const year = b.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function parseDateFromInput(inputStr: string): Date | undefined {
  const parts = inputStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthIdx = MONTHS_PT.findIndex(
      (m) => m.toLowerCase() === parts[1].toLowerCase()
    );
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
      return new Date(year, monthIdx, day);
    }
  }
  return undefined;
}

export function MensagensPrivadasPage() {
  const [activeTab, setActiveTab] = useState<TabType>("convocacao");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Campos do formulário
  const [data, setData] = useState<string>(getTodayFormatted());
  const [provas, setProvas] = useState<string>("");
  
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

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return;
    const day = String(selected.getDate()).padStart(2, "0");
    const month = MONTHS_PT[selected.getMonth()];
    const year = selected.getFullYear();
    const formatted = `${day} ${month} ${year}`;
    setData(formatted);
    setIsCalendarOpen(false);
    toast.success(`Data selecionada: ${formatted}`);
  };

  const handleSelectCrime = (selectedCrime: string) => {
    setCrime(selectedCrime);
    const found = findCrimeMapping(selectedCrime);
    if (found) {
      setSecao(found.secao);
      if (!tipoPunicao || tipoPunicao === "INFORMAR PUNIÇÃO") {
        setTipoPunicao(found.punicaoPadrao);
      }
      toast.success(`Seção do CPI vinculada automaticamente: ${found.secao}`);
    }
  };

  const handleCrimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCrime(val);
    const found = findCrimeMapping(val);
    if (found) {
      setSecao(found.secao);
    }
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
    setData(getTodayFormatted());
    toast.info("Campos limpos com sucesso.");
  };

  // Geradores de BBCode fieis aos modelos oficiais da RCC
  const generatedBBCode = useMemo(() => {
    const dateStr = data.trim() || getTodayFormatted();
    const userStr = "{USERNAME}";

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
  }, [activeTab, data, provas, descricao, orientacoes, tipoPunicao, crime, secao, descOrientacao, oriOrientacao]);

  const handleCopy = useCallback(() => {
    if (!navigator.clipboard) {
      toast.error("Área de transferência indisponível no navegador.");
      return;
    }
    navigator.clipboard.writeText(generatedBBCode).then(() => {
      setCopied(true);
      toast.success("BBCode copiado com sucesso para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      toast.error("Erro ao copiar BBCode.");
    });
  }, [generatedBBCode]);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Cabeçalho Padrão SSI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <MessageSquareLock className="h-8 w-8 text-primary" />
            Central de Mensagens Privadas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerador padronizado de BBCode para envio de Mensagens Privadas do Setor de Segurança dos Instrutores.
          </p>
        </div>

        {/* Ações Rápidas no Topo */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center gap-2 border border-border bg-background hover:bg-secondary/50 px-3.5 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-sm w-full sm:w-auto"
            title="Limpar todos os campos"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Limpar</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm transition-all shadow-sm cursor-pointer w-full sm:w-auto"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Copiado!" : "Copiar BBCode"}</span>
          </button>
        </div>
      </div>

      {/* Navegação por Abas Limpas */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("convocacao")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
            activeTab === "convocacao"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent hover:border-border"
          }`}
        >
          <Send className="h-4 w-4" />
          <span>Convocação</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("punicao")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
            activeTab === "punicao"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent hover:border-border"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Punição por Infração</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orientacao")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
            activeTab === "orientacao"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent hover:border-border"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Notificação de Orientação</span>
        </button>
      </div>

      {/* Card Principal do Formulário */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Cabeçalho do Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-border bg-secondary/10 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              {activeTab === "convocacao" && <Send className="h-4 w-4" />}
              {activeTab === "punicao" && <ShieldAlert className="h-4 w-4 text-orange-500" />}
              {activeTab === "orientacao" && <FileText className="h-4 w-4 text-blue-500" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {activeTab === "convocacao" && "Dados para Convocação de Militar"}
                {activeTab === "punicao" && "Dados da Punição por Infração (CPI)"}
                {activeTab === "orientacao" && "Dados da Notificação de Orientação"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {activeTab === "convocacao" && "Convoque o policial militar para averiguação presencial no Habbo Hotel dentro de 24h."}
                {activeTab === "punicao" && "Notificação formal de punição disciplinar conforme o Código Penal dos Instrutores."}
                {activeTab === "orientacao" && "Notificação pedagógica orientativa em relação a uma conduta errônea observada."}
              </p>
            </div>
          </div>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Data do Fato */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Data (DD MMM AAAA):</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder="Ex: 23 Set 2026"
                className="flex-1 bg-background border border-border rounded-md px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm font-mono"
              />

              {/* Popover com Calendário */}
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="px-3 py-2 bg-background hover:bg-secondary/50 border border-border rounded-md text-sm font-medium text-foreground flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    title="Abrir calendário para escolher data"
                  >
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">Calendário</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3 border-border bg-card shadow-2xl rounded-xl" align="end">
                  <CalendarPicker
                    mode="single"
                    selected={parseDateFromInput(data)}
                    onSelect={handleDateSelect}
                    locale={ptBR}
                    initialFocus
                    className="rounded-lg bg-transparent text-foreground"
                  />
                  <div className="pt-2 mt-2 border-t border-border flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSetToday();
                        setIsCalendarOpen(false);
                      }}
                      className="text-xs font-medium text-primary hover:underline px-2 py-1 rounded hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      Definir Hoje ({getTodayFormatted()})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary transition-colors cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              <button
                type="button"
                onClick={handleSetToday}
                className="px-3 py-2 bg-background hover:bg-secondary/50 border border-border rounded-md text-sm font-medium text-muted-foreground hover:text-foreground shadow-sm transition-colors cursor-pointer"
                title="Preencher rapidamente com a data de hoje"
              >
                Hoje
              </button>
            </div>
          </div>

          {/* Campo de Provas da Infração (Comum a todas as abas) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Provas da Infração (Link):
              </label>
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
            </div>
            <input
              type="text"
              value={provas}
              onChange={(e) => setProvas(e.target.value)}
              placeholder="https://imgur.com/..."
              className="w-full bg-background border border-border rounded-md px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm font-mono"
            />
          </div>

          {/* ================================================================= */}
          {/* CAMPOS ESPECÍFICOS: PUNIÇÃO POR INFRAÇÃO                          */}
          {/* ================================================================= */}
          {activeTab === "punicao" && (
            <div className="space-y-4 pt-2 border-t border-border animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seleção do Crime do CPI */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Gavel className="h-3.5 w-3.5 text-primary" />
                    <span>Crime Cometido (Código Penal CPI):</span>
                  </label>
                  <select
                    value={crime}
                    onChange={(e) => handleSelectCrime(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm cursor-pointer"
                  >
                    <option value="">Selecione um crime do Código Penal...</option>
                    {CRIMES_CPI.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label} ({c.secao})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={crime}
                    onChange={handleCrimeInputChange}
                    placeholder="Ou digite o nome do crime personalizado..."
                    className="w-full bg-background border border-border rounded-md px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm mt-1.5"
                  />
                </div>

                {/* Tipo de Punição */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span>Tipo de Punição Aplicada:</span>
                  </label>
                  <input
                    type="text"
                    value={tipoPunicao}
                    onChange={(e) => setTipoPunicao(e.target.value)}
                    placeholder="Ex: Advertência Interna"
                    className="w-full bg-background border border-border rounded-md px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                  />
                  {/* Chips Rápidos de Punição */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Observação", "Advertência Interna", "Rebaixamento", "Expulsão"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTipoPunicao(p)}
                        className={cn(
                          "px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer",
                          tipoPunicao === p
                            ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary border-border hover:text-foreground"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seção do Código Penal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Seção do Código Penal dos Instrutores:
                </label>
                <input
                  type="text"
                  value={secao}
                  onChange={(e) => setSecao(e.target.value)}
                  placeholder="Ex: Capítulo III, Seção I, Art. 2°"
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm font-mono"
                />
              </div>

              {/* Descrição da Infração */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Descrição da Infração:
                </label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva detalhadamente o erro ou conduta observada nos formulários..."
                  className="w-full bg-background border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm resize-none"
                />
              </div>

              {/* Orientações da Punição */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Orientações Disciplinares ao Militar:
                </label>
                <input
                  type="text"
                  value={orientacoes}
                  onChange={(e) => setOrientacoes(e.target.value)}
                  placeholder="Ex: Reler atentamente o script de formação e evitar envio de dados divergentes..."
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                />
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* CAMPOS ESPECÍFICOS: NOTIFICAÇÃO DE ORIENTAÇÃO                     */}
          {/* ================================================================= */}
          {activeTab === "orientacao" && (
            <div className="space-y-4 pt-2 border-t border-border animate-in fade-in duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Descrição da Conduta / Erro Observado:
                </label>
                <textarea
                  rows={3}
                  value={descOrientacao}
                  onChange={(e) => setDescOrientacao(e.target.value)}
                  placeholder="Descreva a conduta ou erro observado que motivou a orientação pedagógica..."
                  className="w-full bg-background border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Orientações ao Instrutor:
                </label>
                <input
                  type="text"
                  value={oriOrientacao}
                  onChange={(e) => setOriOrientacao(e.target.value)}
                  placeholder="Ex: Reler atentamente o script de formação referente ao seu cargo de modo a sanar dúvidas..."
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Botão de Ação Primário Padrão SSI */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-md font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>BBCode Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Gerar e Copiar BBCode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card de Visualização do BBCode Gerado e Prévia do Fórum */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Cabeçalho do Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-border bg-secondary/10 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              {viewMode === "code" ? <Code2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  {viewMode === "code" ? "BBCode Gerado" : "Pré-visualização no Fórum"}
                </h3>
                <span className="text-[11px] text-muted-foreground font-mono bg-secondary/60 border border-border px-2 py-0.5 rounded-full">
                  {generatedBBCode.length} caracteres
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {viewMode === "code"
                  ? "Código pronto para colar no corpo da Mensagem Privada no Fórum RCC"
                  : "Simulação de visualização exata de como a mensagem aparecerá para o militar no Fórum"}
              </p>
            </div>
          </div>

          {/* Alternador Código / Prévia e Ação de Cópia */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-background border border-border rounded-md p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("code")}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === "code"
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
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
                  "px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === "preview"
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="h-3.5 w-3.5" />
                Prévia Fórum
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 border border-border bg-background hover:bg-secondary/50 px-3 py-1.5 rounded-md text-xs font-medium text-foreground transition-colors cursor-pointer shadow-sm"
              title="Copiar código"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              <span>{copied ? "Copiado!" : "Copiar"}</span>
            </button>
          </div>
        </div>

        {/* Conteúdo do Resultado */}
        <div className="p-4 sm:p-6">
          {viewMode === "code" ? (
            <div className="relative">
              <textarea
                readOnly
                rows={10}
                value={generatedBBCode}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full bg-background border border-border rounded-lg p-4 font-mono text-xs sm:text-sm text-foreground/90 leading-relaxed focus:outline-none focus:border-primary/50 resize-y select-all shadow-inner"
              />
            </div>
          ) : (
            /* Pré-visualização autêntica de como fica no fórum phpBB da RCC */
            <div className="bg-background/80 border border-border rounded-xl p-4 sm:p-6 overflow-x-auto">
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
                    Saudações, <span className="text-[#1e2a4d] font-bold">{activeTab === "orientacao" ? "instrutor " : ""}{"{USERNAME}"}</span>!
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

        {/* Rodapé do Card */}
        <div className="px-4 sm:px-6 py-3 border-t border-border bg-secondary/10 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <span>Setor de Segurança dos Instrutores • Fórum Policial RCC</span>
          <span className="text-[11px] text-muted-foreground/70">Padronização Oficial de BBCode</span>
        </div>
      </div>
    </div>
  );
}
