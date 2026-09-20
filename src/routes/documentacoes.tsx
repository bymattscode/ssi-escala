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
  text: string;
  subItems?: SubItem[];
}

interface Section {
  title: string;
  articles: Article[];
}

interface Chapter {
  id: string;
  romanNumber: string;
  title: string;
  articles?: Article[];
  sections?: Section[];
}

// ---------------------------------------------------------
// 1. REGIMENTO INTERNO DO SSI
// ---------------------------------------------------------
const REGIMENTO_SSI: Chapter[] = [
  {
    id: "ssi-capitulo-1",
    romanNumber: "I",
    title: "DAS DISPOSIÇÕES GERAIS",
    articles: [
      {
        number: "Artigo 1°",
        text: "Habilita-se a criação do Setor de Segurança dos Instrutores, subgrupo vinculado à Companhia dos Instrutores, cuja incumbência principal será a atuação direta contra as ações ilícitas ocorridas dentro da companhia, promovendo a segurança dentro desta.",
      },
      {
        number: "Artigo 2°",
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
    id: "ssi-capitulo-2",
    romanNumber: "II",
    title: "DA HIERARQUIA, FUNÇÕES E GRATIFICAÇÕES",
    articles: [
      {
        number: "Artigo 5°",
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
        text: "Os membros receberão medalhas temporárias limitadas a um máximo de 20 (vinte) gratificações mensais, a quais dividir-se-ão de acordo com o número de metas cumpridas por mês (aos fiscalizadores e diretores) ou de acordo com os dias ativos durante o período (aos membros da presidência).",
      },
    ],
  },
  {
    id: "ssi-capitulo-3",
    romanNumber: "III",
    title: "DAS PUNIÇÕES INTERNAS",
    articles: [
      {
        number: "Artigo 9°",
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
    id: "ssi-capitulo-4",
    romanNumber: "IV",
    title: "DA POLÍTICA LICENÇAS, SAÍDAS E REINTEGRAÇÕES",
    articles: [
      {
        number: "Artigo 15°",
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
        text: "Define-se como saída do setor o afastamento definitivo e rompimento de laços ativos com o subgrupo, devendo esta ser autorizada por um membro da presidência. Após homologada e atualizada a saída, o membro não mais poderá retornar ao setor, salvo caso seja votado e julgado apto novamente.",
      },
      {
        number: "Artigo 17°",
        text: "A reintegração no Setor de Segurança dos Instrutores é um direito concedido a todos os membros que, em sua última passagem, ficaram o período mínimo de 02 (dois) meses no subgrupo.",
      },
    ],
  },
  {
    id: "ssi-capitulo-5",
    romanNumber: "V",
    title: "DOS DIREITOS E ATRIBUIÇÕES",
    articles: [
      {
        number: "Artigo 18°",
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

// ---------------------------------------------------------
// 2. CÓDIGO PENAL DOS INSTRUTORES (CPI)
// ---------------------------------------------------------
const CODIGO_PENAL: Chapter[] = [
  {
    id: "cpi-capitulo-1",
    romanNumber: "I",
    title: "DAS DISPOSIÇÕES GERAIS",
    articles: [
      {
        number: "Art. 1º -",
        text: "O Código Penal dos Instrutores segue estritamente os princípios e fundamentos delineados no Código de Conduta Militar (CCM) e no Código Penal Militar (CPM), ao mesmo tempo em que se fundamenta no Regimento Interno da companhia.",
      },
      {
        number: "Art. 2º -",
        text: "O Código Penal dos Instrutores engloba toda a extensão da Polícia Militar Revolução Contra o Crime (RCC) e da companhia dos Instrutores, conforme estabelecido pelo Código de Conduta Militar, nos seguintes termos:",
        subItems: [
          {
            type: "inciso",
            label: "I -",
            text: "Todos os quartos do Habbo Hotel ou canais de comunicação dentro do jogo, como o Habbo Console;",
          },
          {
            type: "inciso",
            label: "II -",
            text: "Todos os sites externos vinculados, de qualquer maneira, à Polícia RCC e à companhia dos Instrutores.",
          },
        ],
      },
      {
        number: "Art. 3º -",
        text: "Crimes cometidos dentro da companhia resultarão em sanções internas. E, caso necessário, serão aplicadas punições administrativas na polícia, conforme previsto no Código de Conduta Militar (CCM) ou no Código Penal Militar (CPM).",
      },
    ],
  },
  {
    id: "cpi-capitulo-2",
    romanNumber: "II",
    title: "PUNIÇÕES ADMINISTRATIVAS INTERNAS",
    articles: [
      {
        number: "Art. 1º -",
        text: "O membro que descumprir as normas estabelecidas por este documento será penalizado e sujeito às seguintes penalidades:",
        subItems: [
          { type: "inciso", label: "I -", text: "Observação;" },
          { type: "inciso", label: "II -", text: "Advertência interna;" },
          { type: "inciso", label: "III -", text: "Rebaixamento;" },
          { type: "inciso", label: "IV -", text: "Expulsão;" },
          { type: "inciso", label: "V -", text: "Exoneração." },
        ],
      },
      {
        number: "Art. 2º -",
        text: "Toda ação passível de punição deve ser cuidadosamente registrada pelos responsáveis nos documentos oficiais da companhia.",
      },
      {
        number: "Art. 3º -",
        text: "O direito de aplicar punições é reservado exclusivamente para as seguintes partes:",
        subItems: [
          { type: "inciso", label: "I -", text: "Liderança;" },
          { type: "inciso", label: "II -", text: "Ministério;" },
          { type: "inciso", label: "III -", text: "Membros do Setor de Segurança dos Instrutores, durante o pleno exercício de suas funções." },
          { type: "paragrafo", label: "§ 1° -", text: "Apenas a liderança tem autoridade para impor sanções aos ministros." },
          { type: "paragrafo", label: "§ 2° -", text: "É estritamente vedado que qualquer indivíduo autorizado a aplicar punições solicite que estas sejam registradas por alguém que não faça parte do grupo designado para tal função." },
          { type: "paragrafo", label: "§ 3° -", text: "No caso de descumprimento de quaisquer normas, o infrator estará sujeito a uma advertência interna pelo crime de abandono de dever/negligência." },
        ],
      },
      {
        number: "Art. 4º -",
        text: "A liderança possui autonomia para aplicar penalidades menores às previstas neste documento, conforme julgamento discricionário.",
      },
      {
        number: "Art. 5º -",
        text: "As punições podem ser aplicadas sem aviso prévio, no entanto, é obrigatório que sejam comunicadas ao infrator em um prazo máximo de 24 horas contados a partir do registro da punição.",
        subItems: [
          {
            type: "paragrafo",
            label: "Parágrafo único -",
            text: "O responsável pela aplicação da punição que não comunicar o infrator no prazo máximo de 24 horas será penalizado com uma advertência interna por abandono de dever/negligência.",
          },
        ],
      },
    ],
    sections: [
      {
        title: "SEÇÃO I — OBSERVAÇÃO",
        articles: [
          {
            number: "Art. 1º -",
            text: "A observação é uma repreensão básica, consiste em uma orientação voltada à correção de infrações leves e doutrina do membro da companhia.",
          },
          {
            number: "Art. 2º -",
            text: "A observação é acumulativa, no qual, possui validade de 30 dias após a postagem dessa.",
          },
          {
            number: "Art. 3º -",
            text: "A observação, por se tratar de uma punição formal, deve ser registrada nos requerimentos da companhia e sua notificação deve ser feita por mensagem privada, exceto no seguinte caso:",
            subItems: [
              {
                type: "paragrafo",
                label: "§ 1° -",
                text: "A infração que acarrete em uma observação se autuada em flagrante poderá ser notificada presencialmente no Centro de Instruções do Corredor dos Instrutores ou na Sala de Inquirição, sendo destinado o uso exclusivo desta sala aos membros do Setor de Segurança dos Instrutores.",
              },
            ],
          },
        ],
      },
      {
        title: "SEÇÃO II — ADVERTÊNCIA INTERNA",
        articles: [
          {
            number: "Art. 1º -",
            text: "A advertência interna é uma repreensão mais elevada, no qual é uma medida disciplinar direcionada a membros que cometem transgressões de gravidade intermediária.",
          },
          {
            number: "Art. 2º -",
            text: "A advertência interna impede que o membro seja promovido pelos próximos 7 dias e possui validade por um período de 30 dias.",
            subItems: [
              {
                type: "paragrafo",
                label: "§ 1° -",
                text: "Caso o instrutor entre em licença, o tempo de duração da advertência interna e/ou bloqueio de promoção será congelado de onde parou e voltará a contabilizar ao fim da licença ou após a postagem do retorno de licença.",
              },
            ],
          },
        ],
      },
      {
        title: "SEÇÃO III — REBAIXAMENTO",
        articles: [
          {
            number: "Art. 1º -",
            text: "O rebaixamento é uma repreensão intermediária, reservada exclusivamente aos avaliadores acima. Não é aplicado apenas em casos de transgressões penais intermediárias, mas também quando o membro não mantém um padrão de conduta adequado à sua posição hierárquica na companhia.",
            subItems: [
              {
                type: "paragrafo",
                label: "§ 1º -",
                text: "O rebaixamento na Companhia dos Instrutores é acompanhado pela atribuição de 50 (cinquenta) medalhas negativas efetivas.",
              },
            ],
          },
        ],
      },
      {
        title: "SEÇÃO IV — EXPULSÃO",
        articles: [
          {
            number: "Art. 1º -",
            text: "A expulsão da companhia dos instrutores é uma repreensão avançada, sendo reservada para crimes de gravidade elevada ou em situações de acumulação de advertências internas por instrutores.",
            subItems: [
              {
                type: "paragrafo",
                label: "Parágrafo único -",
                text: "A expulsão da companhia será seguida pela atribuição de 100 medalhas negativas efetivas.",
              },
            ],
          },
        ],
      },
      {
        title: "SEÇÃO V — EXONERAÇÃO",
        articles: [
          {
            number: "Art. 1º -",
            text: "A exoneração da companhia dos instrutores é a repreensão mais avançada, sendo reservada para crimes de gravidade extrema, onde será proibido o retorno do instrutor por um período específico, ajustado conforme a seriedade da transgressão cometida pelo membro.",
            subItems: [
              {
                type: "paragrafo",
                label: "§ 1° -",
                text: "O direito de exonerar algum membro da companhia é exclusivo da liderança, assim como o direito de remoção.",
              },
              {
                type: "paragrafo",
                label: "§ 2º -",
                text: "O membro exonerado sofre uma penalização de 200 medalhas efetivas negativas.",
              },
            ],
          },
        ],
      },
      {
        title: "SEÇÃO VI — DA REINCIDÊNCIA",
        articles: [
          {
            number: "Art. 1º -",
            text: "A reincidência é definida no momento em que o instrutor comete mais de uma vez a mesma infração num período de 30 dias desde o registro da primeira punição. A punição por reincidência deve ser exercida nos seguintes termos:",
            subItems: [
              {
                type: "inciso",
                label: "I -",
                text: "A punição para a reincidência de duas observações é uma advertência interna, após o registro da segunda observação;",
              },
              {
                type: "inciso",
                label: "II -",
                text: "A reincidência de três advertências internas, após o registro da terceira advertência, resultará em expulsão da companhia caso o membro for do cargo inicial. Caso o membro seja do cargo de avaliador ou acima, resultará em um rebaixamento.",
              },
              {
                type: "inciso",
                label: "III -",
                text: "A reincidência de dois rebaixamentos resultará em uma expulsão, após o registro do segundo rebaixamento;",
              },
              {
                type: "inciso",
                label: "IV -",
                text: "A punição para a reincidência de duas expulsões é uma exoneração de 1 mês, após o registro da segunda expulsão.",
              },
              {
                type: "paragrafo",
                label: "§ 1º -",
                text: "Será punido com uma observação, pelo crime de Abandono de Dever/Negligência, o policial que negligenciar a postagem da punição por reincidência após o prazo de 24 horas após o registro da punição que caracteriza o crime supracitado.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cpi-capitulo-3",
    romanNumber: "III",
    title: "CRIMES",
    sections: [
      {
        title: "SEÇÃO I — ERRO DE POSTAGEM",
        articles: [
          {
            number: "Art. 1º -",
            text: "Este Código Penal Interno estabelece o crime de Erro de Postagem, que ocorre nas seguintes situações:",
            subItems: [
              { type: "inciso", label: "I -", text: "Postagens incorretas de atividades promovidas pelos Instrutores, como cursos e capacitações;" },
              { type: "inciso", label: "II -", text: "Desrespeitar as regras de postagem das aulas;" },
              { type: "inciso", label: "III -", text: "Postar aulas duplicadas." },
            ],
          },
          {
            number: "Art. 2° -",
            text: "O membro que incorrer no crime de Postagem Incorreta será punido de acordo com os seguintes termos:",
            subItems: [
              { type: "inciso", label: "I -", text: "O instrutor que cometer erros de postagem, a punição consiste em uma observação. Caso se torne reincidente, receberá 10 medalhas efetivas negativas por cada ocorrência." },
              { type: "inciso", label: "II -", text: "O instrutor que for Avaliador acima e cometer erros de postagem, a punição rege em 10 medalhas efetivas negativas. Caso se torne reincidente, receberá 10 medalhas efetivas negativas por cada ocorrência." },
              { type: "paragrafo", label: "§ 1º -", text: "Entende-se como reincidência a partir do momento em que o membro for notificado pelo erro e retorne a cometer, sendo desvinculado da quantidade." },
              { type: "paragrafo", label: "§ 2º -", text: "Quando a ausência ou erro da postagem de uma aula no relatório de aulas for solucionada pelo Ministério da Administração, a resolução deverá ficar por conta da própria notificação enviada." },
            ],
          },
        ],
      },
      {
        title: "SEÇÃO II — MANIPULAÇÃO DE SCRIPT",
        articles: [
          {
            number: "Art. 1º -",
            text: "Este Código Penal Interno estabelece o crime de Manipulação de Script, que ocorre nas seguintes situações:",
            subItems: [
              { type: "inciso", label: "I -", text: "Alterar qualquer informação presente em um curso;" },
              { type: "inciso", label: "II -", text: "Pulo de até 04 linhas;" },
              { type: "inciso", label: "III -", text: "Pulo de 05 ou 06 linhas;" },
              { type: "inciso", label: "IV -", text: "Pulo de mais de 06 linhas." },
              { type: "paragrafo", label: "§ 1º -", text: "Estarão sujeitos a 50 medalhas efetivas negativas os policiais que incorrerem no inciso II, em caso de reincidência, expulsão;" },
              { type: "paragrafo", label: "§ 2º -", text: "Estarão sujeitos a uma advertência interna na companhia os policiais que incorrerem no inciso III, em caso de reincidência, expulsão;" },
              { type: "paragrafo", label: "§ 3º -", text: "Estarão sujeitos à expulsão imediata da companhia os policiais que incorrerem no inciso IV;" },
              { type: "paragrafo", label: "§ 4º -", text: "Além das punições acima descritas, os policiais também estarão sujeitos às punições na instituição determinadas pelo Código de Conduta Militar." },
            ],
          },
          {
            number: "Art. 2º -",
            text: "A penalidade para o crime de Manipulação de Script é gradativa, ou seja, aumenta de acordo com a gravidade. Os instrutores que forem flagrados cometendo tal crime estão sujeitos a medalhas efetivas negativas até a expulsão da companhia.",
          },
        ],
      },
      {
        title: "SEÇÃO III — ABANDONO DE DEVER / NEGLIGÊNCIA",
        articles: [
          {
            number: "Art. 1º -",
            text: "Este Código Penal Interno estabelece o crime de Abandono de Dever/Negligência, que ocorre nas seguintes situações:",
            subItems: [
              { type: "inciso", label: "I -", text: "Aplicar teste de admissão a um militar inativo e/ou exonerado;" },
              { type: "inciso", label: "II -", text: "Aplicação inadequada de cursos ou capacitações;" },
              { type: "inciso", label: "III -", text: "Negligenciar em postar o curso/capacitação dentro de 1 hora após a aplicação;" },
              { type: "inciso", label: "IV -", text: "Não cumprimento das metas estabelecidas para o cargo;" },
              { type: "inciso", label: "V -", text: "Conceder permissão de forma errônea e/ou durante período de licença/reserva;" },
              { type: "inciso", label: "VI -", text: "Negligência de funções e responsabilidades a serem realizadas nos subgrupos da companhia e/ou sendo expulso ou rebaixado no subgrupo." },
              { type: "inciso", label: "VII -", text: "Negligência no cumprimento de deveres que, ainda que não previstos nos incisos anteriores, sejam passíveis de punição por afetarem negativamente parte ou toda a companhia." },
            ],
          },
          {
            number: "Art. 2º -",
            text: "A penalidade para o crime de Abandono de Dever/Negligência é gradativa, ou seja, aumenta de acordo com a gravidade. Os instrutores que forem flagrados cometendo tal crime estão sujeitos a uma observação até a expulsão da companhia.",
          },
        ],
      },
      {
        title: "SEÇÃO IV — CONDUTA IMPRÓPRIA",
        articles: [
          {
            number: "Art. 1º -",
            text: "Este Código Penal Interno estabelece o crime de Conduta Imprópria, que ocorre nas seguintes situações:",
            subItems: [
              { type: "inciso", label: "I -", text: "Realizar qualquer modificação na estrutura intelectual ou física da companhia sem a devida permissão;" },
              { type: "inciso", label: "II -", text: "Praticar qualquer ato que viole os valores éticos e morais de um policial da Polícia RCC;" },
              { type: "inciso", label: "III -", text: "Permitir, conscientemente ou não, a entrada de usuários não pertencentes à Polícia RCC pelo corredor da companhia;" },
              { type: "inciso", label: "IV -", text: "Praticar quaisquer ações ilícitas, imorais ou antiéticas que, de alguma forma, favorece direta ou indiretamente o progresso do militar dentro da companhia;" },
              { type: "inciso", label: "V -", text: "Negar a ceder curso ou capacitação a um membro que esteja necessitando de meta, quando já houver a pontuação mínima alcançada;" },
              { type: "inciso", label: "VI -", text: "Qualquer ação punível que não deve passar impune e que possa ser considerada conduta imprópria, afetando parte ou toda a companhia;" },
            ],
          },
          {
            number: "Art. 2º -",
            text: "A penalidade para o crime de Conduta Imprópria é gradativa, ou seja, aumenta de acordo com a gravidade. Os instrutores que forem flagrados cometendo tal crime estão sujeitos a uma observação até a exoneração por tempo indeterminado da companhia.",
          },
        ],
      },
      {
        title: "SEÇÃO V — ABUSO DE PODER",
        articles: [
          {
            number: "Art. 1º -",
            text: "Este Código Penal Interno estabelece o crime de Abuso de Poder, que ocorre nas seguintes situações:",
            subItems: [
              { type: "inciso", label: "I -", text: "Conceder direitos aos quartos dos Instrutores sem autorização da liderança;" },
              { type: "inciso", label: "II -", text: "Aceitar em grupos da companhia fora de sua função, sem autorização da liderança;" },
              { type: "inciso", label: "III -", text: "Utilização do poder para benefício próprio, favorecer terceiros ou prejuízo alheio;" },
              { type: "inciso", label: "IV -", text: "Usar superioridade hierárquica na polícia RCC para compelir um policial, ocupando o mesmo cargo na companhia ou acima, a aplicar cursos." },
            ],
          },
          {
            number: "Art. 2° -",
            text: "A punição para o crime de Abuso de Poder é escalonada, ou seja, aumenta de acordo com a gravidade da infração. Os instrutores flagrados cometendo tal crime estão sujeitos a uma observação, podendo culminar na expulsão da companhia.",
          },
        ],
      },
      {
        title: "SEÇÃO VI — FALSIFICAÇÃO DE INFORMAÇÕES",
        articles: [
          {
            number: "Art. 1° -",
            text: "Este Código Penal Interno estabelece o crime de Falsificação de Informações, que ocorre nas seguintes situações:",
            subItems: [
              { type: "inciso", label: "I -", text: "Falsificar dados em formulários e/ou requerimentos, com o objetivo de facilitar o cumprimento de metas;" },
              { type: "inciso", label: "II -", text: "Falsificar dados ou informações em documentos da companhia;" },
              { type: "inciso", label: "III -", text: "Fornecer informações falsas ou adulteradas em relatórios ou julgamentos do Setor de Segurança dos Instrutores, comprometendo a integridade das informações." },
            ],
          },
          {
            number: "Art. 2° -",
            text: "A penalidade para o crime de Falsificação de Informações é gradativa, ou seja, aumenta de acordo com a gravidade. Os instrutores que forem flagrados cometendo tal crime estão sujeitos a uma observação até a exoneração por tempo indeterminado da companhia.",
          },
        ],
      },
      {
        title: "SEÇÃO VII — INSUFICIÊNCIA PARA O CARGO",
        articles: [
          {
            number: "Art. 1° -",
            text: "Este Código Penal Interno estabelece o crime de Insuficiência para o Cargo, que ocorre nas seguintes situações:",
            subItems: [
              { type: "inciso", label: "I -", text: "Insuficiência de habilidades específicas ou desempenho abaixo das expectativas para o cargo ocupado;" },
              { type: "inciso", label: "II -", text: "Pela ausência igual ou superior a 5 dias, sem postagem de licença ou reserva na companhia." },
            ],
          },
          {
            number: "Art. 2° -",
            text: "A punição para o crime de insuficiência para o cargo será de um rebaixamento, podendo essa ter um agravamento a uma expulsão da companhia.",
            subItems: [
              { type: "paragrafo", label: "Parágrafo único -", text: "Toda punição requer a validação do ministério e/ou da liderança, mediante consenso, para tornar-se aprovada." },
            ],
          },
        ],
      },
      {
        title: "SEÇÃO VIII — QUEBRA DE SIGILO",
        articles: [
          {
            number: "Art. 1° -",
            text: "Este Código Penal Interno estabelece o crime de Quebra de Sigilo, que ocorre nas seguintes situações:",
            subItems: [
              { type: "inciso", label: "I -", text: "Divulgação de informações de grupos na rede social WhatsApp, cujo sigilo é determinado pela liderança da companhia;" },
              { type: "inciso", label: "II -", text: "Compartilhamento de conteúdo de scripts das aulas, cujo sigilo é determinado;" },
              { type: "inciso", label: "III -", text: "Vazamento de informações sigilosas envolvendo subgrupos, ministério ou liderança da companhia." },
              { type: "paragrafo", label: "Parágrafo único -", text: "O envio de projetos, sugestões ou correções relacionadas a scripts ou ao conteúdo do cargo de avaliador ou superior, no qual o sigilo é estabelecido, deve ser realizado por meio de mensagens privadas ao ministério e/ou liderança, evitando a divulgação do conteúdo." },
            ],
          },
          {
            number: "Art. 2° -",
            text: "A penalidade para o crime de Quebra de Sigilo é gradativa, ou seja, aumenta de acordo com a gravidade. Os instrutores que forem flagrados cometendo tal crime estão sujeitos a uma observação até a exoneração por tempo indeterminado da companhia, conforme o Código Penal Militar da RCC.",
          },
        ],
      },
      {
        title: "SEÇÃO IX — PERTURBAÇÃO À INSTRUÇÃO",
        articles: [
          {
            number: "Art. 1° -",
            text: "Este Código Penal Interno estabelece o crime de Perturbação à Instrução, que ocorre nas seguintes situações:",
            subItems: [
              { type: "inciso", label: "I -", text: "Enviar recrutas/cabos para uma sala já ocupada;" },
              { type: "inciso", label: "II -", text: "Acompanhar aula de um instrutor não pertencendo ao cargo de avaliador+;" },
              { type: "inciso", label: "III -", text: "Invadir uma aula em andamento e acabar prejudicando o andamento dela." },
            ],
          },
          {
            number: "Art. 2° -",
            text: "A penalidade para o crime de Perturbação à Instrução é escalonada, ou seja, aumenta de acordo com a gravidade. Os membros que forem flagrados cometendo tal crime estão sujeitos a uma observação até uma expulsão da companhia.",
          },
        ],
      },
      {
        title: "SEÇÃO X — OBSTRUÇÃO À JUSTIÇA",
        articles: [
          {
            number: "Art. 1° -",
            text: "Este Código Penal Interno estabelece o crime de Obstrução à Justiça, que ocorre nas seguintes situações:",
            subItems: [
              { type: "inciso", label: "I -", text: "Passar declaração falsa ou apresentar informação inverídica, de forma consciente, no processo investigativo;" },
              { type: "inciso", label: "II -", text: "Omitir informação acerca de ação criminosa praticada por terceiro, quando tinha conhecimento do fato;" },
              { type: "inciso", label: "III -", text: "A tentativa de eliminar e/ou alterar quaisquer provas que possam servir para possível processo criminal;" },
            ],
          },
          {
            number: "Art. 2° -",
            text: "A penalidade para o crime de Obstrução à Justiça é gradativa, ou seja, aumenta de acordo com a gravidade. Os instrutores que forem flagrados cometendo tal crime estão sujeitos a uma observação até a exoneração por tempo indeterminado da companhia.",
          },
        ],
      },
    ],
  },
  {
    id: "cpi-capitulo-4",
    romanNumber: "IV",
    title: "ÂMBITO JUDICIÁRIO",
    sections: [
      {
        title: "SEÇÃO I — DIREITOS E DEVERES DO INSTRUTOR",
        articles: [
          {
            number: "Art. 1° -",
            text: "A liderança, ministério e o Setor de Segurança dos Instrutores são responsáveis por garantir o cumprimento dos artigos presentes neste documento e do Regimento Interno dos Instrutores, mantendo a ordem na companhia dos Instrutores. É dever de todos os membros zelar pelo seu cumprimento.",
          },
          {
            number: "Art. 2° -",
            text: "Não há crime sem uma lei anterior que o defina, restrinja ou estabeleça normas proibitivas, tampouco pena sem uma previsão legal prévia. Além disso, não ocorre retroatividade da lei penal, exceto quando for em benefício do réu.",
            subItems: [
              { type: "paragrafo", label: "Parágrafo único -", text: "Mesmo que não haja inciso específico, qualquer ação que vá contra as regras determinadas nos manuais dos cargos será punido conforme crime e gravidade julgados pelo responsável pela aplicação da punição." },
            ],
          },
          {
            number: "Art. 3° -",
            text: "Todo membro tem o dever de apresentar uma denúncia caso observe que um instrutor cometeu um ato que infringe alguma das normativas estabelecidas por este documento. Essa denúncia deve ser dirigida a um membro do Setor de Segurança dos Instrutores ou ministério.",
          },
          {
            number: "Art. 4° -",
            text: "Todo membro tem o direito de recorrer de uma punição ou veredito que considerar inadequado em relação à ação cometida, dirigindo-se a uma das instâncias do Setor Judiciário dos Instrutores, a saber:",
            subItems: [
              { type: "inciso", label: "I -", text: "Presidência do Setor de Segurança dos Instrutores;" },
              { type: "inciso", label: "II -", text: "Ministério da companhia;" },
              { type: "inciso", label: "III -", text: "Liderança da companhia." },
              { type: "paragrafo", label: "Parágrafo único -", text: "Recursos relacionados às punições aplicadas pelo Ministério dos Instrutores devem ser direcionados à Liderança da companhia." },
            ],
          },
          {
            number: "Art. 5° -",
            text: "Consideram-se elementos ou provas em uma denúncia ou recurso os seguintes:",
            subItems: [
              { type: "inciso", label: "I -", text: "Printscreen, sendo esse sem edição, entende-se por edição: cortes, falta de data e horário visível e falta de tela cheia;" },
              { type: "inciso", label: "II -", text: "Registros de conversações por printscreen, bem como declarações de testemunhas (se forem por escrito, devem ser comprovadas por printscreen);" },
              { type: "inciso", label: "III -", text: "Vídeos, desde que não contenham edições, exibidos em tela cheia e com data e horário visíveis;" },
              { type: "inciso", label: "IV -", text: "Confissão espontânea da autoria de um crime ou ato delituoso." },
              { type: "paragrafo", label: "Parágrafo único -", text: "Os registros podem ser rasurados para esconder conversas confidenciais, bem como esconder informações pessoais da conta, como quantidade de moedas, diamantes e tempo como membro do Habbo Club." },
            ],
          },
          {
            number: "Art. 6° -",
            text: "Os recursos contra vereditos e/ou punições devem ser apresentados no prazo de até 07 dias, a partir da data de publicação da decisão ou homologação da punição.",
          },
          {
            number: "Art. 7° -",
            text: "As informações e provas utilizadas em denúncias ou acusações perante instâncias da companhia dos Instrutores são confidenciais e seu conhecimento fica restrito aos responsáveis pelo caso e aos elementos que, a critério daquelas, se façam necessários serem informados.",
          },
        ],
      },
      {
        title: "SEÇÃO II — EXTINÇÃO DE PUNIBILIDADE",
        articles: [
          {
            number: "Art. 1° -",
            text: "Considera-se redução ou extinção da punibilidade em um processo judicial conforme os seguintes termos:",
            subItems: [
              { type: "inciso", label: "I -", text: "Pela promoção, rebaixamento, expulsão ou saída do membro da companhia, especialmente em casos de instrutores com advertências internas;" },
              { type: "inciso", label: "II -", text: "Pela retroatividade de uma lei que não mais considera o ato como criminoso ou extingue a punição aplicada ao caso;" },
              { type: "inciso", label: "III -", text: "Pela coação irresistível que impeça o indivíduo de agir de acordo com sua vontade, seguindo estritamente ordens diretas de superiores hierárquicos;" },
              { type: "inciso", label: "IV -", text: "Pelo perdão concedido pela Liderança da companhia;" },
              { type: "inciso", label: "V -", text: "Pelo conhecimento do crime quando o militar estiver em uma carreira diferente daquela em que o crime foi cometido;" },
              { type: "inciso", label: "VI -", text: "Caso seja comprovada a intimidade entre as partes, em casos proferir palavras de baixo calão em conversas particulares ou eventos informais;" },
              { type: "inciso", label: "VII -", text: "Pela conclusão da Transação Penal, destinada aos membros do Ministério;" },
              { type: "inciso", label: "VIII -", text: "Pela comprovação de que o ato delituoso decorreu devida a falha das ferramentas utilizadas no fórum dos Instrutores ou RCCSystem." },
              { type: "paragrafo", label: "§ 1° -", text: "A extinção da punibilidade, conforme mencionado no inciso II, ocorrerá somente se o fato ocorrer dentro do período de 14 (quatorze) dias." },
              { type: "paragrafo", label: "§ 2° -", text: "A extinção da punibilidade, conforme mencionado no inciso V, não se aplica a casos passíveis de exoneração da companhia." },
              { type: "paragrafo", label: "§ 3° -", text: "A migração entre o corpo militar e o corpo executivo não se estende ao disposto no inciso V." },
              { type: "paragrafo", label: "§ 4° -", text: "A extinção de punibilidade, conforme mencionado no inciso VI, é aplicável aos estagiários e ministros que forem punidos com uma observação ou advertência interna sendo extintas pela realização de uma tarefa definida pela Liderança, podendo ser solicitada uma vez a cada 60 dias." },
            ],
          },
          {
            number: "Art. 2° -",
            text: "A ordem direta de um superior hierárquico na companhia, que força ou induz seu subalterno a cometer um crime por meio de uma ordem direta, o autor da coação é responsabilizado pelo resultado e a punibilidade do militar coagido pela conduta delituosa é extinta.",
          },
          {
            number: "Art. 3° -",
            text: "Durante o período de adaptação, que compreende os primeiros 14 (quatorze) dias após a entrada do membro na companhia dos Instrutores, é concedida uma forma mais branda de punição aos membros, permitindo a retrocessão das punições para infrações menos graves. No entanto, há exceções quando o membro:",
            subItems: [
              { type: "inciso", label: "I -", text: "Comete uma infração grave e/ou severa que representa risco para a instituição, militares ou companhia;" },
              { type: "inciso", label: "II -", text: "Reincidir em uma infração." },
            ],
          },
          {
            number: "Art. 4° -",
            text: "Ex-membros que foram exonerados da companhia podem ter uma redução em sua punição caso tenham contribuído de forma aprovada dentro da mesma, incluindo:",
            subItems: [
              { type: "inciso", label: "I -", text: "Realização de alterações em script ou documentos;" },
              { type: "inciso", label: "II -", text: "Envio de projetos relevantes;" },
              { type: "inciso", label: "III -", text: "A reconsideração de punições permite a revisão de casos anteriores, julgados de forma equivocada ou injusta, viabilizando a alteração da punição mediante apresentação de novas evidências ou análise aprofundada do caso." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cpi-capitulo-5",
    romanNumber: "V",
    title: "DISPOSIÇÕES FINAIS",
    articles: [
      {
        number: "Art. 1° -",
        text: "Este documento está sujeito a alterações a qualquer momento, sem aviso prévio, pela liderança.",
      },
      {
        number: "Art. 2° -",
        text: "As solicitações de mudança devem ser feitas no tópico \"[INS] Ouvidoria\".",
      },
      {
        number: "Art. 3° -",
        text: "O Código Penal dos Instrutores é uma compilação de diretrizes pré-definidas pela Liderança, seu Ministério e contribuições de uma parcela dos membros da companhia.",
      },
    ],
  },
];

const PREAMBULO_CPI = "O Código Penal dos Instrutores (CPI) tem como propósito definir os delitos ligados à conduta associativa, visando orientar os membros e tipificar suas transgressões.";

const DOCUMENT_TABS = [
  {
    id: "ssi" as DocumentType,
    title: "Regimento Interno do SSI",
    subtitle: "Normas, cargos e diretrizes do Setor de Segurança",
    badge: null,
    icon: ShieldCheck,
    chaptersCount: 5,
    articlesCount: 20,
  },
  {
    id: "penal" as DocumentType,
    title: "Código Penal dos Instrutores",
    subtitle: "Tipificações, penalidades e dosimetria disciplinar",
    badge: null,
    icon: Scale,
    chaptersCount: 5,
    articlesCount: 52,
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
];

function countChapterArticles(chap: Chapter): number {
  const direct = chap.articles?.length || 0;
  const inSections = chap.sections?.reduce((sum, s) => sum + s.articles.length, 0) || 0;
  return direct + inSections;
}

function DocumentacoesPage() {
  const [activeDoc, setActiveDoc] = useState<DocumentType>("ssi");
  const [searchTerm, setSearchTerm] = useState("");
  const [isIndexOpen, setIsIndexOpen] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<string>("capitulo-1");
  const [copiedArticle, setCopiedArticle] = useState<string | null>(null);

  const currentChapters = activeDoc === "ssi" ? REGIMENTO_SSI : CODIGO_PENAL;

  // Filtragem de artigos no documento ativo
  const filteredChapters = useMemo(() => {
    if (!searchTerm.trim()) return currentChapters;
    const query = searchTerm.toLowerCase();

    return currentChapters
      .map((chap) => {
        const matchChapterTitle = chap.title.toLowerCase().includes(query);

        // Filtrar artigos diretos
        const filteredArticles = (chap.articles || []).filter((art) => {
          const matchArtNum = art.number.toLowerCase().includes(query);
          const matchText = art.text.toLowerCase().includes(query);
          const matchSubItems = art.subItems?.some(
            (sub) => sub.text.toLowerCase().includes(query) || sub.label.toLowerCase().includes(query)
          );
          return matchChapterTitle || matchArtNum || matchText || matchSubItems;
        });

        // Filtrar seções
        const filteredSections = (chap.sections || [])
          .map((sec) => {
            const matchSecTitle = sec.title.toLowerCase().includes(query);
            const secArticles = sec.articles.filter((art) => {
              const matchArtNum = art.number.toLowerCase().includes(query);
              const matchText = art.text.toLowerCase().includes(query);
              const matchSubItems = art.subItems?.some(
                (sub) => sub.text.toLowerCase().includes(query) || sub.label.toLowerCase().includes(query)
              );
              return matchChapterTitle || matchSecTitle || matchArtNum || matchText || matchSubItems;
            });

            return {
              ...sec,
              articles: secArticles,
            };
          })
          .filter((sec) => sec.articles.length > 0);

        return {
          ...chap,
          articles: filteredArticles,
          sections: filteredSections,
        };
      })
      .filter((chap) => (chap.articles && chap.articles.length > 0) || (chap.sections && chap.sections.length > 0));
  }, [currentChapters, searchTerm]);

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

  const totalArticles = useMemo(() => {
    return currentChapters.reduce((acc, chap) => acc + countChapterArticles(chap), 0);
  }, [currentChapters]);

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
        {(activeDoc === "ssi" || activeDoc === "penal") && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 border border-border px-3.5 py-1.5 rounded-lg w-fit">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-foreground">{currentChapters.length} Capítulos</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-semibold text-foreground">{totalArticles} Artigos</span>
          </div>
        )}
      </div>

      {/* Seletor de Documentos (3 Tipos) */}
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
                if (doc.id === "ssi") setActiveChapterId("ssi-capitulo-1");
                if (doc.id === "penal") setActiveChapterId("cpi-capitulo-1");
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

      {/* Visualização de Documento Ativo (SSI ou Código Penal) */}
      {activeDoc === "ssi" || activeDoc === "penal" ? (
        <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
          {/* Navegador Lateral Fixo de Capítulos (Desktop) */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-20 bg-card/80 border border-border rounded-xl p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 pb-3 mb-2 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ListTree className="h-4 w-4 text-primary" />
              <span>Capítulos do Documento</span>
            </div>

            <nav className="flex flex-col gap-1.5">
              {currentChapters.map((chap) => {
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
              <span className="font-semibold text-foreground">
                {activeDoc === "ssi" ? "Setor de Segurança" : "Código Penal dos Instrutores"}
              </span>
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
                  placeholder="Buscar por artigo, crime, termo ou punição (ex: licença, advertência, script, dolo)..."
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

            {/* PREÂMBULO (Apenas no Código Penal) */}
            {activeDoc === "penal" && !searchTerm && (
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1.5">
                  Preâmbulo
                </span>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {PREAMBULO_CPI}
                </p>
              </div>
            )}

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
                  {currentChapters.map((chap) => {
                    const count = countChapterArticles(chap);
                    return (
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
                          {count} {count === 1 ? "artigo" : "artigos"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LISTAGEM DOS CAPÍTULOS E ARTIGOS */}
            {filteredChapters.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="font-bold text-foreground text-sm">Nenhum artigo encontrado</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Não localizamos nenhum artigo correspondente a &quot;{searchTerm}&quot;. Tente buscar
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

                    <div className="flex flex-col gap-6 pt-1">
                      {/* Artigos Diretos do Capítulo */}
                      {chapter.articles && chapter.articles.length > 0 && (
                        <div className="flex flex-col gap-6 divide-y divide-border/40">
                          {chapter.articles.map((article, artIdx) => {
                            const articleId = `${chapter.id}-${article.number.replace(/\s+/g, "-")}`;
                            const isCopied = copiedArticle === articleId;

                            return (
                              <div
                                key={article.number}
                                className={`flex flex-col gap-3 group ${artIdx > 0 ? "pt-5" : ""}`}
                              >
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
                      )}

                      {/* Seções com Artigos (ex: CPI Cap II, Cap III, Cap IV) */}
                      {chapter.sections && chapter.sections.length > 0 && (
                        <div className="flex flex-col gap-8 mt-2">
                          {chapter.sections.map((section, secIdx) => (
                            <div
                              key={section.title}
                              className={`flex flex-col gap-4 ${
                                secIdx > 0 || (chapter.articles && chapter.articles.length > 0)
                                  ? "pt-6 border-t border-border/50"
                                  : ""
                              }`}
                            >
                              {/* Título da Seção */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-primary tracking-wide uppercase px-3 py-1 rounded-md bg-primary/10 border border-primary/20">
                                  {section.title}
                                </span>
                              </div>

                              <div className="flex flex-col gap-6 divide-y divide-border/40">
                                {section.articles.map((article, artIdx) => {
                                  const articleId = `${chapter.id}-${section.title.replace(/\s+/g, "-")}-${article.number.replace(/\s+/g, "-")}`;
                                  const isCopied = copiedArticle === articleId;

                                  return (
                                    <div
                                      key={article.number}
                                      className={`flex flex-col gap-3 group ${artIdx > 0 ? "pt-5" : ""}`}
                                    >
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
                            </div>
                          ))}
                        </div>
                      )}
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
      ) : (
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
      )}
    </div>
  );
}
