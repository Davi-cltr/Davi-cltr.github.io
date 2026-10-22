// Projetos exibidos no portfólio, na ordem em que aparecem.
// Para adicionar um projeto, copie um dos objetos abaixo e ajuste os campos.
// Imagens ficam em public/images/projects/ em duas larguras (-1280 e -640, WebP).
//
// status: 'development' | 'mvp' | 'done' | 'experimental'
// Campos opcionais: demo, code, decisions, nextSteps, learnings.

export const projects = [
  {
    id: 'studentos',
    name: 'StudentOS',
    status: 'development',
    repo: 'https://github.com/Davi-cltr/StudentOs',
    demo: null,
    summary: {
      pt: 'Aplicação web que organiza a vida escolar em um só lugar: matérias, tarefas, provas, notas e anotações. Cada estudante tem sua conta e vê apenas os próprios dados.',
      en: 'A web app that keeps school life in one place: subjects, tasks, exams, grades and notes. Each student has their own account and only sees their own data.',
    },
    problem: {
      pt: 'Prazos, provas e anotações costumam ficar espalhados entre cadernos, aplicativos e mensagens. O estudante perde a visão do que vence na semana e de como está em cada matéria.',
      en: "Deadlines, exams and notes tend to be scattered across notebooks, apps and messages. Students lose track of what's due this week and how they're doing in each subject.",
    },
    role: {
      pt: 'Projeto pessoal, desenvolvido por mim do início ao fim: API em Rails, modelos e controladores, interface em React e a integração entre as duas partes.',
      en: 'Personal project, built by me end to end: the Rails API, models and controllers, the React interface, and the integration between them.',
    },
    stack: ['React 19', 'Vite', 'Ruby on Rails 7.2', 'SQLite', 'bcrypt', 'Minitest', 'GitHub Actions'],
    features: {
      pt: [
        'Cadastro, login e logout, com dados totalmente separados por usuário',
        'Painel com tarefas atrasadas, o que vence na semana, a próxima prova, agenda de 14 dias e média por matéria',
        'Tarefas a fazer e concluídas, com destaque para atrasos e conclusão em um clique',
        'Provas futuras e passadas, com notas',
        'Anotações agrupadas por matéria e filtros por matéria',
        'Tema claro e escuro, layout responsivo e navegação por teclado',
      ],
      en: [
        'Sign up, log in and log out, with data fully separated per user',
        'Dashboard with overdue tasks, what is due this week, the next exam, a 14-day agenda and grade average per subject',
        'To-do and done task lists, with overdue highlighting and one-click completion',
        'Upcoming and past exams with grades',
        'Notes grouped by subject, plus subject filters',
        'Light and dark themes, responsive layout and keyboard navigation',
      ],
    },
    decisions: [
      {
        title: { pt: 'Autenticação feita do zero', en: 'Authentication built from scratch' },
        text: {
          pt: 'O login devolve um token aleatório e o banco guarda só o hash SHA-256 dele. Se o banco vazar, nenhum token utilizável vaza junto. Os tokens expiram em 30 dias e o logout revoga apenas o token atual.',
          en: 'Logging in returns a random token and the database stores only its SHA-256 hash. If the database leaks, no usable token leaks with it. Tokens expire after 30 days and logging out revokes only the current one.',
        },
      },
      {
        title: { pt: 'Isolamento de dados testado', en: 'Tested data isolation' },
        text: {
          pt: 'Toda consulta parte do usuário logado. Registros de outras pessoas respondem 404, e não é possível criar ou mover itens para a matéria de outro usuário. Tudo isso é coberto por testes.',
          en: "Every query starts from the logged-in user. Other people's records answer 404, and items can't be created in or moved to someone else's subject. All of this is covered by tests.",
        },
      },
      {
        title: { pt: 'Qualidade em cada pull request', en: 'Quality checks on every pull request' },
        text: {
          pt: 'O GitHub Actions roda Rubocop, Brakeman, os testes do Rails e o lint, os testes e o build do front-end.',
          en: 'GitHub Actions runs Rubocop, Brakeman, the Rails tests, and the front-end lint, tests and build.',
        },
      },
    ],
    code: {
      file: 'back-end/app/models/auth_token.rb',
      language: 'ruby',
      source: `def self.issue_for(user)
  token = SecureRandom.urlsafe_base64(32)
  record = user.auth_tokens.create!(
    token_digest: digest(token),
    expires_at: LIFETIME.from_now
  )
  [ record, token ]
end`,
    },
    nextSteps: {
      pt: ['Atualizar para o Rails 8', 'Limitar tentativas de login', 'Visualização da agenda em calendário'],
      en: ['Upgrade to Rails 8', 'Rate limiting on login attempts', 'Calendar grid view for the agenda'],
    },
    images: [
      {
        src: 'studentos-dashboard',
        width: 1100,
        height: 1000,
        alt: {
          pt: 'Painel do StudentOS com os próximos prazos, a agenda de 14 dias e as médias por matéria',
          en: 'StudentOS dashboard with upcoming deadlines, a 14-day agenda and grade averages',
        },
      },
      {
        src: 'studentos-tasks',
        width: 1100,
        height: 861,
        alt: { pt: 'Tela de tarefas do StudentOS', en: 'StudentOS tasks screen' },
      },
      {
        src: 'studentos-exams',
        width: 1100,
        height: 800,
        alt: { pt: 'Tela de provas do StudentOS', en: 'StudentOS exams screen' },
      },
      {
        src: 'studentos-mobile-dark',
        width: 390,
        height: 1249,
        alt: { pt: 'StudentOS no celular, com tema escuro', en: 'StudentOS on a phone, dark theme' },
      },
    ],
  },

  {
    id: 'conferente',
    name: 'Conferente',
    status: 'mvp',
    repo: 'https://github.com/Davi-cltr/conferente',
    demo: 'https://conferent.netlify.app/',
    summary: {
      pt: 'Copiloto fiscal para escritórios de contabilidade. O escritório envia os XMLs de NF-e de todos os clientes e recebe um relatório com os erros de IBS e CBS de cada um, antes da apuração.',
      en: 'A tax copilot for accounting firms. The firm uploads the NF-e (Brazilian e-invoice) XML files of all its clients and gets a report of each client’s IBS and CBS errors before the tax filing.',
    },
    problem: {
      pt: 'Com a reforma tributária, toda empresa que emite nota precisa informar IBS e CBS item a item: no Regime Normal desde 03/08/2026 e no Simples Nacional e MEI a partir de janeiro de 2027. O contador atende dezenas de clientes, cada um com um emissor diferente, e não consegue conferir nota por nota.',
      en: "Brazil's tax reform requires every company that issues invoices to report the new IBS and CBS taxes item by item: since 08/03/2026 for the standard regime, and from January 2027 for small businesses. An accountant serves dozens of clients, each using a different invoicing system, and can't check invoice by invoice.",
    },
    role: {
      pt: 'Projeto próprio, desenvolvido por mim: leitura dos XMLs, motor de regras, relatório, versão web, contas e pagamentos, e a vitrine de apresentação.',
      en: 'My own product, built by me: XML parsing, the rules engine, the report, the web version, accounts and payments, and the marketing site.',
    },
    commercial: {
      pt: 'É um produto com planos pagos e 14 dias grátis, hoje em versão 0.1 (MVP), preparada para um piloto com escritórios de contabilidade.',
      en: "It's a paid product with a 14-day free trial, currently at version 0.1 (MVP), prepared for a pilot with accounting firms.",
    },
    stack: ['Python 3.11', 'FastAPI', 'lxml', 'Jinja2', 'SQLite', 'pytest', 'Docker', 'GitHub Actions', 'Netlify'],
    features: {
      pt: [
        'Leitura de NF-e e NFC-e em XML ou ZIP, independente do ERP ou emissor',
        'Regras de conferência (CF001 a CF070) com a fonte legal de cada uma',
        'Relatório HTML por cliente, com erros e avisos explicados',
        'Simulação de 2027: PIS/Cofins atual comparado a CBS e IBS nas mesmas vendas',
        'Site com planos, cadastro do escritório, login e área da conta',
        'Pagamento por Pix com confirmação manual ou por Mercado Pago',
        'Uso pela linha de comando, pelo navegador ou com Docker',
      ],
      en: [
        'Reads NF-e and NFC-e invoices as XML or ZIP, regardless of ERP or invoicing system',
        'Validation rules (CF001 to CF070), each with its legal source',
        'HTML report per client, with errors and warnings explained',
        '2027 simulation: current PIS/Cofins compared with CBS and IBS on the same sales',
        'Site with plans, firm sign-up, login and account area',
        'Payment by Pix with manual confirmation, or through Mercado Pago',
        'Runs from the command line, in the browser, or with Docker',
      ],
    },
    decisions: [
      {
        title: { pt: 'Leitura segura de XML', en: 'Safe XML parsing' },
        text: {
          pt: 'O parser desliga a resolução de entidades e o acesso à rede, o que protege contra ataques XXE. Arquivos acima de 5 MB são recusados.',
          en: 'The parser turns off entity resolution and network access, which protects against XXE attacks. Files over 5 MB are rejected.',
        },
      },
      {
        title: { pt: 'Regras como dados, com fonte', en: 'Rules as data, with sources' },
        text: {
          pt: 'Datas, alíquotas e a tabela de classificação ficam em arquivos JSON, cada valor com sua fonte. Quando sai uma nova nota técnica, a atualização não exige mexer no motor de regras.',
          en: 'Dates, rates and the classification table live in JSON files, each value with its source. When a new technical note is published, updating it does not require touching the rules engine.',
        },
      },
      {
        title: { pt: 'Nada gravado em disco', en: 'Nothing written to disk' },
        text: {
          pt: 'Na versão web, os XMLs enviados são processados em memória e não ficam salvos no servidor.',
          en: 'In the web version, uploaded XML files are processed in memory and are not stored on the server.',
        },
      },
    ],
    code: {
      file: 'src/conferente/parser.py',
      language: 'python',
      source: `_PARSER = etree.XMLParser(
    resolve_entities=False,
    no_network=True,
    remove_comments=True,
    huge_tree=False,
)
LIMITE_BYTES = 5 * 1024 * 1024`,
    },
    images: [
      {
        src: 'conferente-site',
        width: 1280,
        height: 800,
        alt: {
          pt: 'Página inicial do Conferente, com um exemplo de relatório de erros de IBS e CBS',
          en: 'Conferente home page, showing a sample report of IBS and CBS errors',
        },
      },
      {
        src: 'conferente-relatorio',
        width: 1280,
        height: 800,
        alt: {
          pt: 'Relatório de conferência gerado pelo Conferente com notas fictícias de exemplo',
          en: 'Validation report generated by Conferente using sample fictitious invoices',
        },
      },
    ],
  },
]
