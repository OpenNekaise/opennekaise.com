import { OntologyDemo } from './ontology-engine';
import { baseSystems, spawnFiles, spawnChatMessages } from './ontology-data';

let demo: OntologyDemo;

export function initOntologySpawn(): void {
  demo = new OntologyDemo({
    systems: baseSystems,
    files: spawnFiles,
    chatMessages: spawnChatMessages,
    elements: {
      files: 'spawn-files',
      fileList: 'spawn-file-list',
      actionBtn: 'spawn-btn',
      canvasWrap: 'spawn-canvas-wrap',
      canvas: 'spawn-canvas',
      counter: 'spawn-counter',
      chat: 'spawn-chat',
      chatBody: 'spawn-chat-body',
      resetBtn: 'spawn-reset-btn',
    },
  });
  demo.init();
}
