import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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
  RotateCcw,
  Send,
  User,
  ExternalLink,
  Plus,
  Eye,
  X,
  AlertTriangle,
  FileCheck2,
  RefreshCw,
  ArrowUpRight,
  Filter
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { 
  getFakeAccounts, 
  addFakeAccount, 
  deleteFakeAccount, 
  getFiscalizacoes, 
  addFiscalizacao, 
  deleteFiscalizacao, 
  addAuditLog 
} from "../lib/store";
import { FakeAccount, Fiscalizacao } from "../lib/types";
import { toast } from "sonner";
import { formatBrasiliaDateTime, getBrasiliaIsoNow } from "../lib/dateUtils";
import { fetchAllFromRemote, syncModule } from "../lib/syncManager";
import { ConfirmModal, EmptyState, SkeletonTable } from "../components/ui/ux";

export const Route = createFileRoute("/relatorio-avaliacoes")({
  component: RelatorioAvaliacoesPage,
});

// Link do formulário externo oficial do CSI
const CSI_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdmEdmWev23IVc2iN_qjVnqxVEI4t4Au9-cvE6tJCon5Nts2A/viewform";

// Opções das etapas de avaliação do CFSd (conforme formulário oficial)
const INICIO_AULA_OPTIONS = {
  positives: [
    "Realizou a fila no corredor",
    "Soube controlar os recrutas",
  ],
  negatives: [
    "Não realizou a fila no corredor",
    "Não soube controlar os recrutas",
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
  ],
  negatives: [
    "Pulou, manipulou ou alterou alguma parte do script",
    "Não prestou atenção nos requisitos",
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

// Modal padrão da aplicação (idêntico ao de casos.tsx e advertencias.tsx)
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = "max-w-2xl" 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-card border border-border shadow-2xl rounded-xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente elegante e compacto para seleção de critério da aula
function CriterionSelector({
  number,
  title,
  subtitle,
  options,
  selectedList,
  setSelectedList,
  hasOutro,
  setHasOutro,
  outroValue,
  setOutroValue,
}: {
  number: number;
  title: string;
  subtitle: string;
  options: { positives: string[]; negatives: string[] };
  selectedList: string[];
  setSelectedList: (list: string[]) => void;
  hasOutro: boolean;
  setHasOutro: (v: boolean) => void;
  outroValue: string;
  setOutroValue: (v: string) => void;
}) {
  const selected = selectedList[0] || "";
  const isInfraction = Boolean(selected && INFRACOES_CRITICAS.has(selected));
  const isPositive = Boolean(selected && options.positives.includes(selected));

  return (
    <div className="bg-secondary/15 border border-border/80 rounded-xl p-4 flex flex-col gap-2.5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <span className="text-primary font-bold">{number}.</span>
          <span>{title}</span>
        </label>
        {isInfraction && (
          <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1 w-fit animate-in fade-in">
            <AlertTriangle className="h-3 w-3" /> Irregularidade Identificada
          </span>
        )}
        {isPositive && (
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 w-fit animate-in fade-in">
            <CheckCircle2 className="h-3 w-3" /> Em Conformidade
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>

      <select
        value={hasOutro ? "__outro__" : selected}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "__outro__") {
            setHasOutro(true);
            setSelectedList([]);
          } else if (!val) {
            setHasOutro(false);
            setSelectedList([]);
          } else {
            setHasOutro(false);
            setSelectedList([val]);
          }
        }}
        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
      >
        <option value="">Selecione a situação observada...</option>
        <optgroup label="✅ Em Conformidade (Positivas)">
          {options.positives.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </optgroup>
        <optgroup label="⚠️ Irregularidades no CFSd (Negativas)">
          {options.negatives.map((neg) => (
            <option key={neg} value={neg}>
              {neg}
            </option>
          ))}
        </optgroup>
        <option value="__outro__">✏️ Outra observação personalizada...</option>
      </select>

      {hasOutro && (
        <input
          type="text"
          value={outroValue}
          onChange={(e) => setOutroValue(e.target.value)}
          placeholder="Especifique outros detalhes observados nesta etapa..."
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors animate-in fade-in"
        />
      )}
    </div>
  );
}

function RelatorioAvaliacoesPage() {
  const { user } = useAuth();
  const role = user?.role || "Fiscalizador";
  const isAdmin = ["Presidente", "Vice-Presidente", "Ministério", "Diretor"].includes(role);

  // Estados principais
  const [activeTab, setActiveTab] = useState<"fakes" | "avaliacoes">("fakes");
  const [fakes, setFakes] = useState<FakeAccount[]>([]);
  const [fiscalizacoes, setFiscalizacoes] = useState<Fiscalizacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingWithSheets, setIsSyncingWithSheets] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Busca e filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [fiscSearchTerm, setFiscSearchTerm] = useState("");
  const [fiscStatusFilter, setFiscStatusFilter] = useState<"Todas" | "Conforme" | "Com Irregularidades">("Todas");

  // Modais de Criação
  const [isCreateFakeOpen, setIsCreateFakeOpen] = useState(false);
  const [isCreateFiscalizacaoOpen, setIsCreateFiscalizacaoOpen] = useState(false);
  const [selectedFiscalizacao, setSelectedFiscalizacao] = useState<Fiscalizacao | null>(null);

  // Modais de Exclusão
  const [fakeToDelete, setFakeToDelete] = useState<FakeAccount | null>(null);
  const [fiscToDelete, setFiscToDelete] = useState<Fiscalizacao | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados do Formulário de Fake
  const [formOwnerNick, setFormOwnerNick] = useState(user?.nick || "");
  const [formFakeNick, setFormFakeNick] = useState("");
  const [formAgreed, setFormAgreed] = useState(false);
  const [isSubmittingFake, setIsSubmittingFake] = useState(false);

  // Estados do Formulário de Avaliação
  const [fiscStartDate, setFiscStartDate] = useState(getBrasiliaIsoNow());
  const [fiscFiscalizadorNick, setFiscFiscalizadorNick] = useState(user?.nick || "");
  const [fiscInstrutorNick, setFiscInstrutorNick] = useState("");
  const [fiscFakeNick, setFiscFakeNick] = useState("");
  const [isSubmittingFisc, setIsSubmittingFisc] = useState(false);

  // Etapas do CFSd
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

  // Carregar dados locais
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allFakes, allFiscalizacoes] = await Promise.all([
        getFakeAccounts(),
        getFiscalizacoes(),
      ]);
      setFakes(allFakes || []);
      setFiscalizacoes(allFiscalizacoes || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar dados locais.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchAllFromRemote()
      .then(() => loadData())
      .catch((err) => console.warn("Sincronização remota inicial:", err));
  }, []);

  // Sincronização manual
  const handleManualSync = async () => {
    setIsSyncingWithSheets(true);
    toast.info("Sincronizando dados com a planilha...");
    try {
      await fetchAllFromRemote();
      await loadData();
      toast.success("Dados sincronizados com sucesso!");
    } catch (err) {
      console.error("Erro ao sincronizar manualmente:", err);
      toast.error("Falha ao sincronizar com a planilha.");
    } finally {
      setIsSyncingWithSheets(false);
    }
  };

  // Atualizar nicks com o usuário logado
  useEffect(() => {
    if (user?.nick) {
      if (!formOwnerNick) setFormOwnerNick(user.nick);
      if (!fiscFiscalizadorNick) setFiscFiscalizadorNick(user.nick);
    }
  }, [user?.nick]);

  // Fakes cadastradas pelo avaliador selecionado
  const fiscalizadorFakes = useMemo(() => {
    const target = (fiscFiscalizadorNick || user?.nick || "").trim().toLowerCase();
    if (!target) return [];
    return fakes.filter(
      (f) =>
        f.ownerNick?.trim().toLowerCase() === target ||
        f.registeredByNick?.trim().toLowerCase() === target
    );
  }, [fakes, fiscFiscalizadorNick, user?.nick]);

  // Pré-selecionar fake se houver apenas 1
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

  // Métricas rápidas de Fakes
  const fakesMetrics = useMemo(() => {
    const total = fakes.length;
    const myFakes = fakes.filter(
      (f) =>
        f.ownerNick?.toLowerCase() === (user?.nick || "").toLowerCase() ||
        f.registeredByNick?.toLowerCase() === (user?.nick || "").toLowerCase()
    ).length;
    return { total, myFakes };
  }, [fakes, user?.nick]);

  // Lista de fakes filtradas
  const filteredFakes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return fakes.filter((item) => {
      return (
        item.fakeNick?.toLowerCase().includes(term) ||
        item.ownerNick?.toLowerCase().includes(term) ||
        item.id?.toLowerCase().includes(term)
      );
    });
  }, [fakes, searchTerm]);

  // Métricas de Avaliações
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

  // Lista de avaliações filtradas
  const filteredFiscalizacoes = useMemo(() => {
    return fiscalizacoes.filter((item) => {
      const term = fiscSearchTerm.toLowerCase();
      const matchesSearch = (
        item.id?.toLowerCase().includes(term) ||
        item.instrutorNick?.toLowerCase().includes(term) ||
        item.fiscalizadorNick?.toLowerCase().includes(term) ||
        item.fakeNick?.toLowerCase().includes(term)
      );

      const allSelected = [
        ...(item.inicioAula || []),
        ...(item.duranteAula || []),
        ...(item.testeTeorico || []),
        ...(item.comandos || []),
        ...(item.finalizacao || []),
      ];
      const hasInfraction = allSelected.some((x) => INFRACOES_CRITICAS.has(x));

      let matchesStatus = true;
      if (fiscStatusFilter === "Conforme") {
        matchesStatus = !hasInfraction;
      } else if (fiscStatusFilter === "Com Irregularidades") {
        matchesStatus = hasInfraction;
      }

      return matchesSearch && matchesStatus;
    });
  }, [fiscalizacoes, fiscSearchTerm, fiscStatusFilter]);

  // Copiar nick da fake
  const handleCopyNick = (fakeNick: string, id: string) => {
    navigator.clipboard.writeText(fakeNick);
    setCopiedId(id);
    toast.success(`Nick "${fakeNick}" copiado!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Enviar Formulário de Fake
  const handleSubmitFake = async (e: React.FormEvent) => {
    e.preventDefault();
    const owner = formOwnerNick.trim();
    const fake = formFakeNick.trim();

    if (!owner || !fake) {
      toast.error("Preencha o seu Nickname e o da conta Fake criada.");
      return;
    }

    if (!formAgreed) {
      toast.error("Você precisa aceitar os termos de responsabilidade.");
      return;
    }

    const alreadyExists = fakes.find((f) => f.fakeNick?.toLowerCase() === fake.toLowerCase());
    if (alreadyExists) {
      toast.warning(`A fake "${fake}" já foi registrada por ${alreadyExists.ownerNick}.`);
    }

    setIsSubmittingFake(true);
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
      setFormFakeNick("");
      setFormAgreed(false);
      setIsCreateFakeOpen(false);
      syncModule("fakes").catch(console.error);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível registrar a fake. Tente novamente.");
    } finally {
      setIsSubmittingFake(false);
    }
  };

  // Excluir fake
  const handleOpenDeleteFake = (fake: FakeAccount) => {
    const isOwner =
      fake.ownerNick?.toLowerCase() === (user?.nick || "").toLowerCase() ||
      fake.registeredByNick?.toLowerCase() === (user?.nick || "").toLowerCase();

    if (!isAdmin && !isOwner) {
      toast.error("Apenas o responsável pelo registro ou a Diretoria podem excluir esta fake.");
      return;
    }
    setFakeToDelete(fake);
  };

  const confirmDeleteFake = async () => {
    if (!fakeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFakeAccount(fakeToDelete.id);
      setFakes((prev) => prev.filter((f) => f.id !== fakeToDelete.id));
      toast.success(`Registro da fake "${fakeToDelete.fakeNick}" excluído.`);

      await addAuditLog(
        user?.id || "1",
        role || "Fiscalizador",
        "Exclusão de Fake",
        "Fiscalização",
        `Excluiu o registro da fake "${fakeToDelete.fakeNick}".`,
        fakeToDelete.id,
        user?.nick
      );
      syncModule("fakes").catch(console.error);
    } catch (err) {
      toast.error("Erro ao excluir fake.");
    } finally {
      setIsDeleting(false);
      setFakeToDelete(null);
    }
  };

  // Resetar campos de avaliação
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

  // Enviar Avaliação
  const handleSubmitFiscalizacao = async (e: React.FormEvent) => {
    e.preventDefault();

    const fiscalizador = fiscFiscalizadorNick.trim();
    const instrutor = fiscInstrutorNick.trim();
    const fake = fiscFakeNick.trim();

    if (!fiscalizador || !instrutor || !fake) {
      toast.error("Preencha o Nick do Avaliador, do Instrutor e selecione a Fake utilizada.");
      return;
    }

    if (!fiscProofs.trim()) {
      toast.error("Insira o link das provas/prints da avaliação.");
      return;
    }

    let cleanComments = fiscComments.trim();
    if (cleanComments.includes(",")) {
      cleanComments = cleanComments.replace(/,/g, ";");
      toast.info("As vírgulas do seu comentário foram convertidas para ';' para evitar quebrar a planilha.");
    }

    setIsSubmittingFisc(true);
    try {
      const newFisc: Fiscalizacao = {
        id: `AVAL-${Date.now().toString(36).toUpperCase()}`,
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
        `Registrou avaliação do instrutor "${instrutor}" (Fake: ${fake}, Avaliador: ${fiscalizador}).`,
        newFisc.id,
        user?.nick || fiscalizador
      );

      setFiscalizacoes((prev) => [newFisc, ...prev]);
      toast.success("Avaliação registrada com sucesso!");
      setIsCreateFiscalizacaoOpen(false);
      handleResetFiscalizacaoForm();
      syncModule("fiscalizacoes").catch(console.error);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao registrar avaliação.");
    } finally {
      setIsSubmittingFisc(false);
    }
  };

  // Excluir avaliação
  const handleOpenDeleteFiscalizacao = (item: Fiscalizacao) => {
    const isOwner =
      item.fiscalizadorNick?.toLowerCase() === (user?.nick || "").toLowerCase() ||
      item.fiscalizadorId === user?.id;

    if (!isAdmin && !isOwner) {
      toast.error("Apenas o avaliador responsável ou a Diretoria podem excluir esta avaliação.");
      return;
    }
    setFiscToDelete(item);
  };

  const confirmDeleteFiscalizacao = async () => {
    if (!fiscToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFiscalizacao(fiscToDelete.id);
      setFiscalizacoes((prev) => prev.filter((f) => f.id !== fiscToDelete.id));
      toast.success(`Avaliação #${fiscToDelete.id} excluída com sucesso.`);

      await addAuditLog(
        user?.id || "1",
        role || "Fiscalizador",
        "Exclusão de Fiscalização",
        "Fiscalização",
        `Excluiu a avaliação #${fiscToDelete.id} do instrutor ${fiscToDelete.instrutorNick}.`,
        fiscToDelete.id,
        user?.nick
      );
      syncModule("fiscalizacoes").catch(console.error);
    } catch (err) {
      toast.error("Erro ao excluir avaliação.");
    } finally {
      setIsDeleting(false);
      setFiscToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Cabeçalho da Página (Padrão Oficial SSI) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <ClipboardList className="h-8 w-8 text-primary" />
            Relatório de Avaliações
          </h1>
          <p className="text-muted-foreground mt-1">
            Controle de contas fakes e registro de avaliações de instrução da equipe.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncingWithSheets}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium border border-border bg-background hover:bg-secondary/50 transition-colors cursor-pointer disabled:opacity-50 shadow-sm w-full sm:w-auto"
            title="Sincronizar com a planilha do Google Sheets"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncingWithSheets ? "animate-spin" : ""}`} />
            <span>{isSyncingWithSheets ? "Sincronizando..." : "Sincronizar Planilha"}</span>
          </button>
        </div>
      </div>

      {/* Navegação por Abas Limpas */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("fakes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
            activeTab === "fakes"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent hover:border-border"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Registro de Fakes</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === "fakes" ? "bg-white/20 text-white" : "bg-background/60 text-muted-foreground"
          }`}>
            {fakes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("avaliacoes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
            activeTab === "avaliacoes"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent hover:border-border"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Registro de Avaliações</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === "avaliacoes" ? "bg-white/20 text-white" : "bg-background/60 text-muted-foreground"
          }`}>
            {fiscalizacoes.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: REGISTRO DE FAKES                                                 */}
      {/* ========================================================================= */}
      {activeTab === "fakes" && (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          {/* Métricas e Botões de Ação */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Total de Fakes</p>
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mt-2">{fakesMetrics.total}</h3>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Minhas Fakes</p>
                  <User className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mt-2">{fakesMetrics.myFakes}</h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Botão de Registro Externo no CSI */}
              <a
                href={CSI_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-4 py-2.5 rounded-md font-medium text-sm transition-all w-full sm:w-auto shadow-sm"
                title="Cadastrar fake na planilha oficial do CSI (Formulário Externo)"
              >
                <ExternalLink className="h-4 w-4 text-amber-400" />
                <span>Registrar Fake no CSI</span>
              </a>

              {/* Botão para Abrir Modal de Criação de Fake no SSI */}
              <button
                type="button"
                onClick={() => setIsCreateFakeOpen(true)}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-md font-medium text-sm transition-all w-full sm:w-auto shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Registrar Fake (SSI)</span>
              </button>
            </div>
          </div>

          {/* Tabela de Fakes Registradas */}
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden mt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border gap-4 bg-secondary/10">
              <div>
                <h3 className="text-base font-bold text-foreground">Histórico de Fakes Registradas</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Consulte e copie o nickname das contas fakes vinculadas aos membros do setor.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:border-primary/50 transition-colors flex-1 sm:w-64 shadow-sm">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <input
                    type="text"
                    placeholder="Buscar fake ou responsável..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <SkeletonTable rows={5} />
              ) : filteredFakes.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    icon={ShieldCheck}
                    title="Nenhuma fake encontrada"
                    description={
                      searchTerm
                        ? "Nenhuma conta fake corresponde à busca digitada."
                        : "Nenhuma conta fake foi registrada ainda no sistema."
                    }
                  />
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Conta Fake</th>
                      <th className="px-6 py-4 font-medium">Responsável</th>
                      <th className="px-6 py-4 font-medium">Registrado Por</th>
                      <th className="px-6 py-4 font-medium">Data de Registro</th>
                      <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredFakes.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                              <img
                                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                                  item.fakeNick
                                )}&headonly=1&size=m`}
                                alt={item.fakeNick}
                                className="h-10 w-10 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                            <span className="font-bold text-foreground text-sm">
                              {item.fakeNick}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-md overflow-hidden bg-secondary border border-border/70 flex items-center justify-center shrink-0">
                              <img
                                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                                  item.ownerNick
                                )}&headonly=1&size=s`}
                                alt={item.ownerNick}
                                className="h-7 w-7 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {item.ownerNick}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-3.5 text-xs text-muted-foreground">
                          {item.registeredByNick || item.registeredBy}
                        </td>

                        <td className="px-6 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {item.createdAt}
                        </td>

                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyNick(item.fakeNick, item.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground bg-background border border-border hover:border-primary/50 transition-colors cursor-pointer"
                              title="Copiar Nick da Fake"
                            >
                              {copiedId === item.id ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteFake(item)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-rose-400 bg-background border border-border hover:border-rose-500/30 transition-colors cursor-pointer"
                              title="Excluir Registro"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: REGISTRO DE AVALIAÇÕES                                             */}
      {/* ========================================================================= */}
      {activeTab === "avaliacoes" && (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          {/* Métricas de Avaliações */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Avaliações</p>
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-2">{fiscMetrics.total}</h3>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Minhas Avaliações</p>
                <User className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mt-2">{fiscMetrics.myFisc}</h3>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Instrutores</p>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-2">{fiscMetrics.uniqueInstructors}</h3>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Irregularidades</p>
                <AlertTriangle className={`h-4 w-4 ${fiscMetrics.withInfractions > 0 ? "text-amber-400" : "text-emerald-400"}`} />
              </div>
              <h3 className={`text-2xl font-bold mt-2 ${fiscMetrics.withInfractions > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {fiscMetrics.withInfractions}
              </h3>
            </div>
          </div>

          {/* Ações e Tabela de Avaliações */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Avaliações de Aulas (CFSd)</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Acompanhamento e registro da postura de instrutores no script oficial.
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
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-md font-medium text-sm transition-all w-full sm:w-auto shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Avaliação</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden mt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border gap-4 bg-secondary/10">
              {/* Filtros Rápidos */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {(["Todas", "Conforme", "Com Irregularidades"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFiscStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      fiscStatusFilter === status
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent hover:border-border"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Campo de Busca */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:border-primary/50 transition-colors flex-1 sm:w-64 shadow-sm">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <input
                    type="text"
                    placeholder="Buscar instrutor, avaliador..."
                    value={fiscSearchTerm}
                    onChange={(e) => setFiscSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <SkeletonTable rows={5} />
              ) : filteredFiscalizacoes.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    icon={FileCheck2}
                    title="Nenhuma avaliação encontrada"
                    description={
                      fiscSearchTerm || fiscStatusFilter !== "Todas"
                        ? "Nenhuma avaliação corresponde ao filtro ou busca selecionada."
                        : "Nenhuma avaliação foi registrada ainda. Clique no botão '+ Nova Avaliação' acima para cadastrar a primeira."
                    }
                  />
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data / Início</th>
                      <th className="px-6 py-4 font-medium">Instrutor Avaliado</th>
                      <th className="px-6 py-4 font-medium">Avaliador</th>
                      <th className="px-6 py-4 font-medium">Fake Utilizada</th>
                      <th className="px-6 py-4 font-medium">Status CFSd</th>
                      <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
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
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-foreground">
                                {item.startDate || item.createdAt}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                #{item.id}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-3.5">
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
                              <span className="font-semibold text-foreground text-sm">
                                {item.instrutorNick}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                {item.fiscalizadorNick}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-3.5">
                            <span className="text-xs font-mono bg-secondary/60 border border-border px-2 py-0.5 rounded text-foreground">
                              {item.fakeNick}
                            </span>
                          </td>

                          <td className="px-6 py-3.5">
                            {hasInfraction ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit bg-amber-500/10 text-amber-400 border-amber-500/20">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Irregularidades
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Em Conformidade
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedFiscalizacao(item)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground bg-background border border-border hover:border-primary/50 rounded-md transition-colors cursor-pointer"
                                title="Visualizar Detalhes"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Detalhes</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteFiscalizacao(item)}
                                className="p-1.5 text-muted-foreground hover:text-rose-400 bg-background border border-border hover:border-rose-500/30 rounded-md transition-colors cursor-pointer"
                                title="Excluir Avaliação"
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR FAKE (SSI & LINK EXTERNO CSI)                          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateFakeOpen}
        onClose={() => setIsCreateFakeOpen(false)}
        title="Registrar Conta Fake (SSI)"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitFake} className="flex flex-col gap-5">
          {/* Banner do Formulário Oficial do CSI */}
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-start gap-2.5">
              <ExternalLink className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block">Formulário Externo do CSI</strong>
                <span className="text-muted-foreground text-[11px] leading-relaxed">
                  Lembre-se que além do cadastro no SSI, sua fake deve ser registrada no CSI.
                </span>
              </div>
            </div>
            <a
              href={CSI_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold whitespace-nowrap transition-colors"
            >
              <span>Abrir Formulário CSI</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Responsável */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Responsável (Nick) <span className="text-rose-400">*</span>
                </label>
                {user?.nick && formOwnerNick !== user.nick && (
                  <button
                    type="button"
                    onClick={() => setFormOwnerNick(user.nick)}
                    className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                  >
                    Usar meu nick
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {formOwnerNick.trim() && (
                  <div className="h-8 w-8 rounded-md overflow-hidden bg-secondary border border-border shrink-0 flex items-center justify-center">
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                        formOwnerNick.trim()
                      )}&headonly=1&size=s`}
                      alt={formOwnerNick}
                      className="h-8 w-8 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={formOwnerNick}
                  onChange={(e) => setFormOwnerNick(e.target.value)}
                  placeholder="Ex: tchaumateu21"
                  required
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors w-full"
                />
              </div>
            </div>

            {/* Fake Criada */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Nickname da Fake Criada <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                {formFakeNick.trim() && (
                  <div className="h-8 w-8 rounded-md overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                        formFakeNick.trim()
                      )}&headonly=1&size=s`}
                      alt={formFakeNick}
                      className="h-8 w-8 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={formFakeNick}
                  onChange={(e) => setFormFakeNick(e.target.value)}
                  placeholder="Ex: FakeInstrutor01"
                  required
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors w-full"
                />
              </div>
            </div>
          </div>

          {/* Termo de Responsabilidade */}
          <div
            onClick={() => setFormAgreed(!formAgreed)}
            className={`border rounded-lg p-3.5 transition-all cursor-pointer select-none ${
              formAgreed
                ? "bg-primary/5 border-primary/50"
                : "bg-secondary/20 border-border hover:bg-secondary/30"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formAgreed}
                onChange={() => {}}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <div className="flex-1">
                <span className="text-xs font-semibold text-foreground block">
                  Termo de Responsabilidade: <span className="text-rose-400">*</span>
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Concordo com os termos de responsabilidade para a utilização de fakes e assumo o compromisso de cumprir com o exigido, estando sujeito a punições internas e externas por mau uso.
                </p>
              </div>
            </div>
          </div>

          {/* Footer do Modal */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsCreateFakeOpen(false)}
              className="px-4 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingFake}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmittingFake ? "Salvando..." : "Salvar Fake"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTRO DE AVALIAÇÃO (CFSd)                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateFiscalizacaoOpen}
        onClose={() => setIsCreateFiscalizacaoOpen(false)}
        title="Registro de Avaliação (CFSd)"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitFiscalizacao} className="flex flex-col gap-6">
          {/* Seção 1: Identificação */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>1. Identificação Geral</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Data e Horário de Início <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={fiscStartDate}
                  onChange={(e) => setFiscStartDate(e.target.value)}
                  required
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Avaliador (Seu Nick) <span className="text-rose-400">*</span>
                  </label>
                  {user?.nick && fiscFiscalizadorNick !== user.nick && (
                    <button
                      type="button"
                      onClick={() => setFiscFiscalizadorNick(user.nick)}
                      className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      Usar meu nick
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {fiscFiscalizadorNick.trim() && (
                    <div className="h-8 w-8 rounded-md overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
                      <img
                        src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                          fiscFiscalizadorNick.trim()
                        )}&headonly=1&size=s`}
                        alt={fiscFiscalizadorNick}
                        className="h-8 w-8 object-cover"
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
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Instrutor Avaliado <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {fiscInstrutorNick.trim() && (
                    <div className="h-8 w-8 rounded-md overflow-hidden bg-secondary border border-border shrink-0 flex items-center justify-center">
                      <img
                        src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                          fiscInstrutorNick.trim()
                        )}&headonly=1&size=s`}
                        alt={fiscInstrutorNick}
                        className="h-8 w-8 object-cover"
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
                    placeholder="Ex: BravoInstrutor"
                    required
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Fake Utilizada <span className="text-rose-400">*</span>
                </label>
                {fiscalizadorFakes.length > 0 ? (
                  <select
                    value={fiscFakeNick}
                    onChange={(e) => setFiscFakeNick(e.target.value)}
                    required
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="">Selecione sua conta fake...</option>
                    {fiscalizadorFakes.map((f) => (
                      <option key={f.id} value={f.fakeNick}>
                        {f.fakeNick}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={fiscFakeNick}
                    onChange={(e) => setFiscFakeNick(e.target.value)}
                    placeholder="Digite a fake utilizada..."
                    required
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Seção 2: Etapas do CFSd */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span>2. Aplicação do Curso de Formação de Soldados (CFSd)</span>
            </h3>

            <div className="flex flex-col gap-3">
              <CriterionSelector
                number={1}
                title="Início da Aula"
                subtitle="Conduta observada no corredor e na entrada dos recrutas."
                options={INICIO_AULA_OPTIONS}
                selectedList={fiscInicioAula}
                setSelectedList={setFiscInicioAula}
                hasOutro={fiscHasInicioOutro}
                setHasOutro={setFiscHasInicioOutro}
                outroValue={fiscInicioAulaOutro}
                setOutroValue={setFiscInicioAulaOutro}
              />

              <CriterionSelector
                number={2}
                title="Durante da Aula"
                subtitle="Passagem do script, velocidade de envio e atenção a dúvidas."
                options={DURANTE_AULA_OPTIONS}
                selectedList={fiscDuranteAula}
                setSelectedList={setFiscDuranteAula}
                hasOutro={fiscHasDuranteOutro}
                setHasOutro={setFiscHasDuranteOutro}
                outroValue={fiscDuranteAulaOutro}
                setOutroValue={setFiscDuranteAulaOutro}
              />

              <CriterionSelector
                number={3}
                title="Teste Teórico"
                subtitle="Atenção às respostas, correção de erros e critério de aprovação."
                options={TESTE_TEORICO_OPTIONS}
                selectedList={fiscTesteTeorico}
                setSelectedList={setFiscTesteTeorico}
                hasOutro={fiscHasTeoricoOutro}
                setHasOutro={setFiscHasTeoricoOutro}
                outroValue={fiscTesteTeoricoOutro}
                setOutroValue={setFiscTesteTeoricoOutro}
              />

              <CriterionSelector
                number={4}
                title="Prática de Comandos"
                subtitle="Ensino, prática individual logo após a explicação e cobrança correta."
                options={COMANDOS_OPTIONS}
                selectedList={fiscComandos}
                setSelectedList={setFiscComandos}
                hasOutro={fiscHasComandosOutro}
                setHasOutro={setFiscHasComandosOutro}
                outroValue={fiscComandosOutro}
                setOutroValue={setFiscComandosOutro}
              />

              <CriterionSelector
                number={5}
                title="Finalização"
                subtitle="Script de encerramento e conferência criteriosa dos requisitos."
                options={FINALIZACAO_OPTIONS}
                selectedList={fiscFinalizacao}
                setSelectedList={setFiscFinalizacao}
                hasOutro={fiscHasFinalizacaoOutro}
                setHasOutro={setFiscHasFinalizacaoOutro}
                outroValue={fiscFinalizacaoOutro}
                setOutroValue={setFiscFinalizacaoOutro}
              />
            </div>
          </div>

          {/* Seção 3: Provas e Observações */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>3. Comprovações e Encerramento</span>
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Anexo / Prints da Aula (URL) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={fiscProofs}
                onChange={(e) => setFiscProofs(e.target.value)}
                placeholder="https://imgur.com/a/... (links dos prints de comprovação)"
                required
                className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Comentários Adicionais
                </label>
                {fiscComments.includes(",") && (
                  <button
                    type="button"
                    onClick={() => setFiscComments(fiscComments.replace(/,/g, ";"))}
                    className="text-[11px] text-amber-400 hover:underline font-medium cursor-pointer"
                  >
                    Substituir vírgulas por ';'
                  </button>
                )}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-2.5 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Regra SSI:</strong> Não utilize vírgulas (,) nos comentários para não desalinhar a planilha. Use ponto e vírgula (;) ou traço (-).
                </span>
              </div>

              <textarea
                rows={3}
                value={fiscComments}
                onChange={(e) => setFiscComments(e.target.value)}
                placeholder="Observações complementares sobre a aula ou postura do instrutor..."
                className="bg-background border border-border rounded-md p-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer do Modal */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleResetFiscalizacaoForm}
              className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
            >
              Limpar Campos
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateFiscalizacaoOpen(false)}
                className="px-4 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingFisc}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmittingFisc ? "Salvando..." : "Salvar Avaliação"}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: DETALHES DA AVALIAÇÃO                                            */}
      {/* ========================================================================= */}
      {selectedFiscalizacao && (
        <Modal
          isOpen={!!selectedFiscalizacao}
          onClose={() => setSelectedFiscalizacao(null)}
          title={`Avaliação #${selectedFiscalizacao.id}`}
          maxWidth="max-w-2xl"
        >
          <div className="flex flex-col gap-5 text-sm">
            {/* Participantes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-secondary/30 border border-border rounded-lg p-3 flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-md overflow-hidden bg-secondary border border-border/70 flex items-center justify-center shrink-0">
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                      selectedFiscalizacao.instrutorNick
                    )}&headonly=1&size=m`}
                    alt={selectedFiscalizacao.instrutorNick}
                    className="h-9 w-9 object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Instrutor
                  </span>
                  <span className="text-xs font-bold text-foreground truncate block">
                    {selectedFiscalizacao.instrutorNick}
                  </span>
                </div>
              </div>

              <div className="bg-secondary/30 border border-border rounded-lg p-3 flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-md overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                      selectedFiscalizacao.fiscalizadorNick
                    )}&headonly=1&size=m`}
                    alt={selectedFiscalizacao.fiscalizadorNick}
                    className="h-9 w-9 object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-primary uppercase font-semibold block">
                    Avaliador
                  </span>
                  <span className="text-xs font-bold text-foreground truncate block">
                    {selectedFiscalizacao.fiscalizadorNick}
                  </span>
                </div>
              </div>

              <div className="bg-secondary/30 border border-border rounded-lg p-3 flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-md overflow-hidden bg-secondary border border-border/70 flex items-center justify-center shrink-0">
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
                      selectedFiscalizacao.fakeNick
                    )}&headonly=1&size=m`}
                    alt={selectedFiscalizacao.fakeNick}
                    className="h-9 w-9 object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Fake Utilizada
                  </span>
                  <span className="text-xs font-bold text-foreground truncate block font-mono">
                    {selectedFiscalizacao.fakeNick}
                  </span>
                </div>
              </div>
            </div>

            {/* Data */}
            <div className="bg-secondary/20 border border-border rounded-lg px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Data / Início:</span>
              <span className="font-semibold text-foreground font-mono">
                {selectedFiscalizacao.startDate || selectedFiscalizacao.createdAt || "-"}
              </span>
            </div>

            {/* Observações registradas nas 5 etapas */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Situações Registradas no CFSd
              </h4>

              {[
                { label: "1. Início da Aula", items: selectedFiscalizacao.inicioAula, outro: selectedFiscalizacao.inicioAulaOutro },
                { label: "2. Durante da Aula", items: selectedFiscalizacao.duranteAula, outro: selectedFiscalizacao.duranteAulaOutro },
                { label: "3. Teste Teórico", items: selectedFiscalizacao.testeTeorico, outro: selectedFiscalizacao.testeTeoricoOutro },
                { label: "4. Comandos", items: selectedFiscalizacao.comandos, outro: selectedFiscalizacao.comandosOutro },
                { label: "5. Finalização", items: selectedFiscalizacao.finalizacao, outro: selectedFiscalizacao.finalizacaoOutro },
              ].map((etapa, idx) => (
                <div key={idx} className="bg-secondary/15 border border-border rounded-lg p-3 space-y-1.5">
                  <span className="text-xs font-bold text-foreground block">{etapa.label}</span>
                  {(!etapa.items || etapa.items.length === 0) && !etapa.outro ? (
                    <span className="text-xs text-muted-foreground italic">Nenhum item assinalado.</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {etapa.items?.map((it) => {
                        const isCrit = INFRACOES_CRITICAS.has(it);
                        return (
                          <span
                            key={it}
                            className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1.5 ${
                              isCrit
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            }`}
                          >
                            {isCrit ? <AlertTriangle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                            {it}
                          </span>
                        );
                      })}
                      {etapa.outro && (
                        <span className="px-2.5 py-1 rounded text-xs font-medium border bg-secondary border-border text-foreground">
                          <strong>Outro:</strong> {etapa.outro}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Prints */}
            <div className="bg-secondary/15 border border-border rounded-lg p-3 space-y-1.5">
              <span className="text-xs font-bold text-foreground block">
                Comprovações / Prints:
              </span>
              <p className="text-xs font-mono text-muted-foreground break-all bg-background p-2.5 rounded border border-border">
                {selectedFiscalizacao.proofs}
              </p>
              {selectedFiscalizacao.proofs.match(/https?:\/\/[^\s]+/g)?.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-1 bg-primary/10 px-3 py-1 rounded border border-primary/20"
                >
                  <span>Abrir Link #{i + 1}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>

            {/* Comentários */}
            <div className="bg-secondary/15 border border-border rounded-lg p-3 space-y-1">
              <span className="text-xs font-bold text-foreground block">
                Comentários Adicionais:
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedFiscalizacao.comments || "Nenhum comentário adicional registrado."}
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedFiscalizacao(null)}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs rounded-md transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmação de Exclusão de Fake */}
      <ConfirmModal
        isOpen={!!fakeToDelete}
        title="Excluir Conta Fake?"
        description={`Tem certeza de que deseja remover a fake "${fakeToDelete?.fakeNick}" (${fakeToDelete?.ownerNick})? A alteração será sincronizada com a planilha.`}
        confirmText="Excluir Registro"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteFake}
        onClose={() => setFakeToDelete(null)}
      />

      {/* Confirmação de Exclusão de Avaliação */}
      <ConfirmModal
        isOpen={!!fiscToDelete}
        title="Excluir Avaliação?"
        description={`Tem certeza de que deseja remover a avaliação #${fiscToDelete?.id} do instrutor "${fiscToDelete?.instrutorNick}"? A alteração será sincronizada com a planilha.`}
        confirmText="Excluir Avaliação"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteFiscalizacao}
        onClose={() => setFiscToDelete(null)}
      />
    </div>
  );
}
