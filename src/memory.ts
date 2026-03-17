// ── After-conversation demo ───────────────────────────────────────────────────

const convMessages = [
  {
    delay: 0,
    role: 'user',
    label: 'Facility Manager',
    text: 'The COP on VP2 dropped to 2.1 yesterday. We had a technician look at it — turns out the brine pump KB2-P1 was running at 30% instead of 60%. He fixed it on site.',
  },
  {
    delay: 2000,
    role: 'agent',
    label: '🏔️ Nekaise Agent',
    text: 'Good catch. VP2 COP at 2.1 with KB2-P1 underperforming at 30% makes sense — reduced brine flow would starve the evaporator. With the pump back at 60%, COP should recover to the 3.0–3.3 range within a few hours.',
  },
  {
    delay: 4500,
    role: 'thinking',
    label: '🏔️ Nekaise Agent',
    text: 'Conversation turn complete. COP drop and pump fix are confirmed building facts — I should update memory.',
  },
  {
    delay: 6500,
    role: 'thinking',
    label: '🏔️ Nekaise Agent',
    text: 'Running /update-memory... extracting building facts and decisions from this conversation.',
  },
];

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

const sweepMessages = [
  {
    delay: 0,
    role: 'system',
    label: 'System',
    text: '<code>cron 0 2 * * *</code> — Scheduled task triggered: MEMORY AND ONTOLOGY SWEEP',
  },
  {
    delay: 1500,
    role: 'thinking',
    label: '🏔️ Nekaise Agent',
    text: 'Reading today\'s conversation history from messages_history.json... 4 conversations, 12 messages total.',
  },
  {
    delay: 3500,
    role: 'thinking',
    label: '🏔️ Nekaise Agent',
    text: 'Running /update-memory... Found 3 new building facts, 1 resolved issue. Merging into MEMORY.md.',
  },
  {
    delay: 6000,
    role: 'thinking',
    label: '🏔️ Nekaise Agent',
    text: 'Confirmed building facts found — also running /update-ontology to update ONTOLOGY.ttl.',
  },
  {
    delay: 8500,
    role: 'thinking',
    label: '🏔️ Nekaise Agent',
    text: 'Sweep complete. Memory: +3 facts, 1 issue resolved. Ontology: KB2-P1 setpoint updated.',
  },
];

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

function addMsg(body: HTMLElement, msg: typeof convMessages[0]) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-${msg.role}`;
  div.innerHTML = `<span class="chat-role">${msg.label}</span>${msg.text}`;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function runDemo(
  state: DemoState,
  messages: typeof convMessages,
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
    convState, convMessages,
    'memory-conv-body', 'memory-conv-file', 'memory-conv-status', 'memory-conv-content',
    convMemoryBefore, convMemoryAfter,
    5000, 8000,
  );
}

function startSweepDemo() {
  runDemo(
    sweepState, sweepMessages,
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
}

export function activateMemory(): void {
  if (!convState.started) {
    convState.started = true;
    startConvDemo();
  }
}
