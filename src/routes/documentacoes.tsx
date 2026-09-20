import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { 
  BookOpen, 
  ShieldCheck, 
  Building2, 
  Scale, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  ListTree, 
  Copy, 
  Check, 
  ArrowUp,
  Clock,
  Info
} from "lucide-react";

export const Route = createFileRoute("/documentacoes")({
  component: DocumentacoesPage,
});

type DocumentType = "ssi" | "companhia" | "penal";

interface SubItem {
  type: "paragrafo" | "inciso";
  label: string;
  text: string;
}

interface Article {
  number: string;
  labelNumber: string;
  text: string;
  subItems?: SubItem[];
}

interface Chapter {
  id: string;
  romanNumber: string;
  title: string;
  articles: Article[];
}

const REGIMENTO_SSI: Chapter[] = [
  {
    id: "capitulo-1",
    romanNumber: "I",
    title: "DAS DISPOSIÇÕES GERAIS",
    articles: [
      {
        number: "Artigo 1°",
        labelNumber: "Art. 1°",
        text: "Habilita-se a criação do Setor de Segurança dos Instrutores, subgrupo vinculado à Companhia dos Instrutores, cuja incumbência principal será a atuação direta contra as ações ilícitas ocorridas dentro da companhia, promovendo a segurança dentro desta.",
      },
      {
        number: "Artigo 2°",
        labelNumber: "Art. 2°",
        text: "Ao membro do Setor de Segurança dos Instrutores competirá, observando-se o regido pelo Código Penal dos Instrutores, aplicar punições a todas as infrações cometidas, salvo aquelas que requerem permissão da presidência do subgrupo ou da companhia.",
        subItems: [
          {
            type: "paragrafo",
            label: "Parágrafo único:",
            text: "Todas as punições aplicadas pelos integrantes do setor devem ser registradas na Tabela de Casos e Pendências.",
          },
        ],
      },
      {
        number: "Artigo 3°",
        labelNumber: "Art. 3°",
        text: "A entrada de novos membros é realizada de maneira burocrática, cabendo análise direta dos membros da presidência e, quando requerido por estes, dos demais integrantes do setor.",
        subItems: [
          {
            type: "paragrafo",
            label: "Parágrafo único:",
            text: "A convocação dos selecionados deverá ocorrer em quarto oficial da companhia ou do subgrupo, sendo realizada por membro da presidência ou por membro previamente autorizado por esta.",
          },
        ],
      },
      {
        number: "Artigo 4°",
        labelNumber: "Art. 4°",
        text: "O membro em análise para efetivação no subgrupo deverá possuir um ótimo histórico dentro da companhia, não possuindo metas negativas ou punições graves durante os últimos 2 (dois) meses, bem como cumprir o tempo mínimo de 15 (quinze) dias de permanência na companhia.",
        subItems: [
          {
            type: "paragrafo",
            label: "Parágrafo único:",
            text: "Fica dispensado do requisito de tempo mínimo previsto no caput deste artigo o policial que já tenha participado anteriormente do Setor de Segurança dos Instrutores.",
          },
        ],
      },
    ],
  },
  {
    id: "capitulo-2",
    romanNumber: "II",
    title: "DA HIERARQUIA, FUNÇÕES E GRATIFICAÇÕES",
    articles: [
      {
        number: "Artigo 5°",
        labelNumber: "Art. 5°",
        text: "Define-se que a hierarquia interna do Setor de Segurança dos Instrutores dividir-se-á em quatro cargos, cada qual com sua função, a saber:",
        subItems: [
          {
            type: "inciso",
            label: "I –",
            text: "Fiscalizador, responsável pela fiscalização de todas as aulas, acompanhamentos, avaliações e capacitações aplicadas pelos membros da companhia dos Instrutores, em busca de infrações e erros. Além da realização de avaliações do Curso de Formação de Soldados.",
          },
          {
            type: "inciso",
            label: "II –",
            text: "Diretor, responsável pelo fechamento de casos que foram abertos durante o período estipulado na escala semanal, e auxiliar os fiscalizadores com dúvidas;",
          },
          {
            type: "inciso",
            label: "III –",
            text: "Vice-Presidente, responsável por treinar, capacitar e fiscalizar os fiscalizadores e diretores, auxiliando o presidente quando necessário e cumprindo com suas funções semanais de acordo com escala pré-definida;",
          },
          {
            type: "inciso",
            label: "IV –",
            text: "Presidente, responsável pela gestão do grupo como um todo, mantendo-o num patamar elevado de desenvolvimento e fluidez, auxiliando todos os membros e cumprindo com suas funções semanais.",
          },
        ],
      },
      {
        number: "Artigo 6°",
        labelNumber: "Art. 6°",
        text: "De forma a manter-se um número coerente e apropriado de membros no setor, define-se como número máximo de vagas:",
        subItems: [
          {
            type: "inciso",
            label: "I –",
            text: "12 (doze) integrantes, para o cargo de Fiscalizador;",
          },
          {
            type: "inciso",
            label: "II –",
            text: "7 (sete) integrantes, para o cargo de Diretor;",
          },
          {
            type: "inciso",
            label: "III –",
            text: "3 (três) integrantes, para o cargo de Vice-Presidente;",
          },
          {
            type: "inciso",
            label: "IV –",
            text: "1 (um) integrante, para o cargo de Presidente.",
          },
        ],
      },
      {
        number: "Artigo 7°",
        labelNumber: "Art. 7°",
        text: "Para ingressar na presidência do Setor de Segurança, deverá portar os seguintes requisitos:",
        subItems: [
          {
            type: "inciso",
            label: "I –",
            text: "Possuir o cargo de Capacitador+;",
          },
          {
            type: "inciso",
            label: "II –",
            text: "Ser Aspirante a Oficial se for do Corpo Militar;",
          },
          {
            type: "inciso",
            label: "III –",
            text: "Possuir a Especialização Básica se for Corpo Executivo;",
          },
          {
            type: "paragrafo",
            label: "Parágrafo único:",
            text: "Em casos de migração o militar poderá estar sendo realocado de acordo com a avaliação da liderança dos Instrutores. Caso contrário, terá o prazo de 31 dias para portar os requisitos para a permanência do cargo, se não feito, será realocado ao cargo anterior (não sendo a presidência).",
          },
        ],
      },
      {
        number: "Artigo 8°",
        labelNumber: "Art. 8°",
        text: "Os membros receberão medalhas temporárias limitadas a um máximo de 20 (vinte) gratificações mensais, a quais dividir-se-ão de acordo com o número de metas cumpridas por mês (aos fiscalizadores e diretores) ou de acordo com os dias ativos durante o período (aos membros da presidência).",
      },
    ],
  },
  {
    id: "capitulo-3",
    romanNumber: "III",
    title: "DAS PUNIÇÕES INTERNAS",
    articles: [
      {
        number: "Artigo 9°",
        labelNumber: "Art. 9°",
        text: "Fica definida a aplicação de advertências internas e/ou observações como atribuição exclusiva da presidência do setor, devendo todas as postagens serem realizadas por membro deste ou por membro com permissão de algum.",
        subItems: [
          {
            type: "paragrafo",
            label: "§1° -",
            text: "Toda punição terá duração de 30 (trinta) dias de serviço ativo do membro que a recebeu, deixando-se de contar, portanto, os dias em licença.",
          },
          {
            type: "paragrafo",
            label: "§2° -",
            text: "O membro que possuir 2 (duas) observações ativas receberá uma advertência interna.",
          },
          {
            type: "paragrafo",
            label: "§3° -",
            text: "O diretor que possuir 3 (três) advertências internas ativas estará sujeito a um rebaixamento no setor.",
          },
          {
            type: "paragrafo",
            label: "§4° -",
            text: "O fiscalizador que possuir 3 (três) advertências internas ativas será expulso do Setor de Segurança dos Instrutores.",
          },
        ],
      },
      {
        number: "Artigo 10°",
        labelNumber: "Art. 10°",
        text: "Os integrantes do setor devem manter uma conduta ilibada, não sendo punidos por quaisquer crimes dentro da companhia. Caso ocorra, este será, além do recebimento das punições inerentes ao Código Penal dos Instrutores:",
        subItems: [
          {
            type: "inciso",
            label: "I –",
            text: "Punido com uma observação, em caso de punições leves;",
          },
          {
            type: "inciso",
            label: "II –",
            text: "Punido com uma advertência interna, em caso de punições médias;",
          },
          {
            type: "inciso",
            label: "III –",
            text: "Expulso do setor, em caso de punições graves.",
          },
        ],
      },
      {
        number: "Artigo 11°",
        labelNumber: "Art. 11°",
        text: "Receberá uma advertência interna, fora os demais casos citados neste documento, o membro que:",
        subItems: [
          {
            type: "inciso",
            label: "I –",
            text: "Deixar de cumprir, no prazo estabelecido, com a função inerente ao seu cargo no setor sem estar em licença, ou não apresentar justificativa da função em até 24 (vinte e quatro) horas;",
          },
          {
            type: "inciso",
            label: "II –",
            text: "Deixar de cumprir com a função inerente ao seu cargo na companhia sem estar em licença;",
          },
          {
            type: "inciso",
            label: "III –",
            text: "Abuso de poder, podendo chegar a expulsão do setor cabendo o julgamento à presidência do setor.",
          },
        ],
      },
      {
        number: "Artigo 12°",
        labelNumber: "Art. 12°",
        text: "Receberá uma observação, fora os demais casos citados neste documento, o membro que:",
        subItems: [
          {
            type: "inciso",
            label: "I –",
            text: "Realizar, em atraso não superior a 24 (vinte e quatro) horas, sua função após o prazo máximo para realização;",
          },
          {
            type: "inciso",
            label: "II –",
            text: "Ultrapassar o limite de 1 (uma) justificativa acerca da não realização da função, permitidas durante o mês;",
          },
          {
            type: "inciso",
            label: "III –",
            text: "Cometer algum delito de gravidade leve, cabendo o julgamento à presidência do setor;",
          },
          {
            type: "inciso",
            label: "IV –",
            text: "O membro que cometer abandono de dever e negligência em alguma das atribuições de suas funções, dependendo da gravidade, poderá agravar e se tornar uma advertência interna, a depender do julgamento da presidência do setor.",
          },
        ],
      },
      {
        number: "Artigo 13°",
        labelNumber: "Art. 13°",
        text: "Define-se como limite para o cumprimento de suas funções internas:",
        subItems: [
          {
            type: "inciso",
            label: "I –",
            text: "48 horas após o final do dia que deverá fiscalizar, no caso das fiscalizações de backups de aulas do cargo inicial;",
          },
          {
            type: "inciso",
            label: "II –",
            text: "Todos os sábados, às 23h59, no caso das fiscalizações dos backups dos monitores, avaliadores e/ou capacitadores;",
          },
          {
            type: "inciso",
            label: "III –",
            text: "Para a postagem da pontuação por infração, tem como prazo para sua realização, postagem de conclusão e/ou justificativa, em até 24 (vinte e quatro) horas da aplicação da punição;",
          },
          {
            type: "inciso",
            label: "IV –",
            text: "No caso dos diretores, o prazo para fechamento e postagem de conclusão e/ou justificativa da função, é de 48 horas para sua realização;",
          },
        ],
      },
      {
        number: "Artigo 14°",
        labelNumber: "Art. 14°",
        text: "Fica estabelecido o crime de Insuficiência para o Cargo, o que ocorre na seguinte situação:",
        subItems: [
          {
            type: "inciso",
            label: "I –",
            text: "Insuficiência de habilidades específicas ou desempenho abaixo das expectativas para o cargo ocupado;",
          },
          {
            type: "paragrafo",
            label: "Parágrafo único:",
            text: "A punição para o crime de insuficiência para o cargo será de um rebaixamento para diretor+ e expulsão para fiscalizador.",
          },
        ],
      },
    ],
  },
  {
    id: "capitulo-4",
    romanNumber: "IV",
    title: "DA POLÍTICA LICENÇAS, SAÍDAS E REINTEGRAÇÕES",
    articles: [
      {
        number: "Artigo 15°",
        labelNumber: "Art. 15°",
        text: "Define-se como licença de serviço o afastamento temporário de um membro do setor, condicionado ao período mínimo de 5 (cinco) dias e máximo de 30 (trinta) dias. O membro em licença, ao longo da vigência e da semana na qual retornou da licença, estará dispensado do cumprimento de sua meta semanal, estando apto a receber gratificações caso a cumpra.",
        subItems: [
          {
            type: "paragrafo",
            label: "§1° -",
            text: "O membro que precisar sair em licença deverá contar com a permissão de um integrante da presidência e realizar a postagem conforme requerido no tópico “[SSI] Requerimentos: Listagem de Membros”.",
          },
          {
            type: "paragrafo",
            label: "§2° -",
            text: "O membro deverá, para sair em licença no Setor de Segurança dos Instrutores, estar em licença também na Companhia dos Instrutores.",
          },
          {
            type: "paragrafo",
            label: "§3° -",
            text: "Em casos excepcionais onde o membro esteja em reserva de serviço na Companhia dos Instrutores, este será autorizado a solicitar uma reserva também no setor, com prazo equivalente àquele.",
          },
        ],
      },
      {
        number: "Artigo 16°",
        labelNumber: "Art. 16°",
        text: "Define-se como saída do setor o afastamento definitivo e rompimento de laços ativos com o subgrupo, devendo esta ser autorizada por um membro da presidência. Após homologada e atualizada a saída, o membro não mais poderá retornar ao setor, salvo caso seja votado e julgado apto novamente.",
      },
      {
        number: "Artigo 17°",
        labelNumber: "Art. 17°",
        text: "A reintegração no Setor de Segurança dos Instrutores é um direito concedido a todos os membros que, em sua última passagem, ficaram o período mínimo de 02 (dois) meses no subgrupo.",
      },
    ],
  },
  {
    id: "capitulo-5",
    romanNumber: "V",
    title: "DOS DIREITOS E ATRIBUIÇÕES",
    articles: [
      {
        number: "Artigo 18°",
        labelNumber: "Art. 18°",
        text: "Estarão elegíveis ao recebimento de direitos na Companhia dos Instrutores:",
        subItems: [
          {
            type: "inciso",
            label: "I –",
            text: "Os membros da presidência do Setor de Segurança dos Instrutores;",
          },
          {
            type: "inciso",
            label: "II –",
            text: "Ministros+ da companhia dos Instrutores.",
          },
        ],
      },
      {
        number: "Artigo 19°",
        labelNumber: "Art. 19°",
        text: "Todos os membros que possuírem o direito de uso de visual livre na Polícia Militar Revolução Contra o Crime estão aptos a utilizar o fardamento simbólico do setor. Caso não o possua, é terminantemente proibido que o utilize, estando sujeito às punições do Código de Conduta Militar caso o faça.",
        subItems: [
          {
            type: "paragrafo",
            label: "Parágrafo único:",
            text: "É vedada a aplicação de punições pelo membro que não esteja em conformidade com os requisitos obrigatórios, tais como o uso do fardamento do setor, portando a missão e o emblema, sob pena de advertência interna.",
          },
        ],
      },
      {
        number: "Artigo 20°",
        labelNumber: "Art. 20°",
        text: "Quando da realização de seus inquéritos para a obtenção de provas e informações na investigação de seus casos, é vedado ao fiscalizador valer-se de qualquer artifício de caráter difamatório, calunioso ou injurioso ao membro que está sendo investigado.",
        subItems: [
          {
            type: "paragrafo",
            label: "Parágrafo único:",
            text: "O membro que abusar de seu poder, desrespeitando o que rege o caput deste artigo, será expulso do setor.",
          },
        ],
      },
    ],
  },
];

const DOCUMENT_TABS = [
  {
    id: "ssi" as DocumentType,
    title: "Regimento Interno do SSI",
    subtitle: "Normas, cargos e diretrizes do Setor de Segurança",
    badge: null,
    badgeVariant: null,
    icon: ShieldCheck,
    chaptersCount: 5,
    articlesCount: 20,
  },
  {
    id: "companhia" as DocumentType,
    title: "Regimento Interno da Companhia",
    subtitle: "Regulamento geral da Companhia dos Instrutores",
    badge: "Em Breve",
    badgeVariant: "muted",
    icon: Building2,
    chaptersCount: null,
    articlesCount: null,
  },
  {
    id: "penal" as DocumentType,
    title: "Código Penal dos Instrutores",
    subtitle: "Tipificações, penalidades e dosimetria disciplinar",
    badge: "Em Breve",
    badgeVariant: "muted",
    icon: Scale,
    chaptersCount: null,
    articlesCount: null,
  },
];

function DocumentacoesPage() {
  const [activeDoc, setActiveDoc] = useState<DocumentType>("ssi");
  const [searchTerm, setSearchTerm] = useState("");
  const [isIndexOpen, setIsIndexOpen] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<string>("capitulo-1");
  const [copiedArticle, setCopiedArticle] = useState<string | null>(null);

  // Filtragem de artigos no Regimento do SSI
  const filteredChapters = useMemo(() => {
    if (!searchTerm.trim()) return REGIMENTO_SSI;
    const query = searchTerm.toLowerCase();

    return REGIMENTO_SSI.map((chap) => {
      const matchChapterTitle = chap.title.toLowerCase().includes(query);
      const filteredArticles = chap.articles.filter((art) => {
        const matchArtNum = art.number.toLowerCase().includes(query);
        const matchText = art.text.toLowerCase().includes(query);
        const matchSubItems = art.subItems?.some(
          (sub) => sub.text.toLowerCase().includes(query) || sub.label.toLowerCase().includes(query)
        );
        return matchChapterTitle || matchArtNum || matchText || matchSubItems;
      });

      return {
        ...chap,
        articles: filteredArticles,
      };
    }).filter((chap) => chap.articles.length > 0);
  }, [searchTerm]);

  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      const topOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveChapterId(elementId);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedArticle(id);
    setTimeout(() => setCopiedArticle(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                Documentações
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                  Legislação Oficial
                </span>
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Biblioteca jurídica e regimental da Companhia e do Setor de Segurança dos Instrutores.
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas / Indicador de Documento */}
        {activeDoc === "ssi" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 border border-border px-3.5 py-1.5 rounded-lg w-fit">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-foreground">5 Capítulos</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-semibold text-foreground">20 Artigos</span>
          </div>
        )}
      </div>

      {/* Seletor de Documentos (3 Tipos solicitados) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DOCUMENT_TABS.map((doc) => {
          const isSelected = activeDoc === doc.id;
          const Icon = doc.icon;

          return (
            <button
              key={doc.id}
              onClick={() => {
                setActiveDoc(doc.id);
                setSearchTerm("");
              }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between gap-3 group select-none ${
                isSelected
                  ? "bg-card border-primary/50 shadow-sm ring-1 ring-primary/20"
                  : "bg-card/50 hover:bg-card border-border hover:border-border/80 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-bold leading-snug transition-colors ${
                        isSelected ? "text-primary" : "text-foreground group-hover:text-foreground"
                      }`}
                    >
                      {doc.title}
                    </h3>
                  </div>
                </div>

                {doc.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-secondary text-muted-foreground border border-border/50">
                    {doc.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {doc.subtitle}
              </p>

              {isSelected && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo Dinâmico Conforme Documento Selecionado */}
      {activeDoc === "ssi" ? (
        <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
          {/* Navegador Lateral Fixo de Capítulos (Desktop) */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-20 bg-card/80 border border-border rounded-xl p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 pb-3 mb-2 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ListTree className="h-4 w-4 text-primary" />
              <span>Capítulos do Regimento</span>
            </div>

            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => scrollToSection("secao-apresentacao")}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
                  activeChapterId === "secao-apresentacao"
                    ? "bg-primary/15 text-primary font-semibold border border-primary/30"
                    : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    activeChapterId === "secao-apresentacao"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  0
                </span>
                <span className="truncate">APRESENTAÇÃO</span>
              </button>

              {REGIMENTO_SSI.map((chap) => {
                const isActive = activeChapterId === chap.id;
                return (
                  <button
                    key={chap.id}
                    onClick={() => scrollToSection(chap.id)}
                    className={`flex items-start gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-left transition-all group ${
                      isActive
                        ? "bg-primary/15 text-primary font-semibold border border-primary/30"
                        : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground group-hover:text-primary"
                      }`}
                    >
                      {chap.romanNumber}
                    </span>
                    <span className="truncate leading-snug">{chap.title}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground flex flex-col gap-0.5">
              <span className="font-semibold text-foreground">Setor de Segurança</span>
              <span>Companhia dos Instrutores</span>
            </div>
          </aside>

          {/* Área Principal de Leitura */}
          <div className="flex-1 w-full flex flex-col gap-8 min-w-0">
            {/* Barra de Ferramentas e Busca */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card/60 border border-border rounded-xl p-3 shadow-sm">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por artigo, termo ou penalidade (ex: licença, advertência, diretor, meta)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsIndexOpen(!isIndexOpen)}
                  className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <ListTree className="h-3.5 w-3.5 text-primary" />
                  <span>{isIndexOpen ? "Ocultar Índice" : "Exibir Índice"}</span>
                  <ChevronDown
                    className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                      isIndexOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* CARD: APRESENTAÇÃO INSTITUCIONAL */}
            <div
              id="secao-apresentacao"
              className="relative bg-card border border-border hover:border-primary/40 transition-all rounded-xl p-6 sm:p-7 pt-7 shadow-sm"
            >
              {/* Badge de Apresentação Centralizado no Topo */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-primary text-primary-foreground font-black text-xs uppercase px-5 py-1 rounded-md shadow-sm tracking-wider">
                  APRESENTAÇÃO
                </div>
              </div>

              <div className="text-muted-foreground text-sm leading-relaxed space-y-2.5 pt-1">
                <p>
                  <strong className="text-foreground font-semibold">
                    O Regimento Interno do Setor de Segurança dos Instrutores (SSI)
                  </strong>{" "}
                  estabelece as normas, prerrogativas e deveres que regem a conduta e as atribuições de
                  todos os seus integrantes na Companhia dos Instrutores.
                </p>
                <p>
                  Tem por finalidade promover a segurança interna, fiscalizar o cumprimento das
                  diretrizes de ensino e garantir a ordem, a disciplina e a transparência em todas as
                  rotinas do setor.
                </p>
              </div>
            </div>

            {/* ÍNDICE ACORDEÃO */}
            {isIndexOpen && (
              <div className="bg-card/70 border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                <div
                  onClick={() => setIsIndexOpen(!isIndexOpen)}
                  className="flex items-center justify-between px-5 py-3.5 bg-secondary/50 hover:bg-secondary/70 cursor-pointer select-none transition-colors border-b border-border/50"
                >
                  <div className="flex items-center gap-2.5 text-xs font-bold text-primary uppercase tracking-wider">
                    <ListTree className="h-4 w-4" />
                    <span>Índice Geral do Documento</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      isIndexOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <div className="divide-y divide-border/40 text-xs">
                  <button
                    onClick={() => scrollToSection("secao-apresentacao")}
                    className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-primary/10 hover:text-primary transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-secondary text-muted-foreground group-hover:text-primary">
                        0
                      </span>
                      <span className="font-bold tracking-wide uppercase text-foreground group-hover:text-primary">
                        APRESENTAÇÃO
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary" />
                  </button>

                  {REGIMENTO_SSI.map((chap) => (
                    <button
                      key={chap.id}
                      onClick={() => scrollToSection(chap.id)}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-primary/10 hover:text-primary transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black bg-secondary text-muted-foreground group-hover:text-primary">
                          {chap.romanNumber}
                        </span>
                        <span className="font-bold tracking-wide uppercase text-foreground group-hover:text-primary">
                          CAPÍTULO {chap.romanNumber} — {chap.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {chap.articles.length} {chap.articles.length === 1 ? "artigo" : "artigos"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LISTAGEM DOS CAPÍTULOS E ARTIGOS */}
            {filteredChapters.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="font-bold text-foreground text-sm">Nenhum artigo encontrado</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Não localizamos nenhum termo correspondente a &quot;{searchTerm}&quot;. Tente buscar
                  por outra palavra ou limpe a busca.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-1.5 rounded-lg bg-secondary text-xs font-semibold hover:bg-secondary/80 text-foreground"
                >
                  Limpar pesquisa
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {filteredChapters.map((chapter) => (
                  <section
                    key={chapter.id}
                    id={chapter.id}
                    className="relative bg-card border border-border hover:border-primary/40 transition-all rounded-xl p-6 sm:p-8 pt-9 shadow-sm scroll-mt-24"
                  >
                    {/* Badge do Capítulo Centralizado no Topo */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 w-max max-w-[90%] text-center">
                      <div className="bg-primary text-primary-foreground font-black text-xs uppercase px-5 sm:px-7 py-1 rounded-md shadow-sm border border-primary/30 tracking-wider truncate">
                        CAPÍTULO {chapter.romanNumber} — {chapter.title}
                      </div>
                    </div>

                    {/* Lista de Artigos Dentro do Card */}
                    <div className="flex flex-col gap-6 divide-y divide-border/40 pt-1">
                      {chapter.articles.map((article, artIdx) => {
                        const articleId = `${chapter.id}-${article.number.replace(/\s+/g, "-")}`;
                        const isCopied = copiedArticle === articleId;

                        return (
                          <div
                            key={article.number}
                            className={`flex flex-col gap-3 group ${artIdx > 0 ? "pt-5" : ""}`}
                          >
                            {/* Artigo Caput */}
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-foreground/90 text-sm md:text-[15px] leading-relaxed">
                                <span className="text-primary font-bold text-base select-text mr-1.5">
                                  {article.number}
                                </span>
                                {article.text}
                              </p>

                              <button
                                onClick={() =>
                                  handleCopyText(
                                    `${article.number} ${article.text}`,
                                    articleId
                                  )
                                }
                                title="Copiar texto do artigo"
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all shrink-0 mt-0.5"
                              >
                                {isCopied ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>

                            {/* Parágrafos e Incisos */}
                            {article.subItems && article.subItems.length > 0 && (
                              <div className="flex flex-col gap-2 pl-4 sm:pl-6 border-l-2 border-primary/30 ml-1 mt-1">
                                {article.subItems.map((sub, sIdx) => (
                                  <p
                                    key={sIdx}
                                    className="text-foreground/80 text-xs md:text-sm leading-relaxed"
                                  >
                                    <span className="text-primary font-bold mr-1.5 select-text">
                                      {sub.label}
                                    </span>
                                    {sub.text}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {/* Botão de Voltar ao Topo */}
            <div className="flex justify-center pt-6">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground transition-all shadow-sm"
              >
                <ArrowUp className="h-4 w-4 text-primary" />
                <span>Voltar ao Início do Documento</span>
              </button>
            </div>
          </div>
        </div>
      ) : activeDoc === "companhia" ? (
        /* PLACEHOLDER: REGIMENTO INTERNO DA COMPANHIA */
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden mt-4">
          <div className="h-20 w-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center text-primary mb-5 shadow-inner">
            <Building2 className="h-10 w-10" />
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border/50 uppercase tracking-wider mb-3">
            Aguardando Homologação
          </span>

          <h2 className="text-2xl font-bold text-foreground tracking-tight max-w-md">
            Regimento Interno da Companhia
          </h2>

          <p className="text-muted-foreground text-sm max-w-xl mt-3 leading-relaxed">
            O documento unificado contendo todas as diretrizes, deveres dos instrutores, hierarquia,
            regras de cursos (CFSd, CFC I e II) e critérios de progressão da Companhia dos Instrutores
            está sendo revisado e será incorporado em breve a este sistema.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mt-8 pt-8 border-t border-border/50 text-left">
            <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-primary" />
                Estrutura Prevista
              </span>
              <p className="text-xs text-muted-foreground">
                Disposições gerais, aplicação de cursos, conduta pedagógica e critérios de avaliação.
              </p>
            </div>

            <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Status Atual
              </span>
              <p className="text-xs text-muted-foreground">
                Em fase de compilação pela Liderança e Ministério dos Instrutores.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveDoc("ssi")}
            className="mt-8 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Consultar Regimento Interno do SSI</span>
          </button>
        </div>
      ) : (
        /* PLACEHOLDER: CÓDIGO PENAL DOS INSTRUTORES */
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden mt-4">
          <div className="h-20 w-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center text-primary mb-5 shadow-inner">
            <Scale className="h-10 w-10" />
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border/50 uppercase tracking-wider mb-3">
            Em Revisão Jurídica
          </span>

          <h2 className="text-2xl font-bold text-foreground tracking-tight max-w-md">
            Código Penal dos Instrutores
          </h2>

          <p className="text-muted-foreground text-sm max-w-xl mt-3 leading-relaxed">
            O Código Penal dos Instrutores reúne o catálogo completo de infrações leves, médias e
            graves, atenuantes, agravantes e a tabela de dosimetria de penalidades aplicada aos
            membros da companhia e fiscalizada pelo SSI.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mt-8 pt-8 border-t border-border/50 text-left">
            <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Vínculo com o SSI
              </span>
              <p className="text-xs text-muted-foreground">
                Base jurídica utilizada pelos Fiscalizadores e Diretores na abertura e fechamento de
                casos.
              </p>
            </div>

            <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Previsão de Lançamento
              </span>
              <p className="text-xs text-muted-foreground">
                Aguardando homologação e envio oficial do texto completo dos artigos penais.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveDoc("ssi")}
            className="mt-8 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Consultar Regimento Interno do SSI</span>
          </button>
        </div>
      )}
    </div>
  );
}
