# Tailor Match AI

[Português (Brasil)](#português-brasil) · [English (US)](#english-us)

## Português (Brasil)

**Tailor Match AI** é uma ferramenta local-first para organizar um histórico profissional, comparar evidências reais com uma vaga e preparar materiais de candidatura mais direcionados.

O projeto prioriza clareza e integridade: uma competência só é apresentada como experiência quando há evidência confirmada no perfil. Histórias brutas e anedotas podem enriquecer o contexto, mas não viram afirmações no CV automaticamente.

### Estado atual

Os Milestones 1, 2 e 3 estão concluídos e entregam uma interface Vue 3 + Quasar com:

- formulário de perfil, experiência e histórias brutas;
- entrada de URL e descrição de vaga;
- dashboard demonstrativo com termômetro, radar e gaps usando fixture local;
- persistência de rascunhos no IndexedDB do navegador;
- importação local de PDF com extração de texto revisável, sem upload;
- normalização local do texto da vaga e prévia do pacote de contexto;
- bridge local em Node.js/TypeScript com estratégias fake, CLI e BYOK.

Leitura de URL e geração de CV ainda não foram implementadas. A bridge exige execução local; Codex/Claude devem estar instalados e autenticados quando selecionados. PDFs escaneados sem texto selecionável exigem correção manual nesta etapa. Consulte o [roadmap interno](docs/private/roadmap.md) apenas no checkout local; ele é intencionalmente ignorado pelo Git.

### Privacidade

O aplicativo não envia perfil, vaga ou rascunhos durante o Milestone 1. Os dados ficam apenas no IndexedDB deste navegador. Integrações futuras deverão montar um pacote mínimo de contexto somente quando o usuário solicitar uma avaliação ou geração e deverá ser possível revisar esse pacote antes do envio.

Não faça commit de currículos, PDFs, exports, chaves de API ou dados de candidatos. As pastas `data/`, `exports/`, `uploads/`, `docs/private/` e arquivos `.env*` (exceto `.env.example`) são ignorados para reduzir esse risco.

### Como executar

Requer Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Em outro terminal, inicie a bridge local antes de testar uma integração:

```bash
npm run bridge
```

Para gerar o build de produção:

```bash
npm run build
```

### Estrutura

```text
apps/
  web/       # Vue 3 + Quasar
  bridge/    # limite local para estratégias CLI/LLM (Milestone 3)
docs/public/ # documentação pública da arquitetura
```

Leia a [arquitetura pública](docs/public/arquitetura.md) para as decisões de local-first, Adapter/Strategy e prompts versionados.

### Licença

Distribuído sob a [licença MIT](LICENSE).

---

## English (US)

**Tailor Match AI** is a local-first tool for organizing a professional history, comparing real evidence against a job description, and preparing more focused application materials.

The project favors clarity and integrity: a skill is represented as experience only when it is confirmed by profile evidence. Raw stories and anecdotes may add context, but never become CV claims automatically.

### Current status

Milestones 1, 2, and 3 are complete and provide a Vue 3 + Quasar interface with:

- forms for profile, work experience, and raw stories;
- URL and pasted job-description inputs;
- a fixture-powered compatibility dashboard with a temperature indicator, radar, and gaps;
- browser-local draft persistence through IndexedDB;
- local PDF import with reviewable text extraction and no upload;
- local job-text normalization and a context-package preview;
- a local Node.js/TypeScript bridge with fake, CLI, and BYOK strategies.

URL extraction and CV generation are not implemented yet. The bridge must run locally, and Codex/Claude must be installed and authenticated when selected. Scanned PDFs without selectable text need manual correction at this stage. The internal roadmap is intentionally Git-ignored and remains available only in a local checkout.

### Privacy

During Milestone 1, the application does not transmit profiles, jobs, or drafts. They remain in this browser's IndexedDB. Future integrations must create a minimal context package only after an explicit user action and allow that package to be reviewed before it is sent.

Do not commit resumes, PDFs, generated exports, API keys, or candidate data. The `data/`, `exports/`, `uploads/`, `docs/private/`, and `.env*` paths (except `.env.example`) are ignored to reduce this risk.

### Run locally

Requires Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Start the local bridge in another terminal before testing an integration:

```bash
npm run bridge
```

Build the production assets with:

```bash
npm run build
```

### Structure

```text
apps/
  web/       # Vue 3 + Quasar
  bridge/    # local boundary for CLI/LLM strategies (Milestone 3)
docs/public/ # public architecture documentation
```

See the [public architecture](docs/public/arquitetura.md) for the local-first, Adapter/Strategy, and versioned-prompt decisions.

### License

Released under the [MIT License](LICENSE).
