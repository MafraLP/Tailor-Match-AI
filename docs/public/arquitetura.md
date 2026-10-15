# Tailor Match AI — Arquitetura do Produto

Tailor Match AI é uma ferramenta local-first para transformar um histórico profissional real em uma candidatura mais clara e direcionada. O produto recebe o perfil do candidato e uma vaga, explica a compatibilidade entre ambos e, quando solicitado, produz um currículo otimizado e uma carta de apresentação.

O objetivo não é inflar palavras-chave. É evidenciar, de forma verificável, a experiência que melhor responde ao problema da vaga e deixar explícitas as lacunas que ainda existem.

## Experiência visual

A interface será construída com Vue 3 e Quasar. Essa combinação entrega uma aplicação responsiva, componentes acessíveis e um caminho direto para uma experiência desktop/web sem criar duas bases de código.

O fluxo principal será simples:

1. O candidato importa um PDF ou completa o próprio perfil, inclusive com histórias e anedotas em texto livre.
2. A vaga é fornecida por URL ou por texto colado.
3. O produto exibe um painel de compatibilidade antes de qualquer geração.
4. O candidato escolhe idioma e instruções adicionais para gerar o CV e, opcionalmente, a cover letter.

O painel não se resume a uma nota. Ele usará um indicador de temperatura para comunicar o nível geral de aderência, um radar para comparar requisitos da vaga e competências com evidência no perfil, e uma área de gaps com a razão de cada ponto. Assim, a pessoa entende onde é competitiva e onde precisa de cautela.

## Avaliação com evidência, não com contagem de palavras

O motor de match seguirá uma avaliação estruturada: senioridade e escopo da função, responsabilidades, tecnologias exigidas versus tecnologias comprovadas, contexto de produto, requisitos obrigatórios, idioma, localização e modelo de trabalho. A saída será `Suitable`, `Borderline` ou `Not suitable`, acompanhada de pontos fortes, bloqueadores e lacunas materiais.

O sistema diferencia três tipos de informação:

- **Evidência comprovada:** experiências, tecnologias, resultados e datas presentes no perfil do candidato.
- **Contexto bruto:** histórias e anedotas úteis para orientar perguntas ou redação, mas que não viram afirmações no currículo sem confirmação.
- **Lacunas:** requisitos relevantes da vaga ainda não comprovados; nunca são promovidos a competência apenas por proximidade semântica.

O PDF será extraído em uma estrutura adequada a ATS: texto selecionável, seções convencionais e metadados de origem. A extração não é tratada como verdade absoluta: o candidato poderá revisar e complementar o conteúdo antes da avaliação.

## Privacidade local-first

O histórico profissional, PDFs importados, rascunhos e resultados ficam no navegador, em IndexedDB. A aplicação não exige um banco central de perfis para funcionar.

Quando o usuário pede uma avaliação ou geração, o front-end monta naquele momento um pacote de prompt mínimo com o contexto necessário. Só esse pacote é encaminhado ao provedor ou agente escolhido. A interface deixará claro o destino dos dados antes do envio e permitirá revisar o material preparado.

Essa arquitetura reduz a retenção de dados pessoais e torna o produto adequado para demonstrações, uso individual e evolução posterior sem transformar o portfólio em um repositório de currículos de terceiros.

## Integração agnóstica de IA

Uma bridge local em Node.js/TypeScript conecta a interface a diferentes meios de inferência: APIs com chave própria (BYOK) e CLIs instaladas na máquina, como Codex ou Claude.

O núcleo trabalha contra uma interface de estratégia única — por exemplo, `evaluate` e `generate` — e cada integração implementa sua própria estratégia. A UI e o motor de prompts não precisam saber se a resposta veio de uma API, de uma CLI ou de um provedor futuro.

Isso traz três benefícios práticos:

- troca de provedor sem reescrever a experiência do produto;
- credenciais e execução de CLI mantidas no ambiente do usuário;
- testes do motor de decisão usando uma estratégia simulada, sem custo de inferência.

## Prompt engineering versionado

Os prompts serão arquivos versionados e parametrizáveis, não textos soltos dentro da interface. Cada fluxo — extração, normalização da vaga, avaliação, CV e cover letter — terá um template com variáveis explícitas, versão e contrato de saída.

Essa escolha dá rastreabilidade ao resultado e permite evoluir instruções sem alterar a lógica de apresentação. Também preserva as regras centrais: não inventar fatos, usar a linguagem da vaga quando apropriado, priorizar conteúdo relevante e manter o currículo legível por ATS.

## Limites intencionais da primeira versão

O produto começa como aplicação local para um único usuário. Não inclui contas, sincronização em nuvem, compartilhamento de perfis nem ranking automático de candidatos. Esses recursos aumentariam a superfície de privacidade e não são necessários para demonstrar o núcleo do produto.
