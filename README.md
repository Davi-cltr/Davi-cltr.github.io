# Portfólio de Davi Motta

Site pessoal bilíngue (português e inglês) feito com React e Vite. Apresenta meus projetos como estudos de caso, com capturas de tela reais, trechos do código e as decisões técnicas por trás de cada um.

## O conceito: a cidade de código sob luz de sódio (v2)

A paleta continua sendo uma cidade à noite sob luz de sódio, e a ideia continua sendo **a luz revela o código**. Na v2 essa cidade virou um lugar em 3D: um único canvas WebGL atrás da página, e a câmera viaja por ele conforme a rolagem.

- **Abertura:** contagem real do carregamento com um filamento de sódio que esquenta e vira o horizonte. Atrás do nome, linhas reais do StudentOS e do Conferente flutuam no escuro; a luz do cursor revela as que estão perto. A foto, recortada, é iluminada pela mesma luz (luz de recorte do lado do cursor, separação de cor quando o mouse corre). O peso de cada letra do nome responde à distância do cursor.
- **Viagem:** entre os capítulos a câmera atravessa o campo de código; as linhas se esticam em rastros de luz.
- **Sobre:** o retrato se monta a partir de milhares de partículas conforme a rolagem; o cursor empurra as partículas. A frase de destaque acende palavra por palavra.
- **Habilidades:** mapa de evidências em 3D. Cada tecnologia é um ponto ligado por fios aos lugares onde foi usada, com pulsos de luz viajando pelos fios. Dá para girar arrastando; escolher uma tecnologia acende os fios dela.
- **Projetos:** a moldura de navegador fica presa à tela enquanto a história passa ao lado, e cada bloco troca a captura. As capturas são desenhadas em WebGL: a troca vira uma dissolução que queima em sódio, e o cursor ondula a imagem. Nas decisões técnicas, as linhas do código real acendem em sequência.
- **Trajetória:** uma avenida à noite, presa à rolagem. Cada poste é um mês: os do passado acendem quando a câmera chega neles, a linha de hoje atravessa a rua, e depois dela a rua ainda não foi feita.
- **Contato:** a cidade inteira no horizonte, com janelas acesas; o título acende onde o cursor passa; copiar o e-mail solta faíscas.
- **Detalhes:** cursor próprio com palavras de contexto, botões magnéticos, textos que se embaralham, índice lateral dos capítulos, barra de progresso, relógio de Americana, grão de filme e som opcional (o zumbido da cidade e das lâmpadas, um sopro que acompanha a velocidade da rolagem).

Tecnologias: React 19, Vite, Three.js (shaders GLSL próprios, pós-processamento com bloom), GSAP + ScrollTrigger + SplitText, Lenis (rolagem suave) e Web Audio.

**Acessibilidade e desempenho:** tudo funciona por teclado e leitor de tela (as imagens e os textos reais continuam no HTML; o WebGL só desenha por cima). "Reduzir movimento" (do sistema ou no rodapé) desliga a rolagem suave, as cenas presas e as animações, e a trajetória vira uma lista. Sem WebGL, o site mostra as imagens normais. A qualidade 3D é escolhida pelo aparelho e pode ser trocada no rodapé (Alta ou Leve).

Publicado no Netlify (veja "Publicar no Netlify").

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
    profile.js     nome, apresentação, frase de destaque, ficha, foto, currículo e contatos
    projects.js    projetos (estudos de caso) e os trechos de código das decisões técnicas
    career.js      linha do tempo de trabalho e estudo, e certificados
    skills.js      mapa de evidências: tecnologias e onde cada uma foi usada
    heroCode.js    linhas reais de código usadas como textura da abertura
  i18n/
    strings.js     textos fixos da interface (menus, botões, títulos)
    LanguageProvider.jsx   troca de idioma
  components/      uma seção do site por arquivo (Hero, About, Skills, Projects, Journey, Contact)
  lib/motion.js    revelação ao rolar, seção ativa e preferências de movimento
  styles/
    tokens.css     cores, fontes, espaços e curvas de movimento (mude aqui para alterar o visual inteiro)
    base.css       estilos gerais, botões e revelação
    chrome.css     cabeçalho, menu, barra de progresso e rodapé
    hero.css, about.css, skills.css, projects.css, journey.css, contact.css
public/
  images/projects/ capturas de tela dos projetos
  cv/              coloque aqui o currículo em PDF
  og-image.jpg     imagem que aparece quando o link é compartilhado
```

Todo texto traduzido segue o formato `{ pt: '...', en: '...' }`. Ao mudar um, mude os dois.

## Tarefas comuns

### Trocar a foto

A foto fica em `public/images/davi-1090.webp` e `public/images/davi-545.webp`: recortada (fundo transparente), vertical, proporção 1:2. Para trocar, gere dois WebP com fundo transparente nesses tamanhos e substitua os arquivos. As partículas da seção Sobre são geradas a partir da versão menor.

### Adicionar o currículo

1. Coloque o PDF em `public/cv/`.
2. Em `src/data/profile.js`, troque `resume: null` por `resume: '/cv/nome-do-arquivo.pdf'`.

O botão "Baixar currículo" aparece sozinho na seção de contato.

### Adicionar ou atualizar um projeto

1. Em `src/data/projects.js`, copie um dos objetos e ajuste os campos. Os opcionais (`demo`, `decisions`, `nextSteps`, `learnings`, `commercial`) podem ser omitidos ou ficar `null`.
2. Use um destes status: `development` (em desenvolvimento), `mvp` (MVP em validação), `done` (concluído) ou `experimental`.
3. Para as imagens, salve cada captura em duas larguras, `nome-1280.webp` e `nome-640.webp`, em `public/images/projects/`, e informe largura e altura originais no campo `images`. Um jeito rápido de gerar as duas versões é o [Squoosh](https://squoosh.app/).

Use somente capturas reais do projeto. O campo `label` de cada imagem vira o nome da aba na moldura de navegador.

4. Para cada decisão técnica, o campo `code` mostra um trecho real do arquivo:
   - `file`: caminho no repositório (vira o link "Abrir arquivo no GitHub");
   - `blocks`: trechos contínuos do arquivo, cada um com `start`, o número real da primeira linha;
   - `highlight`: números reais das linhas que acendem quando a decisão é escolhida.

### Atualizar o mapa de habilidades

Em `src/data/skills.js`, cada tecnologia tem `sources`, a lista de onde ela foi usada (`emotta`, `studentos`, `conferente`). Os fios do mapa são desenhados a partir dessa lista. Para um projeto novo aparecer como fonte, adicione-o em `evidenceSources`.

### Atualizar a linha do tempo

Em `src/data/career.js`, cada etapa tem `start` e `end` no formato `AAAA-MM` (`end: null` significa "até hoje") e `short`, o rótulo curto que aparece dentro da barra. Etapas futuras levam `planned: true` e aparecem tracejadas. A marca "Hoje" é calculada sozinha pela data atual.

### Adicionar um certificado

Em `src/data/career.js`, adicione ao array `certificates`:

```js
{ name: 'Nome do curso', issuer: 'Instituição', year: '2026', url: 'https://link-do-certificado' }
```

A seção "Cursos e certificados" só aparece quando houver pelo menos um item.

### Mudar cores ou fontes

Tudo fica em `src/styles/tokens.css`. As fontes vêm do pacote Fontsource (instaladas pelo `npm install`, sem depender do Google Fonts).

A textura da abertura (`src/data/heroCode.js`) é uma lista de linhas reais dos projetos. Se quiser trocar, cole outras linhas do seu código ali.

## Idiomas

- O site abre no idioma do navegador da pessoa (português para quem usa português, inglês para os demais).
- A escolha feita no seletor fica salva para as próximas visitas.
- Dá para mandar o link já no idioma certo, acrescentando `?lang=en` ao endereço.

## Publicar no Netlify

O código fica no GitHub e o site é publicado pelo Netlify. A configuração já está em `netlify.toml`: comando `npm run build`, pasta `dist` e Node 22.

**Primeira vez:**

1. Entre em [app.netlify.com](https://app.netlify.com) com a sua conta do GitHub.
2. Clique em **Add new site → Import an existing project → GitHub** e escolha o repositório **Davi-cltr.github.io**.
3. O Netlify lê o `netlify.toml` sozinho. Confira se aparece **Build command: npm run build** e **Publish directory: dist**, e clique em **Deploy**.
4. Para escolher o endereço, vá em **Site configuration → Change site name** (por exemplo, `davimotta` vira `https://davimotta.netlify.app`).

Depois disso, cada `git push` na branch `main` publica uma versão nova automaticamente.

O endereço do site entra sozinho nas metatags (link canônico e imagem de compartilhamento), pela variável `URL` que o Netlify fornece durante o build. Se você ligar um domínio próprio, ele passa a ser usado automaticamente.

## Acessibilidade e desempenho

- Navegação completa por teclado, com link "Pular para o conteúdo" e foco visível. Abas da galeria e das decisões técnicas funcionam com as setas.
- Com "reduzir movimento" ativado no sistema: sem animações, a luz da abertura fica parada e todo o conteúdo já aparece visível.
- Auditado com axe-core (WCAG 2.1 AA) em computador e celular, nos dois idiomas, sem violações.
- Alvos de toque com pelo menos 40px no celular.
- A abertura animada roda uma vez por sessão; ao voltar para a página, ela já aparece pronta.
- Imagens em WebP, em dois tamanhos, carregadas só quando aparecem na tela.
- Textos alternativos traduzidos nos dois idiomas.
