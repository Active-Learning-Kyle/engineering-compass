/** Specific, low-stakes practice suggestions, not prescriptions or rankings. */
export const growthActions: Record<string, string> = {
  problem:
    'Interview someone affected by a problem, then rewrite the problem statement using one observation and one constraint.',
  planning:
    'Break a small deliverable into milestones, identify its riskiest assumption, and review the plan with a teammate.',
  collaboration:
    'Agree who owns each interface with a teammate from another discipline, then check that you both understand the handover.',
  handsOn:
    'Build a small working system and keep a fault log: symptom, possible cause, test, and what changed.',
  design:
    'Make a low-cost prototype to answer one question. Observe someone using it and revise one feature from the evidence.',
  pitch:
    'Give a two-minute explanation of a solution, including one piece of evidence and one limitation. Ask what was unclear.',
  mechanical:
    'Assemble a simple mechanism, check its fit and alignment, and record how one adjustment changes its movement.',
  cad: 'Model two mating parts with editable dimensions. Check clearances and ask someone to review whether they can be manufactured.',
  fabrication:
    'Produce a small test piece using an approved process. Compare the actual dimensions with your model before making the full part.',
  electronics:
    'Build a supervised low-voltage circuit and compare measured values with your predictions before changing the design.',
  programming:
    'Write a small program with a clear input and output. Add a normal-case test and an edge-case test, then debug any mismatch.',
  physicalComputing:
    'Connect an input to an output on a microcontroller. Test each separately before combining them into one behaviour.',
  sensorsIot:
    'Collect repeated sensor readings against a reference, check their variation, and document missing or unreliable data.',
  aiVision:
    'Evaluate a small model on examples not used for training. Examine its errors and record where its predictions should not be trusted.',
  integration:
    'Connect two subsystems with an agreed interface. Test normal operation, missing inputs, and recovery after a failure.',
  unfamiliarTools:
    'Choose one unfamiliar tool for a small task. Follow a worked example, then repeat it with one change and explain what you learned.',
  'not-sure':
    'Try one unfamiliar project role, then revisit this reflection with new evidence.',
};
