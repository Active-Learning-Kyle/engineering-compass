'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  CircuitBoard,
  Compass,
  Cpu,
  Download,
  Gauge,
  Lightbulb,
  Network,
  RefreshCw,
  Shapes,
  Sparkles,
  TimerReset,
  Users,
  Wrench,
  Cog,
} from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

import { Button } from '@/components/ui/button';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';

type Step = 'welcome' | 'field' | 'assessment' | 'results';
type CompetencyKey =
  | 'problem'
  | 'planning'
  | 'collaboration'
  | 'handsOn'
  | 'design'
  | 'pitch';
type ToolkitKey =
  | 'Mechanical Assembly'
  | 'CAD & 3D Modelling'
  | 'Digital Fabrication'
  | 'Electronics'
  | 'Programming'
  | 'Embedded Systems'
  | 'Sensors & Measurement'
  | 'Data & Analysis';

type Question = {
  id: number;
  competency: CompetencyKey;
  prompt: string;
  context: string;
  toolkit?: ToolkitKey[];
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
          execute: (input: unknown) => unknown;
        },
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}

const competencies: Record<
  CompetencyKey,
  { label: string; short: string; description: string; color: string }
> = {
  problem: {
    label: 'Problem Identification',
    short: 'Problem',
    description: 'Frame the right challenge before solving it.',
    color: '#8d153a',
  },
  planning: {
    label: 'Proposal with Plan',
    short: 'Planning',
    description: 'Turn ideas into a realistic route forward.',
    color: '#c24856',
  },
  collaboration: {
    label: 'Interdisciplinary Collaboration',
    short: 'Teamwork',
    description: 'Coordinate people, perspectives and dependencies.',
    color: '#d98c53',
  },
  handsOn: {
    label: 'Hands-on Skills',
    short: 'Hands-on',
    description: 'Use technical tools to build, test and learn.',
    color: '#377c7a',
  },
  design: {
    label: 'Design Thinking & Prototyping',
    short: 'Design',
    description: 'Prototype early and improve through evidence.',
    color: '#426c9b',
  },
  pitch: {
    label: 'Pitch for Engineering Solutions',
    short: 'Pitch',
    description: 'Explain value, evidence and trade-offs clearly.',
    color: '#615685',
  },
};

const questions: Question[] = [
  {
    id: 1,
    competency: 'problem',
    prompt:
      'Before proposing a solution, I investigate what is actually happening.',
    context:
      'Think about projects where the initial brief may not have captured the real need.',
  },
  {
    id: 2,
    competency: 'problem',
    prompt:
      'I gather evidence from users, observations or measurements to validate a problem.',
    context:
      'Evidence can be simple: an interview, a count, a test or a direct observation.',
  },
  {
    id: 3,
    competency: 'problem',
    prompt:
      'I can narrow a broad challenge into a specific engineering problem.',
    context: 'A strong problem is clear enough for a team to act on.',
  },
  {
    id: 4,
    competency: 'problem',
    prompt:
      'I distinguish visible symptoms from the underlying cause of a problem.',
    context:
      'Consider whether you ask “why” more than once before deciding what to fix.',
  },
  {
    id: 5,
    competency: 'problem',
    prompt:
      'I identify the people, constraints and conditions that define a problem.',
    context:
      'For example: users, safety, environment, space, time or available resources.',
  },
  {
    id: 6,
    competency: 'planning',
    prompt: 'I translate an idea into clear requirements and success criteria.',
    context:
      'You should be able to tell whether the final outcome actually works.',
  },
  {
    id: 7,
    competency: 'planning',
    prompt:
      'I compare more than one solution direction before choosing an approach.',
    context:
      'This includes considering meaningful alternatives, not cosmetic variations.',
  },
  {
    id: 8,
    competency: 'planning',
    prompt:
      'I assess whether a solution is feasible with the time, budget and resources available.',
    context:
      'Base your answer on what you usually do, not what an ideal team would do.',
  },
  {
    id: 9,
    competency: 'planning',
    prompt:
      'I break a project into milestones, responsibilities and concrete next steps.',
    context: 'A useful plan makes ownership and progress visible.',
  },
  {
    id: 10,
    competency: 'planning',
    prompt:
      'I identify important risks early and prepare a practical response.',
    context:
      'Risks may involve safety, performance, coordination, supply or schedule.',
  },
  {
    id: 11,
    competency: 'collaboration',
    prompt: 'I take clear ownership of my responsibilities in a team project.',
    context: 'Think about whether teammates can rely on your work and updates.',
  },
  {
    id: 12,
    competency: 'collaboration',
    prompt:
      'I actively connect ideas from teammates with different technical backgrounds.',
    context:
      'Interdisciplinary work often requires translating between ways of thinking.',
  },
  {
    id: 13,
    competency: 'collaboration',
    prompt:
      'I invite quieter or differing perspectives before the team commits to a decision.',
    context:
      'Consider what you do when one voice is dominating the discussion.',
  },
  {
    id: 14,
    competency: 'collaboration',
    prompt:
      'I address disagreement constructively and help the team move forward.',
    context: 'The goal is not to avoid conflict, but to use it productively.',
  },
  {
    id: 15,
    competency: 'collaboration',
    prompt:
      'I coordinate dependencies so that one person’s delay does not surprise the whole team.',
    context:
      'This can include check-ins, shared files, interface decisions or contingency plans.',
  },
  {
    id: 16,
    competency: 'handsOn',
    prompt:
      'I can safely assemble, adjust and troubleshoot a basic mechanical system.',
    context:
      'Think about hand tools, fasteners, alignment, mechanisms and physical fit.',
    toolkit: ['Mechanical Assembly'],
  },
  {
    id: 17,
    competency: 'handsOn',
    prompt:
      'I can turn a sketch or measurement into a manufacturable digital model.',
    context:
      'Consider both CAD modelling and preparing a part for 3D printing or laser cutting.',
    toolkit: ['CAD & 3D Modelling', 'Digital Fabrication'],
  },
  {
    id: 18,
    competency: 'handsOn',
    prompt: 'I can build and troubleshoot a basic electronic circuit.',
    context:
      'Think about breadboards, wiring, components, measurement and soldering.',
    toolkit: ['Electronics'],
  },
  {
    id: 19,
    competency: 'handsOn',
    prompt: 'I can write or adapt code to control a physical device.',
    context:
      'This may involve Python, C/C++, a microcontroller or another embedded platform.',
    toolkit: ['Programming', 'Embedded Systems'],
  },
  {
    id: 20,
    competency: 'handsOn',
    prompt:
      'I can collect sensor data and use it to evaluate system performance.',
    context:
      'Consider calibration, measurement quality, plotting and interpreting results.',
    toolkit: ['Sensors & Measurement', 'Data & Analysis'],
  },
  {
    id: 21,
    competency: 'design',
    prompt:
      'I build a simple prototype early enough for it to change the direction of the project.',
    context:
      'An early prototype can be rough, partial or made from low-cost materials.',
  },
  {
    id: 22,
    competency: 'design',
    prompt: 'I plan tests around specific questions or success criteria.',
    context:
      'A useful test is designed to reduce uncertainty, not only demonstrate the idea.',
  },
  {
    id: 23,
    competency: 'design',
    prompt: 'I use feedback and test evidence to decide what to change next.',
    context:
      'Think about whether evidence can override your original preference.',
  },
  {
    id: 24,
    competency: 'design',
    prompt:
      'When a prototype fails, I diagnose the cause before making changes.',
    context:
      'Systematic learning is more valuable than random trial and error.',
  },
  {
    id: 25,
    competency: 'design',
    prompt:
      'I document iterations so the team understands what improved and why.',
    context:
      'Documentation may include sketches, photos, measurements, versions or decisions.',
  },
  {
    id: 26,
    competency: 'pitch',
    prompt:
      'I can explain the problem and proposed solution in a clear, logical story.',
    context:
      'A listener should quickly understand what matters and what you are proposing.',
  },
  {
    id: 27,
    competency: 'pitch',
    prompt:
      'I explain the value of a solution from the user or stakeholder’s perspective.',
    context:
      'Value may involve experience, safety, efficiency, access, cost or impact.',
  },
  {
    id: 28,
    competency: 'pitch',
    prompt: 'I support important claims with relevant evidence.',
    context:
      'Evidence can come from testing, calculations, research, comparison or user feedback.',
  },
  {
    id: 29,
    competency: 'pitch',
    prompt:
      'I can explain limitations and trade-offs without weakening the core proposal.',
    context:
      'Credible engineering communication is transparent about what a design cannot do.',
  },
  {
    id: 30,
    competency: 'pitch',
    prompt:
      'I adapt technical detail and language to the needs of my audience.',
    context:
      'Consider how you communicate differently with peers, users and decision-makers.',
  },
];

const scale = [
  { value: 1, label: 'Not yet', hint: 'Rarely true' },
  { value: 2, label: 'Emerging', hint: 'Sometimes, with help' },
  { value: 3, label: 'Developing', hint: 'Often, in familiar work' },
  { value: 4, label: 'Capable', hint: 'Usually, independently' },
  { value: 5, label: 'Consistent', hint: 'Across varied projects' },
];

const fieldOptions = [
  {
    id: 'civil',
    title: 'Civil Engineering',
    subtitle: 'Structures, infrastructure & the built environment',
    icon: Building2,
  },
  {
    id: 'data',
    title: 'Data & Systems Engineering',
    subtitle: 'Data, decisions, logistics & complex systems',
    icon: Network,
  },
  {
    id: 'ece',
    title: 'Electrical & Computer Engineering',
    subtitle: 'Circuits, computing, control & communication',
    icon: Cpu,
  },
  {
    id: 'mechanical',
    title: 'Mechanical Engineering',
    subtitle: 'Machines, materials, energy & design',
    icon: Cog,
  },
];

const sectionIcons: Record<CompetencyKey, typeof Compass> = {
  problem: Compass,
  planning: BarChart3,
  collaboration: Users,
  handsOn: Wrench,
  design: Lightbulb,
  pitch: Sparkles,
};

const chartConfig = {
  score: { label: 'Score', color: '#8d153a' },
} satisfies ChartConfig;
const toPercent = (value: number) => Math.round(((value - 1) / 4) * 100);

export default function Home() {
  const [step, setStep] = useState<Step>('welcome');
  const [field, setField] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [responseMs, setResponseMs] = useState<number | null>(null);
  const [fastStreak, setFastStreak] = useState(0);
  const [lastNudgeAt, setLastNudgeAt] = useState(-10);
  const [showNudge, setShowNudge] = useState(false);
  const questionStarted = useRef(0);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const allowedFields = [
      'civil',
      'data',
      'ece',
      'mechanical',
      'other',
      'skip',
    ];
    void Promise.resolve(
      context.registerTool(
        {
          name: 'start_engineering_assessment',
          title: 'Start Engineering Compass',
          description:
            'Start a fresh 30-question Engineering Compass assessment, optionally setting the learner’s engineering field for background context only.',
          inputSchema: {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                enum: allowedFields,
                description:
                  'Optional background field. Use skip to leave it unset.',
              },
            },
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            if (typeof input !== 'object' || input === null) {
              throw new Error('Input must be an object.');
            }
            const requestedField = (input as { field?: unknown }).field;
            if (
              requestedField !== undefined &&
              (typeof requestedField !== 'string' ||
                !allowedFields.includes(requestedField))
            ) {
              throw new Error(
                'Field must be one of the supported Engineering Compass options.',
              );
            }
            setField(
              requestedField === 'skip' || requestedField === undefined
                ? null
                : requestedField,
            );
            setAnswers({});
            setCurrent(0);
            setFastStreak(0);
            setLastNudgeAt(-10);
            setShowNudge(false);
            setResponseMs(null);
            questionStarted.current = Date.now();
            setStep('assessment');
            return { status: 'started', question: 1, totalQuestions: 30 };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const activeQuestion = questions[current];
  const selected = answers[activeQuestion?.id];
  const results = useMemo(() => {
    const competencyScores = (Object.keys(competencies) as CompetencyKey[]).map(
      (key) => {
        const items = questions.filter(
          (question) => question.competency === key,
        );
        const average =
          items.reduce(
            (sum, question) => sum + (answers[question.id] ?? 1),
            0,
          ) / items.length;
        return {
          key,
          subject: competencies[key].short,
          fullLabel: competencies[key].label,
          score: toPercent(average),
          description: competencies[key].description,
          color: competencies[key].color,
        };
      },
    );
    const toolkitMap = new Map<ToolkitKey, number[]>();
    questions.forEach((question) =>
      question.toolkit?.forEach((tool) =>
        toolkitMap.set(tool, [
          ...(toolkitMap.get(tool) ?? []),
          answers[question.id] ?? 1,
        ]),
      ),
    );
    const toolkitScores = Array.from(toolkitMap.entries()).map(
      ([name, values]) => ({
        name,
        score: toPercent(
          values.reduce((sum, value) => sum + value, 0) / values.length,
        ),
      }),
    );
    return { competencyScores, toolkitScores };
  }, [answers]);

  function beginAssessment() {
    setCurrent(0);
    questionStarted.current = Date.now();
    setStep('assessment');
  }

  function chooseAnswer(value: number) {
    setAnswers((previous) => ({ ...previous, [activeQuestion.id]: value }));
    // oxlint-disable-next-line react/react-compiler -- timing is intentionally sampled in a user event handler.
    setResponseMs(Date.now() - questionStarted.current);
    setShowNudge(false);
  }

  function advance(force = false) {
    if (!selected) return;
    const wasFast = (responseMs ?? 99999) < 1800;
    const nextStreak = wasFast ? fastStreak + 1 : 0;
    if (!force && nextStreak >= 2 && current - lastNudgeAt >= 6) {
      setFastStreak(nextStreak);
      setLastNudgeAt(current);
      setShowNudge(true);
      return;
    }
    setFastStreak(force ? 0 : nextStreak);
    setShowNudge(false);
    setResponseMs(null);
    if (current === questions.length - 1) {
      setStep('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrent((value) => value + 1);
    questionStarted.current = Date.now();
  }

  function goBack() {
    if (current === 0) {
      setStep('field');
      return;
    }
    setCurrent((value) => value - 1);
    setResponseMs(null);
    setShowNudge(false);
    questionStarted.current = Date.now();
  }

  function restart() {
    setStep('welcome');
    setField(null);
    setCurrent(0);
    setAnswers({});
    setFastStreak(0);
    setLastNudgeAt(-10);
    setShowNudge(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function downloadSummary() {
    const fieldLabel =
      fieldOptions.find((option) => option.id === field)?.title ??
      (field === 'other' ? 'Other / Interdisciplinary' : 'Not provided');
    const lines = [
      'ENGINEERING COMPASS — PERSONAL PROFILE',
      `Engineering field: ${fieldLabel}`,
      '',
      'SIX ENGINEERING COMPETENCIES',
      ...results.competencyScores.map(
        (item) => `${item.fullLabel}: ${item.score}/100`,
      ),
      '',
      'TECHNICAL TOOLKIT',
      ...results.toolkitScores.map((item) => `${item.name}: ${item.score}/100`),
      '',
      'A formative reflection profile — not a grade or selection test.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'engineering-compass-profile.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header
        progress={step === 'assessment' ? ((current + 1) / 30) * 100 : null}
      />

      {step === 'welcome' && (
        <section className="relative overflow-hidden">
          <div
            className="compass-grid absolute inset-0 opacity-70"
            aria-hidden="true"
          />
          <div className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.08fr_.92fr] lg:px-12">
            <div className="max-w-3xl">
              <div className="eyebrow mb-6">
                <Compass className="size-4" /> ENGG1101 · FORMATIVE REFLECTION
              </div>
              <h1 className="display-title text-[clamp(3.4rem,8vw,7.7rem)] leading-[.86] tracking-[-.065em]">
                Find your<span className="block text-primary">engineering</span>
                direction.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                A practical self-assessment across six capabilities that help
                engineers define, build, collaborate and communicate.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-13 rounded-full px-7 text-base shadow-[0_12px_34px_rgba(141,21,58,.22)]"
                  onClick={() => setStep('field')}
                >
                  Begin assessment <ArrowRight className="ml-1 size-4" />
                </Button>
                <div className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
                  <Gauge className="size-4" /> About 8–10 minutes
                </div>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-lg">
              <div className="profile-orbit" aria-hidden="true">
                <div className="orbit-center">
                  <Compass className="size-12" strokeWidth={1.4} />
                  <span>YOUR PROFILE</span>
                </div>
                {(Object.keys(competencies) as CompetencyKey[]).map(
                  (key, index) => {
                    const Icon = sectionIcons[key];
                    return (
                      <div
                        key={key}
                        className={`orbit-point orbit-point-${index + 1}`}
                        style={
                          {
                            '--point-color': competencies[key].color,
                          } as React.CSSProperties
                        }
                      >
                        <Icon className="size-5" />
                      </div>
                    );
                  },
                )}
              </div>
              <div className="mt-8 grid grid-cols-3 divide-x divide-border rounded-2xl border bg-card/90 py-4 shadow-sm backdrop-blur">
                {[
                  ['30', 'questions'],
                  ['6', 'competencies'],
                  ['8', 'toolkit areas'],
                ].map(([value, label]) => (
                  <div key={label} className="px-3 text-center">
                    <div className="font-serif text-2xl font-semibold text-primary">
                      {value}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 'field' && (
        <section className="mx-auto max-w-6xl px-6 py-14 lg:px-12 lg:py-20">
          <button
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            onClick={() => setStep('welcome')}
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <div className="max-w-2xl">
            <div className="eyebrow mb-5">OPTIONAL BACKGROUND</div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Which engineering field best describes you?
            </h1>
            <p className="mt-4 text-lg leading-7 text-muted-foreground">
              Choose the field closest to your current programme. This helps
              provide context only—it never affects your score.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {fieldOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = field === option.id;
              return (
                <button
                  key={option.id}
                  className={`field-card ${isSelected ? 'field-card-selected' : ''}`}
                  onClick={() => setField(option.id)}
                  aria-pressed={isSelected}
                >
                  <span className="field-icon">
                    <Icon className="size-7" strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block font-serif text-xl font-semibold">
                      {option.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {option.subtitle}
                    </span>
                  </span>
                  <span className="ml-auto grid size-7 shrink-0 place-items-center rounded-full border">
                    {isSelected ? (
                      <Check className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button
              className={`compact-choice ${field === 'other' ? 'compact-choice-selected' : ''}`}
              onClick={() => setField('other')}
            >
              <Shapes className="size-5" /> Other / Interdisciplinary
            </button>
            <button className="compact-choice" onClick={() => setField(null)}>
              Skip for now
            </button>
          </div>
          <div className="mt-10 flex justify-end">
            <Button
              size="lg"
              className="h-12 rounded-full px-7"
              onClick={beginAssessment}
            >
              Continue <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </section>
      )}

      {step === 'assessment' && activeQuestion && (
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[260px_minmax(0,760px)] lg:px-12 lg:py-14">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <div className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
                Your progress
              </div>
              <div className="mt-4 space-y-1.5">
                {(Object.keys(competencies) as CompetencyKey[]).map(
                  (key, index) => {
                    const Icon = sectionIcons[key];
                    const sectionIndex = Math.floor(current / 5);
                    const isActive = index === sectionIndex;
                    const isComplete = index < sectionIndex;
                    return (
                      <div
                        key={key}
                        className={`section-row ${isActive ? 'section-row-active' : ''}`}
                      >
                        <span
                          className={`section-dot ${isComplete ? 'section-dot-complete' : ''}`}
                        >
                          {isComplete ? (
                            <Check className="size-3" />
                          ) : (
                            <Icon className="size-3.5" />
                          )}
                        </span>
                        <span className="text-sm">
                          {competencies[key].label}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
              <div className="mt-8 rounded-xl border border-primary/10 bg-primary/[.035] p-4 text-xs leading-5 text-muted-foreground">
                Answer for how you work now—not for the engineer you think you
                should be.
              </div>
            </div>
          </aside>
          <div>
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                  {competencies[activeQuestion.competency].label}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Question {current + 1} of {questions.length}
                </div>
              </div>
              <div className="rounded-full border bg-card px-3 py-1.5 text-sm font-semibold tabular-nums">
                {Math.round(((current + 1) / questions.length) * 100)}%
              </div>
            </div>
            <article className="question-card">
              <div className="mb-7 flex size-11 items-center justify-center rounded-xl bg-primary/[.08] text-primary">
                {(() => {
                  const Icon = sectionIcons[activeQuestion.competency];
                  return <Icon className="size-5" />;
                })()}
              </div>
              <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-[2.4rem]">
                {activeQuestion.prompt}
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                {activeQuestion.context}
              </p>
              {activeQuestion.toolkit && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {activeQuestion.toolkit.map((item) => (
                    <span key={item} className="tool-chip">
                      <CircuitBoard className="size-3" /> {item}
                    </span>
                  ))}
                </div>
              )}
              <fieldset className="mt-9">
                <legend className="mb-3 text-sm font-semibold">
                  How consistently does this describe you?
                </legend>
                <div className="grid gap-2.5 sm:grid-cols-5">
                  {scale.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={`scale-option ${selected === option.value ? 'scale-option-selected' : ''}`}
                      onClick={() => chooseAnswer(option.value)}
                      aria-pressed={selected === option.value}
                    >
                      <span className="scale-number">{option.value}</span>
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-[11px] leading-4 text-muted-foreground">
                        {option.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
              {showNudge && (
                <output className="mt-6 flex gap-3 rounded-xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-950">
                  <TimerReset className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <div className="font-semibold">
                      A quick reflection check
                    </div>
                    <p className="mt-1 leading-5 text-amber-900/80">
                      You answered the last few questions unusually quickly.
                      Take a moment to picture a real project example, then keep
                      or change this answer.
                    </p>
                  </div>
                </output>
              )}
              <div className="mt-8 flex items-center justify-between border-t pt-6">
                <Button variant="ghost" size="lg" onClick={goBack}>
                  <ArrowLeft className="mr-1 size-4" /> Previous
                </Button>
                <Button
                  size="lg"
                  className="h-11 rounded-full px-6"
                  disabled={!selected}
                  onClick={() => advance(showNudge)}
                >
                  {current === questions.length - 1
                    ? 'View my profile'
                    : showNudge
                      ? 'Keep answer & continue'
                      : 'Next'}
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              </div>
            </article>
          </div>
        </section>
      )}

      {step === 'results' && (
        <Results
          scores={results.competencyScores}
          toolkit={results.toolkitScores}
          field={field}
          onRestart={restart}
          onDownload={downloadSummary}
        />
      )}
    </main>
  );
}

function Header({ progress }: { progress: number | null }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[75px] max-w-7xl items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Compass className="size-5" />
          </div>
          <div>
            <div className="font-serif text-lg font-semibold leading-none">
              Engineering Compass
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
              Active Learning · HKU Engineering
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <span className="size-2 rounded-full bg-emerald-500" /> Responses stay
          in this browser
        </div>
      </div>
      {progress !== null && (
        <Progress
          value={progress}
          className="absolute inset-x-0 bottom-0 gap-0 [&_[data-slot=progress-track]]:h-[3px] [&_[data-slot=progress-track]]:rounded-none"
        />
      )}
    </header>
  );
}

function Results({
  scores,
  toolkit,
  field,
  onRestart,
  onDownload,
}: {
  scores: Array<{
    key: CompetencyKey;
    subject: string;
    fullLabel: string;
    score: number;
    description: string;
    color: string;
  }>;
  toolkit: Array<{ name: string; score: number }>;
  field: string | null;
  onRestart: () => void;
  onDownload: () => void;
}) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const strength = sorted[0];
  const growth = sorted[sorted.length - 1];
  const fieldLabel = fieldOptions.find((option) => option.id === field)?.title;
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16">
      <div className="results-hero">
        <div>
          <div className="eyebrow mb-5">
            <Sparkles className="size-4" /> YOUR ENGINEERING PROFILE
          </div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
            Your compass points to{' '}
            <span className="text-primary">{strength.subject}</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-7 text-muted-foreground">
            You show your strongest current confidence in{' '}
            {strength.fullLabel.toLowerCase()}. Your clearest next development
            opportunity is {growth.fullLabel.toLowerCase()}.
          </p>
          {fieldLabel && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium">
              <Building2 className="size-3.5 text-primary" /> Background:{' '}
              {fieldLabel} · not scored
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={onDownload}
          >
            <Download className="mr-1 size-4" /> Download summary
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full"
            onClick={onRestart}
          >
            <RefreshCw className="mr-1 size-4" /> Retake
          </Button>
        </div>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <article className="result-panel min-w-0">
          <div className="panel-heading">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                Six competencies
              </div>
              <h2 className="mt-1 font-serif text-2xl font-semibold">
                Your engineering profile
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              0–100 confidence scale
            </span>
          </div>
          <ChartContainer
            config={chartConfig}
            className="mx-auto mt-3 aspect-square max-h-[470px] w-full"
          >
            <RadarChart data={scores} outerRadius="72%">
              <PolarGrid stroke="#ded8d2" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#5e5855', fontSize: 12, fontWeight: 600 }}
              />
              <Radar
                dataKey="score"
                stroke="var(--color-score)"
                fill="var(--color-score)"
                fillOpacity={0.18}
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#8d153a', strokeWidth: 0 }}
              />
            </RadarChart>
          </ChartContainer>
        </article>
        <article className="result-panel">
          <div className="panel-heading">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                Technical toolkit
              </div>
              <h2 className="mt-1 font-serif text-2xl font-semibold">
                Hands-on confidence
              </h2>
            </div>
            <Wrench className="size-5 text-primary" />
          </div>
          <div className="mt-8 space-y-5">
            {toolkit.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-semibold tabular-nums text-primary">
                    {item.score}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="insight-card border-t-[3px] border-t-emerald-600">
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Sparkles className="size-5" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-700">
                Build on this strength
              </div>
              <h3 className="mt-1 font-serif text-xl font-semibold">
                {strength.fullLabel}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {strength.description} Look for a project role where you can
                model this capability for teammates.
              </p>
            </div>
          </div>
        </article>
        <article className="insight-card border-t-[3px] border-t-amber-500">
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Lightbulb className="size-5" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[.14em] text-amber-700">
                Try next
              </div>
              <h3 className="mt-1 font-serif text-xl font-semibold">
                {growth.fullLabel}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {growth.description} Choose one small, observable behaviour to
                practise in your next team milestone.
              </p>
            </div>
          </div>
        </article>
      </div>
      <div className="mt-10 border-t pt-6 text-sm leading-6 text-muted-foreground">
        This profile is a formative reflection, not a grade, diagnosis or
        selection test. Scores reflect your self-reported confidence today and
        can change with experience.
      </div>
    </section>
  );
}
