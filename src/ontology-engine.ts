// ── Types ──────────────────────────────────────────────────────────────────────

export interface SystemDef {
  label: string;
  children?: string[];
  actors?: string[];
}

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
  depth: number;
  isNew: boolean;
}

interface GEdge {
  source: number;
  target: number;
}

export interface DemoConfig {
  systems: Record<string, SystemDef>;
  files: { name: string; size: string; icon: string }[];
  chatMessages: { role: 'user' | 'agent'; text: string }[];
  newRootChildren?: string[];
  elements: {
    files: string;
    fileList: string;
    actionBtn: string;
    canvasWrap: string;
    canvas: string;
    counter: string;
    chat: string;
    chatBody: string;
    resetBtn: string;
  };
}

// ── Colors ────────────────────────────────────────────────────────────────────

const SET_RGB = '78, 205, 196';
const ACTOR_RGB = '255, 165, 70';

// ── Demo Class ────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'processing' | 'spawning' | 'settling' | 'done';

export class OntologyDemo {
  private config: DemoConfig;
  private phase: Phase = 'idle';
  private phaseStart = 0;
  private graph!: { nodes: GNode[]; edges: GEdge[] };
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private dpr = 1;
  private centerX = 0;
  private centerY = 0;
  private spawnOrder: number[] = [];
  private fileCheckIdx = 0;
  private chatMsgIdx = 0;
  private chatTypingStart = 0;
  private rafId = 0;
  private panX = 0;
  private panY = 0;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private activated = false;
  private isUpdateMode: boolean;
  private newNodeIds: Set<string>;
  private idleRafId = 0;

  constructor(config: DemoConfig) {
    this.config = config;
    this.isUpdateMode = !!config.newRootChildren?.length;
    this.newNodeIds = this.isUpdateMode ? this.computeNewNodeIds() : new Set();
  }

  private computeNewNodeIds(): Set<string> {
    const ids = new Set<string>();
    const { systems, newRootChildren } = this.config;
    if (!newRootChildren) return ids;
    for (const key of newRootChildren) {
      ids.add(key);
      const sys = systems[key];
      if (sys?.children) {
        for (const child of sys.children) {
          ids.add(child);
          if (systems[child]?.actors) {
            for (const a of systems[child].actors!) ids.add(a);
          }
        }
      }
      if (sys?.actors) {
        for (const a of sys.actors) ids.add(a);
      }
    }
    return ids;
  }

  // ── Graph Building ────────────────────────────────────────────────────────

  private buildGraph(): { nodes: GNode[]; edges: GEdge[] } {
    const { systems } = this.config;
    const nodes: GNode[] = [];
    const edges: GEdge[] = [];
    const idxMap = new Map<string, number>();

    const addNode = (id: string, label: string, type: 'set' | 'actor', parent: string | null, depth: number) => {
      const idx = nodes.length;
      idxMap.set(id, idx);
      const isNew = this.newNodeIds.has(id);
      nodes.push({ id, label, type, parent, x: 0, y: 0, vx: 0, vy: 0, spawned: false, alpha: 0, depth, isNew });
      if (parent !== null) {
        const pi = idxMap.get(parent);
        if (pi !== undefined) edges.push({ source: pi, target: idx });
      }
    };

    addNode('root', systems.root.label, 'set', null, 0);
    for (const childId of systems.root.children!) {
      addNode(childId, systems[childId].label, 'set', 'root', 1);
    }
    if (systems.root.actors) {
      for (const a of systems.root.actors) {
        addNode(a, a, 'actor', 'root', 3);
      }
    }
    for (const sysId of systems.root.children!) {
      const sys = systems[sysId];
      if (sys.children) {
        for (const subId of sys.children) {
          addNode(subId, systems[subId].label, 'set', sysId, 2);
          if (systems[subId]?.actors) {
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

  // ── Layout ──────────────────────────────────────────────────────────────────

  private assignPositions(): void {
    const n = this.graph.nodes;
    n[0].x = this.centerX;
    n[0].y = this.centerY;

    const mainSystems = n.filter((nd) => nd.depth === 1);
    const r1 = Math.min(this.centerX, this.centerY) * 0.9;
    mainSystems.forEach((nd, i) => {
      const angle = (i / mainSystems.length) * Math.PI * 2 - Math.PI / 2;
      nd.x = this.centerX + Math.cos(angle) * r1;
      nd.y = this.centerY + Math.sin(angle) * r1;
    });

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

    const actors = n.filter((nd) => nd.depth === 3);
    actors.forEach((nd) => {
      const parentNode = n.find((p) => p.id === nd.parent)!;
      const angle = Math.random() * Math.PI * 2;
      const r3 = 40 + Math.random() * 50;
      nd.x = parentNode.x + Math.cos(angle) * r3;
      nd.y = parentNode.y + Math.sin(angle) * r3;
    });
  }

  private buildSpawnOrder(): number[] {
    const order: number[] = [];
    for (let d = 0; d <= 3; d++) {
      this.graph.nodes.forEach((nd, i) => {
        if (nd.depth === d && !nd.spawned) order.push(i);
      });
    }
    return order;
  }

  // ── Simulation ──────────────────────────────────────────────────────────────

  private simulate(): void {
    const { nodes, edges } = this.graph;

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

    for (let i = 0; i < nodes.length; i++) {
      if (!nodes[i].spawned) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        if (!nodes[j].spawned) continue;
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > 40000) continue;
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

    for (const nd of nodes) {
      if (!nd.spawned) continue;
      nd.x += nd.vx;
      nd.y += nd.vy;
      nd.vx *= 0.9;
      nd.vy *= 0.9;
    }
  }

  // ── Rendering ───────────────────────────────────────────────────────────────

  private drawGraph(): void {
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    this.ctx.clearRect(0, 0, w, h);

    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);

    for (const e of this.graph.edges) {
      const a = this.graph.nodes[e.source];
      const b = this.graph.nodes[e.target];
      if (!a.spawned || !b.spawned) continue;
      const alpha = Math.min(a.alpha, b.alpha);
      if (alpha <= 0) continue;
      this.ctx.beginPath();
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 * alpha})`;
      this.ctx.lineWidth = 1;
      this.ctx.moveTo(a.x, a.y);
      this.ctx.lineTo(b.x, b.y);
      this.ctx.stroke();
    }

    for (const nd of this.graph.nodes) {
      if (!nd.spawned || nd.alpha <= 0) continue;

      const isSet = nd.type === 'set';
      const radius = nd.depth === 0 ? 20 : nd.depth === 1 ? 14 : nd.depth === 2 ? 9 : 5;
      const rgb = isSet ? SET_RGB : ACTOR_RGB;

      this.ctx.beginPath();
      this.ctx.arc(nd.x, nd.y, radius + 6, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${rgb}, ${0.12 * nd.alpha})`;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(nd.x, nd.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${rgb}, ${nd.alpha * 0.9})`;
      this.ctx.fill();

      if (isSet && nd.depth <= 1 && nd.alpha > 0.5) {
        this.ctx.font = nd.depth === 0 ? 'bold 14px monospace' : '11px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = `rgba(255, 255, 255, ${nd.alpha * 0.95})`;
        this.ctx.fillText(nd.label, nd.x, nd.y - radius - 8);
      }
    }

    this.ctx.restore();
  }

  private updateCounter(): void {
    const el = document.getElementById(this.config.elements.counter);
    if (!el) return;
    const spawned = this.graph.nodes.filter((n) => n.spawned).length;
    const sets = this.graph.nodes.filter((n) => n.spawned && n.type === 'set').length;
    const actors = this.graph.nodes.filter((n) => n.spawned && n.type === 'actor').length;
    const edgesShown = this.graph.edges.filter((e) => this.graph.nodes[e.source].spawned && this.graph.nodes[e.target].spawned).length;
    el.textContent = `${sets} sets · ${actors} actors · ${edgesShown} edges`;
    el.style.opacity = spawned > 0 ? '1' : '0';
  }

  // ── Main Loop ───────────────────────────────────────────────────────────────

  private tick = (timestamp: number): void => {
    if (this.phase === 'idle') {
      if (this.isUpdateMode && this.activated) {
        this.drawGraph();
        this.idleRafId = requestAnimationFrame(this.tick);
      }
      return;
    }

    const elapsed = timestamp - this.phaseStart;

    if (this.phase === 'processing') {
      const newIdx = Math.min(Math.floor(elapsed / 250), this.config.files.length);
      while (this.fileCheckIdx < newIdx) {
        const el = document.getElementById(`${this.config.elements.fileList}-${this.fileCheckIdx}`);
        if (el) el.classList.add('checked');
        this.fileCheckIdx++;
      }
      if (this.fileCheckIdx >= this.config.files.length && elapsed > this.config.files.length * 250 + 400) {
        this.phase = 'spawning';
        this.phaseStart = timestamp;
        document.getElementById(this.config.elements.files)?.classList.add('minimized');
        if (!this.isUpdateMode) {
          document.getElementById(this.config.elements.canvasWrap)!.classList.add('visible');
        }
      }
    }

    if (this.phase === 'spawning') {
      const totalNodes = this.spawnOrder.length;
      const duration = this.isUpdateMode ? 5000 : 10000;
      const rawProgress = Math.min(elapsed / duration, 1);
      const progress = rawProgress * rawProgress * rawProgress;
      const targetSpawned = Math.floor(progress * totalNodes);

      for (let i = 0; i < targetSpawned && i < this.spawnOrder.length; i++) {
        const ni = this.spawnOrder[i];
        if (!this.graph.nodes[ni].spawned) {
          this.graph.nodes[ni].spawned = true;
        }
      }

      for (const nd of this.graph.nodes) {
        if (nd.spawned && nd.alpha < 1) {
          nd.alpha = Math.min(nd.alpha + 0.08, 1);
        }
      }

      this.simulate();
      this.drawGraph();
      this.updateCounter();

      if (rawProgress >= 1) {
        this.phase = 'settling';
        this.phaseStart = timestamp;
      }
    }

    if (this.phase === 'settling') {
      for (const nd of this.graph.nodes) {
        if (nd.alpha < 1) nd.alpha = Math.min(nd.alpha + 0.05, 1);
      }
      this.simulate();
      this.drawGraph();
      this.updateCounter();

      if (elapsed > 2000) {
        this.phase = 'done';
        this.phaseStart = timestamp;
        document.getElementById(this.config.elements.chat)!.classList.add('visible');
        this.startChatDemo(timestamp);
      }
    }

    if (this.phase === 'done') {
      this.simulate();
      this.drawGraph();
      this.tickChat(timestamp);
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  // ── Chat ────────────────────────────────────────────────────────────────────

  private startChatDemo(timestamp: number): void {
    this.chatMsgIdx = 0;
    this.chatTypingStart = timestamp + 1000;
  }

  private tickChat(timestamp: number): void {
    const chatBody = document.getElementById(this.config.elements.chatBody);
    if (!chatBody) return;
    if (this.chatMsgIdx >= this.config.chatMessages.length) return;

    const msgDelay = this.chatMsgIdx === 0 ? 1000 : 2500;
    if (timestamp > this.chatTypingStart + msgDelay * this.chatMsgIdx) {
      const msg = this.config.chatMessages[this.chatMsgIdx];
      const div = document.createElement('div');
      div.className = `chat-msg chat-${msg.role}`;
      div.innerHTML = `<span class="chat-role">${msg.role === 'user' ? 'You' : '🏔️ Nekaise Agent'}</span>${msg.text}`;
      chatBody.appendChild(div);
      chatBody.scrollTop = chatBody.scrollHeight;
      this.chatMsgIdx++;
    }
  }

  // ── Canvas Setup ────────────────────────────────────────────────────────────

  private initCanvas(): void {
    this.canvas = document.getElementById(this.config.elements.canvas) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const wrap = document.getElementById(this.config.elements.canvasWrap)!;
    const rect = wrap.getBoundingClientRect();
    const w = rect.width;
    const h = Math.max(550, Math.min(850, window.innerHeight * 0.8));
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.centerX = w / 2;
    this.centerY = h / 2;

    if (this.graph) this.assignPositions();
  }

  // ── Public Methods ──────────────────────────────────────────────────────────

  init(): void {
    const { elements, files } = this.config;
    const fileList = document.getElementById(elements.fileList);

    if (fileList) {
      files.forEach((f, i) => {
        const li = document.createElement('li');
        li.id = `${elements.fileList}-${i}`;
        li.innerHTML = `<span class="file-icon">${f.icon}</span><span class="file-name">${f.name}</span><span class="file-size">${f.size}</span><span class="file-check">✓</span>`;
        fileList.appendChild(li);
      });
    }

    const btn = document.getElementById(elements.actionBtn);
    btn?.addEventListener('click', () => this.start());

    // Pan: mouse
    const canvasEl = document.getElementById(elements.canvas)!;
    canvasEl.addEventListener('mousedown', (e) => {
      this.isPanning = true;
      this.panStartX = e.clientX - this.panX;
      this.panStartY = e.clientY - this.panY;
      canvasEl.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.isPanning) return;
      this.panX = e.clientX - this.panStartX;
      this.panY = e.clientY - this.panStartY;
    });
    window.addEventListener('mouseup', () => {
      if (!this.isPanning) return;
      this.isPanning = false;
      canvasEl.style.cursor = 'grab';
    });

    // Pan: touch
    canvasEl.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      this.isPanning = true;
      this.panStartX = e.touches[0].clientX - this.panX;
      this.panStartY = e.touches[0].clientY - this.panY;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!this.isPanning || e.touches.length !== 1) return;
      this.panX = e.touches[0].clientX - this.panStartX;
      this.panY = e.touches[0].clientY - this.panStartY;
    });
    window.addEventListener('touchend', () => {
      this.isPanning = false;
    });

    // Reset
    document.getElementById(elements.resetBtn)?.addEventListener('click', () => {
      this.reset();
    });

    window.addEventListener('resize', () => {
      if (this.canvas) this.resizeCanvas();
    });
  }

  activate(): void {
    if (this.activated) return;
    this.activated = true;

    if (!this.isUpdateMode) return;

    this.graph = this.buildGraph();
    this.initCanvas();
    this.assignPositions();

    // Pre-spawn all base (non-new) nodes
    for (const nd of this.graph.nodes) {
      if (!nd.isNew) {
        nd.spawned = true;
        nd.alpha = 1;
      }
    }

    // Settle the layout
    for (let i = 0; i < 150; i++) {
      this.simulate();
    }

    document.getElementById(this.config.elements.canvasWrap)!.classList.add('visible');
    this.drawGraph();
    this.updateCounter();

    // Start idle render loop (for pan responsiveness)
    this.idleRafId = requestAnimationFrame(this.tick);
  }

  start(): void {
    if (this.phase !== 'idle') return;
    document.getElementById(this.config.elements.actionBtn)?.classList.add('disabled');

    if (!this.isUpdateMode) {
      this.graph = this.buildGraph();
      this.initCanvas();
      this.assignPositions();
    }

    this.spawnOrder = this.buildSpawnOrder();
    this.fileCheckIdx = 0;
    this.chatMsgIdx = 0;

    this.phase = 'processing';
    this.phaseStart = performance.now();

    if (this.isUpdateMode) {
      cancelAnimationFrame(this.idleRafId);
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  private reset(): void {
    cancelAnimationFrame(this.rafId);
    cancelAnimationFrame(this.idleRafId);
    this.phase = 'idle';
    this.panX = 0;
    this.panY = 0;

    const { elements, files } = this.config;

    files.forEach((_, i) => {
      document.getElementById(`${elements.fileList}-${i}`)?.classList.remove('checked');
    });

    document.getElementById(elements.files)?.classList.remove('minimized');
    document.getElementById(elements.chat)?.classList.remove('visible');
    document.getElementById(elements.actionBtn)?.classList.remove('disabled');

    const chatBody = document.getElementById(elements.chatBody);
    if (chatBody) chatBody.innerHTML = '';

    if (this.isUpdateMode) {
      // Rebuild graph with base nodes pre-spawned
      this.graph = this.buildGraph();
      this.assignPositions();
      for (const nd of this.graph.nodes) {
        if (!nd.isNew) {
          nd.spawned = true;
          nd.alpha = 1;
        }
      }
      for (let i = 0; i < 150; i++) this.simulate();
      this.drawGraph();
      this.updateCounter();
      this.idleRafId = requestAnimationFrame(this.tick);
    } else {
      document.getElementById(elements.canvasWrap)?.classList.remove('visible');
      const counter = document.getElementById(elements.counter);
      if (counter) counter.textContent = '';
      if (this.canvas && this.ctx) {
        const w = this.canvas.width / this.dpr;
        const h = this.canvas.height / this.dpr;
        this.ctx.clearRect(0, 0, w, h);
      }
    }
  }
}
