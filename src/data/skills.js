// Mapa de evidências: cada tecnologia aponta para onde foi usada de verdade.
//
// sources: lugares que comprovam o uso (ids de "evidenceSources" abaixo).
//          Lista vazia = estou estudando, ainda sem projeto publicado.
// level:   'work' (uso no trabalho) | 'project' (usei em projeto) | 'learning' (estudando)

export const evidenceSources = [
  { id: 'emotta', name: 'EMotta Sistemas', kind: { pt: 'Trabalho', en: 'Work' }, href: '#journey' },
  { id: 'studentos', name: 'StudentOS', kind: { pt: 'Projeto', en: 'Project' }, href: '#project-studentos' },
  { id: 'conferente', name: 'Conferente', kind: { pt: 'Projeto', en: 'Project' }, href: '#project-conferente' },
]

export const skillGroups = [
  {
    id: 'frontend',
    title: { pt: 'Front-end', en: 'Front end' },
    items: [
      { name: 'React', level: 'project', sources: ['studentos'] },
      { name: 'JavaScript', level: 'project', sources: ['studentos'] },
      { name: 'HTML', level: 'project', sources: ['studentos', 'conferente'] },
      { name: 'CSS', level: 'project', sources: ['studentos', 'conferente'] },
    ],
  },
  {
    id: 'backend',
    title: { pt: 'Back-end', en: 'Back end' },
    items: [
      { name: 'Ruby on Rails', level: 'project', sources: ['studentos'] },
      { name: 'Python', level: 'project', sources: ['conferente'], note: { pt: 'com FastAPI', en: 'with FastAPI' } },
    ],
  },
  {
    id: 'data',
    title: { pt: 'Banco de dados', en: 'Databases' },
    items: [
      { name: 'SQLite', level: 'project', sources: ['studentos', 'conferente'] },
      { name: 'SQL', level: 'learning', sources: [] },
    ],
  },
  {
    id: 'practices',
    title: { pt: 'Ferramentas e práticas', en: 'Tools and practices' },
    items: [
      { name: { pt: 'Git e GitHub', en: 'Git and GitHub' }, level: 'project', sources: ['studentos', 'conferente'], note: { pt: 'com GitHub Actions', en: 'with GitHub Actions' } },
      { name: { pt: 'Testes automatizados', en: 'Automated tests' }, level: 'project', sources: ['studentos', 'conferente'], note: { pt: 'Minitest e pytest', en: 'Minitest and pytest' } },
      { name: { pt: 'APIs REST', en: 'REST APIs' }, level: 'project', sources: ['studentos'] },
      { name: { pt: 'Depuração e correção de bugs', en: 'Debugging and bug fixing' }, level: 'work', sources: ['emotta'] },
      { name: { pt: 'Manutenção de sistemas', en: 'System maintenance' }, level: 'work', sources: ['emotta'], note: { pt: 'no ApontaFácil', en: 'on ApontaFácil' } },
    ],
  },
]

export const interests = {
  pt: ['Inteligência artificial', 'Automação', 'Sistemas completos, do banco à interface', 'Arquitetura de aplicações e boas práticas'],
  en: ['Artificial intelligence', 'Automation', 'Complete systems, from database to interface', 'Application architecture and good practices'],
}
