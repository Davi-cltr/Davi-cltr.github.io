# Portfólio de Davi Motta

Site pessoal bilíngue (português e inglês) feito com React e Vite. Apresenta meus projetos como estudos de caso, com capturas de tela reais, trechos do código e as decisões técnicas por trás de cada um.

Endereço depois de publicado: **https://davi-cltr.github.io**

## Como rodar no seu computador

Você precisa do [Node.js 22](https://nodejs.org/) ou mais novo.

```bash
npm install      # instala as dependências (só na primeira vez)
npm run dev      # abre em http://localhost:5173 e atualiza ao salvar
npm run build    # gera a versão final na pasta dist/
npm run preview  # mostra a versão final em http://localhost:4173
```

## Onde fica cada coisa

```
src/
  data/
    profile.js     nome, apresentação, foto, currículo e contatos
    projects.js    projetos (estudos de caso)
    career.js      experiência, formação e certificados
    skills.js      habilidades e áreas de interesse
  i18n/
    strings.js     textos fixos da interface (menus, botões, títulos)
    LanguageProvider.jsx   troca de idioma
  components/      uma seção do site por arquivo
  styles/
    tokens.css     cores, fontes e espaçamentos (mude aqui para alterar o visual inteiro)
    base.css       estilos gerais e botões
    sections.css   estilos de cada seção
public/
  images/projects/ capturas de tela dos projetos
  cv/              coloque aqui o currículo em PDF
  og-image.png     imagem que aparece quando o link é compartilhado
```

Todo texto traduzido segue o formato `{ pt: '...', en: '...' }`. Ao mudar um, mude os dois.

## Tarefas comuns

### Adicionar a foto

1. Salve a foto em `public/images/`, de preferência em WebP, vertical (proporção 4:5, por exemplo 960 × 1200 px).
2. Em `src/data/profile.js`, troque `photo: null` por `photo: '/images/davi.webp'` (use o nome do seu arquivo).

Enquanto não houver foto, o site mostra um monograma "DM" no mesmo espaço.

### Adicionar o currículo

1. Coloque o PDF em `public/cv/`.
2. Em `src/data/profile.js`, troque `resume: null` por `resume: '/cv/nome-do-arquivo.pdf'`.

O botão "Baixar currículo" aparece sozinho na seção de contato.

### Adicionar ou atualizar um projeto

1. Em `src/data/projects.js`, copie um dos objetos e ajuste os campos. Os opcionais (`demo`, `code`, `decisions`, `nextSteps`, `learnings`, `commercial`) podem ser omitidos ou ficar `null`.
2. Use um destes status: `development` (em desenvolvimento), `mvp` (MVP em validação), `done` (concluído) ou `experimental`.
3. Para as imagens, salve cada captura em duas larguras, `nome-1280.webp` e `nome-640.webp`, em `public/images/projects/`, e informe largura e altura originais no campo `images`. Um jeito rápido de gerar as duas versões é o [Squoosh](https://squoosh.app/).

Use somente capturas reais do projeto.

### Adicionar um certificado

Em `src/data/career.js`, adicione ao array `certificates`:

```js
{ name: 'Nome do curso', issuer: 'Instituição', year: '2026', url: 'https://link-do-certificado' }
```

A seção "Cursos e certificados" só aparece quando houver pelo menos um item.

### Mudar cores ou fontes

Tudo fica em `src/styles/tokens.css`. As fontes vêm do pacote Fontsource (instaladas pelo `npm install`, sem depender do Google Fonts).

## Idiomas

- O site abre no idioma do navegador da pessoa (português para quem usa português, inglês para os demais).
- A escolha feita no seletor fica salva para as próximas visitas.
- Dá para mandar o link já no idioma certo: `https://davi-cltr.github.io/?lang=en`.

## Publicar no GitHub Pages

1. Crie um repositório público chamado **`Davi-cltr.github.io`** (exatamente assim, com o seu usuário). Com esse nome, o site fica em `https://davi-cltr.github.io`.
2. Envie o código:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do portfólio"
   git branch -M main
   git remote add origin https://github.com/Davi-cltr/Davi-cltr.github.io.git
   git push -u origin main
   ```
3. No repositório, vá em **Settings → Pages** e, em **Source**, escolha **GitHub Actions**.
4. Acompanhe a aba **Actions**. Quando o workflow "Deploy no GitHub Pages" terminar com sucesso, o site estará no ar.

Depois disso, cada `git push` na `main` publica uma versão nova automaticamente.

**Usando outro nome de repositório** (por exemplo `portfolio`): o workflow detecta isso e publica em `https://davi-cltr.github.io/portfolio/`. Nesse caso, atualize também os endereços em `index.html` (canonical, `og:url` e `og:image`).

### Por que GitHub Pages

O site é estático: não tem banco de dados nem servidor, e o contato é feito por e-mail. O GitHub Pages é gratuito, fica no mesmo lugar do código e publica sozinho a cada push. A Vercel também funcionaria (importe o repositório e ela detecta o Vite), mas só faria diferença se o site passasse a precisar de funções de servidor, como um formulário de contato próprio.

## Acessibilidade e desempenho

- Navegação completa por teclado, com link "Pular para o conteúdo" e foco visível.
- Animação do cursor desligada para quem ativa "reduzir movimento" no sistema.
- Imagens em WebP, em dois tamanhos, carregadas só quando aparecem na tela.
- Textos alternativos traduzidos nos dois idiomas.
