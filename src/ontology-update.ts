import { OntologyDemo } from './ontology-engine';
import { updateSystems } from './ontology-data';

let demo: OntologyDemo;
let flowGen = 0;
let flowStarted = false;

// All conversation messages with timing (ms from flow start)
// role: 'thinking' = agent internal reasoning, shown in muted style
const conversation = [
  {
    delay: 0,
    role: 'user',
    label: 'Facility Manager',
    text: 'We\'ve installed new PV panels on the roof and two heat pumps in the basement. All commissioning data, sensor mappings, and control sequences are in <code>/data/pv-hp-upgrade/</code>.',
  },
  {
    delay: 1800,
    role: 'thinking',
    label: '🏔️ Nekaise Agent',
    text: 'New PV and heat pump installation — I should update the ontology. Let me read through the commissioning reports, sensor mappings, and control sequences in <code>/data/pv-hp-upgrade/</code>...',
  },
  // ── graph animation starts at ~3500ms, settles ~11000ms ──
  {
    delay: 11500,
    role: 'agent',
    label: '🏔️ Nekaise Agent',
    text: 'I\'ve updated the ontology with <strong>PV1 Solar</strong> (2 sub-systems, 6 sensors) and <strong>HP1 Heat Pump</strong> (6 sensors). Both are now connected to the building graph.',
  },
  {
    delay: 14000,
    role: 'user',
    label: 'You',
    text: 'What is the current PV generation capacity?',
  },
  {
    delay: 16000,
    role: 'agent',
    label: '🏔️ Nekaise Agent',
    text: 'PV1 has two roof arrays (PV1-EP1, PV1-EP2) with a combined inverter bank (PV1-INV1, PV1-INV2). Total generation is tracked via PV1-EL metering.',
  },
];

const GRAPH_START_DELAY = 3500;

function addMessage(body: HTMLElement, msg: typeof conversation[0]) {
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
}

export function activateOntologyUpdate(): void {
  demo.activate();
  if (!flowStarted) {
    flowStarted = true;
    startFlow();
  }
}
