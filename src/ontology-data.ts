import type { SystemDef } from './ontology-engine';

// ── Base building systems (Axelsdgården 42) ─────────────────────────────────

export const baseSystems: Record<string, SystemDef> = {
  root: {
    label: 'Axelsdgården 42',
    children: ['AS201', 'LB04', 'LB05', 'LB07', 'LB10', 'LB11', 'LB13', 'Garage', 'VS2', 'VV2', 'VP2', 'KB2', 'KV2', 'VVC', 'Metering'],
    actors: ['UTE-GT31', 'UTE-GX31'],
  },
  AS201: {
    label: 'AS201 Control',
    actors: ['EL-Total', 'EL-Property', 'EL-Apt', 'EL-Garage', 'EL-EV', 'EL-HP'],
  },
  LB04: {
    label: 'LB04 AHU',
    children: ['LB04-Inlet', 'LB04-Exhaust', 'LB04-VVX', 'LB04-Elev'],
    actors: ['LB04-TF01', 'LB04-FF01', 'LB04-SV21', 'LB04-P1', 'LB04-GT11', 'LB04-GT81', 'LB04-GP11', 'LB04-GP12', 'LB04-GX71', 'LB04-GX72', 'LB04-GX73', 'LB04-ST21', 'LB04-ST71', 'LB04-EL'],
  },
  'LB04-Inlet': { label: 'Inlet Duct' },
  'LB04-Exhaust': { label: 'Exhaust Duct' },
  'LB04-VVX': { label: 'Heat Exchanger' },
  'LB04-Elev': { label: 'Elevator Shaft' },
  LB05: {
    label: 'LB05 AHU',
    children: ['LB05-Inlet', 'LB05-Exhaust', 'LB05-VVX', 'LB05-Dist'],
    actors: ['LB05-TF01', 'LB05-FF01', 'LB05-SV21', 'LB05-GT11', 'LB05-GX71', 'LB05-GX72', 'LB05-EL'],
  },
  'LB05-Inlet': { label: 'Inlet Duct' },
  'LB05-Exhaust': { label: 'Exhaust Duct' },
  'LB05-VVX': { label: 'Heat Exchanger' },
  'LB05-Dist': {
    label: 'Distribution',
    actors: ['LB05-GX74', 'LB05-GX75', 'LB05-GX76', 'LB05-GX77', 'LB05-ST7:2', 'LB05-ST7:6', 'LB05-ST7:9', 'LB05-ST7:11'],
  },
  LB07: {
    label: 'LB07 AHU',
    children: ['LB07-Inlet', 'LB07-Exhaust', 'LB07-VVX', 'LB07-Roof', 'LB07-Elrm'],
    actors: ['LB07-TF01', 'LB07-FF01', 'LB07-GT11', 'LB07-GX71', 'LB07-GX73', 'LB07-EL'],
  },
  'LB07-Inlet': { label: 'Inlet Duct' },
  'LB07-Exhaust': { label: 'Exhaust Duct' },
  'LB07-VVX': { label: 'Heat Exchanger' },
  'LB07-Roof': { label: 'Roof Lounge' },
  'LB07-Elrm': { label: 'Electrical Room' },
  LB10: {
    label: 'LB10 AHU',
    children: ['LB10-Inlet', 'LB10-Exhaust', 'LB10-VVX', 'LB10-Elrm'],
    actors: ['LB10-TF01', 'LB10-FF01', 'LB10-GT11', 'LB10-GX71', 'LB10-EL'],
  },
  'LB10-Inlet': { label: 'Inlet Duct' },
  'LB10-Exhaust': { label: 'Exhaust Duct' },
  'LB10-VVX': { label: 'Heat Exchanger' },
  'LB10-Elrm': { label: 'Electrical Room' },
  LB11: {
    label: 'LB11 AHU',
    children: ['LB11-Inlet', 'LB11-Exhaust', 'LB11-VVX', 'LB11-Elev', 'LB11-Elrm'],
    actors: ['LB11-TF01', 'LB11-FF01', 'LB11-GT11', 'LB11-GX71', 'LB11-GX74', 'LB11-EL'],
  },
  'LB11-Inlet': { label: 'Inlet Duct' },
  'LB11-Exhaust': { label: 'Exhaust Duct' },
  'LB11-VVX': { label: 'Heat Exchanger' },
  'LB11-Elev': { label: 'Elevator Shaft' },
  'LB11-Elrm': { label: 'Electrical Room' },
  LB13: {
    label: 'LB13 AHU',
    children: ['LB13-Inlet', 'LB13-Exhaust', 'LB13-VVX', 'LB13-Elev', 'LB13-Elrm'],
    actors: ['LB13-TF01', 'LB13-FF01', 'LB13-GT11', 'LB13-GX71', 'LB13-GX74', 'LB13-EL'],
  },
  'LB13-Inlet': { label: 'Inlet Duct' },
  'LB13-Exhaust': { label: 'Exhaust Duct' },
  'LB13-VVX': { label: 'Heat Exchanger' },
  'LB13-Elev': { label: 'Elevator Shaft' },
  'LB13-Elrm': { label: 'Electrical Room' },
  Garage: {
    label: 'Garage Ventilation',
    actors: ['LB06-FF01', 'LB08-FF01', 'LB12-FF01', 'LB06-GQ51', 'LB08-GQ51', 'LB12-GQ51'],
  },
  VS2: {
    label: 'VS2 Heating',
    actors: ['VS2-GT11', 'VS2-GT51', 'VS2-SV61', 'VS2-SV11', 'VS2-P1', 'VS2-EXP1', 'VS2-VMM1', 'VS-Garage-SV21'],
  },
  VV2: {
    label: 'VV2 Hot Water',
    actors: ['VV2-GT11', 'VV2-SV1', 'VV2-SV2', 'VV2-VM1'],
  },
  VP2: {
    label: 'VP2 Heat Pump',
    actors: ['VP2-EP14', 'VP2-EP15', 'VP2-EM1', 'VP2-VMM1'],
  },
  KB2: {
    label: 'KB2 Brine',
    actors: ['KB2-EXP1', 'KB2-P1'],
  },
  KV2: {
    label: 'KV2 Cold Water',
    actors: ['KV2-P1A', 'KV2-P1B', 'KV2-P1C', 'KV-VM1', 'KV-VM2'],
  },
  VVC: {
    label: 'VVC Circulation',
    actors: ['VVC-P1', 'VVC-GT41', 'VVC-SV21', 'VVC-VM1'],
  },
  Metering: {
    label: 'Metering',
    actors: ['FJV-VMM1', 'FV-GT41', 'FV-GT42'],
  },
};

// ── Spawn demo data ──────────────────────────────────────────────────────────

export const spawnFiles = [
  { name: 'control_cards.pdf', size: '2.4 MB', icon: '📄' },
  { name: 'system_description.pdf', size: '449 KB', icon: '📄' },
  { name: 'bms_operation_guide.md', size: '12 KB', icon: '📝' },
  { name: 'heating_control.md', size: '8 KB', icon: '📝' },
  { name: 'sensor_tags.csv', size: '34 KB', icon: '📊' },
  { name: 'existing_model.ttl', size: '18 KB', icon: '🔗' },
  { name: 'floor_plan_01.png', size: '1.1 MB', icon: '🖼️' },
  { name: 'floor_plan_02.png', size: '980 KB', icon: '🖼️' },
];

export const spawnChatMessages = [
  { role: 'user' as const, text: 'What is the supply air setpoint for LB04 at -10°C outdoor?' },
  { role: 'agent' as const, text: 'According to the 9-breakpoint curve, LB04 supply air setpoint is +20°C when outdoor temperature is -10°C.' },
  { role: 'user' as const, text: 'What happens when smoke is detected in the exhaust duct?' },
  { role: 'agent' as const, text: 'GX72 fire function activates: bypass damper ST71 opens, unit speeds to controller setpoint. This overrides GX71 supply-side fire function.' },
];

// ── Update demo data ─────────────────────────────────────────────────────────

export const updateFiles = [
  { name: 'pv_installation_report.pdf', size: '3.1 MB', icon: '📄' },
  { name: 'heat_pump_commissioning.pdf', size: '1.8 MB', icon: '📄' },
  { name: 'electrical_single_line.pdf', size: '2.2 MB', icon: '📄' },
  { name: 'pv_sensor_mapping.csv', size: '18 KB', icon: '📊' },
  { name: 'hp_control_sequence.md', size: '6 KB', icon: '📝' },
  { name: 'roof_mounting_plan.png', size: '1.4 MB', icon: '🖼️' },
];

export const updateChatMessages = [
  { role: 'agent' as const, text: 'Done. I\'ve added <strong>PV1 Solar</strong> (2 sub-systems, 6 sensors) and <strong>HP1 Heat Pump</strong> (6 sensors) to the ontology. Both are now connected to the building graph.' },
  { role: 'user' as const, text: 'What is the current PV generation capacity?' },
  { role: 'agent' as const, text: 'PV1 has two roof arrays (PV1-EP1, PV1-EP2) with a combined inverter bank (PV1-INV1, PV1-INV2). Total generation is tracked via PV1-EL metering.' },
  { role: 'user' as const, text: 'How does the new heat pump integrate with the existing heating?' },
  { role: 'agent' as const, text: 'HP1 operates in parallel with VS2 Heating. HP1-SV1 modulates flow based on HP1-GT11 supply and HP1-GT21 return temperatures. The brine circuit connects through KB2.' },
];

// ── Extended systems for update demo (base + PV + HP) ────────────────────────

export const updateSystems: Record<string, SystemDef> = {
  ...baseSystems,
  root: {
    ...baseSystems.root,
    children: [...baseSystems.root.children!, 'PV1', 'HP1'],
  },
  PV1: {
    label: 'PV1 Solar',
    children: ['PV1-Roof', 'PV1-Inv'],
    actors: ['PV1-EP1', 'PV1-EP2', 'PV1-GT11', 'PV1-EL'],
  },
  'PV1-Roof': { label: 'Roof Array' },
  'PV1-Inv': {
    label: 'Inverter Bank',
    actors: ['PV1-INV1', 'PV1-INV2'],
  },
  HP1: {
    label: 'HP1 Heat Pump',
    actors: ['HP1-GT11', 'HP1-GT21', 'HP1-EP1', 'HP1-SV1', 'HP1-P1', 'HP1-EL'],
  },
};
