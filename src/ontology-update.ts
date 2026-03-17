import { OntologyDemo } from './ontology-engine';
import { updateSystems } from './ontology-data';
import { getLang, onLangChange, type Lang } from './i18n';

let demo: OntologyDemo;
let flowGen = 0;
let flowStarted = false;

type Msg = { delay: number; role: string; label: string; text: string };

const conversations: Record<Lang, Msg[]> = {
  en: [
    { delay: 0, role: 'user', label: 'Facility Manager', text: 'We\'ve installed new PV panels on the roof and two heat pumps in the basement. All commissioning data, sensor mappings, and control sequences are in <code>/data/pv-hp-upgrade/</code>.' },
    { delay: 1800, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'New PV and heat pump installation — I should update the ontology. Let me read through the commissioning reports, sensor mappings, and control sequences in <code>/data/pv-hp-upgrade/</code>...' },
    { delay: 11500, role: 'agent', label: '🏔️ Nekaise Agent', text: 'I\'ve updated the ontology with <strong>PV1 Solar</strong> (2 sub-systems, 6 sensors) and <strong>HP1 Heat Pump</strong> (6 sensors). Both are now connected to the building graph.' },
    { delay: 14000, role: 'user', label: 'You', text: 'What is the current PV generation capacity?' },
    { delay: 16000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'PV1 has two roof arrays (PV1-EP1, PV1-EP2) with a combined inverter bank (PV1-INV1, PV1-INV2). Total generation is tracked via PV1-EL metering.' },
  ],
  zh: [
    { delay: 0, role: 'user', label: '设施经理', text: '我们在屋顶安装了新的光伏板，地下室安装了两台热泵。所有调试数据、传感器映射和控制逻辑都在 <code>/data/pv-hp-upgrade/</code> 中。' },
    { delay: 1800, role: 'thinking', label: '🏔️ Nekaise Agent', text: '新的光伏和热泵安装——我应该更新本体。让我查阅 <code>/data/pv-hp-upgrade/</code> 中的调试报告、传感器映射和控制逻辑...' },
    { delay: 11500, role: 'agent', label: '🏔️ Nekaise Agent', text: '已更新本体，新增 <strong>PV1 太阳能</strong>（2 个子系统，6 个传感器）和 <strong>HP1 热泵</strong>（6 个传感器）。两者均已连接到建筑图谱。' },
    { delay: 14000, role: 'user', label: '你', text: '当前光伏发电容量是多少？' },
    { delay: 16000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'PV1 有两组屋顶阵列（PV1-EP1、PV1-EP2），配备组合逆变器组（PV1-INV1、PV1-INV2）。总发电量通过 PV1-EL 计量跟踪。' },
  ],
  sv: [
    { delay: 0, role: 'user', label: 'Fastighetsförvaltare', text: 'Vi har installerat nya solpaneler på taket och två värmepumpar i källaren. All driftdata, sensormappningar och styrsekvenser finns i <code>/data/pv-hp-upgrade/</code>.' },
    { delay: 1800, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Ny solcells- och värmepumpsinstallation — jag bör uppdatera ontologin. Låt mig läsa igenom driftrapporter, sensormappningar och styrsekvenser i <code>/data/pv-hp-upgrade/</code>...' },
    { delay: 11500, role: 'agent', label: '🏔️ Nekaise Agent', text: 'Jag har uppdaterat ontologin med <strong>PV1 Sol</strong> (2 delsystem, 6 sensorer) och <strong>HP1 Värmepump</strong> (6 sensorer). Båda är nu anslutna till byggnadsgrafen.' },
    { delay: 14000, role: 'user', label: 'Du', text: 'Vad är den aktuella solcellskapaciteten?' },
    { delay: 16000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'PV1 har två takpaneler (PV1-EP1, PV1-EP2) med en kombinerad växelriktarbank (PV1-INV1, PV1-INV2). Total produktion spåras via PV1-EL-mätning.' },
  ],
};

const GRAPH_START_DELAY = 3500;

function addMessage(body: HTMLElement, msg: Msg) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-${msg.role}`;
  div.innerHTML = `<span class="chat-role">${msg.label}</span>${msg.text}`;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function startFlow() {
  const gen = ++flowGen;
  const body = document.getElementById('update-chat-body')!;
  body.innerHTML = '';
  const conversation = conversations[getLang()];

  // First message appears instantly
  addMessage(body, conversation[0]);

  // Rest animate in with delays
  for (let i = 1; i < conversation.length; i++) {
    const msg = conversation[i];
    setTimeout(() => {
      if (flowGen !== gen) return;
      addMessage(body, msg);
    }, msg.delay);
  }

  // Trigger graph animation after agent says "give me a moment"
  setTimeout(() => {
    if (flowGen !== gen) return;
    demo.start();
  }, GRAPH_START_DELAY);
}

export function initOntologyUpdate(): void {
  demo = new OntologyDemo({
    systems: updateSystems,
    files: [],
    chatMessages: [],
    newRootChildren: ['PV1', 'HP1'],
    elements: {
      files: 'update-files',
      fileList: 'update-file-list',
      actionBtn: 'update-btn',
      canvasWrap: 'update-canvas-wrap',
      canvas: 'update-canvas',
      counter: 'update-counter',
      chat: 'update-chat',
      chatBody: 'update-chat-body',
      resetBtn: 'update-reset-btn',
    },
  });
  demo.init();

  // On reset: cancel current flow, restart
  document.getElementById('update-reset-btn')?.addEventListener('click', () => {
    flowStarted = false;
    requestAnimationFrame(() => {
      flowStarted = true;
      startFlow();
    });
  });

  // Restart flow on language change if already running
  onLangChange(() => {
    if (flowStarted) {
      startFlow();
    }
  });
}

export function activateOntologyUpdate(): void {
  demo.activate();
  if (!flowStarted) {
    flowStarted = true;
    startFlow();
  }
}
