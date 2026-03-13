import './style.css';
import { initMatrixRain } from './matrix';
import { initWordReveal } from './animation';
import { initBuildingChart } from './chart';
import { initOntologySpawn } from './ontology';

initMatrixRain();
initWordReveal();
initBuildingChart();
initOntologySpawn();

// Tab switching
document.querySelectorAll<HTMLButtonElement>('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab!;
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    document.getElementById('section-home')!.classList.toggle('hidden', target !== 'home');
    document.getElementById('section-ontology')!.classList.toggle('hidden', target !== 'ontology');
  });
});
