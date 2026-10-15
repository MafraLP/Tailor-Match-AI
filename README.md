# Tailor Match AI

[Português (Brasil)](#português-brasil) · [English (US)](#english-us)

## Português (Brasil)

**Tailor Match AI** é uma ferramenta local-first para organizar um histórico profissional, comparar evidências reais com uma vaga e preparar materiais de candidatura mais direcionados.

O projeto prioriza clareza e integridade: uma competência só é apresentada como experiência quando há evidência confirmada no perfil. Histórias brutas e anedotas podem enriquecer o contexto, mas não viram afirmações no CV automaticamente.

### Estado atual

O Milestone 1 está concluído e entrega uma interface Vue 3 + Quasar com:

- formulário de perfil, experiência e histórias brutas;
- entrada de URL e descrição de vaga;
- dashboard demonstrativo com termômetro, radar e gaps usando fixture local;
- persistência de rascunhos no IndexedDB do navegador;
- um shell de bridge local em Node.js para futuras integrações de IA.

Parsing de PDF, leitura de URL, integração com CLIs/LLMs, BYOK e geração de CV ainda não foram implementados. Consulte o [roadmap interno](docs/private/roadmap.md) apenas no checkout local; ele é intencionalmente ignorado pelo Git.

### Privacidade

O aplicativo não envia perfil, vaga ou rascunhos durante o Milestone 1. Os dados ficam apenas no IndexedDB deste navegador. Integrações futuras deverão montar um pacote mínimo de contexto somente quando o usuário solicitar uma avaliação ou geração e deverá ser possível revisar esse pacote antes do envio.

Não faça commit de currículos, PDFs, exports, chaves de API ou dados de candidatos. As pastas `data/`, `exports/`, `uploads/`, `docs/private/` e arquivos `.env*` (exceto `.env.example`) são ignorados para reduzir esse risco.

### Como executar

Requer Node.js 20+ e npm.

```bash
npm install
npm run dev
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

Milestone 1 is complete and provides a Vue 3 + Quasar interface with:

- forms for profile, work experience, and raw stories;
- URL and pasted job-description inputs;
- a fixture-powered compatibility dashboard with a temperature indicator, radar, and gaps;
- browser-local draft persistence through IndexedDB;
- a local Node.js bridge shell for upcoming AI integrations.

PDF parsing, URL extraction, CLI/LLM integrations, BYOK, and CV generation are not implemented yet. The internal roadmap is intentionally Git-ignored and remains available only in a local checkout.

### Privacy

During Milestone 1, the application does not transmit profiles, jobs, or drafts. They remain in this browser's IndexedDB. Future integrations must create a minimal context package only after an explicit user action and allow that package to be reviewed before it is sent.

Do not commit resumes, PDFs, generated exports, API keys, or candidate data. The `data/`, `exports/`, `uploads/`, `docs/private/`, and `.env*` paths (except `.env.example`) are ignored to reduce this risk.

### Run locally

Requires Node.js 20+ and npm.

```bash
npm install
npm run dev
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
