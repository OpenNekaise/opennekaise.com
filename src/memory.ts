import { getLang, onLangChange, type Lang } from './i18n';

// ── After-conversation demo ───────────────────────────────────────────────────

type Msg = { delay: number; role: string; label: string; text: string };

const convMessagesI18n: Record<Lang, Msg[]> = {
  en: [
    { delay: 0, role: 'user', label: 'Facility Manager', text: 'The COP on VP2 dropped to 2.1 yesterday. We had a technician look at it — turns out the brine pump KB2-P1 was running at 30% instead of 60%. He fixed it on site.' },
    { delay: 2000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'Good catch. VP2 COP at 2.1 with KB2-P1 underperforming at 30% makes sense — reduced brine flow would starve the evaporator. With the pump back at 60%, COP should recover to the 3.0–3.3 range within a few hours.' },
    { delay: 4500, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Conversation turn complete. COP drop and pump fix are confirmed building facts — I should update memory.' },
    { delay: 6500, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Running /update-memory... extracting building facts and decisions from this conversation.' },
  ],
  zh: [
    { delay: 0, role: 'user', label: '设施经理', text: 'VP2 的 COP 昨天降到了 2.1。我们让技术员检查了——发现盐水泵 KB2-P1 以 30% 而非 60% 运行。他已现场修复。' },
    { delay: 2000, role: 'agent', label: '🏔️ Nekaise Agent', text: '好的发现。VP2 COP 2.1 加上 KB2-P1 仅 30% 运行是合理的——减少的盐水流量会导致蒸发器效率下降。泵恢复到 60% 后，COP 应在几小时内恢复到 3.0–3.3 范围。' },
    { delay: 4500, role: 'thinking', label: '🏔️ Nekaise Agent', text: '对话轮次完成。COP 下降和泵修复是确认的建筑事实——我应该更新记忆。' },
    { delay: 6500, role: 'thinking', label: '🏔️ Nekaise Agent', text: '执行 /update-memory... 从对话中提取建筑事实和决策。' },
  ],
  sv: [
    { delay: 0, role: 'user', label: 'Fastighetsförvaltare', text: 'COP på VP2 sjönk till 2.1 igår. Vi lät en tekniker titta på det — det visade sig att köldbärarpumpen KB2-P1 körde på 30% istället för 60%. Han åtgärdade det på plats.' },
    { delay: 2000, role: 'agent', label: '🏔️ Nekaise Agent', text: 'Bra fångst. VP2 COP på 2.1 med KB2-P1 på 30% stämmer — minskat köldbärarflöde svälter förångaren. Med pumpen tillbaka på 60% bör COP återhämta sig till 3.0–3.3 inom några timmar.' },
    { delay: 4500, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Konversationstur klar. COP-fall och pumpfix är bekräftade byggnadsfakta — jag bör uppdatera minnet.' },
    { delay: 6500, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Kör /update-memory... extraherar byggnadsfakta och beslut från denna konversation.' },
  ],
};

const convMemoryBefore = `<span class="memory-heading"># Memory</span>

<span class="memory-date">Last updated: 2026-03-15</span>

<span class="memory-heading">## Building Facts</span>
- VP2 heat pump nominal COP: 3.2 (measured Jan 2026)
- VS2 heating supply setpoint: 45°C at -15°C outdoor
- LB04 supply air curve: 9 breakpoints, +20°C at -10°C outdoor

<span class="memory-heading">## Decisions</span>
- 2026-02-28: Night setback on VS2 approved (22:00–06:00, -3°C)

<span class="memory-heading">## User Preferences</span>
- Facility manager prefers short answers with specific values
- Notify on COP drops below 2.5

<span class="memory-heading">## Open Issues</span>
- LB05 distribution sensors GX74–GX77 showing drift since Feb`;

const convMemoryAfter = `<span class="memory-heading"># Memory</span>

<span class="memory-date">Last updated: 2026-03-17</span>

<span class="memory-heading">## Building Facts</span>
- VP2 heat pump nominal COP: 3.2 (measured Jan 2026)
<span class="memory-new">- VP2 COP dropped to 2.1 on 2026-03-16 — caused by KB2-P1 running at 30%</span>
<span class="memory-new">- KB2-P1 brine pump corrected to 60% on 2026-03-16 (technician on site)</span>
- VS2 heating supply setpoint: 45°C at -15°C outdoor
- LB04 supply air curve: 9 breakpoints, +20°C at -10°C outdoor

<span class="memory-heading">## Decisions</span>
- 2026-02-28: Night setback on VS2 approved (22:00–06:00, -3°C)

<span class="memory-heading">## User Preferences</span>
- Facility manager prefers short answers with specific values
- Notify on COP drops below 2.5

<span class="memory-heading">## Open Issues</span>
- LB05 distribution sensors GX74–GX77 showing drift since Feb
<span class="memory-new">- Monitor VP2 COP recovery after KB2-P1 fix — expect 3.0–3.3</span>`;

// ── Daily sweep demo ─────────────────────────────────────────────────────────

const sweepMessagesI18n: Record<Lang, Msg[]> = {
  en: [
    { delay: 0, role: 'system', label: 'System', text: '<code>cron 0 2 * * *</code> — Scheduled task triggered: MEMORY AND ONTOLOGY SWEEP' },
    { delay: 1500, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Reading today\'s conversation history from messages_history.json... 4 conversations, 12 messages total.' },
    { delay: 3500, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Running /update-memory... Found 3 new building facts, 1 resolved issue. Merging into MEMORY.md.' },
    { delay: 6000, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Confirmed building facts found — also running /update-ontology to update ONTOLOGY.ttl.' },
    { delay: 8500, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Sweep complete. Memory: +3 facts, 1 issue resolved. Ontology: KB2-P1 setpoint updated.' },
  ],
  zh: [
    { delay: 0, role: 'system', label: '系统', text: '<code>cron 0 2 * * *</code> — 定时任务触发：记忆和本体扫描' },
    { delay: 1500, role: 'thinking', label: '🏔️ Nekaise Agent', text: '读取今日对话历史 messages_history.json... 共 4 次对话，12 条消息。' },
    { delay: 3500, role: 'thinking', label: '🏔️ Nekaise Agent', text: '执行 /update-memory... 发现 3 条新建筑事实，1 个已解决问题。合并到 MEMORY.md。' },
    { delay: 6000, role: 'thinking', label: '🏔️ Nekaise Agent', text: '已确认建筑事实——同时执行 /update-ontology 更新 ONTOLOGY.ttl。' },
    { delay: 8500, role: 'thinking', label: '🏔️ Nekaise Agent', text: '扫描完成。记忆：+3 条事实，1 个问题已解决。本体：KB2-P1 设定点已更新。' },
  ],
  sv: [
    { delay: 0, role: 'system', label: 'System', text: '<code>cron 0 2 * * *</code> — Schemalagd uppgift utlöst: MINNES- OCH ONTOLOGISVEP' },
    { delay: 1500, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Läser dagens konversationshistorik från messages_history.json... 4 konversationer, 12 meddelanden totalt.' },
    { delay: 3500, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Kör /update-memory... Hittade 3 nya byggnadsfakta, 1 löst fråga. Slår ihop med MEMORY.md.' },
    { delay: 6000, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Bekräftade byggnadsfakta hittade — kör även /update-ontology för att uppdatera ONTOLOGY.ttl.' },
    { delay: 8500, role: 'thinking', label: '🏔️ Nekaise Agent', text: 'Svep klart. Minne: +3 fakta, 1 fråga löst. Ontologi: KB2-P1 börvärde uppdaterat.' },
  ],
};

const sweepMemoryBefore = `<span class="memory-heading"># Memory</span>

<span class="memory-date">Last updated: 2026-03-16</span>

<span class="memory-heading">## Building Facts</span>
- VP2 heat pump nominal COP: 3.2 (measured Jan 2026)
- VP2 COP dropped to 2.1 on 2026-03-16 — caused by KB2-P1 at 30%
- KB2-P1 brine pump corrected to 60% on 2026-03-16
- VS2 heating supply setpoint: 45°C at -15°C outdoor

<span class="memory-heading">## Open Issues</span>
- LB05 distribution sensors GX74–GX77 showing drift since Feb
- Monitor VP2 COP recovery after KB2-P1 fix — expect 3.0–3.3`;

const sweepMemoryAfter = `<span class="memory-heading"># Memory</span>

<span class="memory-date">Last updated: 2026-03-17</span>

<span class="memory-heading">## Building Facts</span>
- VP2 heat pump nominal COP: 3.2 (measured Jan 2026)
- VP2 COP dropped to 2.1 on 2026-03-16 — caused by KB2-P1 at 30%
- KB2-P1 brine pump corrected to 60% on 2026-03-16
<span class="memory-new">- VP2 COP recovered to 3.1 on 2026-03-17 (confirmed via EL-HP metering)</span>
- VS2 heating supply setpoint: 45°C at -15°C outdoor
<span class="memory-new">- Garage ventilation LB06-GQ51 CO sensor calibrated on 2026-03-17</span>
<span class="memory-new">- VV2 hot water return temp stable at 52°C after SV2 adjustment</span>

<span class="memory-heading">## Open Issues</span>
- LB05 distribution sensors GX74–GX77 showing drift since Feb
<span class="memory-new"><s>- Monitor VP2 COP recovery after KB2-P1 fix — expect 3.0–3.3</s> ✓ Resolved: COP at 3.1</span>`;

// ── Demo runner ──────────────────────────────────────────────────────────────

interface DemoState {
  gen: number;
  started: boolean;
}

const convState: DemoState = { gen: 0, started: false };
const sweepState: DemoState = { gen: 0, started: false };

function addMsg(body: HTMLElement, msg: Msg) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-${msg.role}`;
  div.innerHTML = `<span class="chat-role">${msg.label}</span>${msg.text}`;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function runDemo(
  state: DemoState,
  messages: Msg[],
  bodyId: string,
  fileId: string,
  statusId: string,
  contentId: string,
  memBefore: string,
  memAfter: string,
  memoryShowDelay: number,
  memoryUpdateDelay: number,
) {
  const gen = ++state.gen;
  const body = document.getElementById(bodyId)!;
  const file = document.getElementById(fileId)!;
  const status = document.getElementById(statusId)!;
  const content = document.getElementById(contentId)!;

  body.innerHTML = '';
  file.classList.remove('visible');
  status.textContent = '';
  content.innerHTML = '';

  // First message instant
  addMsg(body, messages[0]);

  // Rest timed
  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    setTimeout(() => {
      if (state.gen !== gen) return;
      addMsg(body, msg);
    }, msg.delay);
  }

  // Show memory file with "before" state
  setTimeout(() => {
    if (state.gen !== gen) return;
    content.innerHTML = memBefore;
    file.classList.add('visible');
    status.textContent = 'current';
  }, memoryShowDelay);

  // Update memory to "after" state
  setTimeout(() => {
    if (state.gen !== gen) return;
    status.textContent = 'updating...';
  }, memoryUpdateDelay);

  setTimeout(() => {
    if (state.gen !== gen) return;
    content.innerHTML = memAfter;
    status.textContent = 'updated ✓';
  }, memoryUpdateDelay + 1500);
}

function startConvDemo() {
  runDemo(
    convState, convMessagesI18n[getLang()],
    'memory-conv-body', 'memory-conv-file', 'memory-conv-status', 'memory-conv-content',
    convMemoryBefore, convMemoryAfter,
    5000, 8000,
  );
}

function startSweepDemo() {
  runDemo(
    sweepState, sweepMessagesI18n[getLang()],
    'memory-sweep-body', 'memory-sweep-file', 'memory-sweep-status', 'memory-sweep-content',
    sweepMemoryBefore, sweepMemoryAfter,
    2500, 7000,
  );
}

// ── Init ─────────────────────────────────────────────────────────────────────

export function initMemory(): void {
  // Sub-tab switching
  document.querySelectorAll<HTMLButtonElement>('.onto-subtab[data-memory-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.memoryTab!;
      document.querySelectorAll('.onto-subtab[data-memory-tab]').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      document.getElementById('memory-conv-panel')!.classList.toggle('hidden', target !== 'conversation');
      document.getElementById('memory-sweep-panel')!.classList.toggle('hidden', target !== 'sweep');

      if (target === 'sweep' && !sweepState.started) {
        sweepState.started = true;
        startSweepDemo();
      }
    });
  });

  // Reset buttons
  document.getElementById('memory-conv-reset')?.addEventListener('click', () => {
    convState.started = false;
    requestAnimationFrame(() => {
      convState.started = true;
      startConvDemo();
    });
  });

  document.getElementById('memory-sweep-reset')?.addEventListener('click', () => {
    sweepState.started = false;
    requestAnimationFrame(() => {
      sweepState.started = true;
      startSweepDemo();
    });
  });

  // Restart demos on language change
  onLangChange(() => {
    if (convState.started) startConvDemo();
    if (sweepState.started) startSweepDemo();
  });
}

export function activateMemory(): void {
  if (!convState.started) {
    convState.started = true;
    startConvDemo();
  }
}
