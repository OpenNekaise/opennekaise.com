export function initWordReveal(): void {
  const manifesto = document.getElementById('manifesto');
  const footer = document.getElementById('footer');
  if (!manifesto || !footer) return;

  const paragraphs = manifesto.querySelectorAll('p');

  // Wrap each word in a span, preserving HTML structure
  paragraphs.forEach((p) => {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

    textNodes.forEach((node) => {
      const words = node.textContent!.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach((w) => {
        if (/^\s+$/.test(w)) {
          frag.appendChild(document.createTextNode(w));
        } else if (w) {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = w;
          frag.appendChild(span);
        }
      });
      node.parentNode!.replaceChild(frag, node);
    });
  });

  const allWords = manifesto.querySelectorAll<HTMLSpanElement>('.word');
  let i = 0;

  function revealNext(): void {
    if (i >= allWords.length) {
      footer!.classList.add('visible');
      return;
    }

    const word = allWords[i];
    word.classList.add('visible', 'glow');

    // Remove glow after a brief flash
    setTimeout(() => word.classList.remove('glow'), 200);

    i++;

    // Pacing: 80–120ms per word with slight randomness
    const delay = 80 + Math.random() * 40;
    setTimeout(revealNext, delay);
  }

  // Start animation after a short pause
  setTimeout(revealNext, 600);
}
