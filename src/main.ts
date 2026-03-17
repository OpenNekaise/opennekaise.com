import './style.css';
import { initMatrixRain } from './matrix';
import { initWordReveal } from './animation';
import { initBuildingChart } from './chart';
import { initOntologySpawn } from './ontology';
import { initOntologyUpdate, activateOntologyUpdate } from './ontology-update';
import { initMemory, activateMemory } from './memory';
import { initI18n } from './i18n';

initMatrixRain();
initWordReveal();
initBuildingChart();
initOntologySpawn();
initOntologyUpdate();
initMemory();
initI18n();

// Top-level tab switching (Home / ONTOLOGY.ttl / MEMORY.md)
document.querySelectorAll<HTMLButtonElement>('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab!;
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    document.getElementById('section-home')!.classList.toggle('hidden', target !== 'home');
    document.getElementById('section-ontology')!.classList.toggle('hidden', target !== 'ontology');
    document.getElementById('section-memory')!.classList.toggle('hidden', target !== 'memory');

    if (target === 'ontology') {
      const activeSubtab = document.querySelector('.onto-subtab[data-onto-tab].active') as HTMLElement;
      if (activeSubtab?.dataset.ontoTab === 'update') {
        activateOntologyUpdate();
      }
    }

    if (target === 'memory') {
      activateMemory();
    }
  });
});

// Ontology sub-tab switching (/ontology-spawn / /ontology-update)
document.querySelectorAll<HTMLButtonElement>('.onto-subtab[data-onto-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.ontoTab!;
    document.querySelectorAll('.onto-subtab[data-onto-tab]').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    document.getElementById('onto-spawn-panel')!.classList.toggle('hidden', target !== 'spawn');
    document.getElementById('onto-update-panel')!.classList.toggle('hidden', target !== 'update');

    if (target === 'update') {
      activateOntologyUpdate();
    }
  });
});
