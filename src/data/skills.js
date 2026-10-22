// Habilidades por categoria. Em vez de porcentagens, cada item diz onde
// a tecnologia foi usada de fato (evidence), para quem lê poder conferir.
//
// level: 'work'     → uso no trabalho
//        'project'  → usei em projeto publicado
//        'learning' → estou estudando

export const skillGroups = [
  {
    id: 'frontend',
    title: { pt: 'Front-end', en: 'Front end' },
    items: [
      { name: 'React', level: 'project', evidence: { pt: 'StudentOS', en: 'StudentOS' } },
      { name: 'JavaScript', level: 'project', evidence: { pt: 'StudentOS', en: 'StudentOS' } },
      { name: 'HTML', level: 'project', evidence: { pt: 'StudentOS e Conferente', en: 'StudentOS and Conferente' } },
      { name: 'CSS', level: 'project', evidence: { pt: 'StudentOS e Conferente', en: 'StudentOS and Conferente' } },
    ],
  },
  {
    id: 'backend',
    title: { pt: 'Back-end', en: 'Back end' },
    items: [
      { name: 'Ruby on Rails', level: 'project', evidence: { pt: 'API do StudentOS', en: 'StudentOS API' } },
      { name: 'Python', level: 'project', evidence: { pt: 'Conferente, com FastAPI', en: 'Conferente, with FastAPI' } },
    ],
  },
  {
    id: 'data',
    title: { pt: 'Banco de dados', en: 'Databases' },
    items: [
      { name: 'SQLite', level: 'project', evidence: { pt: 'StudentOS e Conferente', en: 'StudentOS and Conferente' } },
      { name: 'SQL', level: 'learning', evidence: { pt: 'Em estudo', en: 'Studying' } },
    ],
  },
  {
    id: 'practices',
    title: { pt: 'Ferramentas e práticas', en: 'Tools and practices' },
    items: [
      { name: { pt: 'Git e GitHub', en: 'Git and GitHub' }, level: 'project', evidence: { pt: 'Todos os projetos, com GitHub Actions', en: 'All projects, with GitHub Actions' } },
      { name: { pt: 'Testes automatizados', en: 'Automated tests' }, level: 'project', evidence: { pt: 'Minitest no StudentOS, pytest no Conferente', en: 'Minitest in StudentOS, pytest in Conferente' } },
      { name: { pt: 'APIs REST', en: 'REST APIs' }, level: 'project', evidence: { pt: 'Integração entre front-end e back-end no StudentOS', en: 'Front-end and back-end integration in StudentOS' } },
      { name: { pt: 'Depuração e correção de bugs', en: 'Debugging and bug fixing' }, level: 'work', evidence: { pt: 'Dia a dia na EMotta Sistemas', en: 'Day to day at EMotta Sistemas' } },
      { name: { pt: 'Manutenção de sistemas', en: 'System maintenance' }, level: 'work', evidence: { pt: 'Melhorias no ApontaFácil', en: 'Improvements to ApontaFácil' } },
    ],
  },
]

export const interests = {
  pt: ['Inteligência artificial', 'Automação', 'Sistemas completos, do banco à interface', 'Arquitetura de aplicações e boas práticas'],
  en: ['Artificial intelligence', 'Automation', 'Complete systems, from database to interface', 'Application architecture and good practices'],
}
