// ── Graph data (from demo_brf_kringlan.ttl) ──────────────────────────────────

interface SystemDef {
  label: string;
  children?: string[];
  actors?: string[];
}

const systems: Record<string, SystemDef> = {
  root: {
    label: 'Demo Residence',
    children: ['AS201', 'LB04', 'LB05', 'LB07', 'LB10', 'LB11', 'LB13', 'Garage', 'VS2', 'VV2', 'VP2', 'KB2', 'KV2', 'VVC', 'Metering'],
    actors: ['UTE-GT31', 'UTE-GX31'],
  },
  AS201: {
    label: 'AS201 Control',
    actors: ['EL-Total', 'EL-Property', 'EL-Apt', 'EL-Garage', 'EL-EV', 'EL-HP'],
  },
  LB04: {
    label: 'LB04 AHU',
    children: ['LB04-Inlet', 'LB04-Exhaust', 'LB04-VVX', 'LB04-Elev'],
    actors: ['LB04-TF01', 'LB04-FF01', 'LB04-SV21', 'LB04-P1', 'LB04-GT11', 'LB04-GT81', 'LB04-GP11', 'LB04-GP12', 'LB04-GX71', 'LB04-GX72', 'LB04-GX73', 'LB04-ST21', 'LB04-ST71', 'LB04-EL'],
  },
  'LB04-Inlet': { label: 'Inlet Duct' },
  'LB04-Exhaust': { label: 'Exhaust Duct' },
  'LB04-VVX': { label: 'Heat Exchanger' },
  'LB04-Elev': { label: 'Elevator Shaft' },
  LB05: {
    label: 'LB05 AHU',
    children: ['LB05-Inlet', 'LB05-Exhaust', 'LB05-VVX', 'LB05-Dist'],
    actors: ['LB05-TF01', 'LB05-FF01', 'LB05-SV21', 'LB05-GT11', 'LB05-GX71', 'LB05-GX72', 'LB05-EL'],
  },
  'LB05-Inlet': { label: 'Inlet Duct' },
  'LB05-Exhaust': { label: 'Exhaust Duct' },
  'LB05-VVX': { label: 'Heat Exchanger' },
  'LB05-Dist': {
    label: 'Distribution',
    actors: ['LB05-GX74', 'LB05-GX75', 'LB05-GX76', 'LB05-GX77', 'LB05-ST7:2', 'LB05-ST7:6', 'LB05-ST7:9', 'LB05-ST7:11'],
  },
  LB07: {
    label: 'LB07 AHU',
    children: ['LB07-Inlet', 'LB07-Exhaust', 'LB07-VVX', 'LB07-Roof', 'LB07-Elrm'],
    actors: ['LB07-TF01', 'LB07-FF01', 'LB07-GT11', 'LB07-GX71', 'LB07-GX73', 'LB07-EL'],
  },
  'LB07-Inlet': { label: 'Inlet Duct' },
  'LB07-Exhaust': { label: 'Exhaust Duct' },
  'LB07-VVX': { label: 'Heat Exchanger' },
  'LB07-Roof': { label: 'Roof Lounge' },
  'LB07-Elrm': { label: 'Electrical Room' },
  LB10: {
    label: 'LB10 AHU',
    children: ['LB10-Inlet', 'LB10-Exhaust', 'LB10-VVX', 'LB10-Elrm'],
    actors: ['LB10-TF01', 'LB10-FF01', 'LB10-GT11', 'LB10-GX71', 'LB10-EL'],
  },
  'LB10-Inlet': { label: 'Inlet Duct' },
  'LB10-Exhaust': { label: 'Exhaust Duct' },
  'LB10-VVX': { label: 'Heat Exchanger' },
  'LB10-Elrm': { label: 'Electrical Room' },
  LB11: {
    label: 'LB11 AHU',
    children: ['LB11-Inlet', 'LB11-Exhaust', 'LB11-VVX', 'LB11-Elev', 'LB11-Elrm'],
    actors: ['LB11-TF01', 'LB11-FF01', 'LB11-GT11', 'LB11-GX71', 'LB11-GX74', 'LB11-EL'],
  },
  'LB11-Inlet': { label: 'Inlet Duct' },
  'LB11-Exhaust': { label: 'Exhaust Duct' },
  'LB11-VVX': { label: 'Heat Exchanger' },
  'LB11-Elev': { label: 'Elevator Shaft' },
  'LB11-Elrm': { label: 'Electrical Room' },
  LB13: {
    label: 'LB13 AHU',
    children: ['LB13-Inlet', 'LB13-Exhaust', 'LB13-VVX', 'LB13-Elev', 'LB13-Elrm'],
    actors: ['LB13-TF01', 'LB13-FF01', 'LB13-GT11', 'LB13-GX71', 'LB13-GX74', 'LB13-EL'],
  },
  'LB13-Inlet': { label: 'Inlet Duct' },
  'LB13-Exhaust': { label: 'Exhaust Duct' },
  'LB13-VVX': { label: 'Heat Exchanger' },
  'LB13-Elev': { label: 'Elevator Shaft' },
  'LB13-Elrm': { label: 'Electrical Room' },
  Garage: {
    label: 'Garage Ventilation',
    actors: ['LB06-FF01', 'LB08-FF01', 'LB12-FF01', 'LB06-GQ51', 'LB08-GQ51', 'LB12-GQ51'],
  },
  VS2: {
    label: 'VS2 Heating',
    actors: ['VS2-GT11', 'VS2-GT51', 'VS2-SV61', 'VS2-SV11', 'VS2-P1', 'VS2-EXP1', 'VS2-VMM1', 'VS-Garage-SV21'],
  },
  VV2: {
    label: 'VV2 Hot Water',
    actors: ['VV2-GT11', 'VV2-SV1', 'VV2-SV2', 'VV2-VM1'],
  },
  VP2: {
    label: 'VP2 Heat Pump',
    actors: ['VP2-EP14', 'VP2-EP15', 'VP2-EM1', 'VP2-VMM1'],
  },
  KB2: {
    label: 'KB2 Brine',
    actors: ['KB2-EXP1', 'KB2-P1'],
  },
  KV2: {
    label: 'KV2 Cold Water',
    actors: ['KV2-P1A', 'KV2-P1B', 'KV2-P1C', 'KV-VM1', 'KV-VM2'],
  },
  VVC: {
    label: 'VVC Circulation',
    actors: ['VVC-P1', 'VVC-GT41', 'VVC-SV21', 'VVC-VM1'],
  },
  Metering: {
    label: 'Metering',
    actors: ['FJV-VMM1', 'FV-GT41', 'FV-GT42'],
  },
};

// ── Build node/edge arrays ───────────────────────────────────────────────────

interface GNode {
  id: string;
  label: string;
  type: 'set' | 'actor';
  parent: string | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  spawned: boolean;
  alpha: number;
  depth: number; // 0=root, 1=main system, 2=sub-set, 3=actor
}

interface GEdge {
  source: number; // index into nodes
  target: number;
}

function buildGraph(): { nodes: GNode[]; edges: GEdge[] } {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  const idxMap = new Map<string, number>();

  function addNode(id: string, label: string, type: 'set' | 'actor', parent: string | null, depth: number) {
    const idx = nodes.length;
    idxMap.set(id, idx);
    nodes.push({ id, label, type, parent, x: 0, y: 0, vx: 0, vy: 0, spawned: false, alpha: 0, depth });
    if (parent !== null) {
      const pi = idxMap.get(parent);
      if (pi !== undefined) edges.push({ source: pi, target: idx });
    }
  }

  // Root
  addNode('root', systems.root.label, 'set', null, 0);

  // Main systems (depth 1)
  for (const childId of systems.root.children!) {
    addNode(childId, systems[childId].label, 'set', 'root', 1);
  }

  // Root actors
  for (const a of systems.root.actors!) {
    addNode(a, a, 'actor', 'root', 3);
  }

  // Each system: sub-sets (depth 2) and actors (depth 3)
  for (const sysId of systems.root.children!) {
    const sys = systems[sysId];
    if (sys.children) {
      for (const subId of sys.children) {
        addNode(subId, systems[subId].label, 'set', sysId, 2);
        // Sub-set actors
        if (systems[subId].actors) {
          for (const a of systems[subId].actors!) {
            addNode(a, a, 'actor', subId, 3);
          }
        }
      }
    }
    if (sys.actors) {
      for (const a of sys.actors) {
        addNode(a, a, 'actor', sysId, 3);
      }
    }
  }

  return { nodes, edges };
}

// ── Fake file list ───────────────────────────────────────────────────────────

const fakeFiles = [
  { name: 'control_cards.pdf', size: '2.4 MB', icon: '📄' },
  { name: 'system_description.pdf', size: '449 KB', icon: '📄' },
  { name: 'bms_operation_guide.md', size: '12 KB', icon: '📝' },
  { name: 'heating_control.md', size: '8 KB', icon: '📝' },
  { name: 'sensor_tags.csv', size: '34 KB', icon: '📊' },
  { name: 'existing_model.ttl', size: '18 KB', icon: '🔗' },
  { name: 'floor_plan_01.png', size: '1.1 MB', icon: '🖼️' },
  { name: 'floor_plan_02.png', size: '980 KB', icon: '🖼️' },
];

// ── Chat messages ────────────────────────────────────────────────────────────

const chatMessages = [
  { role: 'user' as const, text: 'What is the supply air setpoint for LB04 at -10°C outdoor?' },
  { role: 'agent' as const, text: 'According to the 9-breakpoint curve, LB04 supply air setpoint is +20°C when outdoor temperature is -10°C.' },
  { role: 'user' as const, text: 'What happens when smoke is detected in the exhaust duct?' },
  { role: 'agent' as const, text: 'GX72 fire function activates: bypass damper ST71 opens, unit speeds to controller setpoint. This overrides GX71 supply-side fire function.' },
];

// ── State machine ────────────────────────────────────────────────────────────

type Phase = 'idle' | 'processing' | 'spawning' | 'settling' | 'done';

let phase: Phase = 'idle';
let phaseStart = 0;
let graph: ReturnType<typeof buildGraph>;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let dpr = 1;
let centerX = 0;
let centerY = 0;
let spawnOrder: number[] = [];
let fileCheckIdx = 0;
let chatMsgIdx = 0;
let chatTypingStart = 0;
let rafId = 0;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

// ── Layout ───────────────────────────────────────────────────────────────────

function assignPositions() {
  const n = graph.nodes;
  // Root at center
  n[0].x = centerX;
  n[0].y = centerY;

  // Main systems in a circle — spread wide
  const mainSystems = n.filter((nd) => nd.depth === 1);
  const r1 = Math.min(centerX, centerY) * 0.9;
  mainSystems.forEach((nd, i) => {
    const angle = (i / mainSystems.length) * Math.PI * 2 - Math.PI / 2;
    nd.x = centerX + Math.cos(angle) * r1;
    nd.y = centerY + Math.sin(angle) * r1;
  });

  // Sub-sets around their parent — wider spread
  const subSets = n.filter((nd) => nd.depth === 2);
  const parentChildCount = new Map<string, number>();
  const parentChildIdx = new Map<string, number>();
  subSets.forEach((nd) => {
    parentChildCount.set(nd.parent!, (parentChildCount.get(nd.parent!) || 0) + 1);
  });
  subSets.forEach((nd) => {
    const pi = parentChildIdx.get(nd.parent!) || 0;
    parentChildIdx.set(nd.parent!, pi + 1);
    const count = parentChildCount.get(nd.parent!)!;
    const parentNode = n.find((p) => p.id === nd.parent)!;
    const angle = (pi / count) * Math.PI * 2 + Math.random() * 0.3;
    const r2 = 90 + Math.random() * 50;
    nd.x = parentNode.x + Math.cos(angle) * r2;
    nd.y = parentNode.y + Math.sin(angle) * r2;
  });

  // Actors near their parent with jitter — wider
  const actors = n.filter((nd) => nd.depth === 3);
  actors.forEach((nd) => {
    const parentNode = n.find((p) => p.id === nd.parent)!;
    const angle = Math.random() * Math.PI * 2;
    const r3 = 40 + Math.random() * 50;
    nd.x = parentNode.x + Math.cos(angle) * r3;
    nd.y = parentNode.y + Math.sin(angle) * r3;
  });
}

function buildSpawnOrder(): number[] {
  // Spawn by depth: root → systems → sub-sets → actors
  const order: number[] = [];
  for (let d = 0; d <= 3; d++) {
    graph.nodes.forEach((nd, i) => {
      if (nd.depth === d) order.push(i);
    });
  }
  return order;
}

// ── Force simulation ─────────────────────────────────────────────────────────

function simulate() {
  const nodes = graph.nodes;
  const edges = graph.edges;

  // Spring attraction along edges
  for (const e of edges) {
    const a = nodes[e.source];
    const b = nodes[e.target];
    if (!a.spawned || !b.spawned) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const targetDist = b.depth === 3 ? 70 : 130;
    const force = (dist - targetDist) * 0.002;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    a.vx += fx;
    a.vy += fy;
    b.vx -= fx;
    b.vy -= fy;
  }

  // Mild repulsion between spawned nodes (only nearby)
  for (let i = 0; i < nodes.length; i++) {
    if (!nodes[i].spawned) continue;
    for (let j = i + 1; j < nodes.length; j++) {
      if (!nodes[j].spawned) continue;
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 > 40000) continue; // skip far nodes
      const dist = Math.sqrt(dist2) || 1;
      const minDist = nodes[i].depth === 3 && nodes[j].depth === 3 ? 18 : 35;
      if (dist < minDist) {
        const force = (minDist - dist) * 0.05;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }
  }

  // Apply velocity with damping
  for (const nd of nodes) {
    if (!nd.spawned) continue;
    nd.x += nd.vx;
    nd.y += nd.vy;
    nd.vx *= 0.9;
    nd.vy *= 0.9;
  }
}

// ── Rendering ────────────────────────────────────────────────────────────────

// Colors: Sets=teal, Actors=orange, Captions=purple
const SET_RGB = '78, 205, 196';     // #4ecdc4 teal
const ACTOR_RGB = '255, 165, 70';   // #ffa546 orange
const CAPTION_RGB = '180, 120, 255'; // #b478ff purple

function drawGraph() {
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(panX, panY);

  // Edges — white lines
  for (const e of graph.edges) {
    const a = graph.nodes[e.source];
    const b = graph.nodes[e.target];
    if (!a.spawned || !b.spawned) continue;
    const alpha = Math.min(a.alpha, b.alpha);
    if (alpha <= 0) continue;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 * alpha})`;
    ctx.lineWidth = 1;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // Nodes — larger, distinct colors
  for (const nd of graph.nodes) {
    if (!nd.spawned || nd.alpha <= 0) continue;

    const isSet = nd.type === 'set';
    const radius = nd.depth === 0 ? 20 : nd.depth === 1 ? 14 : nd.depth === 2 ? 9 : 5;

    // Pick color based on type
    const rgb = isSet ? SET_RGB : ACTOR_RGB;

    // Glow for sets and actors
    ctx.beginPath();
    ctx.arc(nd.x, nd.y, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb}, ${0.12 * nd.alpha})`;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(nd.x, nd.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb}, ${nd.alpha * 0.9})`;
    ctx.fill();

    // Label for sets (depth 0 and 1 only)
    if (isSet && nd.depth <= 1 && nd.alpha > 0.5) {
      ctx.font = nd.depth === 0 ? 'bold 14px monospace' : '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255, 255, 255, ${nd.alpha * 0.95})`;
      ctx.fillText(nd.label, nd.x, nd.y - radius - 8);
    }
  }

  ctx.restore();
}

// ── Counter display ──────────────────────────────────────────────────────────

function updateCounter() {
  const el = document.getElementById('onto-counter');
  if (!el) return;
  const spawned = graph.nodes.filter((n) => n.spawned).length;
  const sets = graph.nodes.filter((n) => n.spawned && n.type === 'set').length;
  const actors = graph.nodes.filter((n) => n.spawned && n.type === 'actor').length;
  const edgesShown = graph.edges.filter((e) => graph.nodes[e.source].spawned && graph.nodes[e.target].spawned).length;
  el.textContent = `${sets} sets · ${actors} actors · ${edgesShown} edges`;
  el.style.opacity = spawned > 0 ? '1' : '0';
}

// ── Main loop ────────────────────────────────────────────────────────────────

function tick(timestamp: number) {
  if (phase === 'idle') return;

  const elapsed = timestamp - phaseStart;

  if (phase === 'processing') {
    // Checkmark files one by one (250ms each)
    const newIdx = Math.min(Math.floor(elapsed / 250), fakeFiles.length);
    while (fileCheckIdx < newIdx) {
      const el = document.getElementById(`file-${fileCheckIdx}`);
      if (el) el.classList.add('checked');
      fileCheckIdx++;
    }
    if (fileCheckIdx >= fakeFiles.length && elapsed > fakeFiles.length * 250 + 400) {
      // Transition to spawning
      phase = 'spawning';
      phaseStart = timestamp;
      document.getElementById('onto-files')!.classList.add('minimized');
      document.getElementById('onto-canvas-wrap')!.classList.add('visible');
    }
  }

  if (phase === 'spawning') {
    // Spawn nodes: slow at start, accelerating — cubic ease-in
    const totalNodes = spawnOrder.length;
    const rawProgress = Math.min(elapsed / 10000, 1);
    const progress = rawProgress * rawProgress * rawProgress; // cubic ease-in: slow→fast
    const targetSpawned = Math.floor(progress * totalNodes);

    for (let i = 0; i < targetSpawned && i < spawnOrder.length; i++) {
      const ni = spawnOrder[i];
      if (!graph.nodes[ni].spawned) {
        graph.nodes[ni].spawned = true;
      }
    }

    // Fade in alpha
    for (const nd of graph.nodes) {
      if (nd.spawned && nd.alpha < 1) {
        nd.alpha = Math.min(nd.alpha + 0.08, 1);
      }
    }

    simulate();
    drawGraph();
    updateCounter();

    if (rawProgress >= 1) {
      phase = 'settling';
      phaseStart = timestamp;
    }
  }

  if (phase === 'settling') {
    // Let simulation settle for 2s then show chat
    for (const nd of graph.nodes) {
      if (nd.alpha < 1) nd.alpha = Math.min(nd.alpha + 0.05, 1);
    }
    simulate();
    drawGraph();
    updateCounter();

    if (elapsed > 2000) {
      phase = 'done';
      phaseStart = timestamp;
      document.getElementById('onto-chat')!.classList.add('visible');
      startChatDemo(timestamp);
    }
  }

  if (phase === 'done') {
    // Keep rendering for hover effects etc
    simulate();
    drawGraph();
    tickChat(timestamp);
  }

  rafId = requestAnimationFrame(tick);
}

// ── Chat demo ────────────────────────────────────────────────────────────────

function startChatDemo(timestamp: number) {
  chatMsgIdx = 0;
  chatTypingStart = timestamp + 1000; // 1s before first message
}

function tickChat(timestamp: number) {
  const chatBody = document.getElementById('onto-chat-body');
  if (!chatBody) return;

  if (chatMsgIdx >= chatMessages.length) return;

  const msgDelay = chatMsgIdx === 0 ? 1000 : 2500;
  if (timestamp > chatTypingStart + msgDelay * chatMsgIdx) {
    const msg = chatMessages[chatMsgIdx];
    const div = document.createElement('div');
    div.className = `chat-msg chat-${msg.role}`;
    div.innerHTML = `<span class="chat-role">${msg.role === 'user' ? 'You' : '🏔️ Nekaise'}</span>${msg.text}`;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    chatMsgIdx++;
  }
}

// ── Initialization ───────────────────────────────────────────────────────────

export function initOntologySpawn(): void {
  // Build file list
  const fileList = document.getElementById('onto-file-list');
  if (!fileList) return;

  fakeFiles.forEach((f, i) => {
    const li = document.createElement('li');
    li.id = `file-${i}`;
    li.innerHTML = `<span class="file-icon">${f.icon}</span><span class="file-name">${f.name}</span><span class="file-size">${f.size}</span><span class="file-check">✓</span>`;
    fileList.appendChild(li);
  });

  // Spawn button
  const btn = document.getElementById('onto-spawn-btn');
  btn?.addEventListener('click', () => {
    if (phase !== 'idle') return;
    btn.classList.add('disabled');

    // Init graph
    graph = buildGraph();
    canvas = document.getElementById('onto-canvas') as HTMLCanvasElement;
    ctx = canvas.getContext('2d')!;
    dpr = window.devicePixelRatio || 1;
    resizeCanvas();

    assignPositions();
    spawnOrder = buildSpawnOrder();
    fileCheckIdx = 0;
    chatMsgIdx = 0;

    phase = 'processing';
    phaseStart = performance.now();
    rafId = requestAnimationFrame(tick);
  });

  // Pan: mouse drag
  const canvasEl = document.getElementById('onto-canvas')!;
  canvasEl.addEventListener('mousedown', (e) => {
    isPanning = true;
    panStartX = e.clientX - panX;
    panStartY = e.clientY - panY;
    canvasEl.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = e.clientX - panStartX;
    panY = e.clientY - panStartY;
  });
  window.addEventListener('mouseup', () => {
    isPanning = false;
    canvasEl.style.cursor = 'grab';
  });

  // Pan: touch drag
  canvasEl.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    isPanning = true;
    panStartX = e.touches[0].clientX - panX;
    panStartY = e.touches[0].clientY - panY;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!isPanning || e.touches.length !== 1) return;
    panX = e.touches[0].clientX - panStartX;
    panY = e.touches[0].clientY - panStartY;
  });
  window.addEventListener('touchend', () => {
    isPanning = false;
  });

  // Reset button
  document.getElementById('onto-reset-btn')?.addEventListener('click', () => {
    cancelAnimationFrame(rafId);
    phase = 'idle';
    panX = 0;
    panY = 0;

    // Reset file checks
    fakeFiles.forEach((_, i) => {
      document.getElementById(`file-${i}`)?.classList.remove('checked');
    });

    // Reset visibility
    document.getElementById('onto-files')!.classList.remove('minimized');
    document.getElementById('onto-canvas-wrap')!.classList.remove('visible');
    document.getElementById('onto-chat')!.classList.remove('visible');
    document.getElementById('onto-spawn-btn')!.classList.remove('disabled');
    document.getElementById('onto-counter')!.textContent = '';

    // Clear chat
    const chatBody = document.getElementById('onto-chat-body');
    if (chatBody) chatBody.innerHTML = '';

    // Clear canvas
    if (canvas && ctx) {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
    }
  });

  window.addEventListener('resize', () => {
    if (canvas) resizeCanvas();
  });
}

function resizeCanvas() {
  const wrap = document.getElementById('onto-canvas-wrap')!;
  const rect = wrap.getBoundingClientRect();
  const w = rect.width;
  const h = Math.max(550, Math.min(850, window.innerHeight * 0.8));
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  centerX = w / 2;
  centerY = h / 2;

  if (graph) assignPositions();
}
