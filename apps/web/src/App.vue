<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { loadDraft, saveDraft } from "./lib/profileStore";
import { demoMatch } from "./fixtures/match";
import { buildContextPackage, normalizeWhitespace, validationMessage } from "./lib/contextPackage";

const activeStep = ref(1);
const saved = ref(false);
const saving = ref(false);
const profile = reactive({
  name: "",
  headline: "",
  location: "",
  languages: "",
  skills: "",
  experience: "",
  confirmedEvidence: "",
  stories: ""
});
const job = reactive({ url: "", description: "", normalizedDescription: "" });
const pdfStatus = ref("");
const pdfError = ref("");
const extractingPdf = ref(false);
const formError = ref("");
const contextPackage = computed(() => buildContextPackage(profile, job));

const temperature = computed(() => demoMatch.score >= 75 ? "🔥" : demoMatch.score >= 55 ? "🌤️" : "🧊");
const radarPoints = (field) => demoMatch.radar.map((item, index) => {
  const angle = (Math.PI * 2 * index) / demoMatch.radar.length - Math.PI / 2;
  const radius = item[field] * 0.78;
  return `${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`;
}).join(" ");
const axisPoint = (index) => {
  const angle = (Math.PI * 2 * index) / demoMatch.radar.length - Math.PI / 2;
  return { x: 100 + Math.cos(angle) * 86, y: 100 + Math.sin(angle) * 86 };
};

async function persist() {
  saving.value = true;
  saved.value = false;
  try {
    await saveDraft({ profile: JSON.parse(JSON.stringify(profile)), job: JSON.parse(JSON.stringify(job)) });
    saved.value = true;
  } finally {
    saving.value = false;
  }
}

async function continueTo(step) {
  formError.value = validationMessage(profile, job);
  if (step >= 3 && formError.value) return;
  await persist();
  activeStep.value = step;
}

async function importPdf(file) {
  if (!file) return;
  pdfError.value = "";
  pdfStatus.value = "";
  extractingPdf.value = true;
  try {
    const { extractPdfText } = await import("./lib/pdfText");
    const result = await extractPdfText(file);
    profile.confirmedEvidence = result.text;
    pdfStatus.value = `${file.name} processado localmente · ${result.pages} página${result.pages === 1 ? "" : "s"}. Revise o texto antes de continuar.`;
    await persist();
  } catch (error) {
    pdfError.value = error.message;
  } finally {
    extractingPdf.value = false;
  }
}

function normalizeJob() {
  job.normalizedDescription = normalizeWhitespace(job.description);
}

onMounted(async () => {
  const draft = await loadDraft();
  if (draft?.profile) {
    Object.assign(profile, draft.profile);
    if (!profile.confirmedEvidence && profile.experience) profile.confirmedEvidence = profile.experience;
  }
  if (draft?.job) Object.assign(job, draft.job);
});
</script>

<template>
  <q-layout view="hHh Lpr fFf" class="app-shell">
    <q-header class="topbar">
      <q-toolbar class="toolbar">
        <div class="brand-mark">T</div>
        <q-toolbar-title>
          <strong>Tailor Match</strong><span class="ai-label">AI</span>
          <div class="tagline">Match honesto, candidatura melhor.</div>
        </q-toolbar-title>
        <q-chip square class="local-chip" icon="lock">Dados locais</q-chip>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="page-wrap">
        <section class="hero">
          <p class="eyebrow">MILSTONE 2 · CONTEXTO LOCAL</p>
          <h1>Transforme sua trajetória em <span>evidência.</span></h1>
          <p class="hero-copy">Organize seu contexto, compare com uma vaga e enxergue onde você já é forte — antes de enviar qualquer dado para uma IA.</p>
        </section>

        <section class="privacy-banner" aria-label="Privacidade">
          <q-icon name="verified_user" size="22px" />
          <div><strong>Nada foi enviado.</strong> Este protótipo salva seu perfil e a vaga somente no IndexedDB deste navegador.</div>
          <q-badge outline color="positive">LOCAL-FIRST</q-badge>
        </section>

        <q-stepper v-model="activeStep" flat animated color="primary" class="workflow" header-nav>
          <q-step :name="1" title="Seu perfil" icon="person" :done="activeStep > 1">
            <div class="section-heading"><div><p class="eyebrow">01 · CONTEXTO</p><h2>Traga evidências, depois complemente a história.</h2><p>O texto extraído de um PDF e as experiências preenchidas manualmente são revisáveis. Histórias brutas ficam separadas.</p></div><q-btn flat color="primary" icon="save" :label="saving ? 'Salvando...' : saved ? 'Salvo localmente' : 'Salvar rascunho'" @click="persist" /></div>
            <div class="pdf-import">
              <div><p class="card-kicker">IMPORTAR CURRÍCULO</p><strong>Extrair texto do PDF neste navegador</strong><p>O arquivo não é enviado nem mantido após a extração. PDFs com texto selecionável, até 10 MB.</p></div>
              <q-file outlined accept="application/pdf,.pdf" label="Selecionar PDF" :loading="extractingPdf" @update:model-value="importPdf">
                <template #prepend><q-icon name="upload_file" /></template>
              </q-file>
            </div>
            <q-banner v-if="pdfStatus" rounded class="success-banner"><template #avatar><q-icon name="check_circle" color="positive" /></template>{{ pdfStatus }}</q-banner>
            <q-banner v-if="pdfError" rounded class="error-banner"><template #avatar><q-icon name="error" color="negative" /></template>{{ pdfError }}</q-banner>
            <div class="form-grid">
              <q-input v-model="profile.name" outlined label="Nome" placeholder="Como quer aparecer no CV" />
              <q-input v-model="profile.headline" outlined label="Título profissional" placeholder="Ex.: Desenvolvedor Full-stack" />
              <q-input v-model="profile.location" outlined label="Localização / modelo de trabalho" placeholder="Ex.: São Paulo · remoto" />
              <q-input v-model="profile.languages" outlined label="Idiomas" placeholder="Ex.: Português nativo, inglês B2" />
              <q-input v-model="profile.skills" outlined class="span-2" label="Tecnologias e competências comprovadas" placeholder="Ex.: Vue, Laravel, PostgreSQL, APIs REST" hint="Use vírgulas para separar." />
              <q-input v-model="profile.confirmedEvidence" outlined type="textarea" autogrow class="span-2" label="Evidências confirmadas" placeholder="Empresa, cargo, período, responsabilidades, tecnologias e resultados comprováveis." hint="Revise o texto extraído antes de usá-lo como evidência." />
              <q-input v-model="profile.stories" outlined type="textarea" autogrow class="span-2 raw-context" label="Histórias brutas e anedotas" placeholder="Ex.: Na faculdade fiz um mini projeto que resolveu…" hint="Não será tratado como fato no CV sem sua revisão." />
            </div>
            <div class="step-actions"><q-btn unelevated color="primary" label="Continuar para a vaga" icon-right="arrow_forward" @click="continueTo(2)" /></div>
          </q-step>

          <q-step :name="2" title="A vaga" icon="work_outline" :done="activeStep > 2">
            <div class="section-heading"><div><p class="eyebrow">02 · ALVO</p><h2>Traga o contexto da oportunidade.</h2><p>A URL fica registrada localmente como referência. Nesta etapa, o texto colado é a fonte confiável para análise.</p></div><q-btn flat color="primary" icon="save" label="Salvar rascunho" @click="persist" /></div>
            <div class="form-grid job-form">
              <q-input v-model="job.url" outlined class="span-2" label="URL da vaga (opcional)" placeholder="https://empresa.com/carreiras/vaga" type="url" />
              <q-input v-model="job.description" outlined type="textarea" autogrow class="span-2" label="Descrição da vaga" placeholder="Cole a descrição completa: responsabilidades, requisitos obrigatórios, diferenciais, idioma e localização." @blur="normalizeJob" />
            </div>
            <div class="job-tools"><q-btn outline color="primary" icon="cleaning_services" label="Normalizar texto" @click="normalizeJob" /><span>Remove espaçamento excessivo sem mudar o conteúdo.</span></div>
            <q-expansion-item group="review" icon="visibility" label="Revisar pacote preparado para avaliação" header-class="context-review">
              <div class="context-copy">Este é o único contexto que uma futura integração poderá receber após sua ação explícita. Nada é enviado agora.</div>
              <pre class="context-preview">{{ JSON.stringify(contextPackage, null, 2) }}</pre>
            </q-expansion-item>
            <q-banner v-if="formError" rounded class="error-banner"><template #avatar><q-icon name="error" color="negative" /></template>{{ formError }}</q-banner>
            <div class="demo-note"><q-icon name="science" /><div><strong>Dashboard demonstrativo.</strong> O resultado da próxima etapa usa uma fixture local, sem avaliar nem enviar este conteúdo.</div></div>
            <div class="step-actions"><q-btn flat label="Voltar" @click="activeStep = 1" /><q-btn unelevated color="primary" label="Ver compatibilidade" icon-right="insights" @click="continueTo(3)" /></div>
          </q-step>

          <q-step :name="3" title="Compatibilidade" icon="insights" :done="activeStep > 3">
            <div class="match-intro"><div><p class="eyebrow">03 · LEITURA DE MATCH</p><h2>Compatibilidade com contexto.</h2><p>Resultado demonstrativo para validar a experiência visual do produto.</p></div><q-badge color="positive" class="fixture-badge">FIXTURE LOCAL</q-badge></div>
            <div class="score-layout">
              <q-card flat bordered class="score-card"><q-card-section><p class="card-kicker">ADERÊNCIA GERAL</p><div class="score-number">{{ demoMatch.score }}<small>/100</small></div><div class="temperature">{{ temperature }}</div><q-linear-progress rounded size="10px" :value="demoMatch.score / 100" color="primary" track-color="blue-grey-1" class="q-mt-md" /><q-chip color="positive" text-color="white" class="q-mt-md">{{ demoMatch.classification }}</q-chip></q-card-section></q-card>
              <q-card flat bordered class="summary-card"><q-card-section><p class="card-kicker">LEITURA</p><h3>Pronto para aprofundar.</h3><p>{{ demoMatch.summary }}</p><div class="strength-list"><span v-for="strength in demoMatch.strengths" :key="strength"><q-icon name="check_circle" color="positive" />{{ strength }}</span></div></q-card-section></q-card>
            </div>
            <div class="insight-grid">
              <q-card flat bordered class="radar-card"><q-card-section><div class="card-title"><div><p class="card-kicker">MAPA DE COMPETÊNCIAS</p><h3>Você × vaga</h3></div><div class="legend"><span><i class="candidate"></i>Você</span><span><i class="role"></i>Vaga</span></div></div><svg viewBox="0 0 200 200" role="img" aria-label="Radar comparando perfil e vaga"><polygon points="100,14 182,73 151,166 49,166 18,73" class="radar-grid" /><polygon :points="radarPoints('role')" class="role-shape" /><polygon :points="radarPoints('candidate')" class="candidate-shape" /><g v-for="(item, index) in demoMatch.radar" :key="item.label"><line x1="100" y1="100" :x2="axisPoint(index).x" :y2="axisPoint(index).y" class="axis" /><text :x="100 + (axisPoint(index).x - 100) * 1.14" :y="100 + (axisPoint(index).y - 100) * 1.14" text-anchor="middle" class="radar-label">{{ item.label }}</text></g></svg></q-card-section></q-card>
              <q-card flat bordered class="gaps-card"><q-card-section><p class="card-kicker">GAPS A ENDEREÇAR</p><h3>O que merece atenção</h3><div v-for="gap in demoMatch.gaps" :key="gap.title" class="gap"><div class="gap-icon">!</div><div><strong>{{ gap.title }}</strong><p>{{ gap.detail }}</p><q-badge outline color="warning">{{ gap.level }}</q-badge></div></div></q-card-section></q-card>
            </div>
            <div class="step-actions"><q-btn flat label="Editar vaga" @click="activeStep = 2" /><q-btn unelevated color="primary" label="Preparar geração" icon-right="description" @click="activeStep = 4" /></div>
          </q-step>

          <q-step :name="4" title="Geração" icon="description">
            <div class="section-heading"><div><p class="eyebrow">04 · PRÓXIMA ETAPA</p><h2>Geração ainda não está conectada.</h2><p>O shell visual está pronto; o Milestone 4 adicionará prompts versionados, provider bridge e exportação ATS.</p></div></div>
            <div class="generation-grid"><q-select outlined disable label="Idioma de saída" model-value="Português (Brasil)" :options="['Português (Brasil)', 'English']" /><q-input outlined disable label="Instruções adicionais" placeholder="Ex.: focar mais em liderança" /><q-toggle disable label="Incluir cover letter quando aplicável" /></div>
            <q-banner rounded class="generation-banner"><template #avatar><q-icon name="lock" color="primary" /></template>Os botões ficam bloqueados até a bridge e o motor de prompts serem implementados. Seus rascunhos continuam locais.</q-banner>
            <div class="step-actions"><q-btn flat label="Voltar ao dashboard" @click="activeStep = 3" /><q-btn unelevated disable color="primary" label="Gerar CV" icon="download" /></div>
          </q-step>
        </q-stepper>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style>
:root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #e9edf8; background: #0b1220; }
* { box-sizing: border-box; }
body { margin: 0; background: #0b1220; }
.app-shell { min-height: 100vh; background: radial-gradient(circle at 70% 0%, #1a2151 0, transparent 33rem), #0b1220; }
.topbar { background: rgba(11,18,32,.82); backdrop-filter: blur(12px); border-bottom: 1px solid #26324c; }
.toolbar { max-width: 1180px; min-height: 72px; margin: auto; padding: 0 20px; }
.brand-mark { width: 34px; height: 34px; display: grid; place-items: center; margin-right: 10px; border-radius: 10px; color: #fff; font-weight: 800; background: linear-gradient(135deg,#8b7cff,#4d39da); }
.ai-label { color: #8b7cff; margin-left: 5px; }.tagline { font-size: 12px; color: #9da9bf; margin-top: 1px; font-weight: 400; }
.local-chip { background: #122b2a; color: #a9efe0; border: 1px solid #286b61; }
.page-wrap { max-width: 1180px; margin: 0 auto; padding: 64px 20px 80px; }
.hero { max-width: 760px; margin-bottom: 28px; }.eyebrow { color: #a99eff; font-weight: 750; letter-spacing: .12em; font-size: 11px; margin: 0 0 8px; }
h1,h2,h3,p { margin-top: 0; } h1 { font-size: clamp(34px, 5vw, 58px); line-height: 1.06; letter-spacing: -.045em; margin-bottom: 18px; } h1 span { color: #8f83ff; } h2 { font-size: 29px; letter-spacing: -.03em; margin-bottom: 8px; } h3 { font-size: 19px; margin-bottom: 10px; }
.hero-copy,.section-heading p,.match-intro p { color: #aeb8cc; line-height: 1.65; font-size: 16px; }.privacy-banner { display: flex; align-items: center; gap: 13px; padding: 14px 16px; background: #101b2d; border: 1px solid #29405b; border-radius: 12px; color: #bdd0e9; margin-bottom: 24px; }.privacy-banner .q-badge { margin-left: auto; }.workflow { border-radius: 16px; background: #f8f9fd; color: #1c2638; overflow: hidden; }.workflow .q-stepper__header { border-bottom: 1px solid #e2e7f0; }.workflow .q-stepper__tab { min-height: 82px; }.workflow .q-stepper__step-inner { padding: 34px; }.workflow .q-field--outlined .q-field__control:before { border-color: #ccd4e2; }.section-heading,.match-intro { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 26px; }.section-heading p,.match-intro p { color: #657187; font-size: 14px; margin-bottom: 0; }.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px; }.span-2 { grid-column: span 2; }.raw-context .q-field__control { background: #fbfaff; }.pdf-import { display:grid; grid-template-columns: 1.2fr .8fr; gap:20px; align-items:center; background:#f2f4fb; border:1px dashed #b8c2d6; border-radius:12px; padding:18px; margin-bottom:18px; }.pdf-import p:not(.card-kicker) { color:#657187; font-size:13px; margin:5px 0 0; line-height:1.45; }.success-banner,.error-banner { margin: 0 0 18px; }.success-banner { background:#ecfbf6; color:#176752; border:1px solid #b9eadb; }.error-banner { background:#fff0f1; color:#9d2735; border:1px solid #f3c5cb; }.job-tools { display:flex; align-items:center; gap:12px; margin-top:18px; color:#657187; font-size:13px; }.context-review { color:#382e80; font-weight:700; }.context-copy { color:#657187; font-size:13px; padding:0 18px 12px; }.context-preview { max-height:320px; overflow:auto; margin:0 18px 18px; padding:14px; background:#101827; color:#d8e2f5; border-radius:8px; white-space:pre-wrap; font:12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace; }.step-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; }.step-actions .q-btn:first-child { margin-right: auto; }.demo-note,.generation-banner { display: flex; gap: 10px; background: #f2f0ff; color: #403878; border: 1px solid #dcd6ff; border-radius: 10px; padding: 14px; margin-top: 20px; }.fixture-badge { align-self: center; }.score-layout,.insight-grid { display: grid; grid-template-columns: .72fr 1.28fr; gap: 18px; }.score-layout { margin-bottom: 18px; }.score-card,.summary-card,.radar-card,.gaps-card { border-color: #dce2ec; }.score-card { text-align: center; }.card-kicker { color: #78869b; font-size: 11px; font-weight: 750; letter-spacing: .1em; margin-bottom: 12px; }.score-number { font-size: 57px; line-height: 1; font-weight: 800; letter-spacing: -.06em; color: #262c63; }.score-number small { font-size: 18px; color: #8390a2; letter-spacing: 0; }.temperature { font-size: 30px; margin-top: 7px; }.summary-card p { color: #5f6a7e; line-height: 1.6; }.strength-list { display: flex; flex-wrap: wrap; gap: 12px 18px; margin-top: 24px; }.strength-list span { display: flex; align-items: center; gap: 5px; font-size: 13px; }.card-title { display: flex; justify-content: space-between; }.legend { display: flex; gap: 12px; font-size: 11px; color: #647085; }.legend i { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right: 4px; }.candidate { background:#6557ec; }.role { background:#2eb89c; }.radar-card svg { width: 100%; max-height: 300px; margin-top: 8px; overflow: visible; }.radar-grid { fill: #f7f8fc; stroke: #d7deeb; }.axis { stroke: #d7deeb; }.candidate-shape { fill: rgba(101,87,236,.24); stroke: #6557ec; stroke-width: 2; }.role-shape { fill: rgba(46,184,156,.18); stroke: #2eb89c; stroke-width: 2; }.radar-label { font-size: 8px; fill:#5f6b7f; }.gap { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #edf0f5; }.gap:last-child { border-bottom: 0; }.gap-icon { flex: 0 0 25px; height: 25px; border-radius: 50%; display:grid; place-items:center; color: #966900; background:#fff2ce; font-weight:800; }.gap p { color: #657187; line-height: 1.48; font-size: 13px; margin: 5px 0 8px; }.generation-grid { display:grid; gap:18px; grid-template-columns: repeat(2,minmax(0,1fr)); }.generation-grid .q-toggle { grid-column:span 2; }.generation-banner { margin-top: 22px; }
@media (max-width: 700px) { .page-wrap { padding: 38px 14px 50px; }.local-chip { display:none; }.workflow .q-stepper__step-inner { padding: 24px 16px; }.section-heading,.match-intro { display:block; }.section-heading .q-btn { margin-top: 8px; }.form-grid,.score-layout,.insight-grid,.generation-grid,.pdf-import { grid-template-columns: 1fr; }.span-2,.generation-grid .q-toggle { grid-column: auto; }.privacy-banner .q-badge { display:none; }.workflow .q-stepper__tab { padding: 8px; }.workflow .q-stepper__label { font-size: 11px; }.step-actions { flex-wrap: wrap; }.step-actions .q-btn:first-child { margin-right: 0; }.card-title { display:block; }.legend { margin-top: 8px; }.job-tools { align-items:flex-start; flex-direction:column; } }
</style>
