import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, Fragment } from "react";
import { 
  ClipboardList, 
  ShieldCheck, 
  Users, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  FileText, 
  BarChart3, 
  RotateCcw,
  Send,
  User,
  ExternalLink,
  Lock,
  Sparkles,
  Plus,
  Eye,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  FileCheck2,
  Info,
  ArrowUpRight
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { 
  getFakeAccounts, 
  addFakeAccount, 
  updateFakeAccount, 
  deleteFakeAccount, 
  getMembers, 
  addAuditLog,
  getFiscalizacoes,
  addFiscalizacao,
  deleteFiscalizacao
} from "../lib/store";
import { FakeAccount, Member, Fiscalizacao } from "../lib/types";
import { toast } from "sonner";
import { formatBrasiliaDateTime, getBrasiliaIsoNow } from "../lib/dateUtils";

// Opções das etapas de fiscalização do CFSd (conforme formulário oficial)
// Cada pergunta possui 6 opções: 3 positivas (coluna esquerda - azul) e 3 negativas (coluna direita - vermelho)
const INICIO_AULA_OPTIONS = {
  positives: [
    "Realizou a fila no corredor",
    "Soube controlar os recrutas",
    "Iniciou a aula com postura e sala adequada",
  ],
  negatives: [
    "Não realizou a fila no corredor",
    "Não soube controlar os recrutas",
    "Entrou em uma sala com uma aula em andamento",
  ],
};

const DURANTE_AULA_OPTIONS = {
  positives: [
    "Passou o script corretamente",
    "Velocidade de envio do script adequada",
    "Demonstrou paciência em tirar todas as dúvidas do recruta",
  ],
  negatives: [
    "Pulou ou manipulou algum trecho do script",
    "Velocidade de envio do script muito rápida",
    "Demonstrou impaciência durante a aula",
  ],
};

const TESTE_TEORICO_OPTIONS = {
  positives: [
    "Manteve atenção às respostas do recruta",
    "Corrigiu os erros cometidos pelo recruta",
    "Avaliou e finalizou o teste com precisão",
  ],
  negatives: [
    "Não prestou atenção nos erros cometidos pelo recruta",
    "Reprovou incorretamente o recruta",
    "Não corrigiu os erros ou aprovou incorretamente",
  ],
};

const COMANDOS_OPTIONS = {
  positives: [
    "Passou, ensinou e cobrou a prática dos comandos corretamente",
    "Praticou cada comando logo após explicá-lo",
    "Ensinou o recruta a executar o comando ao notar erro",
  ],
  negatives: [
    "Pulou ou não realizou a prática dos comandos",
    "Não praticou os comandos logo após explicá-los",
    "Cobrou a execução dos comandos mas não ensinou como executar",
  ],
};

const FINALIZACAO_OPTIONS = {
  positives: [
    "Passou o script de finalização corretamente",
    "Prestou atenção nos requisitos",
    "Liberou o recruta com as instruções e permissões corretas",
  ],
  negatives: [
    "Pulou, manipulou ou alterou alguma parte do script",
    "Não prestou atenção nos requisitos",
    "Liberou o recruta com pendências ou sem os requisitos",
  ],
};

const INFRACOES_CRITICAS = new Set([
  // Início da Aula
  "Não realizou a fila no corredor",
  "Não soube controlar os recrutas",
  "Entrou em uma sala com uma aula em andamento",

  // Durante da aula
  "Pulou ou manipulou algum trecho do script",
  "Velocidade de envio do script muito rápida",
  "Demonstrou impaciência durante a aula",

  // Teste teórico
  "Não prestou atenção nos erros cometidos pelo recruta",
  "Reprovou incorretamente o recruta",
  "Não corrigiu os erros ou aprovou incorretamente",

  // Comandos
  "Pulou ou não realizou a prática dos comandos",
  "Não praticou os comandos logo após explicá-los",
  "Cobrou a execução dos comandos mas não ensinou como executar",
  "Reprovou ou puniu o recruta por erro nos comandos sem ensiná-lo",

  // Finalização
  "Pulou, manipulou ou alterou alguma parte do script",
  "Pulou, manipulou ou alterou o script de encerramento",
  "Não prestou atenção nos requisitos",
  "Liberou o recruta com pendências ou sem os requisitos",
]);

function OptionCard({
  label,
  checked,
  onChange,
  isCritical,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  isCritical?: boolean;
}) {
  return (
    <div
      onClick={onChange}
      className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer select-none transition-all ${
        checked
          ? isCritical
            ? "bg-rose-500/10 border-rose-500/60 text-rose-300 shadow-sm ring-1 ring-rose-500/30"
            : "bg-primary/10 border-primary/60 text-foreground shadow-sm ring-1 ring-primary/30"
          : isCritical
            ? "bg-secondary/20 border-border/70 hover:border-rose-500/40 hover:bg-rose-500/5 text-muted-foreground hover:text-foreground"
            : "bg-secondary/20 border-border/70 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
      }`}
    >
      <div className="pt-0.5 shrink-0">
        <div
          className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
            checked
              ? isCritical
                ? "bg-rose-500 border-rose-500 text-white"
                : "bg-primary border-primary text-white"
              : "border-muted-foreground/50 bg-background"
          }`}
        >
          {checked && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
        </div>
      </div>
      <span className="leading-snug">{label}</span>
    </div>
  );
}

// Helpers para seleção única por tópico (com capacidade de desmarcar ao clicar de novo)
function handleSelectSingleOption(
  currentList: string[],
  setList: React.Dispatch<React.SetStateAction<string[]>>,
  setHasOutro: React.Dispatch<React.SetStateAction<boolean>>,
  option: string
) {
  if (currentList.includes(option)) {
    setList([]);
  } else {
    setList([option]);
    setHasOutro(false);
  }
}

function handleToggleOutro(
  currentHasOutro: boolean,
  setHasOutro: React.Dispatch<React.SetStateAction<boolean>>,
  setList: React.Dispatch<React.SetStateAction<string[]>>
) {
  const nextVal = !currentHasOutro;
  setHasOutro(nextVal);
  if (nextVal) {
    setList([]);
  }
}

// Componente para renderizar cada pergunta com 6 opções (3 Positivas à esquerda e 3 Negativas à direita) + Campo de Outro
function QuestionSection({
  title,
  subtitle,
  options,
  selectedList,
  setSelectedList,
  hasOutro,
  setHasOutro,
  outroValue,
  setOutroValue,
  outroPlaceholder,
  isBorderTop = true,
}: {
  title: string;
  subtitle: string;
  options: { positives: string[]; negatives: string[] };
  selectedList: string[];
  setSelectedList: React.Dispatch<React.SetStateAction<string[]>>;
  hasOutro: boolean;
  setHasOutro: React.Dispatch<React.SetStateAction<boolean>>;
  outroValue: string;
  setOutroValue: React.Dispatch<React.SetStateAction<string>>;
  outroPlaceholder: string;
  isBorderTop?: boolean;
}) {
  return (
    <div className={`space-y-2.5 ${isBorderTop ? "border-t border-border/50 pt-4" : ""}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <span>{title}</span>
        </label>
        <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">
          Selecione 1 opção
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>

      {/* Grid 2 colunas: Positivas à esquerda (Azul), Negativas à direita (Vermelho) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary px-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          <span>Positivas (Azul)</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 px-1">
          <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
          <span>Negativas (Vermelho)</span>
        </div>

        {[0, 1, 2].map((idx) => {
          const pos = options.positives[idx];
          const neg = options.negatives[idx];
          return (
            <Fragment key={idx}>
              <OptionCard
                label={pos}
                checked={selectedList.includes(pos)}
                isCritical={false}
                onChange={() => handleSelectSingleOption(selectedList, setSelectedList, setHasOutro, pos)}
              />
              <OptionCard
                label={neg}
                checked={selectedList.includes(neg)}
                isCritical={true}
                onChange={() => handleSelectSingleOption(selectedList, setSelectedList, setHasOutro, neg)}
              />
            </Fragment>
          );
        })}
      </div>

      {/* Outro */}
      <div
        className={`flex flex-col gap-2 p-3 rounded-xl border text-xs transition-all ${
          hasOutro
            ? "bg-primary/10 border-primary/60 text-foreground shadow-sm ring-1 ring-primary/30"
            : "bg-secondary/20 border-border/70 hover:border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
        }`}
      >
        <div
          onClick={() => handleToggleOutro(hasOutro, setHasOutro, setSelectedList)}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div
            className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
              hasOutro
                ? "bg-primary border-primary text-white"
                : "border-muted-foreground/50 bg-background"
            }`}
          >
            {hasOutro && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
          </div>
          <span className="font-semibold text-xs sm:text-sm">Outro:</span>
        </div>
        {hasOutro && (
          <input
            type="text"
            value={outroValue}
            onChange={(e) => setOutroValue(e.target.value)}
            placeholder={outroPlaceholder}
            className="w-full bg-background border border-border/80 focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/relatorio-avaliacoes")({
  component: RelatorioFiscalizacaoPage,
});

function RelatorioFiscalizacaoPage() {
  const { user, role } = useAuth();
  const isAdmin = role === "Ministério" || role === "Presidente" || role === "Vice-Presidente" || role === "Diretor";

  // Navegação em 2 Abas: Registro de Fakes e Formulário de Fiscalização
  const [activeTab, setActiveTab] = useState<"fakes" | "formulario">("fakes");
  const [isCreateFiscalizacaoOpen, setIsCreateFiscalizacaoOpen] = useState(false);

  // Dados de Fakes, Membros e Fiscalizações
  const [fakes, setFakes] = useState<FakeAccount[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [fiscalizacoes, setFiscalizacoes] = useState<Fiscalizacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados do Formulário de Registro de Fake
  const [formOwnerNick, setFormOwnerNick] = useState("");
  const [formFakeNick, setFormFakeNick] = useState("");
  const [formAgreed, setFormAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de Filtro da Tabela de Fakes
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados do Módulo de Fiscalização (Estilo Gestão de Casos)
  const [fiscSearchTerm, setFiscSearchTerm] = useState("");
  const [selectedFiscalizacao, setSelectedFiscalizacao] = useState<Fiscalizacao | null>(null);

  // Estados do Formulário de Nova Fiscalização
  const [fiscStartDate, setFiscStartDate] = useState(getBrasiliaIsoNow());
  const [fiscFiscalizadorNick, setFiscFiscalizadorNick] = useState("");
  const [fiscInstrutorNick, setFiscInstrutorNick] = useState("");
  const [fiscFakeNick, setFiscFakeNick] = useState("");

  // Checkboxes de Etapas da Aula (CFSd)
  const [fiscInicioAula, setFiscInicioAula] = useState<string[]>([]);
  const [fiscInicioAulaOutro, setFiscInicioAulaOutro] = useState("");
  const [fiscHasInicioOutro, setFiscHasInicioOutro] = useState(false);

  const [fiscDuranteAula, setFiscDuranteAula] = useState<string[]>([]);
  const [fiscDuranteAulaOutro, setFiscDuranteAulaOutro] = useState("");
  const [fiscHasDuranteOutro, setFiscHasDuranteOutro] = useState(false);

  const [fiscTesteTeorico, setFiscTesteTeorico] = useState<string[]>([]);
  const [fiscTesteTeoricoOutro, setFiscTesteTeoricoOutro] = useState("");
  const [fiscHasTeoricoOutro, setFiscHasTeoricoOutro] = useState(false);

  const [fiscComandos, setFiscComandos] = useState<string[]>([]);
  const [fiscComandosOutro, setFiscComandosOutro] = useState("");
  const [fiscHasComandosOutro, setFiscHasComandosOutro] = useState(false);

  const [fiscFinalizacao, setFiscFinalizacao] = useState<string[]>([]);
  const [fiscFinalizacaoOutro, setFiscFinalizacaoOutro] = useState("");
  const [fiscHasFinalizacaoOutro, setFiscHasFinalizacaoOutro] = useState(false);

  const [fiscProofs, setFiscProofs] = useState("");
  const [fiscComments, setFiscComments] = useState("");
  const [isSubmittingFisc, setIsSubmittingFisc] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [loadedFakes, loadedMembers, loadedFiscalizacoes] = await Promise.all([
          getFakeAccounts(),
          getMembers(),
          getFiscalizacoes(),
        ]);
        setFakes(Array.isArray(loadedFakes) ? loadedFakes : []);
        setMembers(Array.isArray(loadedMembers) ? loadedMembers : []);
        setFiscalizacoes(Array.isArray(loadedFiscalizacoes) ? loadedFiscalizacoes : []);
      } catch (err) {
        console.error("Erro ao carregar dados de fiscalização:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Preencher nick inicial com o do usuário logado caso ainda vazio
  useEffect(() => {
    if (!formOwnerNick && user?.nick) {
      setFormOwnerNick(user.nick);
    }
    if (!fiscFiscalizadorNick && user?.nick) {
      setFiscFiscalizadorNick(user.nick);
    }
  }, [user?.nick, formOwnerNick, fiscFiscalizadorNick]);

  // Lista de fakes filtradas por busca
  const filteredFakes = useMemo(() => {
    return fakes.filter((item) => {
      return (
        item.fakeNick?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerNick?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [fakes, searchTerm]);

  // Métricas rápidas de fakes
  const metrics = useMemo(() => {
    const total = fakes.length;
    const myFakes = fakes.filter(
      (f) =>
        f.ownerNick?.toLowerCase() === (user?.nick || "").toLowerCase() ||
        f.registeredByNick?.toLowerCase() === (user?.nick || "").toLowerCase()
    ).length;
    return { total, myFakes };
  }, [fakes, user?.nick]);

  // Fakes cadastradas pelo fiscalizador selecionado
  const fiscalizadorFakes = useMemo(() => {
    const target = (fiscFiscalizadorNick || user?.nick || "").trim().toLowerCase();
    if (!target) return [];
    return fakes.filter(
      (f) =>
        f.ownerNick?.trim().toLowerCase() === target ||
        f.registeredByNick?.trim().toLowerCase() === target
    );
  }, [fakes, fiscFiscalizadorNick, user?.nick]);

  // Quando as fakes do fiscalizador mudarem, se houver apenas 1, pré-selecionar automaticamente
  useEffect(() => {
    if (fiscalizadorFakes.length === 1 && !fiscFakeNick) {
      setFiscFakeNick(fiscalizadorFakes[0].fakeNick);
    } else if (
      fiscFakeNick &&
      !fiscalizadorFakes.some((f) => f.fakeNick?.toLowerCase() === fiscFakeNick.toLowerCase())
    ) {
      setFiscFakeNick("");
    }
  }, [fiscalizadorFakes, fiscFakeNick]);

  // Lista de fiscalizações filtradas por busca
  const filteredFiscalizacoes = useMemo(() => {
    return fiscalizacoes.filter((item) => {
      const term = fiscSearchTerm.toLowerCase();
      return (
        item.id?.toLowerCase().includes(term) ||
        item.instrutorNick?.toLowerCase().includes(term) ||
        item.fiscalizadorNick?.toLowerCase().includes(term) ||
        item.fakeNick?.toLowerCase().includes(term)
      );
    });
  }, [fiscalizacoes, fiscSearchTerm]);

  // Métricas de fiscalização
  const fiscMetrics = useMemo(() => {
    const total = fiscalizacoes.length;
    const myFisc = fiscalizacoes.filter(
      (f) =>
        f.fiscalizadorNick?.toLowerCase() === (user?.nick || "").toLowerCase() ||
        f.fiscalizadorId === user?.id
    ).length;
    const uniqueInstructors = new Set(
      fiscalizacoes.map((f) => f.instrutorNick?.toLowerCase()).filter(Boolean)
    ).size;
    const withInfractions = fiscalizacoes.filter((f) => {
      const allSelected = [
        ...(f.inicioAula || []),
        ...(f.duranteAula || []),
        ...(f.testeTeorico || []),
        ...(f.comandos || []),
        ...(f.finalizacao || []),
      ];
      return allSelected.some((item) => INFRACOES_CRITICAS.has(item));
    }).length;

    return { total, myFisc, uniqueInstructors, withInfractions };
  }, [fiscalizacoes, user?.nick, user?.id]);

  // Limpar formulário de fiscalização
  const handleResetFiscalizacaoForm = () => {
    setFiscStartDate(getBrasiliaIsoNow());
    setFiscFiscalizadorNick(user?.nick || "");
    setFiscInstrutorNick("");
    setFiscFakeNick("");
    setFiscInicioAula([]);
    setFiscInicioAulaOutro("");
    setFiscHasInicioOutro(false);
    setFiscDuranteAula([]);
    setFiscDuranteAulaOutro("");
    setFiscHasDuranteOutro(false);
    setFiscTesteTeorico([]);
    setFiscTesteTeoricoOutro("");
    setFiscHasTeoricoOutro(false);
    setFiscComandos([]);
    setFiscComandosOutro("");
    setFiscHasComandosOutro(false);
    setFiscFinalizacao([]);
    setFiscFinalizacaoOutro("");
    setFiscHasFinalizacaoOutro(false);
    setFiscProofs("");
    setFiscComments("");
  };

  // Submeter nova fiscalização
  const handleSubmitFiscalizacao = async (e: React.FormEvent) => {
    e.preventDefault();

    const fiscalizador = fiscFiscalizadorNick.trim();
    const instrutor = fiscInstrutorNick.trim();
    const fake = fiscFakeNick.trim();

    if (!fiscalizador) {
      toast.error("Por favor, preencha o Nickname do fiscalizador.");
      return;
    }

    if (!instrutor) {
      toast.error("Por favor, preencha o Nickname do instrutor que aplicou a aula.");
      return;
    }

    if (!fake) {
      toast.error("Por favor, selecione ou preencha a conta fake utilizada.");
      return;
    }

    if (!fiscProofs.trim()) {
      toast.error("Por favor, insira o link dos prints de comprovação da fiscalização.");
      return;
    }

    // Regra oficial do SSI: Comentários sem vírgulas para não quebrar a planilha
    let cleanComments = fiscComments.trim();
    if (cleanComments.includes(",")) {
      cleanComments = cleanComments.replace(/,/g, ";");
      toast.info("As vírgulas do seu comentário foram convertidas para ';' para evitar quebrar a planilha.");
    }

    setIsSubmittingFisc(true);
    try {
      const newFisc: Fiscalizacao = {
        id: `FISC-${Date.now().toString(36).toUpperCase()}`,
        startDate: formatBrasiliaDateTime(fiscStartDate),
        fiscalizadorNick: fiscalizador,
        fiscalizadorId: user?.id,
        instrutorNick: instrutor,
        fakeNick: fake,
        inicioAula: fiscInicioAula,
        inicioAulaOutro: fiscHasInicioOutro ? fiscInicioAulaOutro.trim() : undefined,
        duranteAula: fiscDuranteAula,
        duranteAulaOutro: fiscHasDuranteOutro ? fiscDuranteAulaOutro.trim() : undefined,
        testeTeorico: fiscTesteTeorico,
        testeTeoricoOutro: fiscHasTeoricoOutro ? fiscTesteTeoricoOutro.trim() : undefined,
        comandos: fiscComandos,
        comandosOutro: fiscHasComandosOutro ? fiscComandosOutro.trim() : undefined,
        finalizacao: fiscFinalizacao,
        finalizacaoOutro: fiscHasFinalizacaoOutro ? fiscFinalizacaoOutro.trim() : undefined,
        proofs: fiscProofs.trim(),
        comments: cleanComments || undefined,
        createdAt: formatBrasiliaDateTime(Date.now()),
        timestamp: Date.now(),
      };

      await addFiscalizacao(newFisc);

      await addAuditLog(
        user?.id || fiscalizador,
        role || "Fiscalizador",
        "Registro de Fiscalização",
        "Fiscalização",
        `Registrou fiscalização da aula do instrutor "${instrutor}" (Fake: ${fake}, Fiscalizador: ${fiscalizador}).`,
        newFisc.id,
        user?.nick || fiscalizador
      );

      setFiscalizacoes((prev) => [newFisc, ...prev]);
      toast.success("Fiscalização registrada com sucesso!");
      setIsCreateFiscalizacaoOpen(false);
      handleResetFiscalizacaoForm();
    } catch (err) {
      console.error("Erro ao registrar fiscalização:", err);
      toast.error("Erro ao salvar fiscalização. Tente novamente.");
    } finally {
      setIsSubmittingFisc(false);
    }
  };

  // Excluir fiscalização
  const handleDeleteFiscalizacao = async (item: Fiscalizacao) => {
    const isOwner =
      item.fiscalizadorNick?.toLowerCase() === (user?.nick || "").toLowerCase() ||
      item.fiscalizadorId === user?.id;

    if (!isAdmin && !isOwner) {
      toast.error("Apenas o fiscalizador responsável ou a Liderança podem excluir esta fiscalização.");
      return;
    }

    if (!window.confirm(`Tem certeza de que deseja remover a fiscalização #${item.id} do instrutor ${item.instrutorNick}?`)) {
      return;
    }

    try {
      await deleteFiscalizacao(item.id);
      setFiscalizacoes((prev) => prev.filter((f) => f.id !== item.id));
      toast.success(`Fiscalização #${item.id} excluída com sucesso.`);

      await addAuditLog(
        user?.id || "1",
        role || "Fiscalizador",
        "Exclusão de Fiscalização",
        "Fiscalização",
        `Excluiu a fiscalização #${item.id} do instrutor ${item.instrutorNick}.`,
        item.id,
        user?.nick
      );
    } catch (err) {
      toast.error("Erro ao excluir fiscalização.");
    }
  };

  // Handler para Limpar Formulário de Fake
  const handleResetForm = () => {
    setFormOwnerNick(user?.nick || "");
    setFormFakeNick("");
    setFormAgreed(false);
  };

  // Handler para Enviar Formulário de Fake
  const handleSubmitFake = async (e: React.FormEvent) => {
    e.preventDefault();

    const owner = formOwnerNick.trim();
    const fake = formFakeNick.trim();

    if (!owner) {
      toast.error("Por favor, preencha o seu Nickname ou do responsável.");
      return;
    }

    if (!fake) {
      toast.error("Por favor, preencha o Nickname da fake criada.");
      return;
    }

    if (!formAgreed) {
      toast.error(
        "Você precisa concordar com os termos de responsabilidade para registrar a fake."
      );
      return;
    }

    // Verificar se já existe fake ativa com este nick
    const alreadyExists = fakes.find(
      (f) => f.fakeNick?.toLowerCase() === fake.toLowerCase()
    );
    if (alreadyExists) {
      toast.warning(
        `A fake "${fake}" já foi registrada anteriormente por ${alreadyExists.ownerNick}.`
      );
    }

    setIsSubmitting(true);
    try {
      const newFake: FakeAccount = {
        id: `FAKE-${Date.now().toString(36).toUpperCase()}`,
        ownerNick: owner,
        fakeNick: fake,
        registeredBy: user?.id || user?.nick || owner,
        registeredByNick: user?.nick || owner,
        createdAt: formatBrasiliaDateTime(Date.now()),
        timestamp: Date.now(),
        agreedTerms: true,
        status: "Ativa",
      };

      await addFakeAccount(newFake);

      // Registrar auditoria
      await addAuditLog(
        user?.id || owner,
        role || "Fiscalizador",
        "Registro de Fake",
        "Fiscalização",
        `Registrou a conta fake "${fake}" para o responsável "${owner}".`,
        newFake.id,
        user?.nick || owner
      );

      setFakes((prev) => [newFake, ...prev]);
      toast.success(`Conta fake "${fake}" registrada com sucesso!`);

      // Limpar campo da fake para permitir cadastrar mais se desejar
      setFormFakeNick("");
      setFormAgreed(false);
    } catch (err) {
      console.error("Erro ao registrar fake:", err);
      toast.error("Não foi possível registrar a conta fake. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copiar nick da fake
  const handleCopyNick = (fakeNick: string, id: string) => {
    navigator.clipboard.writeText(fakeNick);
    setCopiedId(id);
    toast.success(`Nick "${fakeNick}" copiado para a área de transferência!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Excluir fake
  const handleDeleteFake = async (fake: FakeAccount) => {
    const isOwner =
      fake.ownerNick?.toLowerCase() === (user?.nick || "").toLowerCase() ||
      fake.registeredByNick?.toLowerCase() === (user?.nick || "").toLowerCase();

    if (!isAdmin && !isOwner) {
      toast.error("Apenas o responsável pelo registro ou a Liderança podem excluir esta fake.");
      return;
    }

    if (!window.confirm(`Tem certeza de que deseja remover o registro da fake "${fake.fakeNick}"?`)) {
      return;
    }

    try {
      await deleteFakeAccount(fake.id);
      setFakes((prev) => prev.filter((f) => f.id !== fake.id));
      toast.success(`Registro da fake "${fake.fakeNick}" excluído com sucesso.`);

      await addAuditLog(
        user?.id || "1",
        role || "Fiscalizador",
        "Exclusão de Fake",
        "Fiscalização",
        `Excluiu o registro da fake "${fake.fakeNick}" (Responsável: ${fake.ownerNick}).`,
        fake.id,
        user?.nick
      );
    } catch (err) {
      toast.error("Erro ao excluir fake.");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-inner">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              Relatório de Fiscalização
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Controle de contas fakes, acompanhamento de formulários e análise da liderança.
            </p>
          </div>
        </div>
      </div>

      {/* Navegação Superior: 3 Abas Principais Solicitadas */}
      <div className="flex border-b border-border/60 gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("fakes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "fakes"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Registro de Fakes</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "fakes"
                ? "bg-white/20 text-white"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {fakes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("formulario")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "formulario"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Formulário de Fiscalização</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: REGISTRO DE FAKES (FOCO PRINCIPAL SOLICITADO)                      */}
      {/* ========================================================================= */}
      {activeTab === "fakes" && (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
          {/* Métricas Rápidas Alinhadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total de Fakes Registradas
                </span>
                <p className="text-3xl font-bold text-foreground">{metrics.total}</p>
              </div>
              <div className="h-11 w-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                <Shield className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Minhas Fakes Registradas
                </span>
                <p className="text-3xl font-bold text-primary">{metrics.myFakes}</p>
              </div>
              <div className="h-11 w-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                <User className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* FORMULÁRIO OFICIAL [SSI] REGISTRO DE FAKES (PERFEITAMENTE ALINHADO) */}
          <div className="bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden w-full">
            {/* Cabeçalho do Card */}
            <div className="p-6 sm:p-8 border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                    <span>Registro de fakes</span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    Formulário de registro de fakes dos membros do{" "}
                    <strong className="text-foreground">Setor de Segurança dos Instrutores</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário com as 3 Seções */}
            <form onSubmit={handleSubmitFake} className="p-6 sm:p-8 flex flex-col gap-6">
              {/* Campo 1: Nickname */}
              <div className="bg-secondary/30 border border-border/70 rounded-2xl p-5 transition-all focus-within:border-primary/60 focus-within:bg-secondary/40">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    <label className="text-base font-semibold text-foreground flex items-center gap-1">
                      Nickname: <span className="text-rose-400">*</span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Registre o seu nickname. Em caso de postagem para terceiros, coloque o
                      nickname do responsável pela conta.
                    </p>
                  </div>

                  {/* Avatar Preview do Responsável */}
                  {formOwnerNick.trim() && (
                    <div className="flex items-center gap-2.5 bg-background/80 border border-border/60 rounded-xl px-3 py-1.5 shrink-0">
                      <div className="h-8 w-8 rounded-lg overflow-hidden bg-secondary/80 border border-border/40 flex items-center justify-center shrink-0">
                        <img
                          src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                            formOwnerNick.trim()
                          )}&headonly=1&size=m`}
                          alt={formOwnerNick}
                          className="h-9 w-9 object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-muted-foreground block font-medium">
                          Responsável
                        </span>
                        <span className="text-xs font-bold text-foreground truncate max-w-[120px] block">
                          {formOwnerNick}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formOwnerNick}
                      onChange={(e) => setFormOwnerNick(e.target.value)}
                      placeholder="Sua resposta (ex: tchaumateu21)"
                      required
                      className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors"
                    />
                  </div>

                  {user?.nick && formOwnerNick !== user.nick && (
                    <button
                      type="button"
                      onClick={() => setFormOwnerNick(user.nick)}
                      className="px-3 py-3 rounded-xl border border-border/70 hover:border-primary/50 bg-secondary/40 hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
                      title="Preencher com meu nickname logado"
                    >
                      Usar meu Nick ({user.nick})
                    </button>
                  )}
                </div>
              </div>

              {/* Campo 2: Nickname da fake criada */}
              <div className="bg-secondary/30 border border-border/70 rounded-2xl p-5 transition-all focus-within:border-primary/60 focus-within:bg-secondary/40">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    <label className="text-base font-semibold text-foreground flex items-center gap-1">
                      Nickname da fake criada: <span className="text-rose-400">*</span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Registre o nickname da fake que foi criada.
                    </p>
                  </div>

                  {/* Avatar Preview da Fake em Tempo Real */}
                  {formFakeNick.trim() && (
                    <div className="flex items-center gap-2.5 bg-background/80 border border-border/60 rounded-xl px-3 py-1.5 shrink-0 animate-in fade-in zoom-in-95 duration-200">
                      <div className="h-8 w-8 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <img
                          src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                            formFakeNick.trim()
                          )}&headonly=1&size=m`}
                          alt={formFakeNick}
                          className="h-9 w-9 object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-primary block font-semibold">
                          Fake Criada
                        </span>
                        <span className="text-xs font-bold text-foreground truncate max-w-[120px] block">
                          {formFakeNick}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative mt-2">
                  <input
                    type="text"
                    value={formFakeNick}
                    onChange={(e) => setFormFakeNick(e.target.value)}
                    placeholder="Sua resposta (ex: FakeInstrutor01)"
                    required
                    className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Campo 3: Termo responsabilidade */}
              <div
                onClick={() => setFormAgreed(!formAgreed)}
                className={`border rounded-2xl p-5 transition-all cursor-pointer select-none ${
                  formAgreed
                    ? "bg-primary/5 border-primary/60 shadow-sm"
                    : "bg-secondary/30 border-border/70 hover:border-border hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="pt-0.5">
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                        formAgreed
                          ? "bg-primary border-primary text-primary-foreground shadow-sm"
                          : "border-muted-foreground/60 bg-background"
                      }`}
                    >
                      {formAgreed && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="text-base font-semibold text-foreground flex items-center gap-1 cursor-pointer">
                      Termo responsabilidade: <span className="text-rose-400">*</span>
                    </label>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      Concordo com os termos de responsabilidade dispostos pela minha companhia
                      para a utilização de fakes, e assumo que irei cumprir com o exigido, estando
                      sujeito a punições tanto internas quanto externas por mal uso destas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ações do Formulário */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.99] transition-all shadow-md shadow-primary/20 disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? "Enviando registro..." : "Enviar"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-border/80 hover:bg-secondary/60 text-muted-foreground hover:text-foreground font-medium text-sm transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Limpar formulário</span>
                  </button>
                </div>

                <span className="text-xs text-muted-foreground/80 text-center sm:text-right">
                  Registro oficial protegido e auditado pelo SSI
                </span>
              </div>
            </form>
          </div>

          {/* TABELA DE FAKES REGISTRADAS COM BUSCA E GESTÃO (ALINHADA) */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Histórico de Fakes Registradas</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Consulte, copie o nick e gerencie todas as contas fakes vinculadas aos membros.
                </p>
              </div>

              {/* Busca */}
              <div className="relative min-w-[280px]">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar fake ou responsável..."
                  className="w-full bg-background border border-border/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Listagem em Tabela */}
            {filteredFakes.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center bg-secondary/10">
                <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <h4 className="text-sm font-semibold text-foreground">Nenhuma fake encontrada</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {searchTerm
                    ? "Nenhum resultado corresponde à busca digitada."
                    : "Nenhuma conta fake foi registrada ainda. Preencha o formulário acima para criar o primeiro registro."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-border/70 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/50 text-muted-foreground font-semibold text-xs border-b border-border/70">
                    <tr>
                      <th className="py-3 px-4">FAKE CRIADA</th>
                      <th className="py-3 px-4">RESPONSÁVEL</th>
                      <th className="py-3 px-4">DATA DO REGISTRO</th>
                      <th className="py-3 px-4">TERMO</th>
                      <th className="py-3 px-4 text-right">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-foreground">
                    {filteredFakes.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                        {/* Fake */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                              <img
                                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                                  item.fakeNick
                                )}&headonly=1&size=m`}
                                alt={item.fakeNick}
                                className="h-9 w-9 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground flex items-center gap-1.5">
                                {item.fakeNick}
                                <button
                                  type="button"
                                  onClick={() => handleCopyNick(item.fakeNick, item.id)}
                                  className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded cursor-pointer"
                                  title="Copiar nickname da fake"
                                >
                                  {copiedId === item.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                #{item.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Responsável */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-md overflow-hidden bg-secondary border border-border flex items-center justify-center shrink-0">
                              <img
                                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                                  item.ownerNick
                                )}&headonly=1&size=s`}
                                alt={item.ownerNick}
                                className="h-8 w-8 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              {item.ownerNick}
                            </span>
                          </div>
                        </td>

                        {/* Data */}
                        <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {item.createdAt || "-"}
                        </td>

                        {/* Termo */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="h-3 w-3" />
                            Aceito
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyNick(item.fakeNick, item.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                              title="Copiar nickname"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFake(item)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Excluir registro"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: FORMULÁRIO DE FISCALIZAÇÃO (ESTILO GESTÃO DE CASOS)                */}
      {/* ========================================================================= */}
      {activeTab === "formulario" && (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
          {/* Métricas Rápidas de Fiscalização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Fiscalizações
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{fiscMetrics.total}</p>
              </div>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Minhas Fiscalizações
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{fiscMetrics.myFisc}</p>
              </div>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Instrutores Avaliados
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{fiscMetrics.uniqueInstructors}</p>
              </div>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Irregularidades
                </span>
                <p className={`text-2xl sm:text-3xl font-bold ${fiscMetrics.withInfractions > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {fiscMetrics.withInfractions}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                fiscMetrics.withInfractions > 0 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Header Superior com Botão de Abertura (Igual à Gestão de Casos) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                <span>Fiscalizações de Aulas (CFSd)</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Controle de fiscalizações, postura de instrutores e conformidade com o script oficial.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!fiscFiscalizadorNick && user?.nick) {
                  setFiscFiscalizadorNick(user.nick);
                }
                setIsCreateFiscalizacaoOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-primary/20 active:scale-[0.99] transition-all cursor-pointer w-full sm:w-auto shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Fiscalização</span>
            </button>
          </div>

          {/* Histórico / Listagem das Fiscalizações */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-primary" />
                  <span>Histórico de Fiscalizações Registradas</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Consulte os registros completos, provas anexadas e notas da fiscalização.
                </p>
              </div>

              {/* Busca */}
              <div className="relative min-w-[280px]">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={fiscSearchTerm}
                  onChange={(e) => setFiscSearchTerm(e.target.value)}
                  placeholder="Buscar instrutor, fiscalizador ou fake..."
                  className="w-full bg-background border border-border/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Listagem em Tabela */}
            {filteredFiscalizacoes.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center bg-secondary/10">
                <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <h4 className="text-sm font-semibold text-foreground">Nenhuma fiscalização encontrada</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {fiscSearchTerm
                    ? "Nenhum resultado corresponde à busca digitada."
                    : "Nenhuma fiscalização foi registrada ainda. Clique no botão '+ Nova Fiscalização' acima para cadastrar a primeira."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-border/70 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/50 text-muted-foreground font-semibold text-xs border-b border-border/70">
                    <tr>
                      <th className="py-3 px-4">DATA / INÍCIO</th>
                      <th className="py-3 px-4">INSTRUTOR AVALIADO</th>
                      <th className="py-3 px-4">FISCALIZADOR</th>
                      <th className="py-3 px-4">FAKE UTILIZADA</th>
                      <th className="py-3 px-4">STATUS CFSd</th>
                      <th className="py-3 px-4 text-right">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-foreground">
                    {filteredFiscalizacoes.map((item) => {
                      const allSelected = [
                        ...(item.inicioAula || []),
                        ...(item.duranteAula || []),
                        ...(item.testeTeorico || []),
                        ...(item.comandos || []),
                        ...(item.finalizacao || []),
                      ];
                      const hasInfraction = allSelected.some((x) => INFRACOES_CRITICAS.has(x));

                      return (
                        <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                          {/* Data */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-foreground">
                                {item.startDate || item.createdAt}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                #{item.id}
                              </span>
                            </div>
                          </td>

                          {/* Instrutor */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg overflow-hidden bg-secondary border border-border/70 flex items-center justify-center shrink-0">
                                <img
                                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                                    item.instrutorNick
                                  )}&headonly=1&size=m`}
                                  alt={item.instrutorNick}
                                  className="h-9 w-9 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground text-xs">
                                  {item.instrutorNick}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  Instrutor
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Fiscalizador */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-md overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <img
                                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                                    item.fiscalizadorNick
                                  )}&headonly=1&size=s`}
                                  alt={item.fiscalizadorNick}
                                  className="h-8 w-8 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-foreground">
                                {item.fiscalizadorNick}
                              </span>
                            </div>
                          </td>

                          {/* Fake */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-md overflow-hidden bg-secondary border border-border flex items-center justify-center shrink-0">
                                <img
                                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                                    item.fakeNick
                                  )}&headonly=1&size=s`}
                                  alt={item.fakeNick}
                                  className="h-7 w-7 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">
                                {item.fakeNick}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {hasInfraction ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                                <AlertTriangle className="h-3 w-3" />
                                Irregularidades
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                                <CheckCircle2 className="h-3 w-3" />
                                Conforme
                              </span>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedFiscalizacao(item)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/80 hover:bg-secondary/70 text-xs font-medium text-foreground transition-colors cursor-pointer"
                                title="Ver detalhes completos"
                              >
                                <Eye className="h-3.5 w-3.5 text-primary" />
                                <span className="hidden sm:inline">Ver Detalhes</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteFiscalizacao(item)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Excluir fiscalização"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVA FISCALIZAÇÃO (FORMULÁRIO OFICIAL DO GOOGLE FORMS)             */}
      {/* ========================================================================= */}
      {isCreateFiscalizacaoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-secondary/30">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Nova Fiscalização de Aula (CFSd)</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Preencha os dados e observações recolhidos durante a aplicação do curso.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateFiscalizacaoOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSubmitFiscalizacao} className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {/* BLOCO 1: IDENTIFICAÇÃO */}
              <div className="flex flex-col gap-4 bg-secondary/20 border border-border/70 rounded-2xl p-5">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    1. Identificação & Início da Fiscalização
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Data e Hora de Início */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Início da Fiscalização: <strong className="text-rose-400">*</strong>
                    </label>
                    <input
                      type="datetime-local"
                      value={fiscStartDate}
                      onChange={(e) => setFiscStartDate(e.target.value)}
                      required
                      className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Nickname do Fiscalizador */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">
                        Nickname do Fiscalizador: <strong className="text-rose-400">*</strong>
                      </label>
                      {user?.nick && fiscFiscalizadorNick !== user.nick && (
                        <button
                          type="button"
                          onClick={() => setFiscFiscalizadorNick(user.nick)}
                          className="text-[10px] text-primary hover:underline font-normal cursor-pointer"
                        >
                          Usar Meu Nick
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {fiscFiscalizadorNick.trim() && (
                        <div className="h-9 w-9 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <img
                            src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                              fiscFiscalizadorNick.trim()
                            )}&headonly=1&size=m`}
                            alt={fiscFiscalizadorNick}
                            className="h-10 w-10 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <input
                        type="text"
                        value={fiscFiscalizadorNick}
                        onChange={(e) => setFiscFiscalizadorNick(e.target.value)}
                        placeholder="Ex: tchaumateu21"
                        required
                        className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Nickname do Instrutor */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Nickname do Instrutor Avaliado: <strong className="text-rose-400">*</strong>
                    </label>
                    <div className="flex items-center gap-2">
                      {fiscInstrutorNick.trim() && (
                        <div className="h-9 w-9 rounded-lg overflow-hidden bg-secondary border border-border/70 flex items-center justify-center shrink-0">
                          <img
                            src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                              fiscInstrutorNick.trim()
                            )}&headonly=1&size=m`}
                            alt={fiscInstrutorNick}
                            className="h-10 w-10 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <input
                        type="text"
                        value={fiscInstrutorNick}
                        onChange={(e) => setFiscInstrutorNick(e.target.value)}
                        placeholder="Ex: FulanoInstrutor"
                        required
                        className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Nickname da Fake Utilizada */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Fake Utilizada: <strong className="text-rose-400">*</strong>
                    </label>

                    <div className="flex items-center gap-2">
                      {fiscFakeNick.trim() && (
                        <div className="h-9 w-9 rounded-lg overflow-hidden bg-secondary border border-border/70 flex items-center justify-center shrink-0">
                          <img
                            src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                              fiscFakeNick.trim()
                            )}&headonly=1&size=m`}
                            alt={fiscFakeNick}
                            className="h-10 w-10 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      <select
                        value={fiscFakeNick}
                        onChange={(e) => setFiscFakeNick(e.target.value)}
                        required
                        className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none transition-colors"
                      >
                        <option value="">Selecione a fake utilizada...</option>
                        {fiscalizadorFakes.length > 0 ? (
                          fiscalizadorFakes.map((f) => (
                            <option key={f.id} value={f.fakeNick}>
                              {f.fakeNick}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            Nenhuma fake cadastrada para {fiscFiscalizadorNick || "este fiscalizador"}
                          </option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCO 2: APLICAÇÃO DO CURSO DE FORMAÇÃO DE SOLDADOS (CFSd) */}
              <div className="flex flex-col gap-6 bg-secondary/20 border border-border/70 rounded-2xl p-5">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    2. Aplicação do Curso de Formação de Soldados (CFSd)
                  </h3>
                </div>

                {/* Subseção A: Início da Aula */}
                <QuestionSection
                  title="Início da Aula:"
                  subtitle="Marque a situação observada no início da instrução."
                  options={INICIO_AULA_OPTIONS}
                  selectedList={fiscInicioAula}
                  setSelectedList={setFiscInicioAula}
                  hasOutro={fiscHasInicioOutro}
                  setHasOutro={setFiscHasInicioOutro}
                  outroValue={fiscInicioAulaOutro}
                  setOutroValue={setFiscInicioAulaOutro}
                  outroPlaceholder="Especifique outros detalhes do início da aula..."
                  isBorderTop={false}
                />

                {/* Subseção B: Durante da Aula */}
                <QuestionSection
                  title="Durante da aula:"
                  subtitle="Marque a conduta do instrutor durante a explicação do script."
                  options={DURANTE_AULA_OPTIONS}
                  selectedList={fiscDuranteAula}
                  setSelectedList={setFiscDuranteAula}
                  hasOutro={fiscHasDuranteOutro}
                  setHasOutro={setFiscHasDuranteOutro}
                  outroValue={fiscDuranteAulaOutro}
                  setOutroValue={setFiscDuranteAulaOutro}
                  outroPlaceholder="Especifique outros detalhes do decorrer da aula..."
                />

                {/* Subseção C: Teste Teórico */}
                <QuestionSection
                  title="Teste teórico:"
                  subtitle="Marque como o instrutor conduziu as perguntas e a correção do teste."
                  options={TESTE_TEORICO_OPTIONS}
                  selectedList={fiscTesteTeorico}
                  setSelectedList={setFiscTesteTeorico}
                  hasOutro={fiscHasTeoricoOutro}
                  setHasOutro={setFiscHasTeoricoOutro}
                  outroValue={fiscTesteTeoricoOutro}
                  setOutroValue={setFiscTesteTeoricoOutro}
                  outroPlaceholder="Especifique outros detalhes do teste teórico..."
                />

                {/* Subseção D: Comandos */}
                <QuestionSection
                  title="Comandos:"
                  subtitle="Marque como o instrutor conduziu o ensino e a prática dos comandos da RCC."
                  options={COMANDOS_OPTIONS}
                  selectedList={fiscComandos}
                  setSelectedList={setFiscComandos}
                  hasOutro={fiscHasComandosOutro}
                  setHasOutro={setFiscHasComandosOutro}
                  outroValue={fiscComandosOutro}
                  setOutroValue={setFiscComandosOutro}
                  outroPlaceholder="Especifique outros detalhes da etapa de comandos..."
                />

                {/* Subseção E: Finalização */}
                <QuestionSection
                  title="Finalização:"
                  subtitle="Marque como foi o encerramento do script e a conferência de requisitos."
                  options={FINALIZACAO_OPTIONS}
                  selectedList={fiscFinalizacao}
                  setSelectedList={setFiscFinalizacao}
                  hasOutro={fiscHasFinalizacaoOutro}
                  setHasOutro={setFiscHasFinalizacaoOutro}
                  outroValue={fiscFinalizacaoOutro}
                  setOutroValue={setFiscFinalizacaoOutro}
                  outroPlaceholder="Especifique outros detalhes da finalização..."
                />
              </div>

              {/* BLOCO 3: ENCERRAMENTO DA AVALIAÇÃO (PRINTS & COMENTÁRIOS) */}
              <div className="flex flex-col gap-5 bg-secondary/20 border border-border/70 rounded-2xl p-5">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    3. Encerramento da Avaliação
                  </h3>
                </div>

                {/* Anexos / Prints */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Anexos (Prints da Aula):</span>
                    <strong className="text-rose-400">*</strong>
                  </label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Insira o print retirado durante a avaliação (toda a aula). Se houver diálogo e punição, inserir todo o print da conversa realizada.
                  </p>
                  <input
                    type="text"
                    value={fiscProofs}
                    onChange={(e) => setFiscProofs(e.target.value)}
                    placeholder="https://imgur.com/a/... ou múltiplos links separados por espaço"
                    required
                    className="w-full bg-background border border-border/80 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors font-mono"
                  />
                </div>

                {/* Comentários Adicionais */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Comentários adicionais:
                    </label>
                    {fiscComments.includes(",") && (
                      <button
                        type="button"
                        onClick={() => setFiscComments(fiscComments.replace(/,/g, ";"))}
                        className="text-[10px] text-amber-400 hover:underline font-medium cursor-pointer"
                      >
                        Substituir vírgulas por ';'
                      </button>
                    )}
                  </div>

                  {/* Alerta de Vírgula do Google Forms */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong>Aviso do SSI:</strong> Digite seu comentário <u>SEM VÍRGULAS</u>, para não quebrar a planilha. Passível de PUNIÇÃO. Utilize ponto e vírgula (;) ou traço (-) para separar ideias.
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={fiscComments}
                    onChange={(e) => setFiscComments(e.target.value)}
                    placeholder="Digite observações sobre o instrutor, esclarecimentos etc. (Lembre-se: sem vírgulas)"
                    className="w-full bg-background border border-border/80 focus:border-primary rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors resize-none"
                  />

                  {fiscComments.includes(",") && (
                    <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 animate-pulse">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Vírgula detectada no comentário! Remova ou substitua por ponto ou ponto e vírgula (;).
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={handleResetFiscalizacaoForm}
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  Limpar todos os campos
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsCreateFiscalizacaoOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border/80 hover:bg-secondary text-muted-foreground hover:text-foreground font-medium text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingFisc}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 active:scale-[0.99] transition-all shadow-md shadow-primary/20 disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmittingFisc ? "Registrando..." : "Salvar Fiscalização"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETALHES DA FISCALIZAÇÃO (LEITURA COMPLETA)                       */}
      {/* ========================================================================= */}
      {selectedFiscalizacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-secondary/30">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Fiscalização #{selectedFiscalizacao.id}</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Registrada em {selectedFiscalizacao.createdAt || selectedFiscalizacao.startDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFiscalizacao(null)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Participantes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Instrutor */}
                <div className="bg-secondary/30 border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-secondary border border-border/70 flex items-center justify-center shrink-0">
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                        selectedFiscalizacao.instrutorNick
                      )}&headonly=1&size=m`}
                      alt={selectedFiscalizacao.instrutorNick}
                      className="h-11 w-11 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Instrutor Avaliado
                    </span>
                    <span className="text-xs font-bold text-foreground truncate block">
                      {selectedFiscalizacao.instrutorNick}
                    </span>
                  </div>
                </div>

                {/* Fiscalizador */}
                <div className="bg-secondary/30 border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                        selectedFiscalizacao.fiscalizadorNick
                      )}&headonly=1&size=m`}
                      alt={selectedFiscalizacao.fiscalizadorNick}
                      className="h-11 w-11 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-primary uppercase font-semibold block">
                      Fiscalizador
                    </span>
                    <span className="text-xs font-bold text-foreground truncate block">
                      {selectedFiscalizacao.fiscalizadorNick}
                    </span>
                  </div>
                </div>

                {/* Fake Utilizada */}
                <div className="bg-secondary/30 border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-secondary border border-border/70 flex items-center justify-center shrink-0">
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                        selectedFiscalizacao.fakeNick
                      )}&headonly=1&size=m`}
                      alt={selectedFiscalizacao.fakeNick}
                      className="h-11 w-11 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Fake Utilizada
                    </span>
                    <span className="text-xs font-bold text-foreground truncate block">
                      {selectedFiscalizacao.fakeNick}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data de Início */}
              <div className="bg-secondary/20 border border-border/70 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Início da Fiscalização:</span>
                <span className="font-semibold text-foreground font-mono">
                  {selectedFiscalizacao.startDate || "-"}
                </span>
              </div>

              {/* Observações da Aula */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Etapas Observadas na Aplicação do CFSd
                </h3>

                {/* Início da Aula */}
                <div className="bg-secondary/20 border border-border/70 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground block">Início da Aula</span>
                  {selectedFiscalizacao.inicioAula?.length === 0 && !selectedFiscalizacao.inicioAulaOutro ? (
                    <span className="text-xs text-muted-foreground italic">Nenhum item assinalado.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedFiscalizacao.inicioAula?.map((item) => {
                        const isCrit = INFRACOES_CRITICAS.has(item);
                        return (
                          <span
                            key={item}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                              isCrit
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                                : "bg-primary/10 border-primary/20 text-foreground"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {item}
                          </span>
                        );
                      })}
                      {selectedFiscalizacao.inicioAulaOutro && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-secondary border-border text-foreground">
                          <strong>Outro:</strong> {selectedFiscalizacao.inicioAulaOutro}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Durante da Aula */}
                <div className="bg-secondary/20 border border-border/70 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground block">Durante da aula</span>
                  {selectedFiscalizacao.duranteAula?.length === 0 && !selectedFiscalizacao.duranteAulaOutro ? (
                    <span className="text-xs text-muted-foreground italic">Nenhum item assinalado.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedFiscalizacao.duranteAula?.map((item) => {
                        const isCrit = INFRACOES_CRITICAS.has(item);
                        return (
                          <span
                            key={item}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                              isCrit
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                                : "bg-primary/10 border-primary/20 text-foreground"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {item}
                          </span>
                        );
                      })}
                      {selectedFiscalizacao.duranteAulaOutro && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-secondary border-border text-foreground">
                          <strong>Outro:</strong> {selectedFiscalizacao.duranteAulaOutro}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Teste Teórico */}
                <div className="bg-secondary/20 border border-border/70 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground block">Teste teórico</span>
                  {selectedFiscalizacao.testeTeorico?.length === 0 && !selectedFiscalizacao.testeTeoricoOutro ? (
                    <span className="text-xs text-muted-foreground italic">Nenhum item assinalado.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedFiscalizacao.testeTeorico?.map((item) => {
                        const isCrit = INFRACOES_CRITICAS.has(item);
                        return (
                          <span
                            key={item}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                              isCrit
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                                : "bg-primary/10 border-primary/20 text-foreground"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {item}
                          </span>
                        );
                      })}
                      {selectedFiscalizacao.testeTeoricoOutro && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-secondary border-border text-foreground">
                          <strong>Outro:</strong> {selectedFiscalizacao.testeTeoricoOutro}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Comandos */}
                <div className="bg-secondary/20 border border-border/70 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground block">Comandos</span>
                  {selectedFiscalizacao.comandos?.length === 0 && !selectedFiscalizacao.comandosOutro ? (
                    <span className="text-xs text-muted-foreground italic">Nenhum item assinalado.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedFiscalizacao.comandos?.map((item) => {
                        const isCrit = INFRACOES_CRITICAS.has(item);
                        return (
                          <span
                            key={item}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                              isCrit
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                                : "bg-primary/10 border-primary/20 text-foreground"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {item}
                          </span>
                        );
                      })}
                      {selectedFiscalizacao.comandosOutro && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-secondary border-border text-foreground">
                          <strong>Outro:</strong> {selectedFiscalizacao.comandosOutro}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Finalização */}
                <div className="bg-secondary/20 border border-border/70 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground block">Finalização</span>
                  {selectedFiscalizacao.finalizacao?.length === 0 && !selectedFiscalizacao.finalizacaoOutro ? (
                    <span className="text-xs text-muted-foreground italic">Nenhum item assinalado.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedFiscalizacao.finalizacao?.map((item) => {
                        const isCrit = INFRACOES_CRITICAS.has(item);
                        return (
                          <span
                            key={item}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                              isCrit
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                                : "bg-primary/10 border-primary/20 text-foreground"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {item}
                          </span>
                        );
                      })}
                      {selectedFiscalizacao.finalizacaoOutro && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-secondary border-border text-foreground">
                          <strong>Outro:</strong> {selectedFiscalizacao.finalizacaoOutro}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Anexos e Prints */}
              <div className="bg-secondary/20 border border-border/70 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Prints e Comprovações da Avaliação:
                </span>
                <p className="text-xs font-mono text-muted-foreground break-all bg-background/80 p-3 rounded-lg border border-border/60">
                  {selectedFiscalizacao.proofs}
                </p>
                {selectedFiscalizacao.proofs.match(/https?:\/\/[^\s]+/g)?.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 cursor-pointer"
                  >
                    <span>Abrir Print #{i + 1}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>

              {/* Comentários adicionais */}
              <div className="bg-secondary/20 border border-border/70 rounded-xl p-4 space-y-1.5">
                <span className="text-xs font-bold text-foreground block">
                  Comentários Adicionais:
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedFiscalizacao.comments || "Nenhum comentário adicional registrado."}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-border/80 bg-secondary/30 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedFiscalizacao(null)}
                className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
