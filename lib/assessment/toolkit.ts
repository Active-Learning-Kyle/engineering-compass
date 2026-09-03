import type { ToolkitKey } from './types';

export const toolkit: Record<
  ToolkitKey,
  { label: string; short: string; description: string; skills: string[] }
> = {
  mechanical: {
    label: 'Mechanical Assembly & Mechanisms',
    short: 'Mechanical',
    description: 'Assembly, alignment, adjustment, and mechanism checks.',
    skills: [
      'Hand-tool assembly',
      'Alignment & fit',
      'Mechanism checks',
      'Troubleshooting',
    ],
  },
  cad: {
    label: 'CAD & 3D Modelling',
    short: 'CAD',
    description: 'Editable models that account for fit and manufacture.',
    skills: [
      'Sketch-to-model',
      'Parametric editing',
      'Fit & tolerance',
      'Design for manufacture',
    ],
  },
  fabrication: {
    label: 'Digital Fabrication',
    short: 'Fabrication',
    description: 'Preparing and producing parts with digital processes.',
    skills: [
      'File preparation',
      'Process setup',
      'Material & settings choice',
      'Part production',
    ],
  },
  electronics: {
    label: 'Electronics',
    short: 'Electronics',
    description:
      'Building, measuring, soldering, and troubleshooting circuits.',
    skills: [
      'Breadboarding & wiring',
      'Measurement',
      'Soldering',
      'Circuit troubleshooting',
    ],
  },
  programming: {
    label: 'Programming',
    short: 'Programming',
    description: 'Reading, modifying, writing, and debugging code.',
    skills: [
      'Read & modify code',
      'Write defined behaviours',
      'Debug logic',
      'Test outputs',
    ],
  },
  physicalComputing: {
    label: 'Physical Computing',
    short: 'Physical computing',
    description: 'Using embedded platforms to read inputs and control outputs.',
    skills: [
      'Microcontrollers & SBCs',
      'Digital & analogue I/O',
      'Input sensing',
      'Output control',
    ],
  },
  sensorsIot: {
    label: 'Sensors, Data & IoT',
    short: 'Sensors & IoT',
    description:
      'Calibrating sensors and collecting or transmitting useful data.',
    skills: [
      'Sensor calibration',
      'Data collection',
      'Data quality checks',
      'Transmission & IoT',
    ],
  },
  aiVision: {
    label: 'AI / Computer Vision',
    short: 'AI / CV',
    description:
      'Applying a model or vision workflow and evaluating its output.',
    skills: [
      'Input preparation',
      'Model or CV workflow',
      'Output evaluation',
      'Limitations & reliability',
    ],
  },
  integration: {
    label: 'System Integration & Automation',
    short: 'Integration',
    description: 'Connecting subsystems into reliable end-to-end behaviour.',
    skills: [
      'Interface definition',
      'Subsystem connection',
      'End-to-end testing',
      'Automation reliability',
    ],
  },
};

export const toolkitOrder: ToolkitKey[] = [
  'mechanical',
  'cad',
  'fabrication',
  'electronics',
  'programming',
  'physicalComputing',
  'sensorsIot',
  'aiVision',
  'integration',
];
