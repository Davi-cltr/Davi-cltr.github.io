// Trajetória: trabalho e estudo na mesma linha do tempo.
// Datas no formato 'AAAA-MM'. end: null = até hoje.
// planned: true = etapa futura (aparece tracejada).
// short: rótulo curto que cabe dentro da barra do gráfico.
// As datas futuras são previsões a partir do programa AMS (ETEC → Fatec → pós).

export const timelineRange = { start: '2025-01', end: '2032-01' }

export const tracks = [
  { id: 'work', title: { pt: 'Trabalho', en: 'Work' } },
  { id: 'study', title: { pt: 'Estudo', en: 'Education' } },
]

export const milestones = [
  {
    id: 'intern',
    short: { pt: 'Estágio', en: 'Internship' },
    track: 'work',
    start: '2025-02',
    end: '2026-02',
    org: 'EMotta Sistemas',
    title: { pt: 'Estagiário de desenvolvimento', en: 'Development intern' },
    period: { pt: '2025 – 2026', en: '2025 – 2026' },
    detail: { pt: 'Primeiro contato com desenvolvimento profissional.', en: 'First experience with professional development.' },
  },
  {
    id: 'junior',
    short: { pt: 'Júnior', en: 'Junior' },
    track: 'work',
    start: '2026-02',
    end: null,
    org: 'EMotta Sistemas',
    title: { pt: 'Desenvolvedor júnior', en: 'Junior developer' },
    period: { pt: '2026 – hoje', en: '2026 – present' },
    detail: {
      pt: 'Implemento melhorias no sistema ApontaFácil e investigo e corrijo bugs.',
      en: 'I build improvements to the ApontaFácil system and investigate and fix bugs.',
    },
  },
  {
    id: 'etec',
    short: { pt: 'ETEC', en: 'ETEC' },
    track: 'study',
    start: '2026-02',
    end: '2028-12',
    org: 'ETEC Polivalente de Americana',
    title: {
      pt: 'Ensino Médio integrado ao Técnico em Desenvolvimento de Sistemas (AMS)',
      en: 'High school integrated with the Systems Development technical program (AMS)',
    },
    period: { pt: '2026 – 2028', en: '2026 – 2028' },
    detail: { pt: 'Cursando o 1º ano.', en: 'Currently in year 1.' },
  },
  {
    id: 'fatec',
    short: { pt: 'Fatec', en: 'Fatec' },
    track: 'study',
    start: '2029-02',
    end: '2030-12',
    planned: true,
    org: 'Fatec',
    title: { pt: 'Tecnólogo em Desenvolvimento de Sistemas', en: 'Associate degree in Systems Development' },
    period: { pt: 'Previsto: 2029 – 2030', en: 'Planned: 2029 – 2030' },
    detail: { pt: 'Próxima etapa do programa AMS.', en: 'Next stage of the AMS program.' },
  },
  {
    id: 'pos',
    short: { pt: 'Pós', en: 'Postgrad' },
    track: 'study',
    start: '2031-02',
    end: '2031-12',
    planned: true,
    org: { pt: 'Pós-graduação', en: 'Postgraduate studies' },
    title: { pt: 'Etapa final do programa AMS', en: 'Final stage of the AMS program' },
    period: { pt: 'Previsto: 2031', en: 'Planned: 2031' },
    detail: { pt: 'Um ano de duração.', en: 'One year long.' },
  },
]

// Adicione aqui apenas cursos e certificados concluídos.
// Exemplo: { name: 'Nome do curso', issuer: 'Instituição', year: '2026', url: 'https://...' }
export const certificates = []
