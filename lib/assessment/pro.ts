import { questions } from './questions';
import { competencies } from './competencies';
import { toolkit, toolkitOrder } from './toolkit';
import type {
  AssessmentAnswers,
  AssessmentEdition,
  CompetencyKey,
  ProCheckItem,
  ToolkitKey,
} from './types';

// Pro v0.1: 30 unchanged core items + 12 decisions + 18 evidence reflections.
// Additional choices have identifiers, not ability points. They never enter scoring.ts.
type Scenario = [CompetencyKey, string, Array<[string, string]>];
const scenarios: Scenario[] = [
  [
    'problem',
    'Students say a workshop booking system is frustrating. Before redesigning it, what would you do first?',
    [
      [
        'List features that other booking systems provide.',
        'Feature comparisons can help later. First check where users actually encounter difficulty.',
      ],
      [
        'Observe a few bookings and ask users what they were trying to achieve.',
        'You start with observed needs. Include different users before treating an initial pattern as typical.',
      ],
      [
        'Ask the team to vote on the most likely problem.',
        'A team vote can surface hypotheses; test them with users before selecting a solution.',
      ],
      [
        'Build a faster booking screen and see whether people like it.',
        'A quick prototype can test an idea, but first establish which part of booking needs improvement.',
      ],
    ],
  ],
  [
    'planning',
    'Your prototype is due in two weeks, but a key component may arrive late. How would you adjust the plan?',
    [
      [
        'Continue with the original plan until the delivery date is certain.',
        'Waiting can leave little recovery time. Set a decision date and identify work that does not depend on delivery.',
      ],
      [
        'Replace the component immediately with anything available.',
        'A substitute may help; check its interfaces and performance before committing.',
      ],
      [
        'Identify dependent tasks, test a fallback, and agree when to switch plans.',
        'You make the dependency and decision point explicit. Confirm who owns the fallback test.',
      ],
      [
        'Ask everyone to work faster near the deadline.',
        'Extra effort cannot remove every dependency. Reduce scope or test a fallback before relying on overtime.',
      ],
    ],
  ],
  [
    'collaboration',
    'The mechanical and electronics teams disagree about the space available for a sensor. What would you do next?',
    [
      [
        'Bring both teams together around dimensions, constraints, and an interface drawing.',
        'You connect the disagreement to shared evidence. Record the agreed dimensions and an owner for changes.',
      ],
      [
        'Let the team with more experience choose.',
        'Experience is useful, but make each discipline’s constraints visible before deciding.',
      ],
      [
        'Ask both teams to continue and resolve the fit at assembly.',
        'Deferring an interface conflict can create rework. Test the fit together earlier.',
      ],
      [
        'Choose a compromise halfway between their requests.',
        'A numerical compromise may satisfy neither constraint. Check what each requirement protects.',
      ],
    ],
  ],
  [
    'handsOn',
    'A small robot moves unpredictably after a wiring change. What is your first diagnostic step?',
    [
      [
        'Rewrite the movement code.',
        'Code may be involved, but first isolate what changed and check the physical connections safely.',
      ],
      [
        'Change the motor and controller together.',
        'Changing several parts can hide the cause. Test one suspect element at a time.',
      ],
      [
        'Keep trying the full robot until the failure repeats.',
        'Reproduction helps only with controlled, safe conditions and useful observations.',
      ],
      [
        'Make it safe, inspect the changed connections, and test one subsystem at a time.',
        'You isolate the fault before changing more variables. Record the test and result so others can reproduce it.',
      ],
    ],
  ],
  [
    'design',
    'People struggle with the handle on your prototype. What would you test next?',
    [
      [
        'Finish the full product before making another handle.',
        'A small handle test can answer the usability question before you invest in the full product.',
      ],
      [
        'Make two low-cost handle variants and observe the same task with each.',
        'You compare alternatives around a focused question. Use consistent tasks and note differences between users.',
      ],
      [
        'Ask the team which handle looks best.',
        'Appearance is one consideration; observing grip and task completion gives more direct usability evidence.',
      ],
      [
        'Add more features to make the product more appealing.',
        'More features may not address the difficulty. Isolate the handle issue first.',
      ],
    ],
  ],
  [
    'pitch',
    'Your prototype passed one laboratory test. How would you present it to a potential user?',
    [
      [
        'Say that it is proven to work reliably.',
        'One test is not enough to establish reliability. State the test conditions and remaining uncertainty.',
      ],
      [
        'Show only the technical details and let the audience decide.',
        'Explain what the evidence means for the user, not only how the system was built.',
      ],
      [
        'Explain the benefit, show the test conditions, and state what has not been tested.',
        'You connect value to evidence while making limits visible. Invite questions about the user’s actual setting.',
      ],
      [
        'Avoid discussing results until every possible test is complete.',
        'You can share early evidence honestly without claiming the solution is finished.',
      ],
    ],
  ],
  [
    'problem',
    'A solution works well for most users, but fails for a small group. How would you revisit the problem?',
    [
      [
        'Study that group’s tasks and constraints before deciding whether the requirements must change.',
        'You check who the original framing left out. Document whose needs are covered and whose remain unresolved.',
      ],
      [
        'Treat the failures as exceptions and keep the original requirements.',
        'Exceptions may reveal a missing need. Understand their impact before excluding them.',
      ],
      [
        'Add the feature requested by the most vocal user.',
        'A request is a useful lead, not yet a shared requirement. Check the underlying need.',
      ],
      [
        'Reduce the target audience without further investigation.',
        'Narrowing scope can be reasonable, but explain the evidence and consequences behind that choice.',
      ],
    ],
  ],
  [
    'planning',
    'Two designs meet the main requirement: one is cheaper, the other easier to repair. How would you choose?',
    [
      [
        'Choose the lower purchase price.',
        'Purchase price is only one cost. Consider maintenance and the intended use period.',
      ],
      [
        'Ask each designer to argue for their design, then vote.',
        'Discussion helps; agree on criteria before comparing the proposals.',
      ],
      [
        'Choose the design that looks more technically advanced.',
        'Complexity is not a benefit by itself. Compare against the actual requirements.',
      ],
      [
        'Agree on cost, repair, safety, and use criteria, then compare evidence and trade-offs.',
        'You make the choice traceable to requirements. Identify any criterion supported only by an assumption.',
      ],
    ],
  ],
  [
    'collaboration',
    'A teammate has not delivered an agreed task and integration is blocked. How would you respond?',
    [
      [
        'Quietly redo the work yourself.',
        'Taking over may unblock today’s task but hide the underlying dependency. Discuss support and ownership first.',
      ],
      [
        'Check the blocker with them, agree on help or a smaller handover, and update the team’s plan.',
        'You combine accountability with support. Make the revised handover and date visible to everyone affected.',
      ],
      [
        'Wait for the next scheduled meeting.',
        'If others are blocked, an earlier check-in can prevent avoidable delay.',
      ],
      [
        'Announce to the team that they are responsible for the delay.',
        'Name the dependency without assigning blame before you understand the cause and recovery options.',
      ],
    ],
  ],
  [
    'handsOn',
    'Two subsystems work separately but fail when connected. What would you examine first?',
    [
      [
        'Replace the subsystem with the lower individual performance.',
        'Individual performance may not explain an integration fault. Check the shared interface first.',
      ],
      [
        'Run the complete system repeatedly with different settings.',
        'Unstructured changes make causes harder to identify. Record one interface test at a time.',
      ],
      [
        'Check power, units, timing, and data formats at the interface with a known test input.',
        'You focus on how the parts interact. Keep the test input and expected output available for regression checks.',
      ],
      [
        'Assume one team’s tests were wrong.',
        'Separate tests may both be valid. Compare their assumptions with the connected system’s conditions.',
      ],
    ],
  ],
  [
    'design',
    'Your second prototype performs worse than the first, but you changed three features. What next?',
    [
      [
        'Return to the baseline and test the changes separately against the same criterion.',
        'You make learning from iteration possible. Keep a record of the baseline and each isolated change.',
      ],
      [
        'Keep all three changes and add another improvement.',
        'More changes may make the cause less clear. Isolate the effect of each change first.',
      ],
      [
        'Use whichever prototype the team prefers.',
        'Preference matters for some questions, but check it against the performance criterion that declined.',
      ],
      [
        'Discard both prototypes and start over.',
        'The comparison already contains useful evidence. Recover what it can tell you before restarting.',
      ],
    ],
  ],
  [
    'pitch',
    'A nontechnical partner misunderstands a key limitation during your presentation. What would you do?',
    [
      [
        'Repeat the technical explanation in more detail.',
        'More detail may not resolve the misunderstanding. Try an example tied to their intended use.',
      ],
      [
        'Move on so the presentation stays on time.',
        'A misunderstood limitation can lead to a poor decision. Clarify it before moving on.',
      ],
      [
        'Remove the limitation from the slide to avoid confusion.',
        'The limitation still matters. Explain its practical consequence in plain language.',
      ],
      [
        'Use a concrete example, explain the consequence, and ask them to describe their understanding.',
        'You check shared understanding rather than assuming it. Adapt the example to the partner’s context.',
      ],
    ],
  ],
];

type EvidenceTask = [ToolkitKey, string, string];
const evidenceTasks: EvidenceTask[] = [
  [
    'mechanical',
    'assembling a mechanism and checking alignment or freedom of movement',
    'an assembly check, fit measurement, or movement test',
  ],
  [
    'mechanical',
    'isolating a mechanical fault and testing an adjustment',
    'a before-and-after test or a fault log',
  ],
  [
    'cad',
    'creating a dimensioned model that another person could edit',
    'an editable model and a clear dimensioning scheme',
  ],
  [
    'cad',
    'checking the fit of mating parts before manufacture',
    'a clearance check or a test fit against the model',
  ],
  [
    'fabrication',
    'preparing a file and approved machine settings for a fabricated part',
    'a reviewed setup file and a test piece',
  ],
  [
    'fabrication',
    'adjusting a fabrication process after inspecting a test piece',
    'measured defects and the effect of one changed setting',
  ],
  [
    'electronics',
    'building and measuring a low-voltage circuit using appropriate safety procedures',
    'measurements compared with expected circuit behaviour',
  ],
  [
    'electronics',
    'finding a circuit fault through systematic measurements',
    'a diagnostic sequence identifying the fault',
  ],
  [
    'programming',
    'writing or adapting code to meet a defined input-output requirement',
    'a working program with repeatable tests',
  ],
  [
    'programming',
    'finding a software bug and checking that the fix does not break another behaviour',
    'a minimal failing example and a regression test',
  ],
  [
    'physicalComputing',
    'reading a hardware input and using it to control an output',
    'a repeatable input-output demonstration',
  ],
  [
    'physicalComputing',
    'diagnosing timing or state problems in an embedded system',
    'logs or observations that isolate the timing or state issue',
  ],
  [
    'sensorsIot',
    'calibrating a sensor against a reference and checking repeatability',
    'reference readings and a record of variation',
  ],
  [
    'sensorsIot',
    'handling missing or unreliable readings in a connected data stream',
    'a data-quality check and a tested recovery behaviour',
  ],
  [
    'aiVision',
    'evaluating a model with data not used for training',
    'held-out examples and an error analysis',
  ],
  [
    'aiVision',
    'checking how lighting, background, or user differences affect a vision model',
    'comparisons across conditions and documented limitations',
  ],
  [
    'integration',
    'agreeing and testing an interface between two subsystems',
    'an interface specification and an end-to-end test',
  ],
  [
    'integration',
    'testing how an integrated system recovers from a missing input or failed component',
    'a controlled failure test and a recovery check',
  ],
];

export const proChecks: ProCheckItem[] = [
  ...scenarios.map(
    ([area, prompt, choices], index): ProCheckItem => ({
      id: `PS${String(index + 1).padStart(2, '0')}`,
      number: 31 + index,
      phase: 'proScenarios',
      kind: 'proCheck',
      area,
      prompt,
      helper: 'Choose the action closest to what you would actually do first.',
      options: choices.map(([label, feedback], option) => ({
        id: `choice-${option + 1}`,
        value: option + 1,
        label,
        feedback,
      })),
    }),
  ),
  ...evidenceTasks.map(
    ([area, task, evidence], index): ProCheckItem => ({
      id: `PE${String(index + 1).padStart(2, '0')}`,
      number: 43 + index,
      phase: 'proEvidence',
      kind: 'proCheck',
      area,
      prompt: `Think of a time you worked on ${task}. Which description matches your experience?`,
      helper: `Think about evidence such as ${evidence}. You do not need to upload anything.`,
      options: [
        {
          id: 'not-yet',
          value: 1,
          label: 'I have not done this yet.',
          feedback: `Start with a supported task and keep ${evidence}.`,
        },
        {
          id: 'guided',
          value: 2,
          label:
            'I followed instructions, but cannot yet explain or check all the steps myself.',
          feedback: `Repeat a small part of the task, explain the steps, and review ${evidence} with someone experienced.`,
        },
        {
          id: 'contributed',
          value: 3,
          label:
            'I contributed to this task and can explain my part, with some help checking the result.',
          feedback: `Take ownership of the next check and record ${evidence}.`,
        },
        {
          id: 'verified',
          value: 4,
          label:
            'I completed this task independently and can explain how I checked the result.',
          feedback: `Build on that experience by explaining ${evidence} to a teammate and testing an unfamiliar case.`,
        },
      ],
    }),
  ),
];

export const proQuestions = [...questions, ...proChecks];
export const getQuestions = (edition: AssessmentEdition) =>
  edition === 'pro' ? proQuestions : questions;

export function interpretPro(answers: AssessmentAnswers) {
  const scenariosByArea = Object.keys(competencies).map((area) => ({
    area,
    label: competencies[area as CompetencyKey].label,
    reflections: proChecks
      .filter((item) => item.phase === 'proScenarios' && item.area === area)
      .map((item) => ({
        id: item.id,
        prompt: item.prompt,
        choice: item.options.find(
          (option) => option.value === answers[item.id],
        ),
      })),
  }));
  const evidence = toolkitOrder.map((area, index) => {
    const checks = proChecks.filter(
      (item) => item.phase === 'proEvidence' && item.area === area,
    );
    const values = checks.map((item) =>
      typeof answers[item.id] === 'number' ? (answers[item.id] as number) : 0,
    );
    const independent = values.filter((value) => value === 4).length;
    const experienced = values.filter((value) => value >= 3).length;
    const core = answers[`T${String(index + 1).padStart(2, '0')}`];
    const mismatch =
      typeof core === 'number' &&
      core >= 4 &&
      values.some((value) => value > 0 && value <= 2);
    const weakest = checks[values.indexOf(Math.min(...values))];
    return {
      area,
      label: toolkit[area].label,
      summary:
        independent === 2
          ? 'You describe independently checked work in both specific tasks.'
          : experienced > 0
            ? 'You can describe a contribution to at least one of these tasks; your experience varies between them.'
            : 'These specific tasks are still new or mainly guided experiences for you.',
      crossCheck: mismatch
        ? 'Your overall rating suggests independence, while one specific task is newer to you. That may reflect different experience within this area; revisit the rating if needed.'
        : null,
      next: weakest.options.find(
        (option) => option.value === answers[weakest.id],
      )?.feedback,
    };
  });
  return { scenariosByArea, evidence };
}
