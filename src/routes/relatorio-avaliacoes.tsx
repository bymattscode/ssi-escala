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
  BarChart3, 
  RotateCcw,
  Send,
  User,
  ExternalLink,
  Lock,
  Sparkles
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { 
  getFakeAccounts, 
  addFakeAccount, 
  updateFakeAccount, 
  deleteFakeAccount, 
  getMembers, 
  addAuditLog 
} from "../lib/store";
import { FakeAccount, Member } from "../lib/types";
import { toast } from "sonner";
import { formatBrasiliaDateTime } from "../lib/dateUtils";

export const Route = createFileRoute("/relatorio-avaliacoes")({
  component: RelatorioFiscalizacaoPage,
});

function RelatorioFiscalizacaoPage() {
  const { user, role } = useAuth();
  const isAdmin = role === "Ministério" || role === "Presidente" || role === "Vice-Presidente" || role === "Diretor";

  // Navegação em 3 Abas
  const [activeTab, setActiveTab] = useState<"fakes" | "formulario" | "resultados">("fakes");

  // Dados de Fakes e Membros
  const [fakes, setFakes] = useState<FakeAccount[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados do Formulário de Registro de Fake
  const [formOwnerNick, setFormOwnerNick] = useState("");
  const [formFakeNick, setFormFakeNick] = useState("");
  const [formAgreed, setFormAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de Filtro da Tabela de Fakes
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [loadedFakes, loadedMembers] = await Promise.all([
          getFakeAccounts(),
          getMembers(),
        ]);
        setFakes(Array.isArray(loadedFakes) ? loadedFakes : []);
        setMembers(Array.isArray(loadedMembers) ? loadedMembers : []);
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
  }, [user?.nick, formOwnerNick]);

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

  // Métricas rápidas
  const metrics = useMemo(() => {
    const total = fakes.length;
    const myFakes = fakes.filter(
      (f) =>
        f.ownerNick?.toLowerCase() === (user?.nick || "").toLowerCase() ||
        f.registeredByNick?.toLowerCase() === (user?.nick || "").toLowerCase()
    ).length;
    return { total, myFakes };
  }, [fakes, user?.nick]);

  // Handler para Limpar Formulário
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
      await addAuditLog({
        userId: user?.id || owner,
        userNick: user?.nick || owner,
        userRole: role || "Fiscalizador",
        action: "Registro de Fake",
        module: "Fiscalização",
        details: `Registrou a conta fake "${fake}" para o responsável "${owner}".`,
        targetId: newFake.id,
      });

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

      await addAuditLog({
        userId: user?.id || "1",
        userNick: user?.nick,
        userRole: role || "Fiscalizador",
        action: "Exclusão de Fake",
        module: "Fiscalização",
        details: `Excluiu o registro da fake "${fake.fakeNick}" (Responsável: ${fake.ownerNick}).`,
        targetId: fake.id,
      });
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
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Etapa 2
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("resultados")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "resultados"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Resultados</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Presidência
          </span>
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
                    <span>[SSI] Registro de fakes</span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    Formulário de registro de fakes dos membros do{" "}
                    <strong className="text-foreground">Setor de Segurança dos Instrutores</strong>.
                  </p>
                </div>
              </div>
              <p className="text-xs text-rose-400 font-medium mt-4 flex items-center gap-1.5">
                <span>*</span> Indica uma pergunta obrigatória
              </p>
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
      {/* ABA 2: FORMULÁRIO DE FISCALIZAÇÃO (ETAPA 2 - AGUARDANDO FOTOS DO USUÁRIO) */}
      {/* ========================================================================= */}
      {activeTab === "formulario" && (
        <div className="bg-card border border-border/80 rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[380px] shadow-sm animate-in fade-in duration-300">
          <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-4 shadow-sm">
            <FileText className="h-8 w-8" />
          </div>
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            Próxima Etapa: Em Desenvolvimento
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Formulário de Fiscalização
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">
            Aqui os fiscalizadores preencherão os dados de fiscalização das aulas,
            acompanhamentos e capacitações realizadas na companhia.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border/70 text-xs text-muted-foreground max-w-md flex items-center gap-3 text-left">
            <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
            <span>
              Assim que concluirmos o Registro de Fakes, criaremos este formulário completo
              baseado nas fotos do modelo que você enviar.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: RESULTADOS (ETAPA 3 - ANÁLISE DA PRESIDÊNCIA)                     */}
      {/* ========================================================================= */}
      {activeTab === "resultados" && (
        <div className="bg-card border border-border/80 rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[380px] shadow-sm animate-in fade-in duration-300">
          <div className="h-16 w-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-4 shadow-sm">
            <BarChart3 className="h-8 w-8" />
          </div>
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
            Painel da Presidência & Direção
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Resultados das Fiscalizações
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">
            Painel consolidado onde a presidência verificará se as fiscalizações estão de acordo,
            com relatórios de conformidade, métricas de erros e status geral.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border/70 text-xs text-muted-foreground max-w-md flex items-center gap-3 text-left">
            <Lock className="h-5 w-5 text-purple-400 shrink-0" />
            <span>
              Este módulo será ativado logo após a integração do Formulário de Fiscalização.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
