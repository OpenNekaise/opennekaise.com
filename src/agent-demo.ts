import { getLang, onLangChange, type Lang } from './i18n';

// ── Conversation data (shorter for canvas rendering) ─────────────────────────

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

// Absorption windows — when particles flow from graph to agent
const absorptionWindows = [
  { start: 1000, end: 6000 },
  { start: 12000, end: 17000 },
];

// ── Graph nodes ──────────────────────────────────────────────────────────────

const graphNodes = [
  { label: 'Axelsdgården 42', type: 'building' },
  { label: 'VS2 Heating', type: 'system' },
  { label: 'VP2 Heat Pump', type: 'system' },
  { label: 'VV2 Hot Water', type: 'system' },
  { label: 'LB04 AHU', type: 'system' },
  { label: 'KB2 Brine', type: 'system' },
  { label: 'Garage Vent.', type: 'system' },
  { label: 'GT41 Supply', type: 'sensor' },
  { label: 'GT42 Return', type: 'sensor' },
  { label: 'GX74 Dist.', type: 'sensor' },
  { label: 'SV2 Valve', type: 'actor' },
  { label: 'VP2-EL Meter', type: 'sensor' },
  { label: 'VVC Circ.', type: 'system' },
  { label: 'Metering', type: 'system' },
];

const typeColors: Record<string, string> = {
  building: '#ffffff',
  system: '#4ecdc4',
  sensor: '#ffa546',
  actor: '#ff6b6b',
};

// ── State ────────────────────────────────────────────────────────────────────

interface NodePos {
  x: number;
  y: number;
  label: string;
  type: string;
  baseAlpha: number;
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
  alpha: number; // fade-in
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let nodes: NodePos[] = [];
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
let canvasW = 0;
let canvasH = 0;

// ── Layout ───────────────────────────────────────────────────────────────────

function layoutNodes() {
  const w = canvasW;
  const h = canvasH;

  // Agent position — right of center
  agentX = w * 0.52;
  agentY = h * 0.13;

  // Graph nodes — vertical arc on the left
  const leftX = w * 0.16;
  const marginY = h * 0.06;
  const spanY = h - marginY * 2;

  nodes = graphNodes.map((node, i) => {
    const t = i / (graphNodes.length - 1);
    const y = marginY + t * spanY;
    // Slight inward arc
    const arc = Math.sin(t * Math.PI) * w * 0.06;
    return {
      x: leftX + arc,
      y,
      label: node.label,
      type: node.type,
      baseAlpha: 0.5 + Math.random() * 0.3,
    };
  });
}

// ── Particle helpers ─────────────────────────────────────────────────────────

function spawnParticle() {
  const idx = Math.floor(Math.random() * nodes.length);
  const node = nodes[idx];
  const midX = (node.x + agentX) / 2;
  const midY = (node.y + agentY) / 2;
  const perpX = -(node.y - agentY);
  const perpY = node.x - agentX;
  const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
  const offset = (Math.random() - 0.5) * 60;

  particles.push({
    nodeIdx: idx,
    progress: 0,
    speed: 0.005 + Math.random() * 0.008,
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
  const w = canvasW;
  const h = canvasH;
  ctx.clearRect(0, 0, w, h);

  // Connection lines from nodes to agent
  for (const node of nodes) {
    ctx.strokeStyle = absorbing ? 'rgba(78, 205, 196, 0.06)' : 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(agentX, agentY);
    ctx.stroke();
  }

  // Graph nodes (left side)
  for (const node of nodes) {
    const color = typeColors[node.type] || '#808080';
    const nodeAlpha = absorbing ? 0.9 : node.baseAlpha;

    if (absorbing) {
      const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 10);
      g.addColorStop(0, 'rgba(78, 205, 196, 0.12)');
      g.addColorStop(1, 'rgba(78, 205, 196, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = nodeAlpha;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Label to the left of node
    ctx.fillStyle = '#505050';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = absorbing ? 0.7 : 0.35;
    ctx.fillText(node.label, node.x - 8, node.y);
    ctx.globalAlpha = 1;
  }

  // Agent glow
  if (agentGlow > 0) {
    const g = ctx.createRadialGradient(agentX, agentY, 0, agentX, agentY, 45 + agentGlow * 15);
    g.addColorStop(0, `rgba(78, 205, 196, ${agentGlow * 0.3})`);
    g.addColorStop(0.6, `rgba(78, 205, 196, ${agentGlow * 0.06})`);
    g.addColorStop(1, 'rgba(78, 205, 196, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(agentX, agentY, 60, 0, Math.PI * 2);
    ctx.fill();
  }

  // Agent icon
  ctx.font = '24px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏔️', agentX, agentY - 4);

  ctx.font = '10px monospace';
  ctx.fillStyle = agentGlow > 0.3 ? '#ffffff' : '#a0a0a0';
  ctx.textAlign = 'center';
  ctx.fillText('Nekaise Agent', agentX, agentY + 16);

  // Particles
  for (const p of particles) {
    const node = nodes[p.nodeIdx];
    const px = bezier(p.progress, node.x, p.cx, agentX);
    const py = bezier(p.progress, node.y, p.cy, agentY);

    const tg = ctx.createRadialGradient(px, py, 0, px, py, 5);
    tg.addColorStop(0, `rgba(78, 205, 196, ${0.7 * (1 - p.progress * 0.3)})`);
    tg.addColorStop(1, 'rgba(78, 205, 196, 0)');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  // Chat messages on the right side
  const conv = conversations[getLang()];
  const chatX = agentX - (canvasW * 0.18);
  const chatMaxW = canvasW * 0.42;
  let chatY = agentY + 36;
  const lineH = 14;

  ctx.font = '10px monospace';

  for (const msg of visibleMsgs) {
    // Fade in
    msg.alpha = Math.min(msg.alpha + 0.03, 1);
    ctx.globalAlpha = msg.alpha;

    const isUser = msg.role === 'user';
    const label = isUser ? conv.userLabel : conv.agentLabel;

    // Role label
    ctx.fillStyle = isUser ? '#606060' : '#4ecdc4';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, chatX, chatY);
    chatY += lineH + 1;

    // Message text (wrapped)
    ctx.fillStyle = isUser ? '#909090' : '#d0d0d0';
    ctx.font = '10px monospace';
    const lines = wrapText(msg.text, chatMaxW);
    for (const line of lines) {
      ctx.fillText(line, chatX, chatY);
      chatY += lineH;
    }

    chatY += 10; // gap between messages
    ctx.globalAlpha = 1;
  }

  // Update particles & glow
  if (absorbing) {
    if (Math.random() < 0.35) spawnParticle();
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
  const h = 480;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvasW = w;
  canvasH = h;
  layoutNodes();
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

  // First message instantly
  visibleMsgs.push({ role: msgs[0].role, text: msgs[0].text, alpha: 0 });

  // Rest timed
  for (let i = 1; i < msgs.length; i++) {
    const msg = msgs[i];
    setTimeout(() => {
      if (flowGen !== gen) return;
      visibleMsgs.push({ role: msg.role, text: msg.text, alpha: 0 });
    }, msg.delay);
  }

  // Absorption ticker
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
