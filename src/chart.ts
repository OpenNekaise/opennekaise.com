interface DataPoint {
  date: Date;
  buildings: number;
}

export async function initBuildingChart(): Promise<void> {
  const canvas = document.getElementById('building-chart') as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;

  // Load CSV
  const res = await fetch('/data/buildings.csv');
  const text = await res.text();
  const lines = text.trim().split('\n').slice(1); // skip header
  const data: DataPoint[] = lines
    .filter((l) => l.trim())
    .map((line) => {
      const [dateStr, count] = line.split(',');
      return { date: new Date(dateStr.trim()), buildings: parseInt(count.trim(), 10) };
    });

  if (data.length === 0) return;

  // Extend to today
  const now = new Date();
  const lastPoint = data[data.length - 1];
  if (now > lastPoint.date) {
    data.push({ date: now, buildings: lastPoint.buildings });
  }

  const startDate = data[0].date;
  const endDate = data[data.length - 1].date;
  const maxBuildings = Math.max(...data.map((d) => d.buildings), 1);

  // Chart dimensions
  const padding = { top: 30, right: 30, bottom: 55, left: 50 };

  function resize(): void {
    const rect = canvas!.parentElement!.getBoundingClientRect();
    const w = rect.width;
    const h = Math.min(340, w * 0.55);
    canvas!.style.width = w + 'px';
    canvas!.style.height = h + 'px';
    canvas!.width = w * dpr;
    canvas!.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();

  function getW(): number {
    return canvas!.width / dpr;
  }
  function getH(): number {
    return canvas!.height / dpr;
  }

  // Map data to pixel coords
  function toX(date: Date): number {
    const totalMs = endDate.getTime() - startDate.getTime();
    const frac = (date.getTime() - startDate.getTime()) / totalMs;
    return padding.left + frac * (getW() - padding.left - padding.right);
  }

  function toY(val: number): number {
    // Add 1 unit of headroom above max
    const yMax = maxBuildings + 1;
    const frac = val / yMax;
    return getH() - padding.bottom - frac * (getH() - padding.top - padding.bottom);
  }

  // Generate step-line path points (horizontal then vertical transitions)
  function buildPath(): { x: number; y: number }[] {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < data.length; i++) {
      const x = toX(data[i].date);
      const y = toY(data[i].buildings);
      if (i > 0 && data[i].buildings !== data[i - 1].buildings) {
        // horizontal segment to new x at old y
        pts.push({ x, y: toY(data[i - 1].buildings) });
      }
      pts.push({ x, y });
    }
    return pts;
  }

  // Calculate total path length
  function pathLength(pts: { x: number; y: number }[]): number {
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  }

  // Interpolate along path
  function pointAtLength(
    pts: { x: number; y: number }[],
    targetLen: number
  ): { x: number; y: number } {
    let accumulated = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (accumulated + segLen >= targetLen) {
        const t = (targetLen - accumulated) / segLen;
        return {
          x: pts[i - 1].x + dx * t,
          y: pts[i - 1].y + dy * t,
        };
      }
      accumulated += segLen;
    }
    return pts[pts.length - 1];
  }

  // Find which data points are "passed" at a given drawn length
  function passedDataIndices(
    pts: { x: number; y: number }[],
    drawnLen: number
  ): number[] {
    const indices: number[] = [];
    let accumulated = 0;
    // Map each original data point to its position in the step path
    let pathIdx = 0;
    for (let di = 0; di < data.length; di++) {
      const dx = toX(data[di].date);
      const dy = toY(data[di].buildings);
      // Find this point in pts
      while (pathIdx < pts.length) {
        if (Math.abs(pts[pathIdx].x - dx) < 0.5 && Math.abs(pts[pathIdx].y - dy) < 0.5) {
          break;
        }
        pathIdx++;
      }
      // Calculate length to this pathIdx
      let lenToPoint = 0;
      for (let j = 1; j <= pathIdx && j < pts.length; j++) {
        const ddx = pts[j].x - pts[j - 1].x;
        const ddy = pts[j].y - pts[j - 1].y;
        lenToPoint += Math.sqrt(ddx * ddx + ddy * ddy);
      }
      if (lenToPoint <= drawnLen) {
        indices.push(di);
      }
    }
    return indices;
  }

  // Generate quarterly tick dates between start and end
  function getQuarterlyTicks(): Date[] {
    const ticks: Date[] = [];
    const d = new Date(startDate);
    // Advance to next quarter start
    const qMonths = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    while (d <= endDate) {
      for (const m of qMonths) {
        const tick = new Date(d.getFullYear(), m, 1);
        if (tick > startDate && tick < endDate) {
          ticks.push(tick);
        }
      }
      d.setFullYear(d.getFullYear() + 1);
    }
    // Deduplicate and sort
    const seen = new Set<number>();
    return ticks.filter((t) => {
      const k = t.getTime();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).sort((a, b) => a.getTime() - b.getTime());
  }

  function drawAxes(): void {
    const w = getW();
    const h = getH();

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;

    // Y axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.stroke();

    // X axis
    ctx.beginPath();
    ctx.moveTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    // Y-axis labels and grid
    const yMax = maxBuildings + 1;
    ctx.font = '15px "SF Mono", "Fira Code", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let v = 0; v <= yMax; v++) {
      const y = toY(v);
      ctx.fillStyle = '#d0d0d0';
      ctx.fillText(String(v), padding.left - 10, y);
      if (v > 0) {
        ctx.strokeStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
      }
    }

    // X-axis: quarterly ticks + start + now
    ctx.font = '15px "SF Mono", "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#d0d0d0';

    // Start label
    const startX = toX(startDate);
    const startLabel = startDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    ctx.fillText(startLabel, startX, h - padding.bottom + 10);

    // Quarterly ticks
    const quarterTicks = getQuarterlyTicks();
    for (const tick of quarterTicks) {
      const x = toX(tick);
      // Skip if too close to start or end
      if (Math.abs(x - startX) < 40 || Math.abs(x - toX(endDate)) < 40) continue;
      const label = tick.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      ctx.fillText(label, x, h - padding.bottom + 10);

      // Small tick mark
      ctx.strokeStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.moveTo(x, h - padding.bottom);
      ctx.lineTo(x, h - padding.bottom + 5);
      ctx.stroke();
    }

    // "Now" label
    const nowX = toX(endDate);
    ctx.fillStyle = '#d0d0d0';
    ctx.fillText('Now', nowX, h - padding.bottom + 10);
  }

  // Animation state
  const animDuration = 3000; // ms
  let animStart: number | null = null;
  let animDone = false;

  function draw(timestamp: number): void {
    if (!animStart) animStart = timestamp;
    const elapsed = timestamp - animStart;

    const w = getW();
    const h = getH();
    ctx.clearRect(0, 0, w, h);

    drawAxes();

    const pts = buildPath();
    const totalLen = pathLength(pts);

    // Ease-out animation progress
    const rawProgress = Math.min(elapsed / animDuration, 1);
    const progress = 1 - Math.pow(1 - rawProgress, 3); // cubic ease-out
    const drawnLen = progress * totalLen;

    if (rawProgress >= 1) animDone = true;

    // Draw the line up to current progress
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.moveTo(pts[0].x, pts[0].y);
    let accumulated = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (accumulated + segLen <= drawnLen) {
        ctx.lineTo(pts[i].x, pts[i].y);
        accumulated += segLen;
      } else {
        const t = (drawnLen - accumulated) / segLen;
        ctx.lineTo(pts[i - 1].x + dx * t, pts[i - 1].y + dy * t);
        break;
      }
    }
    ctx.stroke();

    // Draw dots on passed data points (not the "now" point)
    const passed = passedDataIndices(pts, drawnLen);
    for (const di of passed) {
      if (di === data.length - 1) continue; // skip "now" point, it gets the blinking dot
      const x = toX(data[di].date);
      const y = toY(data[di].buildings);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // Blinking dot at the tip
    const tip = pointAtLength(pts, drawnLen);
    const blinkPhase = (Math.sin(timestamp / 400) + 1) / 2; // 0..1 pulsing
    const dotRadius = 4 + blinkPhase * 3;
    const glowAlpha = 0.3 + blinkPhase * 0.5;

    // Glow
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, dotRadius + 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha * 0.3})`;
    ctx.fill();

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, dotRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha * 0.5})`;
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    requestAnimationFrame(draw);
  }

  // Start when chart scrolls into view
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(draw);
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(canvas);

  // Handle resize
  window.addEventListener('resize', () => {
    resize();
    if (animDone) {
      // Redraw immediately on resize when animation is complete
      animStart = null;
      animDone = false;
    }
  });
}
