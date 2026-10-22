// Experiência profissional, formação e cursos.
// status da formação: 'current' (em andamento) | 'planned' (previsto) | 'done' (concluído)

export const experience = [
  {
    company: 'EMotta Sistemas',
    roles: [
      {
        title: { pt: 'Desenvolvedor júnior', en: 'Junior developer' },
        period: { pt: '2026 – atual', en: '2026 – present' },
        activities: {
          pt: ['Implemento melhorias no sistema ApontaFácil', 'Investigo e corrijo bugs'],
          en: ['I build improvements to the ApontaFácil system', 'I investigate and fix bugs'],
        },
      },
      {
        title: { pt: 'Estagiário de desenvolvimento', en: 'Development intern' },
        period: { pt: '2025 – 2026', en: '2025 – 2026' },
        activities: { pt: [], en: [] },
      },
    ],
  },
]

export const education = [
  {
    institution: 'ETEC Polivalente de Americana',
    course: {
      pt: 'Ensino Médio integrado ao Técnico em Desenvolvimento de Sistemas (AMS)',
      en: 'High school integrated with the Systems Development technical program (AMS)',
    },
    detail: {
      pt: 'Cursando o 1º ano. Conclusão prevista para 2028.',
      en: 'Currently in year 1. Expected to finish in 2028.',
    },
    status: 'current',
  },
  {
    institution: 'Fatec',
    course: {
      pt: 'Tecnólogo em Desenvolvimento de Sistemas',
      en: 'Associate degree in Systems Development',
    },
    detail: {
      pt: 'Próxima etapa do programa AMS, com duração de dois anos.',
      en: 'Next stage of the AMS program, two years long.',
    },
    status: 'planned',
  },
  {
    institution: { pt: 'Pós-graduação', en: 'Postgraduate studies' },
    course: { pt: 'Etapa final do programa AMS', en: 'Final stage of the AMS program' },
    detail: { pt: 'Duração de um ano.', en: 'One year long.' },
    status: 'planned',
  },
]

// Adicione aqui apenas cursos e certificados concluídos.
// Exemplo: { name: 'Nome do curso', issuer: 'Instituição', year: '2026', url: 'https://...' }
export const certificates = []
