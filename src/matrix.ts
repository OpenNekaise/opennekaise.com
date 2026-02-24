export function initMatrixRain(): void {
  const canvas = document.getElementById('matrix-bg') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d')!;

  function resize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const fontSize = 14;
  const columns = Math.floor(window.innerWidth / fontSize);
  const drops: number[] = Array.from({ length: columns }, () => Math.random() * -100);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]|;:<>?/~';

  function draw(): void {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.98) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    requestAnimationFrame(draw);
  }

  draw();
}
