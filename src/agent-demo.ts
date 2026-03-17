import { getLang, onLangChange, type Lang } from './i18n';

// ── Conversation data ────────────────────────────────────────────────────────

type Msg = { delay: number; role: 'user' | 'agent'; text: string };

const conversations: Record<Lang, { userLabel: string; agentLabel: string; msgs: Msg[] }> = {
  en: {
    userLabel: 'Facility Manager',
    agentLabel: '🏔️ Nekaise Agent',
    msgs: [
      { delay: 0, role: 'user', text: 'Heating feels uneven — some floors too warm, others cold.' },
      { delay: 7000, role: 'agent', text: 'VS2 supply 45°C ok. Sensors GX74–GX77 show 6°C spread across floors. SV2 valve oscillating — check actuator on site.' },
      { delay: 11000, role: 'user', text: 'Is the heat pump running efficiently?' },
      { delay: 18000, role: 'agent', text: 'VP2 COP 3.1 — normal range. KB2-P1 at 58%. Issue is downstream in distribution, not the pump.' },
    ],
  },
  zh: {
    userLabel: '设施经理',
    agentLabel: '🏔️ Nekaise Agent',
    msgs: [
      { delay: 0, role: 'user', text: '供暖不均匀——有些楼层太热，有些太冷。' },
      { delay: 7000, role: 'agent', text: 'VS2 供水 45°C 正常。传感器 GX74–GX77 显示楼层温差 6°C。SV2 阀振荡——建议现场检查执行器。' },
      { delay: 11000, role: 'user', text: '热泵运行效率如何？' },
      { delay: 18000, role: 'agent', text: 'VP2 COP 3.1——正常范围。KB2-P1 运行 58%。问题在下游分配系统，热泵正常。' },
    ],
  },
  sv: {
    userLabel: 'Fastighetsförvaltare',
    agentLabel: '🏔️ Nekaise Agent',
    msgs: [
      { delay: 0, role: 'user', text: 'Uppvärmningen ojämn — vissa våningar för varma, andra kalla.' },
      { delay: 7000, role: 'agent', text: 'VS2 framledning 45°C ok. Sensorer GX74–GX77 visar 6°C spridning. SV2 ventil oscillerar — kontrollera ställdon på plats.' },
      { delay: 11000, role: 'user', text: 'Kör värmepumpen effektivt?' },
      { delay: 18000, role: 'agent', text: 'VP2 COP 3.1 — normalt. KB2-P1 på 58%. Problemet är nedströms i distributionen, inte pumpen.' },
    ],
  },
};

const absorptionWindows = [
  { start: 1000, end: 6000 },
  { start: 12000, end: 17000 },
];

// ── Graph structure (real ontology hierarchy with edges) ─────────────────────

interface GraphNodeDef {
  id: string;
  label: string;
  type: 'building' | 'system' | 'sensor' | 'actor';
}

interface EdgeDef {
  from: number;
  to: number;
}

const graphNodeDefs: GraphNodeDef[] = [
  { id: 'root', label: 'Axelsdgården 42', type: 'building' },
  { id: 'VS2', label: 'VS2 Heating', type: 'system' },
  { id: 'VP2', label: 'VP2 Heat Pump', type: 'system' },
  { id: 'VV2', label: 'VV2 Hot Water', type: 'system' },
  { id: 'LB04', label: 'LB04 AHU', type: 'system' },
  { id: 'KB2', label: 'KB2 Brine', type: 'system' },
  { id: 'Garage', label: 'Garage Vent.', type: 'system' },
  { id: 'VVC', label: 'VVC Circ.', type: 'system' },
  { id: 'Meter', label: 'Metering', type: 'system' },
  { id: 'GT41', label: 'GT41', type: 'sensor' },
  { id: 'GT42', label: 'GT42', type: 'sensor' },
  { id: 'SV2', label: 'SV2', type: 'actor' },
  { id: 'GX74', label: 'GX74', type: 'sensor' },
  { id: 'VP2EL', label: 'VP2-EL', type: 'sensor' },
  { id: 'KBP1', label: 'KB2-P1', type: 'actor' },
  { id: 'LB04T', label: 'LB04-TF01', type: 'actor' },
  { id: 'FVGT', label: 'FV-GT41', type: 'sensor' },
];

// Build edges from parent-child ontology relationships
function buildEdges(): EdgeDef[] {
  const idx = (id: string) => graphNodeDefs.findIndex((n) => n.id === id);
  const r = idx('root');
  return [
    // root → systems
    { from: r, to: idx('VS2') },
    { from: r, to: idx('VP2') },
    { from: r, to: idx('VV2') },
    { from: r, to: idx('LB04') },
    { from: r, to: idx('KB2') },
    { from: r, to: idx('Garage') },
    { from: r, to: idx('VVC') },
    { from: r, to: idx('Meter') },
    // systems → sensors/actors
    { from: idx('VS2'), to: idx('GT41') },
    { from: idx('VS2'), to: idx('SV2') },
    { from: idx('LB04'), to: idx('GX74') },
    { from: idx('LB04'), to: idx('LB04T') },
    { from: idx('VP2'), to: idx('VP2EL') },
    { from: idx('KB2'), to: idx('GT42') },
    { from: idx('KB2'), to: idx('KBP1') },
    { from: idx('Meter'), to: idx('FVGT') },
  ];
}

const edges = buildEdges();

const typeColors: Record<string, string> = {
  building: '#ffffff',
  system: '#4ecdc4',
  sensor: '#ffa546',
  actor: '#ff6b6b',
};

// ── State ────────────────────────────────────────────────────────────────────

interface GNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  label: string;
  type: string;
  radius: number;
}

interface Particle {
  nodeIdx: number;
  progress: number;
  speed: number;
  cx: number;
  cy: number;
}

interface VisibleMsg {
  role: 'user' | 'agent';
  text: string;
  alpha: number;
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let gNodes: GNode[] = [];
let particles: Particle[] = [];
let visibleMsgs: VisibleMsg[] = [];
let agentX = 0;
let agentY = 0;
let absorbing = false;
let agentGlow = 0;
let rafId = 0;
let flowGen = 0;
let flowStarted = false;
let demoStart = 0;
let W = 0;
let H = 0;

// ── Force-directed graph layout ──────────────────────────────────────────────

function initGraphLayout() {
  const cx = W * 0.18;
  const cy = H * 0.48;

  // Seed positions in a circle
  gNodes = graphNodeDefs.map((def, i) => {
    const angle = (i / graphNodeDefs.length) * Math.PI * 2;
    const r = 80 + Math.random() * 40;
    const isLeaf = def.type === 'sensor' || def.type === 'actor';
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      vx: 0,
      vy: 0,
      label: def.label,
      type: def.type,
      radius: isLeaf ? 3.5 : (def.type === 'building' ? 7 : 5),
    };
  });

  // Pin root near top-center of graph area
  gNodes[0].x = cx;
  gNodes[0].y = cy - 60;

  // Run force simulation
  const REPULSION = 2800;
  const SPRING = 0.06;
  const SPRING_LEN = 55;
  const DAMPING = 0.85;
  const GRAVITY = 0.01;

  for (let iter = 0; iter < 300; iter++) {
    // Repulsion between all pairs
    for (let i = 0; i < gNodes.length; i++) {
      for (let j = i + 1; j < gNodes.length; j++) {
        let dx = gNodes[j].x - gNodes[i].x;
        let dy = gNodes[j].y - gNodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = REPULSION / (dist * dist);
        dx = (dx / dist) * force;
        dy = (dy / dist) * force;
        gNodes[i].vx -= dx;
        gNodes[i].vy -= dy;
        gNodes[j].vx += dx;
        gNodes[j].vy += dy;
      }
    }

    // Spring attraction along edges
    for (const e of edges) {
      const a = gNodes[e.from];
      const b = gNodes[e.to];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - SPRING_LEN) * SPRING;
      dx = (dx / dist) * force;
      dy = (dy / dist) * force;
      a.vx += dx;
      a.vy += dy;
      b.vx -= dx;
      b.vy -= dy;
    }

    // Gravity toward center
    for (const n of gNodes) {
      n.vx += (cx - n.x) * GRAVITY;
      n.vy += (cy - n.y) * GRAVITY;
    }

    // Apply velocity with damping
    for (const n of gNodes) {
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x += n.vx;
      n.y += n.vy;
    }
  }

  // Constrain to left portion of canvas
  const maxX = W * 0.33;
  const minX = 12;
  const minY = 20;
  const maxY = H - 20;
  for (const n of gNodes) {
    n.x = Math.max(minX, Math.min(maxX, n.x));
    n.y = Math.max(minY, Math.min(maxY, n.y));
  }
}

// ── Particle helpers ─────────────────────────────────────────────────────────

function spawnParticle() {
  const idx = Math.floor(Math.random() * gNodes.length);
  const node = gNodes[idx];
  const midX = (node.x + agentX) / 2;
  const midY = (node.y + agentY) / 2;
  const perpX = -(node.y - agentY);
  const perpY = node.x - agentX;
  const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
  const offset = (Math.random() - 0.5) * 70;

  particles.push({
    nodeIdx: idx,
    progress: 0,
    speed: 0.004 + Math.random() * 0.007,
    cx: midX + (perpX / len) * offset,
    cy: midY + (perpY / len) * offset,
  });
}

function bezier(t: number, a: number, b: number, c: number): number {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
}

// ── Text wrapping ────────────────────────────────────────────────────────────

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? cur + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ── Draw ─────────────────────────────────────────────────────────────────────

function draw() {
  ctx.clearRect(0, 0, W, H);

  // ── Graph edges ──
  for (const e of edges) {
    const a = gNodes[e.from];
    const b = gNodes[e.to];
    ctx.strokeStyle = absorbing ? 'rgba(78, 205, 196, 0.18)' : 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // ── Faint lines from graph to agent ──
  for (const n of gNodes) {
    if (!absorbing) continue;
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(n.x, n.y);
    ctx.lineTo(agentX, agentY);
    ctx.stroke();
  }

  // ── Graph nodes ──
  for (const n of gNodes) {
    const color = typeColors[n.type] || '#808080';

    // Absorbing glow per node
    if (absorbing) {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 4);
      g.addColorStop(0, 'rgba(78, 205, 196, 0.15)');
      g.addColorStop(1, 'rgba(78, 205, 196, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = absorbing ? 1 : 0.6;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Label
    ctx.font = n.type === 'building' ? 'bold 11px monospace' : '10px monospace';
    ctx.fillStyle = absorbing ? '#808080' : '#404040';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x + n.radius + 5, n.y);
  }

  // ── Agent glow ──
  if (agentGlow > 0) {
    const g = ctx.createRadialGradient(agentX, agentY, 0, agentX, agentY, 55 + agentGlow * 25);
    g.addColorStop(0, `rgba(78, 205, 196, ${agentGlow * 0.35})`);
    g.addColorStop(0.5, `rgba(78, 205, 196, ${agentGlow * 0.08})`);
    g.addColorStop(1, 'rgba(78, 205, 196, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(agentX, agentY, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Agent icon ──
  ctx.font = '32px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏔️', agentX, agentY - 6);

  ctx.font = '12px monospace';
  ctx.fillStyle = agentGlow > 0.3 ? '#ffffff' : '#a0a0a0';
  ctx.fillText('Nekaise Agent', agentX, agentY + 22);

  // ── Particles ──
  for (const p of particles) {
    const node = gNodes[p.nodeIdx];
    const px = bezier(p.progress, node.x, p.cx, agentX);
    const py = bezier(p.progress, node.y, p.cy, agentY);

    const tg = ctx.createRadialGradient(px, py, 0, px, py, 7);
    tg.addColorStop(0, `rgba(78, 205, 196, ${0.8 * (1 - p.progress * 0.3)})`);
    tg.addColorStop(1, 'rgba(78, 205, 196, 0)');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  // ── Chat messages to the right of agent ──
  const conv = conversations[getLang()];
  const chatX = W * 0.64;
  const chatMaxW = W * 0.32;
  let chatY = H * 0.12;
  const lineH = 16;

  for (const msg of visibleMsgs) {
    msg.alpha = Math.min(msg.alpha + 0.03, 1);
    ctx.globalAlpha = msg.alpha;

    const isUser = msg.role === 'user';

    // Role label
    ctx.fillStyle = isUser ? '#606060' : '#4ecdc4';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(isUser ? conv.userLabel : conv.agentLabel, chatX, chatY);
    chatY += lineH;

    // Wrapped text
    ctx.fillStyle = isUser ? '#909090' : '#d0d0d0';
    ctx.font = '11px monospace';
    const lines = wrapText(msg.text, chatMaxW);
    for (const line of lines) {
      ctx.fillText(line, chatX, chatY);
      chatY += lineH;
    }
    chatY += 12;
    ctx.globalAlpha = 1;
  }

  // ── Update state ──
  if (absorbing) {
    if (Math.random() < 0.4) spawnParticle();
    agentGlow = Math.min(agentGlow + 0.015, 1);
  } else {
    agentGlow = Math.max(agentGlow - 0.01, 0);
  }

  particles = particles.filter((p) => {
    p.progress += p.speed;
    return p.progress < 1;
  });

  rafId = requestAnimationFrame(draw);
}

// ── Canvas sizing ────────────────────────────────────────────────────────────

function resizeCanvas() {
  const wrap = canvas.parentElement!;
  const w = wrap.clientWidth;
  const h = 500;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  W = w;
  H = h;

  // Agent in the middle, vertically centered with graph
  agentX = W * 0.48;
  agentY = H * 0.45;

  initGraphLayout();
}

// ── Demo flow ────────────────────────────────────────────────────────────────

function startFlow() {
  const gen = ++flowGen;
  absorbing = false;
  agentGlow = 0;
  particles = [];
  visibleMsgs = [];
  demoStart = performance.now();

  const msgs = conversations[getLang()].msgs;
  visibleMsgs.push({ role: msgs[0].role, text: msgs[0].text, alpha: 0 });

  for (let i = 1; i < msgs.length; i++) {
    const msg = msgs[i];
    setTimeout(() => {
      if (flowGen !== gen) return;
      visibleMsgs.push({ role: msg.role, text: msg.text, alpha: 0 });
    }, msg.delay);
  }

  const tick = () => {
    if (flowGen !== gen) return;
    const elapsed = performance.now() - demoStart;
    absorbing = absorptionWindows.some((w) => elapsed >= w.start && elapsed <= w.end);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── Public API ───────────────────────────────────────────────────────────────

export function initAgentDemo(): void {
  canvas = document.getElementById('agent-canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d')!;

  window.addEventListener('resize', () => {
    if (flowStarted) resizeCanvas();
  });

  document.getElementById('agent-reset-btn')?.addEventListener('click', () => {
    flowStarted = false;
    requestAnimationFrame(() => {
      flowStarted = true;
      startFlow();
    });
  });

  onLangChange(() => {
    if (flowStarted) startFlow();
  });
}

export function activateAgentDemo(): void {
  resizeCanvas();
  if (!rafId) {
    rafId = requestAnimationFrame(draw);
  }
  if (!flowStarted) {
    flowStarted = true;
    startFlow();
  }
}

export function deactivateAgentDemo(): void {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}
