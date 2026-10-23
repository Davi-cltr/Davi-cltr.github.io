// Projetos exibidos no portfólio, na ordem em que aparecem.
// Para adicionar um projeto, copie um dos objetos abaixo e ajuste os campos.
// Imagens ficam em public/images/projects/ em duas larguras (-1280 e -640, WebP).
//
// status: 'development' | 'mvp' | 'done' | 'experimental'
// Campos opcionais: demo, address, commercial, decisions, nextSteps, learnings.
//
// Cada decisão técnica pode mostrar um trecho real do código:
//   code.file      caminho do arquivo no repositório (vira link para o GitHub)
//   code.blocks    trechos contínuos do arquivo; "start" é o número real da 1ª linha
//   code.highlight números reais das linhas que acendem quando a decisão é escolhida

export const projects = [
  {
    id: 'studentos',
    name: 'StudentOS',
    status: 'development',
    repo: 'https://github.com/Davi-cltr/StudentOs',
    demo: null,
    address: 'localhost:5173',
    tagline: {
      pt: 'A vida escolar inteira em um só lugar.',
      en: 'All of school life in one place.',
    },
    summary: {
      pt: 'Aplicação web que organiza matérias, tarefas, provas, notas e anotações. Cada estudante tem sua conta e vê apenas os próprios dados.',
      en: 'A web app that organizes subjects, tasks, exams, grades and notes. Each student has their own account and only sees their own data.',
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
        id: 'auth',
        title: { pt: 'Autenticação feita do zero', en: 'Authentication built from scratch' },
        text: {
          pt: 'O login devolve um token aleatório e o banco guarda só o hash SHA-256 dele. Se o banco vazar, nenhum token utilizável vaza junto. Os tokens expiram em 30 dias e o logout revoga apenas o token atual.',
          en: 'Logging in returns a random token and the database stores only its SHA-256 hash. If the database leaks, no usable token leaks with it. Tokens expire after 30 days and logging out revokes only the current one.',
        },
        code: {
          file: 'back-end/app/models/auth_token.rb',
          language: 'ruby',
          highlight: [2, 11, 12, 20, 24],
          blocks: [
            {
              start: 1,
              lines: `class AuthToken < ApplicationRecord
  LIFETIME = 30.days

  belongs_to :user
`,
            },
            {
              start: 8,
              lines: `  # Cria um token novo para o usuário e devolve [registro, token].
  # O token em texto puro só existe neste momento: no banco fica apenas o hash.
  def self.issue_for(user)
    token = SecureRandom.urlsafe_base64(32)
    record = user.auth_tokens.create!(token_digest: digest(token), expires_at: LIFETIME.from_now)
    [ record, token ]
  end

  # Devolve o registro de um token válido (existente e não expirado), ou nil.
  def self.authenticate(token)
    return if token.blank?

    where("expires_at > ?", Time.current).find_by(token_digest: digest(token))
  end

  def self.digest(token)
    OpenSSL::Digest::SHA256.hexdigest(token)
  end
end`,
            },
          ],
        },
      },
      {
        id: 'isolation',
        title: { pt: 'Isolamento de dados testado', en: 'Tested data isolation' },
        text: {
          pt: 'Toda consulta parte do usuário logado. Registros de outras pessoas respondem 404, e não é possível criar ou mover itens para a matéria de outro usuário. Tudo isso é coberto por testes.',
          en: "Every query starts from the logged-in user. Other people's records answer 404, and items can't be created in or moved to someone else's subject. All of this is covered by tests.",
        },
        code: {
          file: 'back-end/app/controllers/application_controller.rb',
          language: 'ruby',
          highlight: [5, 6, 47],
          blocks: [
            {
              start: 1,
              lines: `class ApplicationController < ActionController::API
  # Tudo exige login, exceto o que declarar \`skip_before_action :authenticate!\`.
  before_action :authenticate!

  rescue_from ActiveRecord::RecordNotFound do
    render json: { errors: [ "Registro não encontrado" ] }, status: :not_found
  end
`,
            },
            {
              start: 40,
              lines: `    # Tarefas, provas e anotações pertencem a uma matéria. Troca o subject_id enviado
    # pela matéria do usuário logado; se a matéria não for dele (ou não existir), o
    # valor vira nil e a validação do modelo recusa ("Matéria precisa existir").
    def with_owned_subject(attrs)
      attrs = attrs.to_h
      return attrs unless attrs.key?("subject_id")

      attrs.except("subject_id").merge("subject" => current_user.subjects.find_by(id: attrs["subject_id"]))
    end`,
            },
          ],
        },
      },
      {
        id: 'ci',
        title: { pt: 'Qualidade em cada pull request', en: 'Quality checks on every pull request' },
        text: {
          pt: 'O GitHub Actions roda Brakeman, Rubocop, os testes do Rails e o lint, os testes e o build do front-end.',
          en: 'GitHub Actions runs Brakeman, Rubocop, the Rails tests, and the front-end lint, tests and build.',
        },
        code: {
          file: '.github/workflows/ci.yml',
          language: 'yaml',
          highlight: [29, 45, 63, 85, 88, 91],
          blocks: [
            { start: 12, lines: `jobs:\n  scan_ruby:` },
            { start: 29, lines: `        run: bundle exec brakeman --no-pager -x EOLRails` },
            { start: 31, lines: `  lint:` },
            { start: 45, lines: `        run: bin/rubocop -f github` },
            { start: 47, lines: `  test:` },
            { start: 63, lines: `        run: bin/rails db:test:prepare test` },
            { start: 65, lines: `  frontend:` },
            {
              start: 85,
              lines: `        run: npm run lint

      - name: Unit tests
        run: npm test

      - name: Build
        run: npm run build`,
            },
          ],
        },
      },
    ],
    nextSteps: {
      pt: ['Atualizar para o Rails 8', 'Limitar tentativas de login', 'Visualização da agenda em calendário'],
      en: ['Upgrade to Rails 8', 'Rate limiting on login attempts', 'Calendar grid view for the agenda'],
    },
    images: [
      {
        src: 'studentos-dashboard',
        width: 1100,
        height: 1000,
        label: { pt: 'Início', en: 'Home' },
        alt: {
          pt: 'Painel do StudentOS com os próximos prazos, a agenda de 14 dias e as médias por matéria',
          en: 'StudentOS dashboard with upcoming deadlines, a 14-day agenda and grade averages',
        },
      },
      {
        src: 'studentos-tasks',
        width: 1100,
        height: 861,
        label: { pt: 'Tarefas', en: 'Tasks' },
        alt: { pt: 'Tela de tarefas do StudentOS', en: 'StudentOS tasks screen' },
      },
      {
        src: 'studentos-exams',
        width: 1100,
        height: 800,
        label: { pt: 'Provas', en: 'Exams' },
        alt: { pt: 'Tela de provas do StudentOS', en: 'StudentOS exams screen' },
      },
      {
        src: 'studentos-mobile-dark',
        width: 390,
        height: 1249,
        label: { pt: 'Celular', en: 'Mobile' },
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
    address: 'conferent.netlify.app',
    tagline: {
      pt: 'Os erros de IBS e CBS, antes da apuração.',
      en: 'IBS and CBS errors, caught before the tax filing.',
    },
    summary: {
      pt: 'Copiloto fiscal para escritórios de contabilidade. O escritório envia os XMLs de NF-e de todos os clientes e recebe um relatório com os erros de IBS e CBS de cada um.',
      en: 'A tax copilot for accounting firms. The firm uploads the NF-e (Brazilian e-invoice) XML files of all its clients and gets a report of each client’s IBS and CBS errors.',
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
        id: 'xxe',
        title: { pt: 'Leitura segura de XML', en: 'Safe XML parsing' },
        text: {
          pt: 'O parser desliga a resolução de entidades e o acesso à rede, o que protege contra ataques XXE. Arquivos acima de 5 MB são recusados antes mesmo de serem lidos.',
          en: 'The parser turns off entity resolution and network access, which protects against XXE attacks. Files over 5 MB are rejected before they are even parsed.',
        },
        code: {
          file: 'src/conferente/parser.py',
          language: 'python',
          highlight: [30, 32, 148, 149],
          blocks: [
            {
              start: 29,
              lines: `_PARSER = etree.XMLParser(
    resolve_entities=False, no_network=True, remove_comments=True, huge_tree=False
)
LIMITE_BYTES = 5 * 1024 * 1024  # um XML de NF-e real fica bem abaixo disso`,
            },
            {
              start: 147,
              lines: `def ler_nota(conteudo: bytes, arquivo: str = "") -> NotaFiscal:
    if len(conteudo) > LIMITE_BYTES:
        raise ValueError("arquivo maior que 5 MB, não parece uma NF-e")
    try:
        raiz = etree.fromstring(conteudo, _PARSER)`,
            },
          ],
        },
      },
      {
        id: 'rules',
        title: { pt: 'Regras como dados, com fonte', en: 'Rules as data, with sources' },
        text: {
          pt: 'Datas, alíquotas e a tabela de classificação ficam em arquivos JSON, cada valor com sua fonte legal. Quando sai uma nova nota técnica, a atualização não exige mexer no motor de regras.',
          en: 'Dates, rates and the classification table live in JSON files, each value with its legal source. When a new technical note is published, updating it does not require touching the rules engine.',
        },
        code: {
          file: 'src/conferente/regras/parametros.json',
          language: 'json',
          highlight: [3, 18, 19, 20, 21],
          blocks: [
            {
              start: 1,
              lines: `{
  "_versao": "2026-10-17",
  "_aviso": "Parâmetros legais mudam por nota técnica e lei complementar. Cada valor traz a fonte. Revise antes de cada mês de apuração.",`,
            },
            {
              start: 16,
              lines: `  "aliquotas": {
    "2026": {
      "pCBS": 0.9,
      "pIBSUF": 0.1,
      "pIBSMun": 0.0,
      "fonte": "Ano-teste: CBS 0,9% e IBS 0,1% (art. 343 e seguintes da LC 214/2025). Sem recolhimento efetivo para quem cumpre as obrigações acessórias; valores compensáveis com PIS/Cofins."
    },`,
            },
          ],
        },
      },
      {
        id: 'memory',
        title: { pt: 'Nada gravado em disco', en: 'Nothing written to disk' },
        text: {
          pt: 'Na versão web, os XMLs enviados são lidos em memória e conferidos na hora. Os arquivos não ficam salvos no servidor, e envios acima de 200 MB são recusados.',
          en: 'In the web version, uploaded XML files are read in memory and checked on the spot. Files are not stored on the server, and uploads over 200 MB are rejected.',
        },
        code: {
          file: 'src/conferente/web/app.py',
          language: 'python',
          highlight: [407, 409, 410, 413],
          blocks: [
            {
              start: 405,
              lines: `    lidos, total = [], 0
    for f in arquivos:
        dados = await f.read()
        total += len(dados)
        if total > LIMITE_TOTAL:
            return erro("O envio passou de 200 MB. Divida em lotes menores.", 413)
        lidos.append((f.filename or "sem-nome.xml", dados))

    notas, erros = ler_lote(lidos)`,
            },
          ],
        },
      },
    ],
    images: [
      {
        src: 'conferente-site',
        width: 1280,
        height: 800,
        label: { pt: 'Vitrine', en: 'Site' },
        alt: {
          pt: 'Página inicial do Conferente, com um exemplo de relatório de erros de IBS e CBS',
          en: 'Conferente home page, showing a sample report of IBS and CBS errors',
        },
      },
      {
        src: 'conferente-relatorio',
        width: 1280,
        height: 800,
        label: { pt: 'Relatório', en: 'Report' },
        alt: {
          pt: 'Relatório de conferência gerado pelo Conferente com notas fictícias de exemplo',
          en: 'Validation report generated by Conferente using sample fictitious invoices',
        },
      },
    ],
  },
]
