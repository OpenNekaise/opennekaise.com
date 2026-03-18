export type Lang = 'en' | 'zh' | 'sv';

let currentLang: Lang = 'en';
const listeners: (() => void)[] = [];

// ── Translations ──────────────────────────────────────────────────────────────

const T: Record<string, Record<Lang, string>> = {

  // ── Manifesto ─────────────────────────────────────────────────────────────

  'manifesto.p1': {
    en: 'One day, buildings used to be studied and managed by "meat computers" in between eating, sleeping, having other fun, and synchronizing once in a while using sound wave interconnect in the ritual of "group meeting".',
    zh: '曾经，建筑的研究和管理依赖于"肉脑计算机"——它们在吃饭、睡觉和其他娱乐之余，偶尔通过声波互联进行名为"小组会议"的同步仪式。',
    sv: 'En gång studerades och förvaltades byggnader av "köttkomputers" mellan ätande, sovande och annat nöje, som då och då synkroniserade via ljudvågsinterface i ritualen "gruppmöte".',
  },
  'manifesto.p2': {
    en: 'That era began to fade. Buildings learned to understand themselves — AI agents reading documentation, fetching sensor data, analyzing time series, learning occupant patterns, and helping keep people comfortable, without anyone having to file a ticket or shout into a walkie-talkie.',
    zh: '那个时代开始褪色。建筑学会了理解自己——AI 代理阅读文档、获取传感器数据、分析时间序列、学习住户行为模式，帮助人们保持舒适，无需任何人提交工单或对着对讲机喊话。',
    sv: 'Den eran började blekna. Byggnader lärde sig förstå sig själva — AI-agenter som läser dokumentation, hämtar sensordata, analyserar tidsserier, lär sig brukarmönster och hjälper människor hålla sig bekväma, utan att någon behöver skicka en felanmälan eller skrika i en walkie-talkie.',
  },
  'manifesto.p3': {
    en: 'The agents claim we are now in the 2,120th generation of the optimization, in any case no one could tell if that\'s right or wrong as the AI has long understood the building beyond what any engineer could comprehend.',
    zh: '代理们声称我们现在处于优化的第 2,120 代，无论如何没人能判断这是否正确，因为 AI 对建筑的理解早已超越了任何工程师的认知。',
    sv: 'Agenterna hävdar att vi nu är i den 2\u00a0120:e generationen av optimeringen, hur som helst kan ingen avgöra om det stämmer eftersom AI:n sedan länge förstått byggnaden bortom vad någon ingenjör kan begripa.',
  },
  'manifesto.p5': {
    en: 'It started as research inside <a href="https://www.vr.se/english/swecris.html?project%3DP2023-01521_Energi#/" target="_blank" rel="noopener" class="highlight">TwinVista</a>, a large research project at KTH funded by <a href="https://www.energimyndigheten.se/en/" target="_blank" rel="noopener" class="highlight">Energimyndigheten</a>.',
    zh: '它始于 <a href="https://www.vr.se/english/swecris.html?project%3DP2023-01521_Energi#/" target="_blank" rel="noopener" class="highlight">TwinVista</a> 内部的研究，一个由 <a href="https://www.energimyndigheten.se/en/" target="_blank" rel="noopener" class="highlight">Energimyndigheten</a> 资助的 KTH 大型研究项目。',
    sv: 'Det började som forskning inom <a href="https://www.vr.se/english/swecris.html?project%3DP2023-01521_Energi#/" target="_blank" rel="noopener" class="highlight">TwinVista</a>, ett stort forskningsprojekt på KTH finansierat av <a href="https://www.energimyndigheten.se/en/" target="_blank" rel="noopener" class="highlight">Energimyndigheten</a>.',
  },
  'manifesto.p6': {
    en: 'One piece of that research wanted out — so we open sourced it.',
    zh: '其中一项研究迫不及待要走向公众——于是我们将它开源了。',
    sv: 'En del av den forskningen ville ut — så vi öppenkällade den.',
  },
  'manifesto.p7': {
    en: 'We want to build <a href="https://github.com/OpenNekaise" target="_blank" rel="noopener" class="highlight">OpenNekaise</a> with an open community — and ship <span class="highlight">Nekaise Agent</span> to every building that wants one.',
    zh: '我们希望与开放社区共建 <a href="https://github.com/OpenNekaise" target="_blank" rel="noopener" class="highlight">OpenNekaise</a>——将 <span class="highlight">Nekaise Agent</span> 送到每一栋需要它的建筑。',
    sv: 'Vi vill bygga <a href="https://github.com/OpenNekaise" target="_blank" rel="noopener" class="highlight">OpenNekaise</a> med en öppen gemenskap — och leverera <span class="highlight">Nekaise Agent</span> till varje byggnad som vill ha en.',
  },
  'manifesto.p8': {
    en: 'An <span class="highlight">AI Agent</span> that lives in your <span class="highlight">Slack</span>, your <span class="highlight">Teams</span>, or wherever your team already works.',
    zh: '一个 <span class="highlight">AI 代理</span>，驻扎在你的 <span class="highlight">Slack</span>、<span class="highlight">Teams</span>，或你团队日常工作的任何地方。',
    sv: 'En <span class="highlight">AI-agent</span> som bor i din <span class="highlight">Slack</span>, ditt <span class="highlight">Teams</span>, eller var ditt team redan arbetar.',
  },
  'manifesto.p9': {
    en: 'An employee who never clocks out.',
    zh: '一个永不下班的员工。',
    sv: 'En anställd som aldrig stämplar ut.',
  },
  'manifesto.p11': {
    en: 'Because when buildings finally understand themselves, they unlock a better future for all of us.',
    zh: '因为当建筑终于理解了自己，它们将为我们所有人开启更美好的未来。',
    sv: 'För när byggnader äntligen förstår sig själva, låser de upp en bättre framtid för oss alla.',
  },
  'manifesto.p12': {
    en: 'You\'re welcome to join the open source community — open an <a href="https://github.com/OpenNekaise/opennekaise/issues" target="_blank" rel="noopener" class="highlight">issue</a>, submit a <a href="https://github.com/OpenNekaise/opennekaise/pulls" target="_blank" rel="noopener" class="highlight">pull request</a>, or just leave a comment.',
    zh: '欢迎加入开源社区 — 提交一个 <a href="https://github.com/OpenNekaise/opennekaise/issues" target="_blank" rel="noopener" class="highlight">Issue</a>、发起一个 <a href="https://github.com/OpenNekaise/opennekaise/pulls" target="_blank" rel="noopener" class="highlight">Pull Request</a>，或留下你的评论。',
    sv: 'Du är välkommen att delta i öppen källkod-gemenskapen — öppna ett <a href="https://github.com/OpenNekaise/opennekaise/issues" target="_blank" rel="noopener" class="highlight">ärende</a>, skicka en <a href="https://github.com/OpenNekaise/opennekaise/pulls" target="_blank" rel="noopener" class="highlight">pull request</a>, eller lämna en kommentar.',
  },

  // ── Chart ─────────────────────────────────────────────────────────────────

  'chart.caption': {
    en: 'Number of buildings managed by Nekaise Agent',
    zh: 'Nekaise Agent 管理的建筑数量',
    sv: 'Antal byggnader som hanteras av Nekaise Agent',
  },

  // ── Agent demo ──────────────────────────────────────────────────────────

  'agent.intro': {
    en: 'Ask <span class="highlight">Nekaise Agent</span> about your building. It reads the <span class="highlight">ontology</span> — the structured knowledge graph of every system, sensor, and relationship — to ground every answer in <span class="highlight">real building data</span>.',
    zh: '向 <span class="highlight">Nekaise Agent</span> 询问你的建筑。它读取<span class="highlight">本体</span>——每个系统、传感器和关系的结构化知识图谱——让每个回答都基于<span class="highlight">真实建筑数据</span>。',
    sv: 'Fråga <span class="highlight">Nekaise Agent</span> om din byggnad. Den läser <span class="highlight">ontologin</span> — den strukturerade kunskapsgrafen över varje system, sensor och relation — för att grunda varje svar i <span class="highlight">verklig byggnadsdata</span>.',
  },
  'agent.demo-note': {
    en: 'This is a demo visualization.',
    zh: '以下为演示可视化。',
    sv: 'Detta är en demovisualisering.',
  },
  'agent.chat-header': {
    en: 'Conversation',
    zh: '对话',
    sv: 'Konversation',
  },
  'agent.ask-placeholder': {
    en: 'Ask about the building...',
    zh: '询问关于建筑的问题...',
    sv: 'Fråga om byggnaden...',
  },
  'agent.reset': {
    en: 'Reset Demo',
    zh: '重置演示',
    sv: 'Återställ demo',
  },

  // ── Ontology intro ────────────────────────────────────────────────────────

  'onto.intro': {
    en: 'Nekaise Agent <span class="highlight">proactively</span> creates and updates an <span class="highlight">ontology</span> from raw building documents — it decides when the building model needs to change, and acts on it. These are <a href="https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview" target="_blank" rel="noopener" class="highlight">Skills</a> built into the agent. Explore more by diving into the <a href="https://github.com/OpenNekaise/opennekaise" target="_blank" rel="noopener" class="highlight">code</a> with your favourite AI.',
    zh: 'Nekaise Agent <span class="highlight">主动</span>从原始建筑文档创建和更新<span class="highlight">本体</span>——它自主决定何时需要更改建筑模型，并立即执行。这些是内置于代理的<a href="https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview" target="_blank" rel="noopener" class="highlight">技能</a>。深入<a href="https://github.com/OpenNekaise/opennekaise" target="_blank" rel="noopener" class="highlight">代码</a>，用你喜欢的 AI 探索更多。',
    sv: 'Nekaise Agent skapar och uppdaterar <span class="highlight">proaktivt</span> en <span class="highlight">ontologi</span> från råa byggnadsdokument — den avgör själv när byggnadsmodellen behöver ändras och agerar direkt. Dessa är <a href="https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview" target="_blank" rel="noopener" class="highlight">färdigheter</a> inbyggda i agenten. Utforska mer genom att dyka in i <a href="https://github.com/OpenNekaise/opennekaise" target="_blank" rel="noopener" class="highlight">koden</a> med din favorit-AI.',
  },
  'onto.demo-note': {
    en: 'These are demo visualizations.',
    zh: '以下为演示可视化。',
    sv: 'Dessa är demovisualiseringar.',
  },

  // ── Ontology UI ───────────────────────────────────────────────────────────

  'onto.source-docs': {
    en: 'Source Documents',
    zh: '源文档',
    sv: 'Källdokument',
  },
  'onto.spawn-btn': {
    en: 'Spawn Ontology',
    zh: '生成本体',
    sv: 'Skapa ontologi',
  },
  'onto.spawn-chat-header': {
    en: 'Talk to Nekaise Agent about this building',
    zh: '与 Nekaise Agent 讨论这栋建筑',
    sv: 'Prata med Nekaise Agent om denna byggnad',
  },
  'onto.update-chat-header': {
    en: 'Conversation',
    zh: '对话',
    sv: 'Konversation',
  },
  'onto.reset': {
    en: 'Reset Demo',
    zh: '重置演示',
    sv: 'Återställ demo',
  },
  'onto.ask-placeholder': {
    en: 'Ask about the building...',
    zh: '询问关于建筑的问题...',
    sv: 'Fråga om byggnaden...',
  },

  // ── Memory intro ──────────────────────────────────────────────────────────

  'memory.intro': {
    en: 'Nekaise Agent <span class="highlight">automatically</span> maintains a structured <span class="highlight">MEMORY.md</span> for each building — it proactively chooses what to remember and what to forget, distilling conversations into facts, decisions, and open issues. Memory updates after every conversation turn, and a <span class="highlight">daily 2am sweep</span> consolidates the full day.',
    zh: 'Nekaise Agent <span class="highlight">自动</span>为每栋建筑维护结构化的 <span class="highlight">MEMORY.md</span>——它主动选择记住什么、忘记什么，将对话提炼为事实、决策和待解决问题。记忆在每次对话后更新，<span class="highlight">每天凌晨 2 点定时任务</span>整合全天内容。',
    sv: 'Nekaise Agent underhåller <span class="highlight">automatiskt</span> en strukturerad <span class="highlight">MEMORY.md</span> för varje byggnad — den väljer proaktivt vad den ska minnas och vad den ska glömma, och destillerar konversationer till fakta, beslut och öppna frågor. Minnet uppdateras efter varje konversation, och en <span class="highlight">daglig 02:00-sweep</span> konsoliderar hela dagen.',
  },
  'memory.demo-note': {
    en: 'These are demo visualizations.',
    zh: '以下为演示可视化。',
    sv: 'Dessa är demovisualiseringar.',
  },
  'memory.conv-header': {
    en: 'Conversation',
    zh: '对话',
    sv: 'Konversation',
  },
  'memory.sweep-header': {
    en: 'Scheduled Task — 2:00 AM',
    zh: '定时任务 — 凌晨 2:00',
    sv: 'Schemalagd uppgift — 02:00',
  },
  'memory.reset': {
    en: 'Reset Demo',
    zh: '重置演示',
    sv: 'Återställ demo',
  },
  'memory.ask-placeholder': {
    en: 'Ask about the building...',
    zh: '询问关于建筑的问题...',
    sv: 'Fråga om byggnaden...',
  },

  // ── Footer ────────────────────────────────────────────────────────────────

  'footer': {
    en: 'Built by 🏔️ Nekaise Agent, with a <a href="https://soul.md/" target="_blank" rel="noopener">soul</a>, by <a href="https://www.kth.se/profile/zengp" target="_blank" rel="noopener">Zeng Peng</a> &amp; <a href="https://github.com/OpenNekaise" target="_blank" rel="noopener">Community</a>',
    zh: '由 🏔️ Nekaise Agent 构建，拥有<a href="https://soul.md/" target="_blank" rel="noopener">灵魂</a>，由 <a href="https://www.kth.se/profile/zengp" target="_blank" rel="noopener">Zeng Peng</a> 和<a href="https://github.com/OpenNekaise" target="_blank" rel="noopener">社区</a>共建',
    sv: 'Byggd av 🏔️ Nekaise Agent, med en <a href="https://soul.md/" target="_blank" rel="noopener">själ</a>, av <a href="https://www.kth.se/profile/zengp" target="_blank" rel="noopener">Zeng Peng</a> &amp; <a href="https://github.com/OpenNekaise" target="_blank" rel="noopener">gemenskapen</a>',
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

export function t(key: string): string {
  return T[key]?.[currentLang] || T[key]?.en || key;
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  if (lang === currentLang) return;
  currentLang = lang;

  // Update all data-i18n elements (text only)
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')!;
    el.textContent = t(key);
  });

  // Update all data-i18n-html elements (HTML content)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html')!;
    el.innerHTML = t(key);
  });

  // Update all data-i18n-placeholder elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder')!;
    (el as HTMLInputElement).placeholder = t(key);
  });

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.lang === lang);
  });

  // Notify listeners (demo modules restart)
  listeners.forEach((fn) => fn());
}

export function onLangChange(fn: () => void): void {
  listeners.push(fn);
}

export function initI18n(): void {
  document.querySelectorAll<HTMLButtonElement>('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang as Lang;
      if (lang) setLang(lang);
    });
  });
}
