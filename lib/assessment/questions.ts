import type { AssessmentItem, AssessmentVersion } from './types';

export const assessmentVersion: AssessmentVersion = 'standard-v1.2';

export const behaviourScale = {
  prompt: 'How well does this describe how you usually work?',
  low: 'Not like me yet',
  high: 'Consistently like me',
};

export const technicalScale = {
  prompt: 'What best describes your current experience?',
  low: 'No direct experience yet',
  high: 'Independent and adaptable',
  details: [
    'No direct experience yet',
    'Tried with step-by-step guidance',
    'Familiar tasks with some help',
    'Independent with common troubleshooting',
    'Can adapt, integrate, or guide others',
  ],
};

const projectCountOptions = [
  { id: 'none', label: 'None yet', value: 1 },
  { id: 'one', label: 'One', value: 2 },
  { id: 'two', label: 'Two', value: 3 },
  { id: 'three-four', label: 'Three or four', value: 4 },
  { id: 'five-plus', label: 'Five or more', value: 5 },
];

const responsibilityOptions = [
  { id: 'observed', label: 'Observed or followed a demonstration', value: 1 },
  {
    id: 'guided',
    label: 'Completed a defined task with close, step-by-step guidance',
    value: 2,
  },
  {
    id: 'owned-familiar',
    label: 'Owned a familiar task with occasional help or review',
    value: 3,
  },
  {
    id: 'owned-subsystem',
    label: 'Independently owned a subsystem, test, or major deliverable',
    value: 4,
  },
  {
    id: 'integrated',
    label:
      'Coordinated interfaces or integrated work across people or subsystems',
    value: 5,
  },
];

export const interestOptions = [
  { id: 'built-environment', label: 'Built environment & infrastructure' },
  { id: 'robotics', label: 'Robotics & automation' },
  { id: 'product-design', label: 'Mechanical & product design' },
  { id: 'connected-devices', label: 'Electronics & connected devices' },
  { id: 'software', label: 'Software & digital systems' },
  { id: 'data-ai', label: 'Data, AI & computer vision' },
  { id: 'energy', label: 'Energy & sustainability' },
  { id: 'health', label: 'Health, accessibility & assistive technology' },
  { id: 'operations', label: 'Operations, logistics & complex systems' },
  { id: 'other-interest', label: 'Other / not sure yet' },
];

export const growthOptions = [
  { id: 'problem', label: 'Identifying and framing problems' },
  { id: 'planning', label: 'Turning proposals into realistic plans' },
  { id: 'collaboration', label: 'Collaborating across roles and disciplines' },
  { id: 'handsOn', label: 'Building and troubleshooting systems' },
  { id: 'design', label: 'Prototyping, testing, and iterating' },
  { id: 'pitch', label: 'Pitching engineering solutions' },
  { id: 'mechanical', label: 'Mechanical Assembly & Mechanisms' },
  { id: 'cad', label: 'CAD & 3D Modelling' },
  { id: 'fabrication', label: 'Digital Fabrication' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'programming', label: 'Programming' },
  { id: 'physicalComputing', label: 'Physical Computing' },
  { id: 'sensorsIot', label: 'Sensors, Data & IoT' },
  { id: 'aiVision', label: 'AI / Computer Vision' },
  { id: 'integration', label: 'System Integration & Automation' },
  {
    id: 'unfamiliarTools',
    label: 'Learning unfamiliar engineering tools and methods',
  },
  { id: 'not-sure', label: 'Not sure yet' },
];

export const questions: AssessmentItem[] = [
  {
    id: 'B01',
    number: 1,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'problem',
    prompt:
      'Before proposing a solution, I investigate what is actually happening.',
    activeLearningEssentialTags: ['problemSolving'],
  },
  {
    id: 'B02',
    number: 2,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'collaboration',
    prompt:
      'In team projects, I take ownership of my responsibilities and deliver work others can rely on.',
    activeLearningEssentialTags: ['valueAndAttitude'],
  },
  {
    id: 'B03',
    number: 3,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'pitch',
    prompt:
      'I adjust how I explain a problem and proposed solution so a particular audience can follow why it matters.',
    activeLearningEssentialTags: ['communication'],
  },
  {
    id: 'B04',
    number: 4,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'planning',
    prompt:
      "I compare meaningful solution approaches against the project's requirements before committing to one.",
    activeLearningEssentialTags: ['problemSolving', 'designAndInnovation'],
  },
  {
    id: 'B05',
    number: 5,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'design',
    prompt:
      'I make an early prototype while there is still time for what I learn to change the design.',
    activeLearningEssentialTags: ['designAndInnovation', 'lifelongLearning'],
  },
  {
    id: 'B06',
    number: 6,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'collaboration',
    prompt:
      'I connect ideas and methods from people with different technical backgrounds when solving a problem.',
    activeLearningEssentialTags: ['interdisciplinaryThinking'],
  },
  {
    id: 'B07',
    number: 7,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'problem',
    prompt:
      'I use evidence to check whether an engineering problem is real and important.',
    helper:
      'Evidence might include observation, user input, measurements, or research.',
    activeLearningEssentialTags: ['problemSolving', 'valueAndAttitude'],
  },
  {
    id: 'B08',
    number: 8,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'design',
    prompt:
      'I design tests to answer a specific question or check a clear success criterion.',
    activeLearningEssentialTags: ['designAndInnovation', 'problemSolving'],
  },
  {
    id: 'B09',
    number: 9,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'planning',
    prompt:
      'I turn an idea into an actionable plan with clear milestones and ownership.',
    activeLearningEssentialTags: ['problemSolving'],
  },
  {
    id: 'B10',
    number: 10,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'pitch',
    prompt:
      'I support important claims about an engineering solution with relevant evidence.',
    activeLearningEssentialTags: ['communication', 'valueAndAttitude'],
  },
  {
    id: 'B11',
    number: 11,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'design',
    prompt:
      'When a prototype fails, I diagnose the likely cause before deciding what to change.',
    activeLearningEssentialTags: ['designAndInnovation', 'lifelongLearning'],
  },
  {
    id: 'B12',
    number: 12,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'collaboration',
    prompt:
      'When a team disagrees, I help clarify the issue and move toward a workable decision.',
    activeLearningEssentialTags: [
      'interdisciplinaryThinking',
      'valueAndAttitude',
    ],
  },
  {
    id: 'B13',
    number: 13,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'planning',
    prompt:
      'Before work begins, I identify important risks that could affect the safety, feasibility, or responsible use of the solution.',
    helper:
      'Risks may be technical, safety-related, environmental, social, financial, or practical.',
    activeLearningEssentialTags: ['problemSolving', 'valueAndAttitude'],
  },
  {
    id: 'B14',
    number: 14,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'problem',
    prompt:
      'I turn a broad concern into a specific engineering problem that a team can act on.',
    activeLearningEssentialTags: ['problemSolving'],
  },
  {
    id: 'B15',
    number: 15,
    phase: 'behaviour',
    kind: 'behaviour',
    competency: 'pitch',
    prompt:
      "I explain a solution's important limitations and trade-offs honestly.",
    activeLearningEssentialTags: ['communication', 'valueAndAttitude'],
  },
  {
    id: 'T01',
    number: 16,
    phase: 'technical',
    kind: 'technical',
    toolkit: 'mechanical',
    prompt:
      'Assemble, adjust, and troubleshoot a basic mechanical system using suitable tools and mechanism checks.',
  },
  {
    id: 'T02',
    number: 17,
    phase: 'technical',
    kind: 'technical',
    toolkit: 'cad',
    prompt:
      'Turn measurements or a sketch into an editable 3D model that accounts for fit and manufacture.',
  },
  {
    id: 'T03',
    number: 18,
    phase: 'technical',
    kind: 'technical',
    toolkit: 'fabrication',
    prompt:
      'Prepare and produce a part using a process such as 3D printing or laser cutting.',
  },
  {
    id: 'T04',
    number: 19,
    phase: 'technical',
    kind: 'technical',
    toolkit: 'electronics',
    prompt:
      'Build, measure, and troubleshoot a basic electronic circuit using breadboards or soldered connections.',
  },
  {
    id: 'T05',
    number: 20,
    phase: 'technical',
    kind: 'technical',
    toolkit: 'programming',
    prompt:
      'Read, modify, write, and debug code to achieve a defined behaviour.',
    activeLearningEssentialTags: ['lifelongLearning'],
  },
  {
    id: 'T06',
    number: 21,
    phase: 'technical',
    kind: 'technical',
    toolkit: 'physicalComputing',
    prompt:
      'Use a Raspberry Pi, Arduino, ESP32, or similar platform to read inputs and control outputs.',
  },
  {
    id: 'T07',
    number: 22,
    phase: 'technical',
    kind: 'technical',
    toolkit: 'sensorsIot',
    prompt:
      'Connect and calibrate sensors, then collect or transmit useful data reliably.',
  },
  {
    id: 'T08',
    number: 23,
    phase: 'technical',
    kind: 'technical',
    toolkit: 'aiVision',
    prompt:
      'Apply or adapt an AI or computer-vision workflow and evaluate whether its output is useful.',
    activeLearningEssentialTags: ['designAndInnovation', 'lifelongLearning'],
  },
  {
    id: 'T09',
    number: 24,
    phase: 'technical',
    kind: 'technical',
    toolkit: 'integration',
    prompt:
      'Connect subsystems into a reliable end-to-end or automated behaviour.',
    helper:
      'Think about mechanical, electronic, sensing, and software interfaces.',
    activeLearningEssentialTags: [
      'designAndInnovation',
      'interdisciplinaryThinking',
    ],
  },
  {
    id: 'C01',
    number: 25,
    phase: 'context',
    kind: 'context',
    prompt:
      'How many engineering projects have you completed that involved making, testing, analysing, or integrating a solution?',
    helper:
      'Course, competition, personal, internship, research, and community projects may all count.',
    options: projectCountOptions,
  },
  {
    id: 'C02',
    number: 26,
    phase: 'context',
    kind: 'context',
    prompt:
      'What is the highest level of responsibility you have taken in an engineering project?',
    options: responsibilityOptions,
  },
  {
    id: 'I01',
    number: 27,
    phase: 'priorities',
    kind: 'interest',
    prompt:
      'Which kinds of engineering work would you most like to explore next?',
    helper: 'Optional · select up to three.',
    options: interestOptions,
    min: 0,
    max: 3,
  },
  {
    id: 'G01',
    number: 28,
    phase: 'priorities',
    kind: 'growth',
    prompt: 'What would you most like to become better at next?',
    helper: 'Select one to three, or choose Not sure yet.',
    options: growthOptions,
    min: 1,
    max: 3,
    activeLearningEssentialTags: ['lifelongLearning'],
  },
  {
    id: 'J01',
    number: 29,
    phase: 'judgment',
    kind: 'judgment',
    prompt:
      "A prototype's sensor readings suddenly become inconsistent. What would you be most likely to do first?",
    options: [
      {
        id: 'adjust',
        label: 'Keep adjusting different parts until the readings look better.',
        value: 1,
      },
      {
        id: 'replace',
        label: 'Replace the sensor immediately because it is probably faulty.',
        value: 2,
      },
      {
        id: 'repeat',
        label: 'Repeat the same test to see whether the issue disappears.',
        value: 3,
      },
      {
        id: 'isolate',
        label:
          'Check the setup, expected range, connections, and calibration, changing one likely cause at a time.',
        value: 4,
      },
      {
        id: 'diagnose',
        label:
          'Define a short diagnostic test, compare evidence with expected behaviour, isolate variables, and document the conclusion.',
        value: 5,
      },
    ],
    activeLearningEssentialTags: ['problemSolving', 'lifelongLearning'],
  },
  {
    id: 'J02',
    number: 30,
    phase: 'judgment',
    kind: 'judgment',
    prompt:
      'Your team prefers its current design, but a fair test shows that it misses an important success criterion. What would you be most likely to do?',
    options: [
      {
        id: 'hide',
        label: 'Keep the design and avoid emphasising the failed result.',
        value: 1,
      },
      {
        id: 'repeat-win',
        label: 'Repeat the test until the team gets a result it can present.',
        value: 2,
      },
      {
        id: 'continue',
        label:
          'Mention the result but continue because changing direction would be inconvenient.',
        value: 3,
      },
      {
        id: 'review',
        label:
          'Review the test quality and criterion, then revise the design or justify an explicit trade-off.',
        value: 4,
      },
      {
        id: 'decide',
        label:
          'Verify the evidence, compare feasible alternatives, document the decision, and communicate the limitation.',
        value: 5,
      },
    ],
    activeLearningEssentialTags: ['valueAndAttitude', 'designAndInnovation'],
  },
];

