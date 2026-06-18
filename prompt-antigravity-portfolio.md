# Prompt de Build — Portfólio Rafael Moraes

> Cole este documento completo no Antigravity como prompt de construção. Ele descreve objetivo, stack, sistema de design, bibliotecas de terceiros e arquitetura de componentes. Siga as decisões exatamente como especificado — foram definidas deliberadamente, não são sugestões abertas.

## 1. Contexto e Objetivo

Construir um portfólio pessoal para **Rafael Moraes**, desenvolvedor backend Java especializado em **Spring Boot, APIs REST e arquitetura em camadas**, com experiência crescente em Angular no frontend. O objetivo central do site é **demonstrar domínio técnico de forma visual e interativa**, com identidade voltada para o universo de software e tecnologia/IA. O visitante-alvo é recrutador técnico ou tech lead avaliando competência real — performance e qualidade de engenharia são parte da apresentação, não só a estética.

## 2. Stack Técnica Obrigatória do Projeto

- **Angular 21** — standalone components (sem NgModules), `signal()`/`computed()` para todo estado reativo, `inject()` para DI, control flow nativo (`@if`, `@for`, `@switch`) — nunca `*ngIf`/`*ngFor`. Habilitar **change detection zoneless** (`provideZonelessChangeDetection()`) para reduzir overhead de runtime.
- **Tailwind CSS 4.2** — via `@import "tailwindcss";` e bloco `@theme` no estilo global, mapeando os tokens de cor da seção 4 como custom properties. Não usar `tailwind.config.js` no formato antigo.
- **@ng-icons/core** + **@ng-icons/simple-icons** (logos de tecnologia) + **@ng-icons/lucide** (ícones de interface: toggle, chevrons, terminal, rede) — ver seção 7 para detalhes de uso.
- **GSAP** (`gsap` + plugins `ScrollTrigger` e `Flip`) para as animações coreografadas de maior responsabilidade (boot sequence, transição de modo, scroll-reveal). Ver seção 7.
- **Three.js: não utilizar.** Decisão deliberada — ver justificativa na seção 7.
- Sem Angular Material e sem qualquer outra lib de componentes de UI — todos os componentes são construídos à mão.

## 3. Princípio de Arquitetura: Separação de Responsabilidades

Esta é uma exigência transversal a todo o projeto, não apenas uma seção isolada:

- **Componentes de apresentação** (`backend-terminal`, `frontend-visual-graph`, `project-card`) não acessam dados diretamente — recebem tudo via `input()` e comunicam via `output()`. Não devem injetar services de dados.
- **Componentes container** (`stack-explorer`, `projects-showcase`) orquestram estado e injetam services, passando dados para os filhos de apresentação.
- **Camada de dados** isolada em services (`SkillsService`, `ProjectsService`) que expõem os arrays curados como signals somente-leitura. Hoje os dados são estáticos; essa camada existe justamente para que, se um dia os dados vierem de uma API/CMS, só o service muda — nenhum componente é tocado.
- **Camada de animação** isolada — nunca chamar GSAP diretamente dentro de um componente de apresentação. Encapsular em uma `AnimationService` ou em diretivas reutilizáveis (`appRevealOnScroll`, `appPulseConnection`), com `effect()`/`afterNextRender()` controlando o ciclo de vida e `tween.kill()`/`ScrollTrigger.kill()` no `DestroyRef` para evitar memory leaks.
- **Ícones centralizados** — um único arquivo `icons.ts` declara todas as constantes de ícone usadas (`import { siJava, siSpringboot, ... }`) e o `provideIcons({...})` é registrado uma única vez em `app.config.ts`, nunca espalhado por múltiplos componentes.

## 4. Direção Visual — "Dois Modos de Pensar"

A seção de stack alterna entre dois modos, refletindo dois modos de raciocínio do desenvolvedor:

- **Modo Backend** — lógico, sequencial, textual → **terminal/CLI interativo**, somente texto monoespaçado, sem ícones (mantém autenticidade de linha de comando).
- **Modo Frontend** — visual, espacial, interativo → **grafo de dependências navegável**, com ícones de tecnologia (ng-icons) em cada nó.

O toggle entre modos re-tema visualmente a seção inteira (cor de acento, ritmo de animação, tratamento tipográfico) — é o momento de maior impacto visual do site. Sem referência a sistemas industriais, automação, PLCs ou hardware de controle em qualquer parte do site.

### Paleta de cores (tokens)

| Token | Hex | Uso |
|---|---|---|
| `--bg-base` | `#0B0D12` | Fundo principal |
| `--bg-surface` | `#131720` | Cards, painéis, terminal |
| `--border-line` | `#1F242E` | Divisores e bordas sutis |
| `--text-primary` | `#ECEFF3` | Texto principal |
| `--text-muted` | `#7A8290` | Texto secundário, estado inativo |
| `--accent-backend` | `#F5A623` | Âmbar — Modo Backend (terminais CLI clássicos) |
| `--accent-frontend` | `#8A63F4` | Violeta — Modo Frontend (ferramentas visuais/design modernas) |
| `--accent-active` | *(dinâmico)* | Aponta para um dos dois acentos conforme o modo; todo elemento interativo da stack referencia esta variável, nunca a cor fixa |

### Tipografia

- **Display/títulos:** Space Grotesk (600–700).
- **Corpo:** Inter (400/500).
- **Terminal/código/labels técnicas:** JetBrains Mono — exclusivo do Modo Backend e de labels técnicas pontuais.

Self-hostar as três fontes via `@font-face` (apenas os pesos usados, `font-display: swap`) em vez de carregar via tag `<link>` do Google Fonts — elimina uma requisição externa render-blocking e é mais alinhado ao "foco total em desempenho".

### Motion

A transição Backend↔Frontend é o único momento de animação elaborada do site (orquestrada via GSAP): o terminal recolhe enquanto o grafo desenha (ou vice-versa), com crossfade de cor entre âmbar e violeta (300–400ms). Dentro do grafo, ativar um nó produz um pulso de luz pelas conexões diretas. Fora desses dois momentos, transições são CSS simples e rápidas (150–200ms). Respeitar `prefers-reduced-motion` substituindo qualquer animação de percurso por troca instantânea de estado, e desabilitando o `ScrollTrigger` de scroll-reveal (conteúdo aparece direto, sem fade).

## 5. Estrutura do Site

### Seção 1 — Hero (Boot Sequence)

Sequência "boot" impressa linha a linha (efeito de digitação via GSAP, não `setInterval` manual — mais fácil de pausar/respeitar reduced-motion), atuando como h1 semântico:

```
INICIALIZANDO PERFIL...
NOME: RAFAEL MORAES
FUNÇÃO: DESENVOLVEDOR BACKEND — JAVA / SPRING BOOT
MÓDULOS: BACKEND ████████░░ FRONTEND ████░░░░░░
STATUS: ONLINE
> explore a stack abaixo
```

A barra de módulos antecipa visualmente a dualidade Backend/Frontend (âmbar e violeta).

### Seção 2 — Stack Interativa (Toggle Backend / Frontend)

Toggle no topo (ícone Lucide `toggle-left`/`toggle-right`), Backend selecionado por padrão.

**Modo Backend — Terminal/CLI** (texto puro, JetBrains Mono):
- `help` → lista comandos
- `whoami` → bio curta, conteúdo fixo (ver seção 12 — `PROFILE.bio`)
- `stack --list core|data|devops` → lista tecnologias backend por subcategoria
- `projects` → ancora até projetos
- `contact` → exibe contato inline

**Modo Frontend — Grafo de Dependências** (nós com ícone ng-icons):
Nó raiz "ANGULAR" conectando aos demais. Nó inativo em `--text-muted`; ao hover/foco/touch, o nó e conexões diretas energizam em `--accent-frontend`, painel lateral mostra nome, nível e projetos relacionados.

**Fallback mobile do grafo:** grid de cards por categoria com o mesmo dado — física de grafo de força não é viável em touch/telas pequenas.

**Acessibilidade:** todo nó e comando sugerido alcançável via Tab, ativável via Enter/Espaço.

### Seção 3 — Projetos

Grid de cards data-driven a partir de `Project[]`. Cada card exibe badges de stack com ícone ng-icons + label. Adicionar projeto = inserir objeto no array, zero alteração no componente visual.

### Seção 4 — Contato / Footer

GitHub, LinkedIn, e-mail (dados reais em `PROFILE`, seção 12). Sem telefone no site público (evita spam/scraping — manter apenas no CV em PDF para download, se houver). Sem qualquer menção a experiência industrial, laboratorial ou automação.

## 6. Stacks Técnicas a Representar

### Modo Backend

| Categoria | Tecnologia | Ícone (Simple Icons) |
|---|---|---|
| backend-core | Java 17 | `siJava` |
| backend-core | Spring Boot | `siSpringboot` |
| backend-core | Spring Security | *(sem logo dedicado — fallback `lucideShield`)* |
| backend-core | Spring Data JPA | *(sem logo dedicado — fallback `lucideDatabase`)* |
| backend-core | Spring Cloud | *(sem logo dedicado — fallback `siSpringboot` atenuado)* |
| backend-core | Hibernate | *(sem logo dedicado — fallback `lucideDatabase`)* |
| data | PostgreSQL | `siPostgresql` |
| data | MySQL | `siMysql` |
| data | MongoDB | `siMongodb` |
| data | RabbitMQ | `siRabbitmq` |
| data | Apache Kafka | `siApachekafka` |
| devops | AWS | `siAmazonaws` |
| devops | Docker | `siDocker` |
| devops | Git | `siGit` |
| devops | GitHub Actions | `siGithubactions` |
| devops | Maven | `siApachemaven` |
| devops | Swagger / OpenAPI | `siSwagger` |
| testes | JUnit 5 | `siJunit5` |
| testes | Mockito | *(sem logo dedicado — fallback `lucideTestTube`)* |

### Modo Frontend

| Tecnologia | Ícone (Simple Icons) |
|---|---|
| Angular 21 | `siAngular` |
| TypeScript | `siTypescript` |
| Tailwind CSS 4.2 | `siTailwindcss` |
| RxJS / Signals | *(sem logo dedicado — fallback `lucideWaves`)* |
| HTML5 | `siHtml5` |
| CSS3 | `siCss3` |
| GSAP | `siGreensock` |

**Regra geral:** quando a tecnologia não tiver logo correspondente no pacote Simple Icons, usar o ícone Lucide equivalente indicado acima — nenhum nó do grafo ou badge de projeto deve ficar sem ícone.

## 7. Bibliotecas de Terceiros — Detalhamento e Decisões

### ng-icons

Instalar `@ng-icons/core`, `@ng-icons/simple-icons`, `@ng-icons/lucide`. Registrar **somente os ícones usados** (lista da seção 6) via `provideIcons({ siJava, siSpringboot, ..., lucideShield, lucideToggleLeft })` em `app.config.ts` — nunca importar o pacote inteiro, isso quebraria o tree-shaking e infla o bundle. Uso no template: `<ng-icon name="siJava" size="20" />`.

### GSAP

Usar para: (1) efeito de digitação do boot sequence, (2) crossfade/morph da transição Backend↔Frontend, (3) pulso de energia nas conexões do grafo, (4) `ScrollTrigger` para reveal de entrada das seções de Projetos e Contato. Carregar GSAP e seus plugins via `@defer` junto com os componentes que os utilizam — a página inicial (antes de qualquer scroll/interação) não deve pagar o custo de bundle do GSAP. Toda instância de tween/ScrollTrigger deve ser registrada para `kill()` no `DestroyRef` do componente correspondente.

### Three.js — decisão: não utilizar

Three.js adicionaria uma engine WebGL completa (~150KB+ minificado, mais shaders e gerenciamento de cena) para um ganho visual incremental, em direto conflito com a exigência de "foco total em desempenho". A identidade de "Modo Frontend = visual/espacial" já é comunicada pelo grafo interativo e pelo acento violeta — não depende de 3D real. Se for desejado um toque adicional de profundidade, usar **CSS 3D transforms nativos** (`perspective`, `rotateX/Y` sutil acompanhando o cursor nos nós do grafo) — sensação de espacialidade sem o custo de uma engine 3D. Não importar Three.js neste projeto.

## 8. Modelos de Dados

```typescript
interface Skill {
  id: string;
  name: string;
  category: 'backend-core' | 'data' | 'devops' | 'tests' | 'frontend';
  proficiency: 'core' | 'proficient' | 'familiar';
  icon: string;              // nome registrado no ng-icons (ex: 'siJava', 'lucideShield')
  connectsTo: string[];      // ids de outras skills — arestas do grafo (Modo Frontend)
  usedInProjects: string[];  // ids de Project
}

interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];        // ids de Skill
  repoUrl: string;
  liveUrl?: string;
  highlight?: boolean;
}
```

## 9. Arquitetura de Componentes (Angular 21, standalone)

```
src/app/
├── models/
│   ├── skill.model.ts
│   └── project.model.ts
├── data/
│   ├── skills.backend.data.ts
│   ├── skills.frontend.data.ts
│   └── projects.data.ts
├── services/
│   ├── skills.service.ts        // expõe signals readonly a partir dos dados
│   ├── projects.service.ts
│   └── animation.service.ts     // wrapper de GSAP, único ponto de import da lib
├── shared/
│   └── icons.ts                 // import + provideIcons centralizado
├── components/
│   ├── hero-terminal/
│   ├── stack-explorer/                  // container — possui activeMode signal
│   │   ├── stack-mode-toggle/           // presentational
│   │   ├── backend-terminal/            // presentational
│   │   └── frontend-visual-graph/       // presentational
│   ├── projects-showcase/               // container
│   │   └── project-card/                // presentational
│   └── site-footer/
└── app.component.ts
```

`stack-explorer` mantém `activeMode = signal<'backend' | 'frontend'>('backend')` e aplica `[attr.data-mode]="activeMode()"` no host. CSS: `[data-mode="backend"]` define `--accent-active: var(--accent-backend)`; `[data-mode="frontend"]` define `--accent-active: var(--accent-frontend)`.

## 10. SEO

- `<title>`: "Rafael Moraes — Desenvolvedor Backend Java & Spring Boot"
- Meta description: desenvolvedor backend, Java, Spring Boot, APIs REST, arquitetura em camadas, Angular.
- Open Graph + Twitter Card configurados (título, descrição, imagem de preview) para compartilhamento em LinkedIn/redes.
- Favicon e ícones de app configurados (não usar o favicon padrão do Angular CLI).
- Hierarquia: `h1` só no hero. `h2` para "Stack Técnica", "Projetos", "Contato".
- Nenhum heading ou conteúdo relevante para SEO mencionando experiência industrial, laboratorial ou automação.
- JSON-LD `Person`, `jobTitle: "Backend Developer"`.

## 11. Performance e Qualidade

- Change detection **zoneless**.
- `@defer` em `frontend-visual-graph` e em qualquer bloco que dependa de GSAP/ScrollTrigger.
- Fontes self-hosted, subset apenas dos pesos usados, `font-display: swap`.
- `NgOptimizedImage` em qualquer imagem/screenshot de projeto.
- Orçamento de bundle explícito no `angular.json` (ex: warning em 250KB, erro em 400KB do bundle inicial) para forçar disciplina.
- Tree-shaking rigoroso de ícones (seção 7) — nunca importar o pacote completo de um icon set.
- Foco de teclado visível em todo elemento interativo (toggle, comandos, nós, cards).
- `prefers-reduced-motion` respeitado em toda animação (seção 4).
- Meta: 90+ em Performance e Acessibilidade no Lighthouse.

## 12. Dados Reais — Perfil, Contato e Conteúdo Pronto

Estes dados são reais e devem ser usados diretamente — não são placeholder.

```typescript
// src/app/data/profile.data.ts
export const PROFILE = {
  name: 'Rafael Moraes',
  role: 'Desenvolvedor Backend Java',
  email: 'rafaeljunio.jsm@outlook.com',
  linkedin: 'https://linkedin.com/in/rafael-moraes-dev',
  github: 'https://github.com/Rafael01Gx',
  location: 'Taboão da Serra, SP',
  education: 'Superior em Análise e Desenvolvimento de Sistemas — UNOPAR, 2025',
  languages: ['Português (nativo)', 'Inglês (intermediário)'],
  bio: 'Desenvolvedor backend Java, especializado em Spring Boot, APIs REST e arquitetura em camadas. Formado em Análise e Desenvolvimento de Sistemas (UNOPAR, 2025), em evolução constante rumo a full-stack e novas tecnologias.',
} as const;
```

`hero-terminal`, `backend-terminal` (comando `whoami`) e `site-footer` consomem este objeto diretamente — nenhum texto de nome, cargo, e-mail ou link deve ser hardcoded fora dele.

### Projetos — pré-preenchidos a partir do currículo real

```typescript
// src/app/data/projects.data.ts
export const PROJECTS: Project[] = [
  {
    id: 'rest-api-spring-boot',
    title: 'API REST com Spring Boot',
    description: 'API REST com arquitetura em camadas, autenticação JWT via Spring Security, persistência com PostgreSQL via JPA/Hibernate, testes unitários com JUnit 5 e Mockito, documentação de endpoints com Swagger.',
    stack: ['java', 'spring-boot', 'spring-security', 'postgresql', 'junit5', 'swagger'],
    repoUrl: 'https://github.com/Rafael01Gx/SUBSTITUIR_PELO_NOME_DO_REPO',
    highlight: true,
  },
  {
    id: 'backend-mensageria',
    title: 'Sistema Backend com Mensageria',
    description: 'Comunicação assíncrona entre serviços via RabbitMQ, separação de responsabilidades por domínio, persistência poliglota (PostgreSQL e MongoDB), infraestrutura como código com AWS CDK, containerizado com Docker.',
    stack: ['spring-boot', 'rabbitmq', 'postgresql', 'mongodb', 'aws', 'docker'],
    repoUrl: 'https://github.com/Rafael01Gx/SUBSTITUIR_PELO_NOME_DO_REPO',
  },
  {
    id: 'sistema-gestao-corporativa',
    title: 'Sistema de Gestão Corporativa (Backend)',
    description: 'Backend completo em Java com Spring Boot, controle de autenticação e autorização com Spring Security, implantação em nuvem via Amazon EC2, integração contínua com GitHub Actions para deploy automatizado, otimização de consultas com JPA e documentação técnica do sistema.',
    stack: ['java', 'spring-boot', 'spring-security', 'aws', 'github-actions'],
    repoUrl: 'https://github.com/Rafael01Gx/SUBSTITUIR_PELO_NOME_DO_REPO',
  },
];
```

> Nota: o título foi generalizado em relação ao nome original do projeto no currículo, removendo a referência ao domínio laboratorial — a descrição foca exclusivamente nos aspectos técnicos (autenticação, deploy, CI/CD, otimização de queries).

**Pendências reais que só você pode preencher** (não foi possível obter automaticamente):
1. O `repoUrl` exato de cada projeto — troque `SUBSTITUIR_PELO_NOME_DO_REPO` pelo nome real do repositório no seu GitHub.
2. Qualquer projeto adicional "escolhido a dedo" que você queira adicionar ao array — a estrutura já está pronta para isso.

## 13. Build & Deploy

Projeto é puramente estático (sem backend próprio) — `ng build` gera output estático compatível com deploy em Vercel, Netlify ou GitHub Pages. Nenhuma configuração de servidor adicional é necessária.
