import type { ToolkitKey } from './types';

export const toolkit: Record<
  ToolkitKey,
  { label: string; short: string; description: string }
> = {
  mechanical: {
    label: 'Mechanical Assembly & Mechanisms',
    short: 'Mechanical',
    description: 'Assembly, alignment, adjustment, and mechanism checks.',
  },
  cad: {
    label: 'CAD & 3D Modelling',
    short: 'CAD',
    description: 'Editable models that account for fit and manufacture.',
  },
  fabrication: {
    label: 'Digital Fabrication',
    short: 'Fabrication',
    description: 'Preparing and producing parts with digital processes.',
  },
  electronics: {
    label: 'Electronics',
    short: 'Electronics',
    description:
      'Building, measuring, soldering, and troubleshooting circuits.',
  },
  programming: {
    label: 'Programming',
    short: 'Programming',
    description: 'Reading, modifying, writing, and debugging code.',
  },
  physicalComputing: {
    label: 'Physical Computing',
    short: 'Physical computing',
    description: 'Using embedded platforms to read inputs and control outputs.',
  },
  sensorsIot: {
    label: 'Sensors, Data & IoT',
    short: 'Sensors & IoT',
    description:
      'Calibrating sensors and collecting or transmitting useful data.',
  },
  aiVision: {
    label: 'AI / Computer Vision',
    short: 'AI / CV',
    description:
      'Applying a model or vision workflow and evaluating its output.',
  },
  integration: {
    label: 'System Integration & Automation',
    short: 'Integration',
    description: 'Connecting subsystems into reliable end-to-end behaviour.',
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
