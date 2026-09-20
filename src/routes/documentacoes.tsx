import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { 
  BookOpen, 
  ShieldCheck, 
  Building2, 
  Scale, 
  Search, 
  ChevronDown, 
  ListTree, 
  Copy, 
  Check, 
  ArrowUp, 
  Home, 
  Users, 
  Globe, 
  ExternalLink,
  Award,
  Sparkles
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

interface CustomCollapsible {
  id: "breves" | "quartos" | "grupos" | "canais";
  title: string;
}

interface Article {
  number: string;
  text: string;
  subItems?: SubItem[];
  customCollapsible?: CustomCollapsible;
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

// ---------------------------------------------------------
// 3. REGIMENTO INTERNO DA COMPANHIA (RII)
// ---------------------------------------------------------
const REGIMENTO_COMPANHIA: Chapter[] = [
  {
    id: "comp-capitulo-1",
    romanNumber: "I",
    title: "DAS DISPOSIÇÕES GERAIS",
    articles: [
      {
        number: "Art. 1º -",
        text: "A Companhia dos Instrutores é o grupo responsável pela formação dos militares da Polícia Revolução Contra o Crime, passando conhecimentos teóricos e práticos através de aulas aplicadas a recrutas e cabos com o objetivo de torná-los futuros líderes em nossa polícia.",
      },
      {
        number: "Art. 2º -",
        text: "Todo instrutor deve, independente de seu grau hierárquico, informar-se das normas contidas neste documento, seguindo-as estritamente. Da mesma forma, todos os membros da companhia estão subordinados ao Código de Conduta Militar e ao Código Penal Militar da Polícia RCC.",
      },
    ],
  },
  {
    id: "comp-capitulo-2",
    romanNumber: "II",
    title: "HIERARQUIA E FUNÇÕES",
    articles: [
      {
        number: "Art. 1° -",
        text: "A companhia dos Instrutores é composta por sete cargos, os quais possuem as seguintes funções:",
        subItems: [
          { type: "inciso", label: "I -", text: "Instrutor (INS): É o cargo inicial da companhia, responsável pela aplicação das aulas do Curso de Formação de Soldados (CFSd) e Curso de Formação de Cabos (CFC) I e II." },
          { type: "inciso", label: "II -", text: "Avaliador (Av.INS): É o cargo responsável por acompanhar a aula, prestando auxílio em tempo real aos Instrutores. Caso o Instrutor venha a ter um desempenho abaixo da nota esperada, terá de fazer obrigatoriamente o Curso de Desenvolvimento de Instrutores (CDI)." },
          { type: "inciso", label: "III -", text: "Capacitador (Cap.INS): É o cargo responsável por capacitar os membros da companhia através de capacitações aplicadas aos instrutores e avaliadores." },
          { type: "inciso", label: "IV -", text: "Estagiário (Est.INS): É o cargo inicial do Ministério dos Instrutores, cuja função é auxiliar os ministros diante da divisão de funções, realizando tarefas administrativas, incluindo a supervisão de projetos enviados à ouvidoria e o acompanhamento das promoções dos membros da companhia." },
          { type: "inciso", label: "V -", text: "Ministro (Min.INS): É o cargo responsável pelas atribuições do ministério, atuando de modo a auxiliar a liderança na administração da companhia, seja através do contato com os membros ou realizando tarefas administrativas, incluindo a supervisão de projetos enviados à ouvidoria e o acompanhamento das promoções dos membros da companhia." },
          { type: "inciso", label: "VI -", text: "Vice-Líder (VL.INS): É o membro responsável por auxiliar o Líder na organização e comando da companhia." },
          { type: "inciso", label: "VII -", text: "Líder (L.INS): É o cargo mais alto do grupo e tem total autonomia sobre ele. É dever do Líder manter os altos padrões de desempenho da companhia, administrando a sua estrutura e funcionamento." },
        ],
      },
      {
        number: "Art. 2º -",
        text: "O ministério da Companhia dos Instrutores é composto por ministros, aos quais os estagiários prestam auxílio nas respectivas funções, sendo divididos em 07 departamentos:",
        subItems: [
          { type: "inciso", label: "I -", text: "Ministério da Administração: Responsável pela atualização das postagens dos Cursos de Formação de Cabos no RCCSystem e pelo envio de uma Mensagem Privada aos instrutores em caso de erros cometidos." },
          { type: "inciso", label: "II -", text: "Ministério da Atualização: Responsável pela atualização diária da listagem de membros e quadro de advertências da companhia." },
          { type: "inciso", label: "III -", text: "Ministério da Contabilidade: Responsável pela postagem da porcentagem semanais e quinzenais na consulta de eficiência, pela distribuição de pontos para instrutores negativos, pela postagem dos destaques no DC e atualização de bots destaques no corredor da companhia." },
          { type: "inciso", label: "IV -", text: "Ministério das Finanças: É responsável pela postagem de medalhas efetivas semanais, quinzenais e mensais e postagem de medalhas dos expulsos/saídas precoces no cofre da Auditoria Fiscal, pela postagem mensal das medalhas de subgrupos no cofre da Auditoria Fiscal e pela postagem de medalhas por proposta aprovada no RCCSystem." },
          { type: "inciso", label: "V -", text: "Ministério da Documentação: É responsável pela implementação das propostas aprovadas, pela atualização da planilha de retificação de erros e pela postagem de pontos por contribuição aprovada no System INS." },
          { type: "inciso", label: "VI -", text: "Ministério dos Recursos Humanos: É responsável pela postagem do destaque mensal no Diário Oficial, pela postagem dos pontos no Ranking Interno dos instrutores e pela postagem dos promovidos." },
          { type: "inciso", label: "VII -", text: "Ministério da Segurança: É responsável pela limpeza do grupo do fórum da companhia e emblemas da companhia dos Instrutores e pela fiscalização da listagem de membros." },
        ],
      },
      {
        number: "Art. 3º -",
        text: "Para a identificação de seus membros, a companhia dispõe de um grupo oficial, além do brevê, de uso obrigatório a todos os membros da companhia, sendo facultativo apenas àqueles que possuem visual livre. Confira abaixo a coloração do brevê de cada cargo:",
        customCollapsible: {
          id: "breves",
          title: "COLORAÇÃO DOS BREVÊS",
        },
      },
    ],
  },
  {
    id: "comp-capitulo-3",
    romanNumber: "III",
    title: "CURSOS E REGRAS DE APLICAÇÕES",
    articles: [
      {
        number: "Art. 1° -",
        text: "A Companhia dos Instrutores é responsável pela formação dos novos militares, sendo de responsabilidade de seus membros a aplicação do Curso de Formação de Soldados (CFSd), além do Curso de Formação de Cabos I e II (CFC).",
        subItems: [
          { type: "paragrafo", label: "§ 1º -", text: "O Curso de Formação de Soldados é aplicado aos recrutas que chegam ao batalhão, mediante alerta do sentinela ao Instrutor que estiver no Hall dos Instrutores, quando houver pelo menos dois recrutas na sentinela ou quando atingir os 05 minutos de pré-aula, cabendo a notificação ao Oficial da Guarda somente na ausência de instrutor disponível." },
          { type: "paragrafo", label: "§ 2º -", text: "O Curso de Formação de Cabos I e II é aplicado aos novos Cabo, que acabaram de ser promovidos hierarquicamente, sendo dever do instrutor, antes de iniciar a aplicação do CFC I e/ou CFC II, verificar se o cabo está registrado no RCCSystem e já obteve o curso anteriormente." },
          { type: "paragrafo", label: "§ 3° -", text: "Caso ocorra a reprovação do CFC I ou CFC II, o Instrutor pode reaplicar de forma consecutiva após a primeira reprovação." },
          { type: "paragrafo", label: "§ 4º -", text: "Em caso de ausência de instrutores, deverá ser seguido a hierarquia da companhia a partir do cargo de avaliador. Todo instrutor, independente do cargo na companhia, tem a obrigação de também postar a aplicação dos cursos CFSd, CFC I e CFC II no formulário de relatório de aulas." },
        ],
      },
      {
        number: "Art. 2° -",
        text: "É proibida a realização de cursos fora das salas de instruções ou dos cubículos do Batalhão Auxiliar, no caso de CFSd.",
      },
      {
        number: "Art. 3° -",
        text: "Caso cometem erros no preenchimento de qualquer informação referente às aulas ou cursos aplicados, os membros da companhia poderão retificar em até 24h após a realização da postagem errônea.",
      },
      {
        number: "Art. 4° -",
        text: "É proibido o início de aulas com o batalhão fechado, independente do motivo que o batalhão não esteja aberto.",
      },
      {
        number: "Art. 5° -",
        text: "Em caso de aulas iniciadas no sábado, mas postadas após 00h do domingo, considerar-se-á pertencente a semana que foi iniciada.",
      },
      {
        number: "Art. 6° -",
        text: "O Hall dos Instrutores, localizado nos batalhões, tem como finalidade organizar os instrutores interessados em aplicar a instrução inicial em uma fila, respeitando a ordem de chegada, salvo nos seguintes casos:",
        subItems: [
          { type: "inciso", label: "I -", text: "Acordo consensual entre o instrutor que estava como próximo da fila e aquele que solicitou a instrução." },
          { type: "inciso", label: "II -", text: "Período de sextas-feiras às 00h00 BR e sábados às 23h59 BR, ocorrerá uma preferência obrigatória para os instrutores que ainda não tenham realizado sua meta." },
        ],
      },
      {
        number: "Art. 7° -",
        text: "Em situações emergenciais em que as plataformas da instituição sendo o RCCSystem ou Fórum encontram-se indisponíveis, ficam estabelecidos os seguintes procedimentos:",
        subItems: [
          { type: "inciso", label: "I -", text: "Na eventualidade do RCCSystem estar offline, efetue a publicação do CFSd no fórum, no tópico denominado \"Listagens e Requerimentos: Backup > Requerimentos: Instrução Inicial, Contratação e Desligamento\"." },
          { type: "inciso", label: "II -", text: "Na eventualidade de AMBAS plataformas estarem indisponíveis, remeta os registros referentes à aula a um Ministro, a fim de que, ao restabelecer-se o funcionamento das plataformas, a demanda seja devidamente atualizada." },
          { type: "paragrafo", label: "Parágrafo único -", text: "Após o retorno do RCCSystem, o Ministério da Administração ficará responsável pela postagem adequada das aulas aplicadas durante o período de inatividade." },
        ],
      },
    ],
  },
  {
    id: "comp-capitulo-4",
    romanNumber: "IV",
    title: "METAS, DESEMPENHOS E GRATIFICAÇÕES",
    articles: [
      {
        number: "Art. 1° -",
        text: "Para cada cargo da companhia, é estabelecida uma meta mínima de desempenho que todos os membros devem cumprir obrigatoriamente dentro do prazo definido para a função que exercem.",
      },
      {
        number: "Art. 2º -",
        text: "As metas mínimas aplicáveis para cada cargo da Companhia dos Instrutores são as seguintes:",
        subItems: [
          { type: "inciso", label: "I -", text: "Instrutor (INS): A meta semanal estabelecida é de 6 pontos, distribuídos da seguinte forma: o Curso de Formação de Soldados (CFSd) equivale a 3 pontos por curso, enquanto o Curso de Formação de Cabos I e II (CFC) equivale a 2 pontos por participante." },
          { type: "inciso", label: "II -", text: "Avaliador (Av.INS): A meta é estabelecida em 6 pontos, em que cada acompanhamento equivale a 4 pontos e o Curso de Desenvolvimento de Instrutores (CDI) equivale a 2 pontos." },
          { type: "inciso", label: "III -", text: "Capacitador (Cap.INS): A meta quinzenal é de 3 capacitações, podendo ser tanto a básica quanto a avançada." },
          { type: "inciso", label: "IV -", text: "Estagiário (Est.INS): A meta é estabelecida em escala mensal e compreende a realização de tarefas administrativas, incluindo a supervisão dos projetos encaminhados à ouvidoria e o acompanhamento das promoções dos membros da Companhia. Ademais, compete à liderança dos Instrutores a condução da rotação de ministérios entre os estagiários, em conformidade com as diretrizes institucionais vigentes." },
          { type: "inciso", label: "V -", text: "Ministro (Min.INS): A meta é fixada em escala mensal e abrange o cumprimento das tarefas administrativas inerentes ao ministério competente, bem como a supervisão dos projetos encaminhados à ouvidoria e o acompanhamento das promoções dos membros da Companhia." },
          { type: "paragrafo", label: "§ 1º -", text: "Os cargos de Líder e Vice-Líder não possuem metas pré-definidas, devendo, contudo, cumprir as obrigações que lhes cabem perante a Companhia de Instrutores." },
          { type: "paragrafo", label: "§ 2º -", text: "O descumprimento da meta acarretará em medalhas efetivas negativas. Para o cargo de Instrutor (INS), a penalidade corresponderá a 10 medalhas negativas. Para os demais cargos, a penalização será equivalente ao valor atribuído à meta do respectivo cargo, convertido em medalhas negativas." },
          { type: "paragrafo", label: "§ 3° -", text: "O membro que descumprir a meta de seu respectivo cargo por duas vezes dentro de um período de 30 dias estará sujeito às seguintes penalidades:" },
          { type: "inciso", label: "I -", text: "Caso ocupe o cargo de Instrutor, será desligado da Companhia e penalizado com 100 medalhas efetivas negativas;" },
          { type: "inciso", label: "II -", text: "Caso ocupe o cargo de Avaliador ou cargo superior, será sujeito a um rebaixamento interno e penalizado com 50 medalhas efetivas negativas." },
          { type: "paragrafo", label: "§ 4° -", text: "Para os Capacitadores, em razão do caráter quinzenal de suas atividades, o período de contagem de reincidência será de 45 dias, e não de 30. Os capacitadores que não cumprirem suas metas no período mencionado receberão um rebaixamento interno." },
        ],
      },
      {
        number: "Art. 3º -",
        text: "Define-se abaixo a gratificação por cumprimento de meta de cada um dos cargos da hierarquia da companhia dos Instrutores:",
        subItems: [
          { type: "inciso", label: "I -", text: "Instrutor (INS): 05 a 15 medalhas efetivas positivas por semana;" },
          { type: "inciso", label: "II -", text: "Avaliador (Av.INS): 15 medalhas efetivas positivas por semana;" },
          { type: "inciso", label: "III -", text: "Capacitador (Cap.INS): 25 medalhas efetivas positivas por quinzena;" },
          { type: "inciso", label: "IV -", text: "Estagiário (Est.INS): 15 medalhas efetivas positivas por semana;" },
          { type: "inciso", label: "V -", text: "Ministro (Min.INS): 15 medalhas efetivas positivas por semana;" },
          { type: "inciso", label: "VI -", text: "Vice-Líder (VL.INS): 65 medalhas efetivas positivas por mês;" },
          { type: "inciso", label: "VII -", text: "Líder (L.INS): 65 medalhas efetivas positivas por mês;" },
          { type: "paragrafo", label: "§ 1º -", text: "As medalhas efetivas atribuídas aos instrutores no cargo inicial são variáveis, sendo a gratificação concedida de acordo com a pontuação obtida, conforme as seguintes categorias:" },
          { type: "inciso", label: "I -", text: "6 a 9 pontos receberá 05 medalhas efetivas;" },
          { type: "inciso", label: "II -", text: "10 a 15 pontos receberá 10 medalhas efetivas;" },
          { type: "inciso", label: "III -", text: "16 ou mais pontos receberá 15 medalhas efetivas." },
          { type: "paragrafo", label: "§ 2º -", text: "Das gratificações destinadas à liderança, serão descontados os dias retirados em licença, de maneira proporcional ao total de dias transcorridos no mês." },
        ],
      },
      {
        number: "Art. 4º -",
        text: "Os instrutores e avaliadores possuem direito a uma justificativa mensal, caso não consigam alcançar a meta mínima, devendo ser postada em até 24 horas após a finalização da respectiva meta, no tópico “[INS] Relatório de Postagens”, encontrado no subfórum do referido cargo.",
      },
      {
        number: "Art. 5º -",
        text: "Aos membros da companhia que se destacarem semanalmente ou quinzenalmente no cumprimento das metas estabelecidas para seus respectivos cargos, serão conferidas honrarias e benefícios, nos termos deste artigo.",
        subItems: [
          { type: "paragrafo", label: "§ 1º -", text: "Os destaques referidos no caput farão jus aos seguintes benefícios:" },
          { type: "inciso", label: "I -", text: "Um \"bot\" com a imagem do avatar no corredor da companhia durante os próximos 7 dias da referida proeza;" },
          { type: "inciso", label: "II -", text: "7 dias de emblema \"[RCC] Melhor Policial do Mês\", podendo ser favoritado;" },
          { type: "inciso", label: "III -", text: "20 medalhas temporárias;" },
          { type: "inciso", label: "IV -", text: "Concessão da medalha de honra por 24 horas." },
          { type: "paragrafo", label: "§ 2º -", text: "O Avaliador ou Capacitador que figurar como destaque semanal ou quinzenal, vão usufruir apenas do benefício previsto no inciso I." },
        ],
      },
      {
        number: "Art. 6º -",
        text: "As promoções na Companhia exigem o cumprimento de metas consecutivas nos seguintes termos:",
        subItems: [
          { type: "inciso", label: "I -", text: "Duas metas consecutivas para promoção aos cargos de Instrutor, Avaliador e Capacitador;" },
          { type: "inciso", label: "II -", text: "Quatro metas consecutivas para promoção aos cargos de Estagiário e Ministro." },
          { type: "paragrafo", label: "Parágrafo único -", text: "A Liderança possui autonomia para efetuar a promoção, independentemente do disposto no caput deste artigo, quando houver necessidade de preenchimento das vagas existentes." },
        ],
      },
      {
        number: "Art. 7º -",
        text: "O membro que tiver um projeto aprovado na companhia será gratificado com 20 medalhas temporárias.",
      },
      {
        number: "Art. 8º -",
        text: "O Setor de Relações Comunicativas (SRC) poderá distribuir até 100 medalhas temporárias mensais em eventos ou treinamentos da companhia.",
      },
    ],
  },
  {
    id: "comp-capitulo-5",
    romanNumber: "V",
    title: "RANKING DE GRATIFICAÇÕES",
    articles: [
      {
        number: "Art. 1º -",
        text: "O Ranking de Gratificações se utiliza de um sistema de pontuações que são atribuídas a cada tipo de atividade dentro da companhia, realizadas pelos instrutores participantes, com o intuito de estimular a realização de ações em prol da companhia, sendo que:",
        subItems: [
          { type: "inciso", label: "I -", text: "A participação no ranking é exclusiva de instrutores, avaliadores e capacitadores, sendo zerado mensalmente." },
          { type: "inciso", label: "II -", text: "O Instrutor do mês receberá o emblema \"[RCC] Melhor Policial do Mês\" por 30 dias e será condecorado com uma medalha no perfil do RCCSystem." },
        ],
      },
      {
        number: "Art. 2º -",
        text: "Define-se como ações passíveis de pontuações positivas no ranking de gratificações:",
        subItems: [
          { type: "inciso", label: "I -", text: "Contribuição aprovada na companhia ou subgrupo;" },
          { type: "inciso", label: "II -", text: "Cumprimento de meta;" },
          { type: "inciso", label: "III -", text: "Destaque semanal/quinzenal;" },
          { type: "inciso", label: "IV -", text: "Promoção na companhia ou no subgrupo;" },
          { type: "inciso", label: "V -", text: "Participação na reunião geral ou em evento interno;" },
          { type: "inciso", label: "VI -", text: "Sugestão de evento." },
        ],
      },
      {
        number: "Art. 3º -",
        text: "Define-se como ações passíveis de pontuações negativas no ranking de gratificações:",
        subItems: [
          { type: "inciso", label: "I -", text: "Descumprimento de meta;" },
          { type: "inciso", label: "II -", text: "Rebaixamento na companhia ou no subgrupo;" },
          { type: "inciso", label: "III -", text: "Advertência Interna;" },
          { type: "inciso", label: "IV -", text: "Qualquer outra infração cometida." },
        ],
      },
      {
        number: "Art. 4º -",
        text: "A postagem e atualização dos pontos será de responsabilidade do Ministério dos Recursos Humanos ou da Liderança dos Subgrupos, com relação à pontuação com que estiver relacionada.",
      },
    ],
  },
  {
    id: "comp-capitulo-6",
    romanNumber: "VI",
    title: "ISENÇÃO DE METAS",
    articles: [
      {
        number: "Art. 1º -",
        text: "Estão passíveis para isenções de meta:",
        subItems: [
          { type: "inciso", label: "I -", text: "Os membros admitidos na Companhia durante a semana de sua admissão, ou que estejam cumprindo a primeira semana de meta no cargo, estão isentos do cumprimento da meta no referido período." },
          { type: "inciso", label: "II -", text: "Os Capacitadores promovidos após decorridos 7 dias do início da quinzena, ou que tenham sido prejudicados de qualquer forma no cumprimento de sua meta quinzenal, estão isentos do cumprimento da meta no referido período." },
          { type: "inciso", label: "III -", text: "Membros da Companhia com meta semanal que entrar de licença em até 96 horas antes da finalização da respectiva meta, ou que retornarem de licença de serviço após 48 horas do início da mesma." },
          { type: "inciso", label: "IV -", text: "Membros da companhia com meta quinzenal que entrar de licença de serviço até a metade da quinzena." },
          { type: "inciso", label: "V -", text: "Instrutores e avaliadores que justificarem a meta em até 24h após o encerramento da respectiva meta, respeitando o limite de uma justificativa por mês." },
          { type: "inciso", label: "VI -", text: "Membros que realizarem a capacitação após 48 horas do início da respectiva meta." },
          { type: "paragrafo", label: "§ 1º -", text: "O membro que se enquadre nas condições supracitadas e venha a cumprir sua meta estará apto ao recebimento de medalhas efetivas positivas." },
          { type: "paragrafo", label: "§ 2º -", text: "O membro promovido ao novo cargo deverá cumprir a meta do cargo anterior, a qual se encerrará na data anterior a postagem da promoção. A promoção será cancelada caso o membro se encontre em situação negativa ou em caso especial." },
        ],
      },
    ],
  },
  {
    id: "comp-capitulo-7",
    romanNumber: "VII",
    title: "DAS ENTRADAS, SAÍDAS E REINTEGRAÇÕES",
    articles: [
      {
        number: "Art. 1º -",
        text: "Todos os policiais ativos na Polícia RCC poderão ingressar na Companhia dos Instrutores, seja por meio do teste de admissão ou reintegração, desde que atendam os seguintes requisitos:",
        subItems: [
          { type: "inciso", label: "I -", text: "Ocupar a patente/cargo de cabo/assessor acima;" },
          { type: "inciso", label: "II -", text: "Ter concluído o Curso de Formação de Cabos (CFC)/Aula de Praças Intermediária (API) e a Aula de Segurança (SEG);" },
          { type: "inciso", label: "III -", text: "Possuir a conta ativa no fórum da Polícia RCC;" },
          { type: "inciso", label: "IV -", text: "Disponibilidade para o cumprimento de seus deveres e metas na companhia." },
        ],
      },
      {
        number: "Art. 2º -",
        text: "Os testes de admissão são de responsabilidade do Departamento de Aplicação. No entanto, na ausência de um membro do subgrupo, poderão ser aplicados por um membro do Ministério ou da Liderança da companhia.",
      },
      {
        number: "Art. 3º -",
        text: "A capacitação é obrigatória para os cargos de instrutores e avaliadores, devendo ser concluída no prazo de 7 dias após a aprovação no teste de admissão ou promoção dentro da companhia.",
        subItems: [
          { type: "paragrafo", label: "§ 1º -", text: "Durante o período de licença na companhia, o prazo da capacitação será suspenso, retornando-se a contagem a partir do retorno do membro." },
          { type: "paragrafo", label: "§ 2º -", text: "O membro que não realizar a capacitação dentro do prazo estipulado, caso ocupe o cargo de avaliador acima, será punido com um rebaixamento interno e 50 medalhas efetivas negativas, e caso ocupe o cargo de instrutor, será expulso da companhia, recebendo 100 medalhas efetivas negativas." },
        ],
      },
      {
        number: "Art. 4º -",
        text: "A reintegração somente será possível aos membros que chegaram ao cargo de Ministro e tiveram baixa honrosa na companhia dos Instrutores, sendo de uso único e exclusivo para o próximo ingresso na companhia, sem a necessidade do teste de admissão, devendo ser realizada por um membro da Liderança ou Ministro que tenha permissão desta.",
        subItems: [
          { type: "paragrafo", label: "Parágrafo único -", text: "Cabe à Liderança julgar a necessidade de realização da capacitação por parte do membro reintegrado, levando-se em conta o tempo em que este esteve inativo, as mudanças ocorridas neste intervalo, bem como demais fatores intervenientes julgados pertinentes." },
        ],
      },
      {
        number: "Art. 5º -",
        text: "Todo membro da companhia dos Instrutores que passar por um processo de migração entre corpo militar/corpo executivo, caso tenha interesse em manter-se na companhia, deverá:",
        subItems: [
          { type: "inciso", label: "I -", text: "Registrar seu desligamento ou reforma no RCCSystem, indicando no campo de motivo que realizará uma migração de corpo;" },
          { type: "inciso", label: "II -", text: "Caso a migração ocorra para o Corpo Militar, deverá solicitar a postagem de seu CFC a um membro com cargo igual ou superior ao de Estagiário;" },
          { type: "inciso", label: "III -", text: "Caso seja para o Corpo Executivo, deve realizar sua Aula de Segurança em até 48 horas após a postagem de seu desligamento ou reforma;" },
          { type: "inciso", label: "IV -", text: "Retornar normalmente às suas atividades, podendo utilizar o brevê e aplicar aulas, após concluir a Aula de Segurança e ter sua TAG aprovada no RCCSystem." },
          { type: "paragrafo", label: "Parágrafo único -", text: "O membro que realizar a migração de corpo não estará isento do cumprimento de sua meta, salvo nos casos em que solicite licença de serviço em conformidade com as diretrizes estabelecidas neste documento." },
        ],
      },
      {
        number: "Art. 6º -",
        text: "Para que um membro solicite seu desligamento honroso da companhia, deverá obter a permissão de um membro com cargo equivalente ou superior ao de estagiário.",
        subItems: [
          { type: "paragrafo", label: "§ 1º -", text: "Membros do Ministério só poderão postar o requerimento de desligamento honroso com permissão de um membro da Liderança." },
          { type: "paragrafo", label: "§ 2º -", text: "Membros que deixarem a companhia sem a permissão requerida serão desligados de forma desonrosa por abandono de dever/negligência e punidos com 100 medalhas efetivas negativas." },
        ],
      },
      {
        number: "Art. 7º -",
        text: "O período de adaptação de 14 dias é um direito dos novos membros da Companhia dos Instrutores, permitindo-lhes o desligamento durante este período sem qualquer punição, desde que obtenham a autorização de um membro do ministério ou liderança da companhia.",
        subItems: [
          { type: "paragrafo", label: "Parágrafo único -", text: "O membro que solicitar o desligamento após o término do período de adaptação, mas antes de completar 30 dias de serviço, será penalizado com a atribuição de 50 medalhas efetivas negativas por saída precoce." },
        ],
      },
      {
        number: "Art. 8° -",
        text: "O instrutor que exceder o período de cinco dias offline será expulso da companhia e será punido com 100 medalhas efetivas negativas e, caso ocupe o cargo de avaliador acima, será rebaixado e punido com 50 medalhas efetivas negativas.",
        subItems: [
          { type: "paragrafo", label: "Parágrafo único -", text: "Após o registro do primeiro rebaixamento, avaliadores acima serão rebaixados um cargo a cada 24 horas até que o tempo offline seja reiniciado." },
        ],
      },
    ],
  },
  {
    id: "comp-capitulo-8",
    romanNumber: "VIII",
    title: "DAS POLÍTICAS DE LICENÇA E RESERVA",
    articles: [
      {
        number: "Art. 1º -",
        text: "Todo membro tem direito a solicitar licença de serviço na Companhia dos Instrutores, desde que obtenha autorização de um membro com cargo de Estagiário ou superior.",
      },
      {
        number: "Art. 2º -",
        text: "A licença poderá ser usada sempre que o instrutor precisar afastar-se de suas funções e metas por um período mínimo de 07 dias e um período máximo de 30 dias.",
        subItems: [
          { type: "paragrafo", label: "§ 1º -", text: "Membros do ministério que queiram integrar em uma licença, precisa possuir a permissão da liderança da companhia." },
          { type: "paragrafo", label: "§ 2º -", text: "Constata-se irregularidade na licença do membro quando a somatória de dias em licença não compensados ultrapassar 30 dias, independentemente de serem sequenciais ou pertencentes à mesma licença. A compensação de cada dia em licença se dará mediante a permanência do membro em atividade por 01 dia." },
          { type: "paragrafo", label: "§ 3º -", text: "A partir do cargo de Avaliador, qualquer licença com duração de 20 dias ou mais resultará na liberação da vaga." },
        ],
      },
      {
        number: "Art. 3º -",
        text: "A reserva é destinada ao membro que necessitar afastar-se de suas funções e metas por um período mínimo de 30 dias e máximo de 90 dias, sendo obrigatória, para sua validação, a autorização de um ministro ou liderança.",
      },
      {
        number: "Art. 4º -",
        text: "O Instrutor que retornar de licença pode, opcionalmente, postar o retorno caso desejar retornar antes do final da licença. Caso a postagem não for realizada, o retorno de licença será contabilizado automaticamente na listagem.",
      },
    ],
  },
  {
    id: "comp-capitulo-9",
    romanNumber: "IX",
    title: "PROPRIEDADES",
    articles: [
      {
        number: "Art. 1° -",
        text: "Todas as estruturas físicas e intelectuais que compõem as atividades internas e externas, como quartos, grupos, subfórum e redes sociais são de propriedade da companhia dos Instrutores.",
      },
      {
        number: "Art. 2º -",
        text: "Os quartos oficiais que compõem a estrutura física da instituição são:",
        customCollapsible: {
          id: "quartos",
          title: "QUARTOS OFICIAIS",
        },
      },
      {
        number: "Art. 3º -",
        text: "Os grupos oficiais que compõem a estrutura intelectual da companhia são:",
        customCollapsible: {
          id: "grupos",
          title: "GRUPOS OFICIAIS",
        },
      },
      {
        number: "Art. 4° -",
        text: "Os grupos oficiais são rigorosamente restritos aos membros da companhia, sendo assim, é expressamente proibido aceitar a solicitação de usuários que não façam parte dos Instrutores, com exceção de membros do Setor de Inteligência e da Corregedoria, ou pessoa autorizada previamente pela liderança.",
      },
      {
        number: "Art. 5º -",
        text: "Os canais externos que compõem a estrutura intelectual da companhia são:",
        customCollapsible: {
          id: "canais",
          title: "CANAIS EXTERNOS",
        },
      },
      {
        number: "Art. 6° -",
        text: "As propriedades da companhia dos Instrutores possuem acesso restrito aos membros, alunos, Comando de Segurança Institucional, Corregedoria e usuários previamente autorizados pela liderança.",
        subItems: [
          { type: "paragrafo", label: "Parágrafo único -", text: "Os membros da Procuradoria Militar de Justiça e Auditoria Fiscal possuem acesso às propriedades da companhia, desde que estejam no cumprimento das funções de seu grupo." },
        ],
      },
      {
        number: "Art. 7° -",
        text: "É estritamente proibida a alteração da estrutura dos quartos internos sem autorização da Liderança.",
      },
      {
        number: "Art. 8º -",
        text: "O policial que conceder acesso ou modificação a um quarto da companhia que seja julgado pela liderança como incorreto, estará sujeito a uma notificação até uma advertência interna.",
      },
      {
        number: "Art. 9º -",
        text: "É direito dos Ministros da companhia possuírem direitos nas dependências da companhia, a fim de auxiliar membros e de resolver possíveis eventualidades que possam surgir, mantendo, assim, a companhia em ordem.",
        subItems: [
          { type: "paragrafo", label: "Parágrafo único -", text: "A única exceção ao artigo acima é referente ao Corredor dos Instrutores, cujo emblema apenas os membros da Liderança e Setor de Inteligência possuem o devido acesso." },
        ],
      },
    ],
  },
  {
    id: "comp-capitulo-10",
    romanNumber: "X",
    title: "DAS REUNIÕES QUINZENAIS",
    articles: [
      {
        number: "Art. 1º -",
        text: "As reuniões do Ministério e da Companhia ocorrem quinzenalmente aos sábados, no mesmo dia, sendo a do Ministério às 15h30 e a da Companhia às 16h30.",
      },
      {
        number: "Art. 2º -",
        text: "As reuniões têm caráter deliberativo, tratando de assuntos estratégicos, administrativos e questões gerais da Companhia dos Instrutores.",
      },
    ],
  },
  {
    id: "comp-capitulo-11",
    romanNumber: "XI",
    title: "DOS SUBGRUPOS",
    articles: [
      {
        number: "Art. 1º -",
        text: "A Companhia dos Instrutores é composta por três subgrupos internos, sendo eles:",
        subItems: [
          { type: "inciso", label: "I -", text: "Setor de Segurança dos Instrutores;" },
          { type: "inciso", label: "II -", text: "Setor de Relações Comunicativas;" },
          { type: "inciso", label: "III -", text: "Departamento de Aplicação." },
        ],
      },
      {
        number: "Art. 2º -",
        text: "Caso um membro seja expulso de um subgrupo, este será enquadrado no crime de Abandono de dever/Negligência e receberá uma advertência interna na Companhia.",
      },
      {
        number: "Art. 3º -",
        text: "O cumprimento das metas em subgrupos resultará no recebimento de 30 medalhas temporárias para o Instrutor que integrar em dois ou mais subgrupos e 20 medalhas temporárias para o Instrutor que fizer parte de apenas um subgrupo.",
      },
      {
        number: "Art. 4º -",
        text: "A liderança de subgrupos é restrita a membros com cargo mínimo de Capacitador e patente/cargo igual ou superior a Aspirante a Oficial ou Analista.",
        subItems: [
          { type: "paragrafo", label: "§ 1º -", text: "Em casos de migração entre corporações da polícia RCC, o líder dispõe de até 30 dias para portar os requisitos previstos no caput." },
          { type: "paragrafo", label: "§ 2º -", text: "Exclui-se do disposto neste artigo o Setor de Segurança dos Instrutores (SSI), no qual a liderança deve ser de Oficial do Corpo Militar ou a Especialização Intermediária do Corpo Executivo." },
        ],
      },
    ],
    sections: [
      {
        title: "SEÇÃO I — SETOR DE SEGURANÇA DOS INSTRUTORES",
        articles: [
          {
            number: "Art. 1º -",
            text: "O Setor de Segurança dos Instrutores (SSI) é responsável pela fiscalização e segurança da Companhia, tendo como objetivo principal a eliminação de ações ilícitas e irregularidades tanto em âmbito interno e/ou externo, além de garantir a qualidade dos serviços prestados e o cumprimento integral das normas estabelecidas nos documentos da Companhia.",
          },
          {
            number: "Art. 2º -",
            text: "Os membros do Setor de Segurança têm como função:",
            subItems: [
              { type: "inciso", label: "I -", text: "A realização de avaliações de instrução;" },
              { type: "inciso", label: "II -", text: "A fiscalização do backup de aulas;" },
              { type: "inciso", label: "III -", text: "Atuar na segurança interna da companhia." },
            ],
          },
          {
            number: "Art. 3º -",
            text: "A quantidade de vagas do grupo é limitada e segue abaixo em ordem hierárquica:",
            subItems: [
              { type: "inciso", label: "I -", text: "Presidente {P.SSI}" },
              { type: "inciso", label: "II -", text: "Vice-Presidente {VP.SSI}" },
              { type: "inciso", label: "III -", text: "Diretor {D.SSI}" },
              { type: "inciso", label: "IV -", text: "Fiscalizador {F.SSI}" },
            ],
          },
          {
            number: "Art. 4º -",
            text: "A entrada de novos membros para o grupo do Setor de Segurança é feita de forma burocrática entre os membros.",
            subItems: [
              { type: "paragrafo", label: "§ 1º -", text: "A votação dos novos candidatos nas reuniões e a convocação são feitos diretamente pela Presidência do grupo, ou com autorização destes." },
              { type: "paragrafo", label: "§ 2º -", text: "O militar deve apresentar ótimas porcentagens desde o ingresso na Companhia, não podendo ter nenhuma avaliação semanal negativa, tampouco ter cometido qualquer infração grave nos últimos 2 meses." },
            ],
          },
          {
            number: "Art. 5º -",
            text: "Para ocupar o posto de Presidente do Setor de Segurança dos Instrutores, o policial deverá ser Oficial do Corpo Militar ou do Corpo Executivo com Especialização Intermediária ou superior.",
          },
        ],
      },
      {
        title: "SEÇÃO II — SETOR DE RELAÇÕES COMUNICATIVAS",
        articles: [
          {
            number: "Art. 1º -",
            text: "Ao Setor de Relações Comunicativas (SRC), compete:",
            subItems: [
              { type: "inciso", label: "I -", text: "A realização de eventos internos ou gerais;" },
              { type: "inciso", label: "II -", text: "A execução de, ao menos, um treinamento por mês;" },
              { type: "inciso", label: "III -", text: "A manutenção do centro de eventos da companhia;" },
              { type: "inciso", label: "IV -", text: "A elaboração das ATA's de reuniões, as postagens no diário oficial e o envio de MP de projetos;" },
              { type: "inciso", label: "V -", text: "O desenvolvimento de conteúdos voltados para informação ou marketing da companhia." },
            ],
          },
          {
            number: "Art. 2º -",
            text: "Para ingressar no Setor de Relações Comunicativas, é necessário comunicar um membro da liderança ou secretaria.",
          },
          {
            number: "Art. 3º -",
            text: "A quantidade de vagas do grupo é limitada e segue abaixo em ordem hierárquica:",
            subItems: [
              { type: "inciso", label: "I -", text: "Líder {L.SRC}" },
              { type: "inciso", label: "II -", text: "Vice-Líder {VL.SRC}" },
              { type: "inciso", label: "III -", text: "Secretário {S.SRC}" },
              { type: "inciso", label: "IV -", text: "Membros {M.SRC}" },
            ],
          },
        ],
      },
      {
        title: "SEÇÃO III — DEPARTAMENTO DE APLICAÇÃO",
        articles: [
          {
            number: "Art. 1º -",
            text: "O Departamento de Aplicação (DA) dos Instrutores tem como finalidade a aplicação de testes seletivos para a entrada de novos membros na companhia, durante a semana.",
          },
          {
            number: "Art. 2º -",
            text: "A quantidade de vagas do grupo é limitada e segue abaixo em ordem hierárquica:",
            subItems: [
              { type: "inciso", label: "I -", text: "Líder {L.DA}" },
              { type: "inciso", label: "II -", text: "Vice-líder {VL.DA}" },
              { type: "inciso", label: "III -", text: "Aplicador {DA}" },
            ],
          },
          {
            number: "Art. 3º -",
            text: "O ingresso no departamento ocorre por meio de processo seletivo realizado via formulário e a sua avaliação é feita pela liderança do subgrupo.",
          },
          {
            number: "Art. 4º -",
            text: "A meta dos aplicadores é de, pelo menos, um teste admissional por semana.",
          },
          {
            number: "Art. 5º -",
            text: "As seguintes atribuições são de responsabilidade da liderança:",
            subItems: [
              { type: "inciso", label: "I -", text: "O auxílio aos membros do subgrupo de maneira geral, além de manter o subfórum e emblema atualizados;" },
              { type: "inciso", label: "II -", text: "A postagem da meta semanal na Consulta de Eficiência;" },
              { type: "inciso", label: "III -", text: "A atualização da listagem de autorizados;" },
              { type: "inciso", label: "IV -", text: "A postagem das medalhas do subgrupo mensalmente." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "comp-capitulo-12",
    romanNumber: "XII",
    title: "DAS DISPOSIÇÕES FINAIS",
    articles: [
      {
        number: "Art. 1º -",
        text: "Este documento está sujeito a alterações a qualquer momento, sem aviso prévio, pela liderança.",
      },
      {
        number: "Art. 2º -",
        text: "As solicitações de mudança devem ser feitas no tópico \"[INS] Ouvidoria\".",
      },
      {
        number: "Art. 3º -",
        text: "O Regimento Interno é uma compilação de diretrizes pré-definidas pela liderança, seu ministério e contribuições de uma parcela dos membros da companhia.",
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
    icon: ShieldCheck,
  },
  {
    id: "companhia" as DocumentType,
    title: "Regimento Interno da Companhia",
    subtitle: "Regulamento geral da Companhia dos Instrutores",
    badge: null,
    icon: Building2,
  },
  {
    id: "penal" as DocumentType,
    title: "Código Penal dos Instrutores",
    subtitle: "Tipificações, penalidades e dosimetria disciplinar",
    badge: null,
    icon: Scale,
  },
];

// Dados dos Quartos Oficiais (Capítulo IX, Art. 2º)
const QUARTOS_OFICIAIS = [
  "[º] [RCC] Corredor dos Instrutores [º]",
  "[º] [INS] Sala de CFC [01] [º]",
  "[º] [INS] Sala de CFC [02] [º]",
  "[º] [INS] Sala de CFC [03] [º]",
  "[º] [INS] Sala de CFC [04] [º]",
  "[º] [INS] Sala de CFSd [01] [º]",
  "[º] [INS] Sala de CFSd [02] [º]",
  "[º] [INS] Sala de CFSd [03] [º]",
  "[º] [INS] Sala de CFSd [04] [º]",
  "[º] [INS] Sala de CFSd [05] [º]",
  "[º] [INS] Sala de CFSd [06] [º]",
  "[º] [INS] Sala de Seleção [º]",
  "[º] [INS] Sala de Capacitação [01] [º]",
  "[º] [INS] Sala de Capacitação [02] [º]",
  "[º] [INS] Sala de Avaliadores [º]",
  "[º] [INS] Sala de Reunião do Ministério [º]",
  "[º] [INS] Sala de Reuniões [º]",
  "[º] [INS] Centro de Eventos [º]",
  "[º] [INS] Sala de Inquirição [º]",
];

// Dados dos Grupos Oficiais (Capítulo IX, Art. 3º)
const GRUPOS_OFICIAIS = [
  "[RCC] Instrutores",
  "[INS] Sala de Reuniões",
  "[INS] Avaliadores",
  "[INS] Capacitadores",
  "[INS] Ministério",
  "[INS] Eventos",
  "[INS] S. R. Comunicativas",
  "[INS] Sala de Seleção",
  "[INS] Setor de Segurança",
  "[RCC] Sala de CFSd 01 [INS]",
  "[RCC] Sala de CFSd 02 [INS]",
  "[RCC] Sala de CFSd 03 [INS]",
  "[RCC] Sala de CFSd 04 [INS]",
  "[RCC] Sala de CFSd 05 [INS]",
  "[RCC] Sala de CFSd 06 [INS]",
];

// Dados dos Canais Externos (Capítulo IX, Art. 5º)
const CANAIS_EXTERNOS = [
  {
    nome: "Site dos Instrutores",
    url: "https://sites.google.com/view/instrutores-da-rcc/in%C3%ADcio?authuser=0",
    isLink: true,
  },
  {
    nome: "System INS",
    url: "https://docs.google.com/spreadsheets/d/1A7s9uh0ninn_kryX-MFFoperb33IB2l9r0lrxne6yHE/edit?usp=sharing",
    isLink: true,
  },
  {
    nome: "Discord dos Instrutores",
    url: null,
    isLink: false,
  },
  {
    nome: "Grupo de Avisos - WhatsApp",
    url: "http://chat.whatsapp.com/IUkkzTRW0yQJFktfNIFFRf",
    isLink: true,
  },
  {
    nome: "Grupo de Comunicação - WhatsApp",
    url: "https://chat.whatsapp.com/BvRxVx4uisWIBMQKburW3l",
    isLink: true,
  },
];

// Dados das Colorações de Brevês (Capítulo II, Art. 3º)
const BREVES_DATA = [
  {
    cargo: "INSTRUTOR E AVALIADOR",
    flash: "Oitava coluna da quarta linha",
    badgeColor: "bg-blue-500",
  },
  {
    cargo: "CAPACITADOR",
    flash: "Décima primeira coluna da quarta linha",
    badgeColor: "bg-cyan-500",
  },
  {
    cargo: "MINISTÉRIO",
    flash: "Décima coluna da quarta linha",
    badgeColor: "bg-indigo-500",
  },
  {
    cargo: "LIDERANÇA",
    flash: "Sétima coluna da quarta linha",
    badgeColor: "bg-violet-500",
  },
];

function DocumentacoesPage() {
  const [activeDoc, setActiveDoc] = useState<DocumentType>("ssi");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChapterId, setActiveChapterId] = useState<string>("ssi-capitulo-1");
  const [copiedArticle, setCopiedArticle] = useState<string | null>(null);

  // Estados dos blocos retráteis (inicialmente recolhidos conforme solicitado)
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({
    breves: false,
    quartos: false,
    grupos: false,
    canais: false,
  });

  const toggleBlock = (blockId: string) => {
    setOpenBlocks((prev) => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  const currentChapters = useMemo(() => {
    switch (activeDoc) {
      case "ssi":
        return REGIMENTO_SSI;
      case "companhia":
        return REGIMENTO_COMPANHIA;
      case "penal":
        return CODIGO_PENAL;
    }
  }, [activeDoc]);

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
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Documentações
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Biblioteca jurídica e regimental da Companhia e do Setor de Segurança dos Instrutores.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor dos 3 Documentos */}
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
                if (doc.id === "companhia") setActiveChapterId("comp-capitulo-1");
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

      {/* Visualização do Documento Ativo */}
      <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
        {/* Navegador Lateral Fixo de Capítulos (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-20 bg-card/80 border border-border rounded-xl p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ListTree className="h-4 w-4 text-primary" />
            <span>Capítulos do Documento</span>
          </div>

          <nav className="flex flex-col gap-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
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
              {activeDoc === "ssi" 
                ? "Setor de Segurança" 
                : activeDoc === "companhia" 
                ? "Regimento Interno" 
                : "Código Penal dos Instrutores"}
            </span>
            <span>Companhia dos Instrutores</span>
          </div>
        </aside>

        {/* Área Principal de Leitura */}
        <div className="flex-1 w-full flex flex-col gap-8 min-w-0">
          {/* Barra de Busca */}
          <div className="bg-card/60 border border-border rounded-xl p-3 shadow-sm">
            <div className="relative w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por artigo, crime, termo ou punição (ex: licença, advertência, script, brevê)..."
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
          </div>


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

                              {/* BLOCOS RETRÁTEIS ESPECIAIS (Quartos, Grupos, Canais e Brevês) */}
                              {article.customCollapsible && (
                                <div className="mt-2 flex flex-col gap-3">
                                  <button
                                    type="button"
                                    onClick={() => toggleBlock(article.customCollapsible!.id)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-secondary/40 hover:bg-secondary/70 transition-all text-left group/btn shadow-sm select-none"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      {article.customCollapsible.id === "breves" && (
                                        <Award className="h-4 w-4 text-primary" />
                                      )}
                                      {article.customCollapsible.id === "quartos" && (
                                        <Home className="h-4 w-4 text-primary" />
                                      )}
                                      {article.customCollapsible.id === "grupos" && (
                                        <Users className="h-4 w-4 text-primary" />
                                      )}
                                      {article.customCollapsible.id === "canais" && (
                                        <Globe className="h-4 w-4 text-primary" />
                                      )}
                                      <span className="text-xs font-bold uppercase tracking-wider text-foreground group-hover/btn:text-primary transition-colors">
                                        {article.customCollapsible.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>
                                        {openBlocks[article.customCollapsible.id] ? "Ocultar" : "Clique para abrir"}
                                      </span>
                                      <ChevronDown
                                        className={`h-4 w-4 transition-transform duration-200 text-muted-foreground ${
                                          openBlocks[article.customCollapsible.id] ? "rotate-180 text-primary" : ""
                                        }`}
                                      />
                                    </div>
                                  </button>

                                  {/* Conteúdo Expansível: Coloração dos Brevês */}
                                  {article.customCollapsible.id === "breves" && openBlocks.breves && (
                                    <div className="p-4 sm:p-5 rounded-xl border border-border/80 bg-background/60 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                      {BREVES_DATA.map((brev) => (
                                        <div
                                          key={brev.cargo}
                                          className="p-3.5 rounded-lg border border-border/60 bg-card/60 flex flex-col gap-2"
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-foreground tracking-wide uppercase">
                                              {brev.cargo}
                                            </span>
                                            <span className={`w-2.5 h-2.5 rounded-full ${brev.badgeColor}`} />
                                          </div>
                                          <div className="text-xs text-muted-foreground bg-secondary/40 px-2.5 py-1.5 rounded-md border border-border/40">
                                            <strong className="text-primary font-semibold">Flash:</strong>{" "}
                                            {brev.flash}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Conteúdo Expansível: Quartos Oficiais */}
                                  {article.customCollapsible.id === "quartos" && openBlocks.quartos && (
                                    <div className="p-4 sm:p-5 rounded-xl border border-border/80 bg-background/60 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                      {QUARTOS_OFICIAIS.map((quarto) => (
                                        <div
                                          key={quarto}
                                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-card/60 border border-border/50 text-xs text-foreground/90 hover:border-primary/40 transition-colors"
                                        >
                                          <span className="text-primary font-mono text-sm leading-none shrink-0">➥</span>
                                          <span className="truncate select-text">{quarto}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Conteúdo Expansível: Grupos Oficiais */}
                                  {article.customCollapsible.id === "grupos" && openBlocks.grupos && (
                                    <div className="p-4 sm:p-5 rounded-xl border border-border/80 bg-background/60 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                      {GRUPOS_OFICIAIS.map((grupo) => (
                                        <div
                                          key={grupo}
                                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-card/60 border border-border/50 text-xs text-foreground/90 hover:border-primary/40 transition-colors"
                                        >
                                          <span className="text-primary font-mono text-sm leading-none shrink-0">➥</span>
                                          <span className="truncate select-text">{grupo}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Conteúdo Expansível: Canais Externos */}
                                  {article.customCollapsible.id === "canais" && openBlocks.canais && (
                                    <div className="p-4 sm:p-5 rounded-xl border border-border/80 bg-background/60 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                      {CANAIS_EXTERNOS.map((canal) => (
                                        canal.isLink && canal.url ? (
                                          <a
                                            key={canal.nome}
                                            href={canal.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-card/60 border border-border/50 text-xs text-primary hover:bg-primary/10 hover:border-primary/50 transition-all group/link"
                                          >
                                            <div className="flex items-center gap-2 font-medium">
                                              <span>➥</span>
                                              <span className="text-foreground group-hover/link:text-primary transition-colors">
                                                {canal.nome}
                                              </span>
                                            </div>
                                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover/link:text-primary transition-colors" />
                                          </a>
                                        ) : (
                                          <div
                                            key={canal.nome}
                                            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-card/40 border border-border/40 text-xs text-muted-foreground"
                                          >
                                            <span className="text-primary">➥</span>
                                            <span>{canal.nome}</span>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Seções com Artigos (ex: Subgrupos e Crimes) */}
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
    </div>
  );
}
