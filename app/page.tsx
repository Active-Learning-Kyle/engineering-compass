'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  BookOpenCheck,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Download,
  Gauge,
  GraduationCap,
  House,
  Leaf,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Target,
  TimerReset,
  UsersRound,
  Wrench,
} from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { competencyOrder } from '@/lib/assessment/competencies';
import { interpretResults } from '@/lib/assessment/interpretation';
import {
  deriveEngineeringMode,
  deriveGrowthStage,
  engineeringModes,
  initialCharacterVariant,
  growthStages,
  type EngineeringModeKey,
  type GrowthStageKey,
} from '@/lib/assessment/profile';
import {
  assessmentVersion,
  behaviourScale,
  questions as standardQuestions,
  technicalScale,
} from '@/lib/assessment/questions';
import { calculateResults } from '@/lib/assessment/scoring';
import { getQuestions, interpretPro } from '@/lib/assessment/pro';
import {
  compassSpringStep,
  shuffledCompassTargets,
} from '@/lib/assessment/compass-motion';
import { toolkit, toolkitOrder } from '@/lib/assessment/toolkit';
import { getStudyYearLabel, studyYears } from '@/lib/assessment/years';
import type {
  AssessmentAnswers,
  AssessmentEdition,
  AssessmentItem,
  PhaseKey,
} from '@/lib/assessment/types';

type Step = 'welcome' | 'year' | 'assessment' | 'results';
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

const progressStorageKey = 'engineering-compass-progress-v1.6';
const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const phases: Array<{ key: PhaseKey; label: string; range: string }> = [
  { key: 'behaviour', label: 'How you work', range: '01–15' },
  { key: 'technical', label: 'Technical toolkit', range: '16–24' },
  { key: 'context', label: 'Project context', range: '25–26' },
  { key: 'priorities', label: 'Interests & growth', range: '27–28' },
  { key: 'judgment', label: 'Engineering judgment', range: '29–30' },
];
const proPhases = [
  ...phases,
  { key: 'proScenarios' as const, label: 'Team decisions', range: '31–42' },
  { key: 'proEvidence' as const, label: 'Practice evidence', range: '43–60' },
];
const chartConfig = {
  score: { label: 'Profile', color: '#163f27' },
} satisfies ChartConfig;
const roleIcons: Record<EngineeringModeKey, typeof Compass> = {
  problem: CircleHelp,
  planning: Target,
  collaboration: UsersRound,
  handsOn: Wrench,
  design: Boxes,
  pitch: MessageCircle,
};

function AnimatedCompassNeedle() {
  const needle = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let targets = shuffledCompassTargets();
    let index = 0;
    let angle = 0;
    let velocity = 0;
    let target = 0;
    let lastTime = 0;
    let nextMove = 0;
    let previousTarget = -1;
    const animate = (time: number) => {
      if (preference.matches) return;
      const dt = Math.min((time - (lastTime || time)) / 1000, 0.035);
      lastTime = time;
      if (time >= nextMove) {
        if (index >= targets.length) {
          targets = shuffledCompassTargets(previousTarget);
          index = 0;
        }
        previousTarget = targets[index++];
        const normalized = ((angle % 360) + 360) % 360;
        target = angle + (((previousTarget - normalized + 540) % 360) - 180);
        nextMove = time + 2100 + Math.random() * 650;
      }
      // Underdamped spring: several overshoots, with a small continuous flutter.
      ({ angle, velocity } = compassSpringStep(
        angle,
        velocity,
        target,
        time,
        dt,
      ));
      needle.current?.style.setProperty('--needle-rotation', `${angle}deg`);
      frame = window.requestAnimationFrame(animate);
    };
    const restart = () => {
      window.cancelAnimationFrame(frame);
      lastTime = 0;
      if (!preference.matches) frame = window.requestAnimationFrame(animate);
    };
    restart();
    preference.addEventListener('change', restart);
    return () => {
      window.cancelAnimationFrame(frame);
      preference.removeEventListener('change', restart);
    };
  }, []);

  return (
    <div className="animated-compass-needle" ref={needle}>
      <span className="needle-north" />
      <span className="needle-south" />
    </div>
  );
}

function CompassRose() {
  return (
    <svg
      className="orbit-compass-rose"
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
    >
      {[130, 165, 178].map((radius) => (
        <circle
          key={radius}
          cx="200"
          cy="200"
          r={radius}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
      {Array.from({ length: 64 }, (_, index) => (
        <path
          key={index}
          d={`M200 22v${index % 4 === 0 ? 19 : 10}`}
          transform={`rotate(${index * 5.625} 200 200)`}
          stroke="currentColor"
          strokeWidth={index % 4 === 0 ? 2 : 1}
        />
      ))}
      {Array.from({ length: 16 }, (_, index) => {
        const tip = index % 4 === 0 ? 5 : index % 2 === 0 ? 39 : 82;
        return (
          <g key={index} transform={`rotate(${index * 22.5} 200 200)`}>
            <path d={`M200 ${tip}L211 184L200 200Z`} fill="currentColor" />
            <path
              d={`M200 ${tip}L189 184L200 200Z`}
              stroke="currentColor"
              fill="currentColor"
              fillOpacity=".12"
            />
          </g>
        );
      })}
      <circle
        cx="200"
        cy="200"
        r="15"
        fill="var(--background)"
        stroke="currentColor"
      />
    </svg>
  );
}

const toolkitExperienceLevels = [
  'New to this',
  'Guided',
  'Developing',
  'Independent',
  'Adaptable',
] as const;

function getToolkitExperienceLevel(score: number) {
  const number = Math.min(5, Math.max(1, Math.round(score / 25) + 1));
  return { number, label: toolkitExperienceLevels[number - 1] };
}
const phaseCopy: Record<
  PhaseKey,
  { eyebrow: string; note: string; icon: typeof Compass }
> = {
  proScenarios: {
    eyebrow: 'PRO · TEAM DECISIONS',
    note: 'Consider the situation and choose your first action. Feedback complements your profile without adding points.',
    icon: Lightbulb,
  },
  proEvidence: {
    eyebrow: 'PRO · PRACTICE EVIDENCE',
    note: 'Recall work you have actually done and how you checked it. No uploads are needed.',
    icon: Wrench,
  },
  behaviour: {
    eyebrow: 'HOW YOU WORK',
    note: 'Think of what you usually do in a real project. The competency behind each statement stays hidden.',
    icon: Compass,
  },
  technical: {
    eyebrow: 'TECHNICAL TOOLKIT',
    note: 'Rate your current experience and independence—not how interested you are in learning the skill.',
    icon: Wrench,
  },
  context: {
    eyebrow: 'PROJECT CONTEXT',
    note: 'These factual answers help frame your reflection. They never add points to your profile.',
    icon: BookOpenCheck,
  },
  priorities: {
    eyebrow: 'INTERESTS & GROWTH',
    note: 'Your choices personalise the result. They do not change your radar or technical scores.',
    icon: Target,
  },
  judgment: {
    eyebrow: 'ENGINEERING JUDGMENT',
    note: 'Choose the response closest to what you would genuinely do. These scenarios are interpreted, not graded.',
    icon: Lightbulb,
  },
};
function isComplete(item: AssessmentItem, answer: unknown) {
  if (item.kind === 'interest') return Array.isArray(answer);
  if (item.kind === 'growth')
    return Array.isArray(answer) && answer.length >= item.min;
  return typeof answer === 'number';
}

export default function Home() {
  const [edition, setEdition] = useState<AssessmentEdition>('standard');
  const questions = getQuestions(edition);
  const activePhases = edition === 'pro' ? proPhases : phases;
  const version = edition === 'pro' ? 'pro-v0.1' : assessmentVersion;
  const [step, setStep] = useState<Step>('welcome');
  const [year, setYear] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({ I01: [] });
  const [savedDraft, setSavedDraft] = useState<{
    edition: AssessmentEdition;
    year: string | null;
    current: number;
    answers: AssessmentAnswers;
  } | null>(null);
  const [responseMs, setResponseMs] = useState<number | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const questionStarted = useRef(0);
  const fastStreak = useRef(0);
  const lastNudgeAt = useRef(-10);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        edition?: AssessmentEdition;
        version?: string;
        year?: string | null;
        current?: number;
        answers?: AssessmentAnswers;
      };
      if (
        (parsed.version === assessmentVersion ||
          parsed.version === 'pro-v0.1') &&
        typeof parsed.current === 'number' &&
        parsed.answers
      ) {
        queueMicrotask(() =>
          setSavedDraft({
            edition: parsed.version === 'pro-v0.1' ? 'pro' : 'standard',
            year: typeof parsed.year === 'string' ? parsed.year : null,
            current: Math.min(
              Math.max(parsed.current ?? 0, 0),
              getQuestions(parsed.version === 'pro-v0.1' ? 'pro' : 'standard')
                .length - 1,
            ),
            answers: parsed.answers ?? { I01: [] },
          }),
        );
      }
    } catch {
      window.localStorage.removeItem(progressStorageKey);
    }
  }, []);

  useEffect(() => {
    if (step !== 'assessment') return;
    const draft = { edition, year, current, answers };
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({ version, ...draft }),
    );
  }, [answers, current, step, year, edition, version]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const allowedYears = [...studyYears.map((option) => option.id), 'skip'];
    Promise.resolve(
      context.registerTool(
        {
          name: 'start_engineering_assessment',
          title: 'Start Engineering Compass',
          description:
            'Start the Standard Engineering Compass reflection, optionally with a study year used only as background context.',
          inputSchema: {
            type: 'object',
            properties: { year: { type: 'string', enum: allowedYears } },
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            if (typeof input !== 'object' || input === null)
              throw new Error('Input must be an object.');
            const requested = (input as { year?: unknown }).year;
            if (
              requested !== undefined &&
              (typeof requested !== 'string' ||
                !allowedYears.includes(requested))
            )
              throw new Error('Unsupported study year.');
            setYear(
              requested === 'skip'
                ? null
                : ((requested as string | undefined) ?? null),
            );
            setAnswers({ I01: [] });
            setEdition('standard');
            setCurrent(0);
            setStep('assessment');
            questionStarted.current = Date.now();
            return {
              status: 'started',
              version: assessmentVersion,
              question: 1,
              totalQuestions: standardQuestions.length,
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const activeQuestion = questions[Math.min(current, questions.length - 1)];
  const selected = answers[activeQuestion.id];
  const results = useMemo(() => calculateResults(answers), [answers]);
  const interpretation = useMemo(
    () =>
      interpretResults(
        answers,
        results.competencyScores,
        results.toolkitScores,
      ),
    [answers, results],
  );
  const activePhaseIndex = activePhases.findIndex(
    (phase) => phase.key === activeQuestion.phase,
  );
  const canContinue = isComplete(activeQuestion, selected);
  const modeKey = useMemo(
    () => deriveEngineeringMode(results.competencyScores),
    [results.competencyScores],
  );
  const growthStageKey = useMemo(
    () => deriveGrowthStage(answers, results.toolkitScores),
    [answers, results.toolkitScores],
  );

  function beginAssessment() {
    setCurrent(0);
    setAnswers({ I01: [] });
    fastStreak.current = 0;
    lastNudgeAt.current = -10;
    setShowNudge(false);
    questionStarted.current = Date.now();
    setStep('assessment');
  }
  function resumeAssessment() {
    if (!savedDraft) return;
    setEdition(savedDraft.edition);
    setYear(savedDraft.year);
    setCurrent(savedDraft.current);
    setAnswers(savedDraft.answers);
    fastStreak.current = 0;
    lastNudgeAt.current = -10;
    setShowNudge(false);
    questionStarted.current = Date.now();
    setStep('assessment');
  }
  function chooseNumber(value: number) {
    const elapsed = Date.now() - questionStarted.current;
    setAnswers((previous) => ({ ...previous, [activeQuestion.id]: value }));
    setResponseMs(elapsed);
    setShowNudge(false);
    advance(false, elapsed, true);
  }
  function toggleSelection(id: string) {
    if (activeQuestion.kind !== 'interest' && activeQuestion.kind !== 'growth')
      return;
    const existing = Array.isArray(selected) ? selected : [];
    let next: string[];
    if (existing.includes(id)) next = existing.filter((item) => item !== id);
    else if (activeQuestion.kind === 'growth' && id === 'not-sure')
      next = ['not-sure'];
    else {
      const withoutNotSure = existing.filter((item) => item !== 'not-sure');
      next = [...withoutNotSure, id];
    }
    setAnswers((previous) => ({ ...previous, [activeQuestion.id]: next }));
    setResponseMs(Date.now() - questionStarted.current);
    setShowNudge(false);
  }
  function advance(
    force = false,
    timingOverride: number | null = null,
    answerJustSelected = false,
  ) {
    if (!canContinue && !answerJustSelected) return;
    const reflective =
      activeQuestion.kind === 'behaviour' ||
      activeQuestion.kind === 'technical';
    const nextStreak =
      reflective && (timingOverride ?? responseMs ?? 99999) < 4000
        ? fastStreak.current + 1
        : 0;
    if (!force && nextStreak >= 2 && current - lastNudgeAt.current >= 6) {
      fastStreak.current = nextStreak;
      lastNudgeAt.current = current;
      setShowNudge(true);
      return;
    }
    fastStreak.current = force ? 0 : nextStreak;
    setShowNudge(false);
    setResponseMs(null);
    if (current === questions.length - 1) {
      setStep('results');
      setSavedDraft(null);
      window.localStorage.removeItem(progressStorageKey);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrent((value) => value + 1);
    questionStarted.current = Date.now();
  }
  function goBack() {
    if (current === 0) {
      setStep('year');
      return;
    }
    setCurrent((value) => value - 1);
    setResponseMs(null);
    setShowNudge(false);
    questionStarted.current = Date.now();
  }
  function returnHome() {
    const draft = { edition, year, current, answers };
    setSavedDraft(draft);
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({ version, ...draft }),
    );
    setStep('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function restart() {
    setStep('welcome');
    setYear(null);
    setCurrent(0);
    setAnswers({ I01: [] });
    fastStreak.current = 0;
    lastNudgeAt.current = -10;
    setShowNudge(false);
    setSavedDraft(null);
    window.localStorage.removeItem(progressStorageKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function downloadProfileImage() {
    const resultPage = document.getElementById('engineering-compass-results');
    if (!resultPage) return;
    await Promise.all(
      Array.from(resultPage.querySelectorAll('img')).map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) resolve();
            else {
              image.addEventListener('load', () => resolve(), { once: true });
              image.addEventListener('error', () => resolve(), { once: true });
            }
          }),
      ),
    );
    const url = await toPng(resultPage, {
      backgroundColor: '#f7faf6',
      cacheBust: true,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      filter: (node) =>
        !(
          node instanceof HTMLElement && node.dataset.captureExclude === 'true'
        ),
    });
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `engineering-compass-${edition}-${modeKey}-profile.png`;
    anchor.click();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {step !== 'welcome' && (
        <Header
          progress={
            step === 'assessment'
              ? ((current + 1) / questions.length) * 100
              : null
          }
        />
      )}
      {step === 'welcome' && (
        <Welcome
          edition={edition}
          onEditionChange={setEdition}
          onBegin={() => setStep('year')}
          onResume={resumeAssessment}
          hasSavedProgress={Boolean(savedDraft)}
        />
      )}
      {step === 'year' && (
        <YearSelection
          year={year}
          onChange={setYear}
          onBack={() => setStep('welcome')}
          onContinue={beginAssessment}
        />
      )}
      {step === 'assessment' && (
        <Assessment
          total={questions.length}
          phases={activePhases}
          question={activeQuestion}
          current={current}
          selected={selected}
          activePhaseIndex={activePhaseIndex}
          canContinue={canContinue}
          showNudge={showNudge}
          onChooseNumber={chooseNumber}
          onToggle={toggleSelection}
          onBack={goBack}
          onHome={returnHome}
          onAdvance={() => advance(showNudge)}
        />
      )}
      {step === 'results' && (
        <Results
          competencyScores={results.competencyScores}
          toolkitScores={results.toolkitScores}
          interpretation={interpretation}
          year={year}
          proReflection={edition === 'pro' ? interpretPro(answers) : null}
          modeKey={modeKey}
          growthStageKey={growthStageKey}
          onRestart={restart}
          onDownload={downloadProfileImage}
        />
      )}
    </main>
  );
}

function Header({ progress }: { progress: number | null }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="brand-mark">
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
          <span className="size-2 rounded-full bg-emerald-600" /> Responses stay
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

function Welcome({
  edition,
  onEditionChange,
  onBegin,
  onResume,
  hasSavedProgress,
}: {
  edition: AssessmentEdition;
  onEditionChange: (edition: AssessmentEdition) => void;
  onBegin: () => void;
  onResume: () => void;
  hasSavedProgress: boolean;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="compass-grid absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 lg:min-h-[610px] lg:grid-cols-[1.04fr_.96fr] lg:px-12">
        <div className="max-w-3xl">
          <div className="home-product-kicker mb-6">
            <span className="home-product-mark">
              <Compass className="size-4" />
            </span>
            <span>Engineering Compass</span>
          </div>
          <h1 className="display-title text-[clamp(3.2rem,6vw,6.3rem)] leading-[.94] tracking-[-.055em]">
            Find Your Role in an Engineering Team
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            A short self-assessment to explore your engineering strengths,
            hands-on experience, and growth directions.
          </p>
          <div className="assessment-version-grid mt-8">
            <button
              className={`assessment-version-card ${edition === 'standard' ? 'is-available is-selected' : ''}`}
              aria-pressed={edition === 'standard'}
              onClick={() => onEditionChange('standard')}
            >
              <span className="version-status">AVAILABLE NOW</span>
              <span className="version-title">Standard</span>
              <span className="version-meta">30 questions · 8–10 minutes</span>
              <span className="version-action">
                {edition === 'standard' ? 'Selected' : 'Choose Standard'}{' '}
                <Check className="size-4" />
              </span>
            </button>
            <button
              className={`assessment-version-card ${edition === 'pro' ? 'is-available is-selected' : ''}`}
              aria-pressed={edition === 'pro'}
              onClick={() => onEditionChange('pro')}
            >
              <span className="version-status">PILOT EDITION</span>
              <span className="version-title">Pro</span>
              <span className="version-meta">
                60 questions · about 18–25 minutes
              </span>
              <span className="version-action">
                {edition === 'pro' ? 'Selected' : 'Choose Pro'}{' '}
                <Check className="size-4" />
              </span>
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-13 rounded-full px-6"
              onClick={onBegin}
            >
              Begin {edition === 'pro' ? 'Pro' : 'Standard'}{' '}
              <ArrowRight className="size-4" />
            </Button>
            {hasSavedProgress && (
              <Button
                variant="outline"
                size="lg"
                className="h-13 rounded-full px-6"
                onClick={onResume}
              >
                Resume saved progress
              </Button>
            )}
            <div className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
              <Gauge className="size-4" />{' '}
              {edition === 'pro'
                ? 'Core profile + team scenarios + practice evidence'
                : 'Your core engineering profile'}
            </div>
          </div>
          {edition === 'pro' && (
            <p className="mt-3 text-sm text-muted-foreground">
              Pro is an initial pilot for feedback and revision, not a validated
              assessment.
            </p>
          )}
          <p className="mt-5 max-w-lg text-xs leading-5 text-muted-foreground">
            Your responses are private and stay on this device. The role is a
            reflection prompt—not a grade, selection test, or fixed type.
          </p>
        </div>
        <div className="mx-auto w-full max-w-lg">
          <div className="profile-orbit" aria-hidden="true">
            <div className="orbit-axis orbit-axis-x" />
            <div className="orbit-axis orbit-axis-y" />
            <CompassRose />
            <span className="compass-cardinal compass-cardinal-n">N</span>
            <span className="compass-cardinal compass-cardinal-e">E</span>
            <span className="compass-cardinal compass-cardinal-s">S</span>
            <span className="compass-cardinal compass-cardinal-w">W</span>
            <AnimatedCompassNeedle />
            <span className="orbit-dot orbit-dot-1" />
            <span className="orbit-dot orbit-dot-2" />
            <span className="orbit-dot orbit-dot-3" />
            <div className="orbit-center">
              <Compass className="size-11" strokeWidth={1.5} />
              <span>YOUR PROFILE</span>
            </div>
            {competencyOrder.map((key, index) => (
              <div
                key={key}
                className={`orbit-point orbit-point-${index + 1}`}
                style={{ '--point-color': '#163f27' } as React.CSSProperties}
              >
                {(() => {
                  const RoleIcon = roleIcons[key];
                  return <RoleIcon className="size-6" strokeWidth={1.7} />;
                })()}
              </div>
            ))}
          </div>
          <div className="mt-7 grid grid-cols-3 divide-x divide-border rounded-2xl border bg-card/95 py-4 shadow-sm">
            {[
              [
                edition === 'pro' ? '60' : '30',
                edition === 'pro' ? 'Pro questions' : 'Standard questions',
              ],
              ['6', 'competencies'],
              ['9', 'toolkit areas'],
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
      <div className="relative mx-auto max-w-7xl px-6 pb-14 lg:px-12">
        <div id="how-it-works" className="method-strip scroll-mt-24">
          <div>
            <div className="panel-eyebrow">HOW THE COMPASS WORKS</div>
            <h2>Discover your strengths and what to practise next.</h2>
          </div>
          <p>
            These responses help you explore six ways of contributing to an
            engineering team and your experience with nine technical toolkit
            areas. Your results highlight a current team role, your practical
            experience, and actions for the skills you want to develop. They
            describe where you are now—not a grade or a fixed type of engineer.
          </p>
        </div>
        <div id="roles" className="modes-preview-heading scroll-mt-24">
          <div>
            <div className="panel-eyebrow">SIX ENGINEERING ROLES</div>
            <h2>Explore how you may currently contribute to a team.</h2>
          </div>
          <span>
            Different roles are useful in different moments—not higher or lower.
          </span>
        </div>
        <div className="modes-preview-grid">
          {(
            Object.entries(engineeringModes) as Array<
              [
                EngineeringModeKey,
                (typeof engineeringModes)[EngineeringModeKey],
              ]
            >
          ).map(([key, mode]) => (
            <button
              type="button"
              className="role-preview-card"
              key={key}
              aria-label={`Preview ${mode.name}`}
            >
              <div className="role-preview-default">
                <div className="role-preview-icon" aria-hidden="true">
                  {(() => {
                    const RoleIcon = roleIcons[key];
                    return <RoleIcon className="size-7" strokeWidth={1.65} />;
                  })()}
                </div>
                <div className="mode-preview-copy">
                  <h3>{mode.name}</h3>
                  <p>{mode.contribution}</p>
                </div>
              </div>
              <div className="role-hover-preview" aria-hidden="true">
                {/* oxlint-disable-next-line next/no-img-element */}
                <img
                  className="role-preview-character role-preview-character-a"
                  src={assetPath(mode.image[initialCharacterVariant(key)])}
                  alt=""
                />
                {/* oxlint-disable-next-line next/no-img-element */}
                <img
                  className="role-preview-character role-preview-character-b"
                  src={assetPath(
                    mode.image[
                      initialCharacterVariant(key) === 'a' ? 'b' : 'a'
                    ],
                  )}
                  alt=""
                />
                <div className="role-hover-copy">
                  <span>ENGINEERING ROLE</span>
                  <h3>{mode.name}</h3>
                  <p>{mode.contribution}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div id="toolkit" className="home-toolkit scroll-mt-24">
          <div>
            <div className="panel-eyebrow">NINE TECHNICAL TOOLKIT AREAS</div>
            <h2>See where your experience is growing.</h2>
            <p>
              Each area is reflected separately, so the result shows both
              breadth and the tools you may want to practise next.
            </p>
            <div className="toolkit-reading-guide">
              <div>
                <strong>Breadth</strong>
                <span>Which kinds of tools you have already encountered.</span>
              </div>
              <div>
                <strong>Independence</strong>
                <span>Where you can work with less step-by-step support.</span>
              </div>
              <div>
                <strong>Next practice</strong>
                <span>One useful area to try in your next project.</span>
              </div>
            </div>
          </div>
          <div className="toolkit-chip-grid">
            {toolkitOrder.map((key) => (
              <button
                type="button"
                className="toolkit-preview-card"
                key={key}
                aria-label={`${toolkit[key].label}: ${toolkit[key].skills.join(', ')}`}
              >
                <span className="toolkit-preview-title">
                  <Wrench className="size-4" />
                  <strong>{toolkit[key].label}</strong>
                </span>
                <span className="toolkit-skills-preview" aria-hidden="true">
                  {toolkit[key].skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <footer className="home-footer">
        <div className="home-footer-brand">
          <Compass className="size-5" />
          <span>
            <strong>Engineering Compass</strong>
            <small>Reflect on how you think, build, and contribute.</small>
          </span>
        </div>
        <span className="home-footer-privacy">
          Private by design · responses stay on your device
        </span>
        <a href="https://activelearning.engg.hku.hk/#about">
          Learn about Active Learning <ArrowRight className="size-4" />
        </a>
      </footer>
    </section>
  );
}

function YearSelection({
  year,
  onChange,
  onBack,
  onContinue,
}: {
  year: string | null;
  onChange: (year: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 lg:px-12 lg:py-18">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft className="size-4" /> Back
      </button>
      <div className="max-w-2xl">
        <div className="eyebrow mb-5">OPTIONAL BACKGROUND</div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          What year of undergraduate study are you in?
        </h1>
        <p className="mt-4 text-lg leading-7 text-muted-foreground">
          This helps you revisit the Compass across different years. It is
          optional and never changes your scores.
        </p>
      </div>
      <div className="mt-9 grid gap-4 md:grid-cols-2">
        {studyYears.map((option) => {
          const isSelected = year === option.id;
          return (
            <button
              key={option.id}
              className={`field-card ${isSelected ? 'field-card-selected' : ''}`}
              onClick={() => onChange(option.id)}
              aria-pressed={isSelected}
            >
              <span className="field-icon">
                <GraduationCap className="size-7" strokeWidth={1.6} />
              </span>
              <span className="min-w-0 text-left">
                <span className="block font-serif text-xl font-semibold">
                  {option.label}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {option.note}
                </span>
              </span>
              <span className="choice-check">
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
      <div className="mt-4">
        <button
          className="compact-choice w-full"
          onClick={() => {
            onChange(null);
            onContinue();
          }}
        >
          Skip this step
        </button>
      </div>
      <div className="mt-9 flex justify-end">
        <Button
          size="lg"
          className="h-12 rounded-full px-7"
          onClick={onContinue}
        >
          Continue <ArrowRight className="ml-1 size-4" />
        </Button>
      </div>
    </section>
  );
}

function Assessment({
  total,
  phases,
  question,
  current,
  selected,
  activePhaseIndex,
  canContinue,
  showNudge,
  onChooseNumber,
  onToggle,
  onBack,
  onHome,
  onAdvance,
}: {
  total: number;
  phases: Array<{ key: PhaseKey; label: string; range: string }>;
  question: AssessmentItem;
  current: number;
  selected: number | string[] | undefined;
  activePhaseIndex: number;
  canContinue: boolean;
  showNudge: boolean;
  onChooseNumber: (value: number) => void;
  onToggle: (id: string) => void;
  onBack: () => void;
  onHome: () => void;
  onAdvance: () => void;
}) {
  const phase = phaseCopy[question.phase];
  const PhaseIcon = phase.icon;
  const scale = question.kind === 'behaviour' ? behaviourScale : technicalScale;
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-9 lg:grid-cols-[250px_minmax(0,780px)] lg:px-12 lg:py-13">
      <aside className="hidden lg:block">
        <div className="sticky top-27">
          <div className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
            Assessment path
          </div>
          <div className="mt-4 space-y-1.5">
            {phases.map((item, index) => (
              <div
                key={item.key}
                className={`section-row ${index === activePhaseIndex ? 'section-row-active' : ''}`}
              >
                <span
                  className={`section-dot ${index < activePhaseIndex ? 'section-dot-complete' : ''}`}
                >
                  {index < activePhaseIndex ? (
                    <Check className="size-3" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0 flex-1 text-sm">{item.label}</span>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {item.range}
                </span>
              </div>
            ))}
          </div>
          <div className="reflection-note mt-7">
            <Leaf className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{phase.note}</span>
          </div>
        </div>
      </aside>
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
              {phase.eyebrow}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Question {current + 1} of {total}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="assessment-home" onClick={onHome}>
              <House className="size-4" /> Return home
            </button>
            <div className="rounded-full border bg-card px-3 py-1.5 text-sm font-semibold tabular-nums text-primary">
              {Math.round(((current + 1) / total) * 100)}%
            </div>
          </div>
        </div>
        {showNudge && (
          <div className="nudge-backdrop">
            <div
              className="nudge-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="nudge-title"
              aria-describedby="nudge-description"
            >
              <div className="nudge-icon">
                <TimerReset className="size-7" />
              </div>
              <div>
                <h2 id="nudge-title">You&apos;re answering a little quickly</h2>
                <p id="nudge-description">
                  Take a moment to read each question before choosing. A more
                  considered response is more likely to give you a result that
                  reflects your current experience.
                </p>
              </div>
              <Button className="nudge-continue" size="lg" onClick={onAdvance}>
                Skip Answer and Continue <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        )}
        <article className="question-card">
          <div className="question-kicker">
            <PhaseIcon className="size-5" />
            {question.kind === 'technical'
              ? toolkit[question.toolkit].label
              : phase.eyebrow}
          </div>
          <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-[2.35rem]">
            {question.prompt}
          </h1>
          {question.helper && (
            <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
              {question.helper}
            </p>
          )}
          {(question.kind === 'behaviour' || question.kind === 'technical') && (
            <ScaleQuestion
              selected={typeof selected === 'number' ? selected : undefined}
              prompt={scale.prompt}
              low={scale.low}
              high={scale.high}
              onChoose={onChooseNumber}
            />
          )}
          {(question.kind === 'context' ||
            question.kind === 'judgment' ||
            question.kind === 'proCheck') && (
            <OrderedChoices
              options={question.options}
              selected={typeof selected === 'number' ? selected : undefined}
              onChoose={onChooseNumber}
              scenario={
                question.kind === 'judgment' || question.kind === 'proCheck'
              }
            />
          )}
          {(question.kind === 'interest' || question.kind === 'growth') && (
            <MultiChoices
              options={question.options}
              selected={Array.isArray(selected) ? selected : []}
              onToggle={onToggle}
            />
          )}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button variant="ghost" size="lg" onClick={onBack}>
              <ArrowLeft className="mr-1 size-4" /> Previous
            </Button>
            <Button
              size="lg"
              className="h-11 rounded-full px-6"
              disabled={!canContinue}
              onClick={onAdvance}
            >
              {current === total - 1 ? 'View my profile' : 'Next'}
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}

function ScaleQuestion({
  selected,
  prompt,
  low,
  high,
  onChoose,
}: {
  selected?: number;
  prompt: string;
  low: string;
  high: string;
  onChoose: (value: number) => void;
}) {
  return (
    <fieldset className="mt-9">
      <legend className="text-sm font-semibold">{prompt}</legend>
      <div className="mt-4 grid grid-cols-5 gap-2.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            type="button"
            key={value}
            className={`scale-position ${selected === value ? 'scale-position-selected' : ''}`}
            onClick={() => onChoose(value)}
            aria-label={`${value} of 5`}
            aria-pressed={selected === value}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-4 text-xs text-muted-foreground">
        <span>{low}</span>
        <span className="text-right">{high}</span>
      </div>
    </fieldset>
  );
}

function OrderedChoices({
  options,
  selected,
  onChoose,
  scenario,
}: {
  options: Array<{ id: string; label: string; value: number }>;
  selected?: number;
  onChoose: (value: number) => void;
  scenario: boolean;
}) {
  return (
    <fieldset className="mt-8">
      <legend className="sr-only">Choose one response</legend>
      <div className="grid gap-2.5">
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            className={`ordered-choice ${selected === option.value ? 'ordered-choice-selected' : ''}`}
            onClick={() => onChoose(option.value)}
            aria-pressed={selected === option.value}
          >
            <span className="choice-radio">
              {selected === option.value && <Check className="size-3.5" />}
            </span>
            <span>{option.label}</span>
            {!scenario && (
              <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function MultiChoices({
  options,
  selected,
  onToggle,
}: {
  options: Array<{ id: string; label: string }>;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="mt-8">
      <legend className="sr-only">Select any that apply</legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option.id);
          return (
            <button
              type="button"
              key={option.id}
              className={`multi-choice ${checked ? 'multi-choice-selected' : ''}`}
              onClick={() => onToggle(option.id)}
              aria-pressed={checked}
            >
              <span className="multi-check">
                {checked && <Check className="size-3.5" />}
              </span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-right text-xs font-medium text-muted-foreground">
        {selected.length} selected
      </div>
    </fieldset>
  );
}

function Results({
  competencyScores,
  toolkitScores,
  interpretation,
  year,
  proReflection,
  modeKey,
  growthStageKey,
  onRestart,
  onDownload,
}: {
  competencyScores: ReturnType<typeof calculateResults>['competencyScores'];
  toolkitScores: ReturnType<typeof calculateResults>['toolkitScores'];
  interpretation: ReturnType<typeof interpretResults>;
  year: string | null;
  proReflection: ReturnType<typeof interpretPro> | null;
  modeKey: EngineeringModeKey;
  growthStageKey: GrowthStageKey;
  onRestart: () => void;
  onDownload: () => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const yearLabel = getStudyYearLabel(year);
  const mode = engineeringModes[modeKey];
  const stage = growthStages[growthStageKey];
  const rankedCompetencies = [...competencyScores].sort(
    (a, b) => b.score - a.score,
  );
  const strongest = rankedCompetencies[0];
  const supporting = rankedCompetencies[1];
  const growthEdge = rankedCompetencies.at(-1);
  const workingAnalysis =
    strongest?.score === growthEdge?.score
      ? 'Your responses are evenly balanced across the six competencies. No single area stands out; choose your next practice from your interests and project needs.'
      : strongest
        ? `Your answers point most strongly to ${strongest.fullLabel}${
            supporting
              ? `, with ${supporting.fullLabel} as a supporting strength`
              : ''
          }. ${
            growthEdge && growthEdge.score < supporting.score
              ? `${growthEdge.fullLabel} is the clearest area to practise next.`
              : ''
          }`
        : 'Your profile shows how you currently approach engineering work.';
  return (
    <section
      id="engineering-compass-results"
      className="results-capture mx-auto max-w-7xl px-6 py-11 lg:px-12 lg:py-15"
    >
      <div
        className="mode-hero"
        style={
          {
            '--mode-accent': mode.accent,
            '--mode-tint': mode.tint,
          } as React.CSSProperties
        }
      >
        <div className="mode-copy">
          <div className="mode-eyebrow">
            <Sparkles className="size-4" />{' '}
            {proReflection
              ? 'PRO · CURRENT ENGINEERING ROLE'
              : 'CURRENT ENGINEERING ROLE'}
          </div>
          <div className="mode-stage-row">
            <span className="growth-stage-pill">
              ENGINEERING EXPERIENCE LEVEL{' '}
              {String(stage.number).padStart(2, '0')}/04 · {stage.name}
            </span>
            {yearLabel && (
              <span className="year-context-pill">
                <GraduationCap className="size-3.5" /> {yearLabel}
              </span>
            )}
          </div>
          <h1>{mode.name}</h1>
          <p className="mode-lead">{mode.shortDescription}</p>
          <div className="mode-contribution">
            <span>YOUR CONTRIBUTION</span>
            <p>{mode.contribution}</p>
          </div>
          <p className="mode-disclaimer">
            A current role lens, not a fixed personality type or professional
            rank. If several scores are close, another role may fit just as
            well.
          </p>
          <div className="mode-actions" data-capture-exclude="true">
            <Button
              variant="outline"
              className="rounded-full"
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  await onDownload();
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <Download className="mr-1 size-4" />
              {isSaving ? 'Preparing image…' : 'Save profile as image'}
            </Button>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={onRestart}
            >
              <RefreshCw className="mr-1 size-4" /> Take assessment again
            </Button>
          </div>
        </div>
        <div
          className="mode-art"
          aria-label={`${mode.name} character illustration`}
        >
          {/* oxlint-disable-next-line next/no-img-element */}
          <img
            className="result-character-first"
            src={assetPath(mode.image[initialCharacterVariant(modeKey)])}
            alt=""
            width={1200}
            height={1200}
          />
          {/* oxlint-disable-next-line next/no-img-element */}
          <img
            className="result-character-second"
            data-capture-exclude="true"
            src={assetPath(
              mode.image[initialCharacterVariant(modeKey) === 'a' ? 'b' : 'a'],
            )}
            alt=""
            width={1200}
            height={1200}
          />
        </div>
      </div>
      <div className="mt-9 grid gap-6 lg:grid-cols-[1.04fr_.96fr]">
        <article className="result-panel min-w-0">
          <div className="panel-heading">
            <div>
              <div className="panel-eyebrow">SIX COMPETENCIES</div>
              <h2 className="mt-1 font-serif text-2xl font-semibold">
                How you currently work
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              0–100 profile scale
            </span>
          </div>
          <ChartContainer
            config={chartConfig}
            className="mx-auto mt-3 aspect-square max-h-[470px] w-full"
          >
            <RadarChart data={competencyScores} outerRadius="70%">
              <PolarGrid stroke="#d8e2dc" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#496158', fontSize: 11, fontWeight: 650 }}
              />
              <Radar
                dataKey="score"
                stroke="var(--color-score)"
                fill="var(--color-score)"
                fillOpacity={0.16}
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#163f27', strokeWidth: 0 }}
              />
            </RadarChart>
          </ChartContainer>
          <p className="result-footnote">{workingAnalysis}</p>
        </article>
        <article className="result-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-eyebrow">TECHNICAL TOOLKIT</div>
              <h2 className="mt-1 font-serif text-2xl font-semibold">
                Experience & independence
              </h2>
            </div>
            <Wrench className="size-5 text-primary" />
          </div>
          <div className="mt-7 space-y-4">
            {toolkitScores.map((item) => {
              const level = getToolkitExperienceLevel(item.score);
              return (
                <div key={item.key}>
                  <div className="mb-1.5 flex items-end justify-between gap-4 text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="toolkit-score-meta">
                      <strong>{item.score}</strong>
                      <span>
                        Level {level.number}/5 · {level.label}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="result-footnote mt-6">
            Each level reflects your selected experience and independence in
            that area. Use it as a practice starting point, not proof of
            mastery.
          </p>
        </article>
      </div>
      <div className="result-growth-stack mt-6 grid gap-6">
        <article className="result-panel">
          <div className="panel-eyebrow">CURRENT STRENGTHS</div>
          <h2 className="mt-1 font-serif text-2xl font-semibold">
            Capabilities to build on
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {interpretation.strengths.map((item) => (
              <div className="insight-tile" key={item.key}>
                <span className="score-pill">{item.score}</span>
                <h3 className="mt-4 font-serif text-lg font-semibold">
                  {item.fullLabel}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </article>
        <article className="result-panel">
          <div className="panel-eyebrow">CHOSEN GROWTH PRIORITIES</div>
          <h2 className="mt-1 font-serif text-2xl font-semibold">
            What you want to develop next
          </h2>
          <div className="growth-actions-grid mt-6">
            {interpretation.growth.map((item) => (
              <div className="growth-row" key={item.id}>
                <Target className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{item.label}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="context-card md:col-span-2">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <div className="panel-eyebrow">EVIDENCE PRACTICE</div>
              <p className="mt-2 leading-7">
                {interpretation.evidenceReflection}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Based on two scenarios; interpreted qualitatively and never
                shown as a numerical score.
              </p>
            </div>
          </div>
        </article>
        <article className="context-card">
          <div className="panel-eyebrow">YOUR PROJECT EXPERIENCE</div>
          <div className="mt-3 font-semibold">
            {interpretation.projectLabel}
          </div>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            <span className="block mt-3 mb-1 font-semibold text-foreground">
              Highest responsibility you described
            </span>
            {interpretation.responsibilityLabel}
          </p>
        </article>
      </div>
      {proReflection && <ProReflection reflection={proReflection} />}
      {interpretation.interests.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4">
          <span className="mr-1 text-xs font-semibold uppercase tracking-[.13em] text-muted-foreground">
            Interested in
          </span>
          {interpretation.interests.map((item) => (
            <span className="interest-chip" key={item}>
              {item}
            </span>
          ))}
        </div>
      )}
      <div className="mt-7 flex items-start gap-3 rounded-2xl bg-secondary/70 p-5 text-sm leading-6 text-muted-foreground">
        <CircleHelp className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>
          Use this profile to choose a project role, learning activity, or
          conversation—not to compare students across years or departments.
          {proReflection &&
            ' Pro is a pilot edition. Its additional scenarios and practice reflections complement the core profile; they do not change its scores or establish professional competence.'}
        </p>
      </div>
    </section>
  );
}

function ProReflection({
  reflection,
}: {
  reflection: ReturnType<typeof interpretPro>;
}) {
  return (
    <div className="mt-6 grid gap-6">
      <article className="result-panel">
        <div className="panel-eyebrow">PRO · TEAM DECISIONS</div>
        <h2 className="mt-1 text-2xl font-semibold">
          How you approach project situations
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Feedback on your 12 scenario choices—not an additional score. The
          six-competency profile above uses the same core questions as Standard.
        </p>
        <div className="pro-reflection-grid mt-6">
          {reflection.scenariosByArea.map((group) => (
            <div className="insight-tile" key={group.area}>
              <h3 className="font-semibold">{group.label}</h3>
              {group.reflections.map((item) => (
                <div key={item.id} className="pro-scenario-feedback">
                  <p className="text-sm font-medium">{item.prompt}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Your choice: </span>
                    {item.choice?.label}
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    {item.choice?.feedback}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </article>
      <article className="result-panel">
        <div className="panel-eyebrow">PRO · PRACTICE EVIDENCE</div>
        <h2 className="mt-1 text-2xl font-semibold">
          Your experience in specific tasks
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Two practical reflections per toolkit area help you compare your broad
          rating with work you can describe. This is self-reported evidence, not
          a verified skills test.
        </p>
        <div className="pro-reflection-grid mt-6">
          {reflection.evidence.map((item) => (
            <div key={item.area} className="insight-tile">
              <h3 className="font-semibold">{item.label}</h3>
              <p className="mt-2 text-sm leading-6">{item.summary}</p>
              {item.crossCheck && (
                <p className="mt-3 text-sm leading-6 pro-cross-check">
                  {item.crossCheck}
                </p>
              )}
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.next}
              </p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
