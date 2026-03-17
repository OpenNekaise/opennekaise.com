import './style.css';
import { initMatrixRain } from './matrix';
import { initWordReveal } from './animation';
import { initBuildingChart } from './chart';
import { initOntologySpawn } from './ontology';
import { initOntologyUpdate, activateOntologyUpdate } from './ontology-update';

initMatrixRain();
initWordReveal();
initBuildingChart();
initOntologySpawn();
initOntologyUpdate();

// Top-level tab switching (Home / ONTOLOGY.ttl)
document.querySelectorAll<HTMLButtonElement>('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab!;
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    document.getElementById('section-home')!.classList.toggle('hidden', target !== 'home');
    document.getElementById('section-ontology')!.classList.toggle('hidden', target !== 'ontology');

    // Activate update demo if its sub-tab is active when ontology section is shown
    if (target === 'ontology') {
      const activeSubtab = document.querySelector('.onto-subtab.active') as HTMLElement;
      if (activeSubtab?.dataset.ontoTab === 'update') {
        activateOntologyUpdate();
      }
    }
  });
});

// Ontology sub-tab switching (/ontology-spawn / /ontology-update)
document.querySelectorAll<HTMLButtonElement>('.onto-subtab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.ontoTab!;
    document.querySelectorAll('.onto-subtab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    document.getElementById('onto-spawn-panel')!.classList.toggle('hidden', target !== 'spawn');
    document.getElementById('onto-update-panel')!.classList.toggle('hidden', target !== 'update');

    if (target === 'update') {
      activateOntologyUpdate();
    }
  });
});
