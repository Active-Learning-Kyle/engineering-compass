import type { ToolkitKey } from './types';

export const toolkit: Record<
  ToolkitKey,
  { label: string; short: string; description: string; skills: string[] }
> = {
  mechanical: {
    label: 'toolkit.mechanical.label',
    short: 'toolkit.mechanical.short',
    description: 'toolkit.mechanical.description',
    skills: [
      'toolkit.mechanical.skills.0',
      'toolkit.mechanical.skills.1',
      'toolkit.mechanical.skills.2',
      'toolkit.mechanical.skills.3',
    ],
  },
  cad: {
    label: 'toolkit.cad.label',
    short: 'toolkit.cad.short',
    description: 'toolkit.cad.description',
    skills: [
      'toolkit.cad.skills.0',
      'toolkit.cad.skills.1',
      'toolkit.cad.skills.2',
      'toolkit.cad.skills.3',
    ],
  },
  fabrication: {
    label: 'toolkit.fabrication.label',
    short: 'toolkit.fabrication.short',
    description: 'toolkit.fabrication.description',
    skills: [
      'toolkit.fabrication.skills.0',
      'toolkit.fabrication.skills.1',
      'toolkit.fabrication.skills.2',
      'toolkit.fabrication.skills.3',
    ],
  },
  electronics: {
    label: 'toolkit.electronics.label',
    short: 'toolkit.electronics.short',
    description: 'toolkit.electronics.description',
    skills: [
      'toolkit.electronics.skills.0',
      'toolkit.electronics.skills.1',
      'toolkit.electronics.skills.2',
      'toolkit.electronics.skills.3',
    ],
  },
  programming: {
    label: 'toolkit.programming.label',
    short: 'toolkit.programming.short',
    description: 'toolkit.programming.description',
    skills: [
      'toolkit.programming.skills.0',
      'toolkit.programming.skills.1',
      'toolkit.programming.skills.2',
      'toolkit.programming.skills.3',
    ],
  },
  physicalComputing: {
    label: 'toolkit.physicalComputing.label',
    short: 'toolkit.physicalComputing.short',
    description: 'toolkit.physicalComputing.description',
    skills: [
      'toolkit.physicalComputing.skills.0',
      'toolkit.physicalComputing.skills.1',
      'toolkit.physicalComputing.skills.2',
      'toolkit.physicalComputing.skills.3',
    ],
  },
  sensorsIot: {
    label: 'toolkit.sensorsIot.label',
    short: 'toolkit.sensorsIot.short',
    description: 'toolkit.sensorsIot.description',
    skills: [
      'toolkit.sensorsIot.skills.0',
      'toolkit.sensorsIot.skills.1',
      'toolkit.sensorsIot.skills.2',
      'toolkit.sensorsIot.skills.3',
    ],
  },
  aiVision: {
    label: 'toolkit.aiVision.label',
    short: 'toolkit.aiVision.short',
    description: 'toolkit.aiVision.description',
    skills: [
      'toolkit.aiVision.skills.0',
      'toolkit.aiVision.skills.1',
      'toolkit.aiVision.skills.2',
      'toolkit.aiVision.skills.3',
    ],
  },
  integration: {
    label: 'toolkit.integration.label',
    short: 'toolkit.integration.short',
    description: 'toolkit.integration.description',
    skills: [
      'toolkit.integration.skills.0',
      'toolkit.integration.skills.1',
      'toolkit.integration.skills.2',
      'toolkit.integration.skills.3',
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
