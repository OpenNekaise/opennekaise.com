import { getLang, onLangChange, type Lang } from './i18n';

// ── Conversation data ────────────────────────────────────────────────────────

type Msg = { delay: number; role: string; label: string; text: string };

const conversations: Record<Lang, Msg[]> = {
  en: [
    { delay: 0, role: 'user', label: 'Facility Manager', text: 'The heating feels uneven — some floors too warm, others too cold. What\'s going on?' },
    { delay: 7000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'VS2 supply temp is 45°C as expected, but distribution sensors GX74–GX77 show a 6°C spread across floors. Control valve SV2 is oscillating — likely a stuck actuator. I\'d recommend checking SV2 on site.' },
    { delay: 11000, role: 'user', label: 'Facility Manager', text: 'What about the heat pump — is it running efficiently?' },
    { delay: 18000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'VP2 COP is at 3.1 — within normal range. KB2-P1 brine pump running at 58%, GT42 return temp stable at 35°C. The heat pump side looks healthy. Your issue is downstream in the distribution.' },
  ],
  zh: [
    { delay: 0, role: 'user', label: '设施经理', text: '建筑供暖不均匀——有些楼层太热，有些太冷。怎么回事？' },
    { delay: 7000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'VS2 供水温度 45°C 正常，但分布传感器 GX74–GX77 显示楼层间温差 6°C。控制阀 SV2 在振荡——可能是执行器卡住。建议现场检查 SV2。' },
    { delay: 11000, role: 'user', label: '设施经理', text: '热泵运行效率如何？' },
    { delay: 18000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'VP2 COP 为 3.1——在正常范围内。KB2-P1 盐水泵运行在 58%，GT42 回水温度稳定在 35°C。热泵侧运行正常，问题在下游分配系统。' },
  ],
  sv: [
    { delay: 0, role: 'user', label: 'Fastighetsförvaltare', text: 'Uppvärmningen känns ojämn — vissa våningar för varma, andra kalla. Vad händer?' },
    { delay: 7000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'VS2 framledning är 45°C som förväntat, men distributionssensorerna GX74–GX77 visar 6°C spridning. Styrventilen SV2 oscillerar — troligen fastnat ställdon. Kontrollera SV2 på plats.' },
    { delay: 11000, role: 'user', label: 'Fastighetsförvaltare', text: 'Hur är det med värmepumpen — kör den effektivt?' },
    { delay: 18000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'VP2 COP ligger på 3.1 — normalt. KB2-P1 köldbärarpump kör på 58%, GT42 returtemp stabil på 35°C. Värmepumpsidan ser bra ut. Problemet är nedströms.' },
  ],
};

// When particles flow inward (absorption windows)
const absorptionWindows = [
  { start: 1000, end: 6000 },    // After first question
  { start: 12000, end: 17000 },   // After second question
];

// ── Graph nodes (representative ontology excerpt) ────────────────────────────

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

// ── Particle system ──────────────────────────────────────────────────────────

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

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let nodes: NodePos[] = [];
let particles: Particle[] = [];
let centerX = 0;
let centerY = 0;
let absorbing = false;
let agentGlow = 0;
let rafId = 0;
let flowGen = 0;
let flowStarted = false;
let demoTime = 0;
let demoStart = 0;
let canvasW = 0;
let canvasH = 0;

function layoutNodes() {
  const w = canvasW;
  const h = canvasH;
  centerX = w / 2;
  centerY = h / 2;

  const rx = Math.min(w * 0.40, 260);
  const ry = Math.min(h * 0.38, 150);

  nodes = graphNodes.map((node, i) => {
    const angle = (i / graphNodes.length) * Math.PI * 2 - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * rx,
      y: centerY + Math.sin(angle) * ry,
      label: node.label,
      type: node.type,
      baseAlpha: 0.5 + Math.random() * 0.3,
    };
  });
}

function spawnParticle() {
  const idx = Math.floor(Math.random() * nodes.length);
  const node = nodes[idx];
  const midX = (node.x + centerX) / 2;
  const midY = (node.y + centerY) / 2;
  const perpX = -(node.y - centerY);
  const perpY = node.x - centerX;
  const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
  const offset = (Math.random() - 0.5) * 80;

  particles.push({
    nodeIdx: idx,
    progress: 0,
    speed: 0.006 + Math.random() * 0.009,
    cx: midX + (perpX / len) * offset,
    cy: midY + (perpY / len) * offset,
  });
}

function bezier(t: number, a: number, b: number, c: number): number {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
}

function draw() {
  const w = canvasW;
  const h = canvasH;
  ctx.clearRect(0, 0, w, h);

  // Subtle connection lines
  for (const node of nodes) {
    ctx.strokeStyle = absorbing ? 'rgba(78, 205, 196, 0.08)' : 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();
  }

  // Node dots and labels
  for (const node of nodes) {
    const color = typeColors[node.type] || '#808080';
    const nodeAlpha = absorbing ? 0.9 : node.baseAlpha;

    // Glow when absorbing
    if (absorbing) {
      const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12);
      g.addColorStop(0, `rgba(78, 205, 196, 0.15)`);
      g.addColorStop(1, 'rgba(78, 205, 196, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = nodeAlpha;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#505050';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = node.y < centerY ? 'bottom' : 'top';
    const ly = node.y < centerY ? node.y - 8 : node.y + 8;
    ctx.globalAlpha = absorbing ? 0.7 : 0.4;
    ctx.fillText(node.label, node.x, ly);
    ctx.globalAlpha = 1;
  }

  // Agent center glow
  if (agentGlow > 0) {
    const g = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50 + agentGlow * 20);
    g.addColorStop(0, `rgba(78, 205, 196, ${agentGlow * 0.25})`);
    g.addColorStop(0.5, `rgba(78, 205, 196, ${agentGlow * 0.08})`);
    g.addColorStop(1, 'rgba(78, 205, 196, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
    ctx.fill();
  }

  // Agent icon
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏔️', centerX, centerY - 6);

  ctx.font = '10px monospace';
  ctx.fillStyle = agentGlow > 0.3 ? '#ffffff' : '#a0a0a0';
  ctx.fillText('Nekaise Agent', centerX, centerY + 18);

  // Particles
  for (const p of particles) {
    const node = nodes[p.nodeIdx];
    const px = bezier(p.progress, node.x, p.cx, centerX);
    const py = bezier(p.progress, node.y, p.cy, centerY);

    // Trail glow
    const tg = ctx.createRadialGradient(px, py, 0, px, py, 6);
    tg.addColorStop(0, `rgba(78, 205, 196, ${0.7 * (1 - p.progress * 0.3)})`);
    tg.addColorStop(1, 'rgba(78, 205, 196, 0)');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  // Update state
  if (absorbing) {
    // Spawn ~2-3 particles per frame when absorbing
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

function resizeCanvas() {
  const wrap = canvas.parentElement!;
  const w = wrap.clientWidth;
  const h = 340;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvasW = w;
  canvasH = h;
  layoutNodes();
}

// ── Chat ─────────────────────────────────────────────────────────────────────

function addMsg(body: HTMLElement, msg: Msg) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-${msg.role}`;
  div.innerHTML = `<span class="chat-role">${msg.label}</span>${msg.text}`;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

// ── Demo flow ────────────────────────────────────────────────────────────────

function startFlow() {
  const gen = ++flowGen;
  const body = document.getElementById('agent-chat-body')!;
  body.innerHTML = '';
  absorbing = false;
  agentGlow = 0;
  particles = [];
  demoStart = performance.now();
  demoTime = 0;

  const msgs = conversations[getLang()];

  // First message immediately
  addMsg(body, msgs[0]);

  // Rest timed
  for (let i = 1; i < msgs.length; i++) {
    const msg = msgs[i];
    setTimeout(() => {
      if (flowGen !== gen) return;
      addMsg(body, msg);
    }, msg.delay);
  }

  // Absorption control via polling (simpler than many timeouts)
  const tick = () => {
    if (flowGen !== gen) return;
    demoTime = performance.now() - demoStart;
    absorbing = absorptionWindows.some((w) => demoTime >= w.start && demoTime <= w.end);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── Init & activate ──────────────────────────────────────────────────────────

export function initAgentDemo(): void {
  canvas = document.getElementById('agent-canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d')!;

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Reset button
  document.getElementById('agent-reset-btn')?.addEventListener('click', () => {
    flowStarted = false;
    requestAnimationFrame(() => {
      flowStarted = true;
      startFlow();
    });
  });

  // Language change
  onLangChange(() => {
    if (flowStarted) startFlow();
  });
}

export function activateAgentDemo(): void {
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
