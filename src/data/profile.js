// Informações pessoais e de contato.
// Campos com { pt, en } são traduzidos; os demais valem para os dois idiomas.

export const profile = {
  name: 'Davi Motta',
  fullName: 'Davi Motta Peluci',

  role: {
    pt: 'Desenvolvedor full stack em início de carreira',
    en: 'Early-career full stack developer',
  },

  tagline: {
    pt: 'Transformando ideias em soluções através do código.',
    en: 'Turning ideas into solutions through code.',
  },

  intro: {
    pt: 'Desenvolvedor júnior na EMotta Sistemas e estudante do técnico em Desenvolvimento de Sistemas na ETEC Polivalente de Americana.',
    en: 'Junior developer at EMotta Sistemas and student of the Systems Development technical program at ETEC Polivalente de Americana.',
  },

  // Foto: coloque o arquivo em public/images/ e troque null pelo caminho,
  // por exemplo: photo: '/images/davi.webp'. Proporção ideal 4:5 (retrato).
  photo: null,

  // Currículo: coloque o PDF em public/cv/ e troque null pelo caminho,
  // por exemplo: resume: '/cv/davi-motta-curriculo.pdf'.
  resume: null,

  location: { pt: 'Brasil', en: 'Brazil' },

  contact: {
    email: 'mottapelucidavi@gmail.com',
    github: 'https://github.com/Davi-cltr',
    linkedin: 'https://www.linkedin.com/in/davi-motta-peluci-b40b863b6',
  },

  about: {
    pt: [
      'Sou desenvolvedor de software e estudo o técnico em Desenvolvimento de Sistemas na ETEC Polivalente de Americana, na modalidade AMS. Hoje trabalho como desenvolvedor júnior na EMotta Sistemas, onde implemento melhorias no sistema ApontaFácil e corrijo bugs.',
      'Gosto de construir aplicações completas: interfaces fáceis de usar, regras de negócio no back-end e a integração entre as duas partes. Nos meus projetos pessoais trabalho com React, JavaScript, Python, Ruby on Rails, HTML e CSS, e sigo estudando bancos de dados, integração com APIs e inteligência artificial.',
      'O que me move é a curiosidade técnica e a iniciativa de tirar ideias do papel. Aprendo melhor fazendo, e cada projeto é uma chance de entender um problema real a fundo.',
    ],
    en: [
      "I'm a software developer studying Systems Development at ETEC Polivalente de Americana, in the AMS program. I currently work as a junior developer at EMotta Sistemas, where I build improvements to the ApontaFácil system and fix bugs.",
      'I enjoy building complete applications: interfaces that are easy to use, business rules on the back end, and the integration between the two. In my personal projects I work with React, JavaScript, Python, Ruby on Rails, HTML and CSS, and I keep studying databases, API integration and artificial intelligence.',
      "What drives me is technical curiosity and the initiative to turn ideas into working software. I learn best by building, and every project is a chance to understand a real problem in depth.",
    ],
  },

  // Frase de destaque da seção Sobre (tirada do próprio texto acima).
  statement: {
    pt: 'Aprendo melhor fazendo. Cada projeto é uma chance de entender um problema real a fundo.',
    en: 'I learn best by building. Every project is a chance to understand a real problem in depth.',
  },

  // Ficha rápida ao lado do texto da seção Sobre.
  facts: [
    { label: { pt: 'Hoje', en: 'Now' }, value: { pt: 'Desenvolvedor júnior na EMotta Sistemas', en: 'Junior developer at EMotta Sistemas' } },
    { label: { pt: 'Estudo', en: 'Studying' }, value: { pt: 'Técnico em Desenvolvimento de Sistemas, ETEC', en: 'Systems Development technical program, ETEC' } },
    { label: { pt: 'Construo com', en: 'Building with' }, value: { pt: 'React, Ruby on Rails e Python', en: 'React, Ruby on Rails and Python' } },
    { label: { pt: 'Base', en: 'Based in' }, value: { pt: 'Brasil', en: 'Brazil' } },
  ],

  goals: {
    pt: 'Quero continuar evoluindo como desenvolvedor, trabalhar em equipe e participar da criação de produtos digitais úteis, eficientes e bem estruturados.',
    en: 'I want to keep growing as a developer, work with teams, and help build digital products that are useful, efficient and well structured.',
  },
}
