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
import { Button } from '@/components/ui/button';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { competencyOrder } from '@/lib/assessment/competencies';
import { interpretResults } from '@/lib/assessment/interpretation';
import {
  deriveEngineeringMode,
  deriveGrowthStage,
  engineeringModes,
  growthStages,
  type CharacterVariant,
  type EngineeringModeKey,
  type GrowthStageKey,
} from '@/lib/assessment/profile';
import {
  assessmentVersion,
  behaviourScale,
  questions,
  technicalScale,
} from '@/lib/assessment/questions';
import { calculateResults } from '@/lib/assessment/scoring';
import { toolkit, toolkitOrder } from '@/lib/assessment/toolkit';
import { getStudyYearLabel, studyYears } from '@/lib/assessment/years';
import type {
  AssessmentAnswers,
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

const progressStorageKey = 'engineering-compass-progress-v1.4';
const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const phases: Array<{ key: PhaseKey; label: string; range: string }> = [
  { key: 'behaviour', label: 'How you work', range: '01–15' },
  { key: 'technical', label: 'Technical toolkit', range: '16–24' },
  { key: 'context', label: 'Project context', range: '25–26' },
  { key: 'priorities', label: 'Interests & growth', range: '27–28' },
  { key: 'judgment', label: 'Engineering judgment', range: '29–30' },
];
const chartConfig = {
  score: { label: 'Profile', color: '#075b45' },
} satisfies ChartConfig;
const roleIcons: Record<EngineeringModeKey, typeof Compass> = {
  problem: CircleHelp,
  planning: Target,
  collaboration: UsersRound,
  handsOn: Wrench,
  design: Boxes,
  pitch: MessageCircle,
};
const phaseCopy: Record<
  PhaseKey,
  { eyebrow: string; note: string; icon: typeof Compass }
> = {
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
  const [step, setStep] = useState<Step>('welcome');
  const [year, setYear] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({ I01: [] });
  const [characterVariant, setCharacterVariant] =
    useState<CharacterVariant>('a');
  const [savedDraft, setSavedDraft] = useState<{
    year: string | null;
    current: number;
    answers: AssessmentAnswers;
    characterVariant: CharacterVariant;
  } | null>(null);
  const [responseMs, setResponseMs] = useState<number | null>(null);
  const [fastStreak, setFastStreak] = useState(0);
  const [lastNudgeAt, setLastNudgeAt] = useState(-10);
  const [showNudge, setShowNudge] = useState(false);
  const questionStarted = useRef(0);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        version?: string;
        year?: string | null;
        current?: number;
        answers?: AssessmentAnswers;
        characterVariant?: CharacterVariant;
      };
      if (
        parsed.version === assessmentVersion &&
        typeof parsed.current === 'number' &&
        parsed.answers &&
        (parsed.characterVariant === 'a' || parsed.characterVariant === 'b')
      ) {
        queueMicrotask(() =>
          setSavedDraft({
            year: typeof parsed.year === 'string' ? parsed.year : null,
            current: Math.min(
              Math.max(parsed.current ?? 0, 0),
              questions.length - 1,
            ),
            answers: parsed.answers ?? { I01: [] },
            characterVariant: parsed.characterVariant ?? 'a',
          }),
        );
      }
    } catch {
      window.localStorage.removeItem(progressStorageKey);
    }
  }, []);

  useEffect(() => {
    if (step !== 'assessment') return;
    const draft = { year, current, answers, characterVariant };
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({ version: assessmentVersion, ...draft }),
    );
  }, [answers, characterVariant, current, step, year]);

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
            setCharacterVariant(Math.random() < 0.5 ? 'a' : 'b');
            setCurrent(0);
            setStep('assessment');
            questionStarted.current = Date.now();
            return {
              status: 'started',
              version: assessmentVersion,
              question: 1,
              totalQuestions: questions.length,
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const activeQuestion = questions[current];
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
  const activePhaseIndex = phases.findIndex(
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

  useEffect(
    () => () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    },
    [],
  );

  function beginAssessment() {
    setCurrent(0);
    setAnswers({ I01: [] });
    setCharacterVariant(Math.random() < 0.5 ? 'a' : 'b');
    setFastStreak(0);
    setShowNudge(false);
    questionStarted.current = Date.now();
    setStep('assessment');
  }
  function resumeAssessment() {
    if (!savedDraft) return;
    setYear(savedDraft.year);
    setCurrent(savedDraft.current);
    setAnswers(savedDraft.answers);
    setCharacterVariant(savedDraft.characterVariant);
    setFastStreak(0);
    setShowNudge(false);
    questionStarted.current = Date.now();
    setStep('assessment');
  }
  function chooseNumber(value: number) {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    const elapsed = Date.now() - questionStarted.current;
    setAnswers((previous) => ({ ...previous, [activeQuestion.id]: value }));
    setResponseMs(elapsed);
    setShowNudge(false);
    autoAdvanceTimer.current = setTimeout(
      () => advance(false, elapsed, true),
      520,
    );
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
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    const reflective =
      activeQuestion.kind === 'behaviour' ||
      activeQuestion.kind === 'technical';
    const nextStreak =
      reflective && (timingOverride ?? responseMs ?? 99999) < 1800
        ? fastStreak + 1
        : 0;
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
      setSavedDraft(null);
      window.localStorage.removeItem(progressStorageKey);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrent((value) => value + 1);
    questionStarted.current = Date.now();
  }
  function goBack() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
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
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    const draft = { year, current, answers, characterVariant };
    setSavedDraft(draft);
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({ version: assessmentVersion, ...draft }),
    );
    setStep('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function restart() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setStep('welcome');
    setYear(null);
    setCurrent(0);
    setAnswers({ I01: [] });
    setFastStreak(0);
    setShowNudge(false);
    setSavedDraft(null);
    window.localStorage.removeItem(progressStorageKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function downloadSummary() {
    const yearLabel = getStudyYearLabel(year) ?? 'Not provided';
    const lines = [
      'ENGINEERING COMPASS — STANDARD V1.4 PROFILE',
      `Study year: ${yearLabel} (context only)`,
      `Current Engineering Role: ${engineeringModes[modeKey].name}`,
      `Growth stage: ${growthStages[growthStageKey].name}`,
      '',
      'SIX ENGINEERING COMPETENCIES',
      ...results.competencyScores.map(
        (item) => `${item.fullLabel}: ${item.score}/100`,
      ),
      '',
      'TECHNICAL TOOLKIT',
      ...results.toolkitScores.map((item) => `${item.name}: ${item.score}/100`),
      '',
      'CHOSEN GROWTH PRIORITIES',
      ...interpretation.growth.map((item) => item.label),
      '',
      'ENGINEERING INTERESTS',
      ...(interpretation.interests.length
        ? interpretation.interests
        : ['Not provided']),
      '',
      `Evidence-practice reflection: ${interpretation.evidenceReflection}`,
      '',
      'A formative self-reflection — not a grade, type, ranking, or objective ability test.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'engineering-compass-standard-v1-4.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header
        progress={
          step === 'assessment'
            ? ((current + 1) / questions.length) * 100
            : null
        }
        showNavigation={step === 'welcome'}
        onBegin={() => setStep('year')}
      />
      {step === 'welcome' && (
        <Welcome
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
          characterVariant={characterVariant}
          modeKey={modeKey}
          growthStageKey={growthStageKey}
          onRestart={restart}
          onDownload={downloadSummary}
        />
      )}
    </main>
  );
}

function Header({
  progress,
  showNavigation,
  onBegin,
}: {
  progress: number | null;
  showNavigation: boolean;
  onBegin: () => void;
}) {
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
        {showNavigation ? (
          <div className="home-nav">
            <nav aria-label="Homepage sections">
              <a href="#about">About</a>
              <a href="#how-it-works">How it works</a>
              <a href="#roles">Roles</a>
              <a href="#toolkit">Toolkit areas</a>
              <a href="#faq">FAQ</a>
            </nav>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={onBegin}
            >
              Take the assessment <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        ) : (
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="size-2 rounded-full bg-emerald-600" /> Responses
            stay in this browser
          </div>
        )}
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
  onBegin,
  onResume,
  hasSavedProgress,
}: {
  onBegin: () => void;
  onResume: () => void;
  hasSavedProgress: boolean;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="compass-grid absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 lg:min-h-[610px] lg:grid-cols-[1.04fr_.96fr] lg:px-12">
        <div className="max-w-3xl">
          <div className="eyebrow mb-6">
            <Compass className="size-4" /> STANDARD · FORMATIVE SELF-ASSESSMENT
          </div>
          <h1 className="display-title text-[clamp(3.2rem,6vw,6.3rem)] leading-[.94] tracking-[-.055em]">
            Find Your Role in an Engineering Team
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            A short self-assessment to explore your engineering strengths,
            hands-on experience, and growth directions.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-13 rounded-full px-7 text-base shadow-[0_14px_34px_rgba(7,91,69,.2)]"
              onClick={onBegin}
            >
              Begin assessment <ArrowRight className="ml-1 size-4" />
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
              <Gauge className="size-4" /> About 8–10 minutes
            </div>
          </div>
          <p className="mt-5 max-w-lg text-xs leading-5 text-muted-foreground">
            Your responses are private and stay on this device. The role is a
            reflection prompt—not a grade, selection test, or fixed type.
          </p>
        </div>
        <div className="mx-auto w-full max-w-lg">
          <div className="profile-orbit" aria-hidden="true">
            <div className="orbit-axis orbit-axis-x" />
            <div className="orbit-axis orbit-axis-y" />
            <div className="orbit-center">
              <Compass className="size-11" strokeWidth={1.5} />
              <span>YOUR PROFILE</span>
            </div>
            {competencyOrder.map((key, index) => (
              <div
                key={key}
                className={`orbit-point orbit-point-${index + 1}`}
                style={{ '--point-color': '#075b45' } as React.CSSProperties}
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
              ['30', 'questions'],
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
            <h2>One profile, two useful lenses.</h2>
          </div>
          <p>
            Thirty responses form your six-competency radar and nine-area
            toolkit. Your leading competency suggests one of six current team
            roles; project context and toolkit experience provide a small Growth
            Stage label. Neither is a grade, personality type, or professional
            rank.
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
            <article className="role-preview-card" key={key}>
              <div className="role-preview-icon" aria-hidden="true">
                {(() => {
                  const RoleIcon = roleIcons[key];
                  return <RoleIcon className="size-7" strokeWidth={1.65} />;
                })()}
              </div>
              <div className="mode-preview-copy">
                <h3>{mode.name}</h3>
                <p>{mode.shortDescription}</p>
              </div>
            </article>
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
          </div>
          <div className="toolkit-chip-grid">
            {toolkitOrder.map((key) => (
              <span key={key}>
                <Wrench className="size-4" /> {toolkit[key].label}
              </span>
            ))}
          </div>
        </div>
        <div id="about" className="home-info-grid scroll-mt-24">
          <article>
            <div className="panel-eyebrow">ABOUT</div>
            <h2>A practical reflection for engineering learners.</h2>
            <p>
              Use it at different points in your undergraduate journey to notice
              changing strengths, experience, and priorities.
            </p>
          </article>
          <article id="faq" className="scroll-mt-24">
            <div className="panel-eyebrow">FAQ</div>
            <h2>Will this decide my team role?</h2>
            <p>
              No. Your result offers one useful role lens based on your current
              responses. If several scores are close, your team contribution may
              shift with the project.
            </p>
          </article>
        </div>
      </div>
      <footer className="home-footer">
        <span>Faculty of Engineering · The University of Hong Kong</span>
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
              Question {current + 1} of {questions.length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="assessment-home" onClick={onHome}>
              <House className="size-4" /> Return home
            </button>
            <div className="rounded-full border bg-card px-3 py-1.5 text-sm font-semibold tabular-nums text-primary">
              {Math.round(((current + 1) / questions.length) * 100)}%
            </div>
          </div>
        </div>
        {showNudge && (
          <output className="nudge nudge-top">
            <TimerReset className="mt-0.5 size-5 shrink-0" />
            <div>
              <div className="font-semibold">A quick reflection check</div>
              <p className="mt-1 leading-5 text-amber-900/80">
                You answered the last few statements unusually quickly. Picture
                a real project example, then keep or change this answer.
              </p>
            </div>
          </output>
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
          {(question.kind === 'context' || question.kind === 'judgment') && (
            <OrderedChoices
              options={question.options}
              selected={typeof selected === 'number' ? selected : undefined}
              onChoose={onChooseNumber}
              scenario={question.kind === 'judgment'}
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
  characterVariant,
  modeKey,
  growthStageKey,
  onRestart,
  onDownload,
}: {
  competencyScores: ReturnType<typeof calculateResults>['competencyScores'];
  toolkitScores: ReturnType<typeof calculateResults>['toolkitScores'];
  interpretation: ReturnType<typeof interpretResults>;
  year: string | null;
  characterVariant: CharacterVariant;
  modeKey: EngineeringModeKey;
  growthStageKey: GrowthStageKey;
  onRestart: () => void;
  onDownload: () => void;
}) {
  const yearLabel = getStudyYearLabel(year);
  const mode = engineeringModes[modeKey];
  const stage = growthStages[growthStageKey];
  return (
    <section className="mx-auto max-w-7xl px-6 py-11 lg:px-12 lg:py-15">
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
            <Sparkles className="size-4" /> CURRENT ENGINEERING ROLE
          </div>
          <div className="mode-stage-row">
            <span className="growth-stage-pill">
              GROWTH STAGE {String(stage.number).padStart(2, '0')}/04 ·{' '}
              {stage.name}
            </span>
            {yearLabel && (
              <span className="year-context-pill">
                <GraduationCap className="size-3.5" /> {yearLabel} · context
                only
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
            well. The illustration is selected at random and does not represent
            your gender.
          </p>
          <div className="mode-actions">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={onDownload}
            >
              <Download className="mr-1 size-4" /> Download summary
            </Button>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={onRestart}
            >
              <RefreshCw className="mr-1 size-4" /> Retake
            </Button>
          </div>
        </div>
        <div
          className="mode-art"
          aria-label={`${mode.name} character illustration`}
        >
          {/* oxlint-disable-next-line next/no-img-element */}
          <img
            src={assetPath(mode.image[characterVariant])}
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
                dot={{ r: 4, fill: '#075b45', strokeWidth: 0 }}
              />
            </RadarChart>
          </ChartContainer>
          <p className="result-footnote">
            Hands-on represents your current technical breadth, experience, and
            independence across all nine toolkit areas—not an objective ability
            score.
          </p>
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
            {toolkitScores.map((item) => (
              <div key={item.key}>
                <div className="mb-1.5 flex items-end justify-between gap-4 text-sm">
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
          <p className="result-footnote mt-6">
            Each bar comes from its own Standard self-report item. Use it as a
            starting point for reflection, not proof of mastery.
          </p>
        </article>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
          <div className="mt-6 space-y-3">
            {interpretation.growth.map((item) => (
              <div className="growth-row" key={item.id}>
                <Target className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{item.label}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.id === 'not-sure'
                      ? 'Try one unfamiliar project role, then revisit this reflection with new evidence.'
                      : 'Choose one small project action that gives you direct practice and feedback.'}
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
          <div className="panel-eyebrow">PROJECT CONTEXT</div>
          <div className="mt-3 font-semibold">
            {interpretation.projectLabel}
          </div>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {interpretation.responsibilityLabel}
          </p>
        </article>
      </div>
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
          conversation—not to compare students across years or departments. A
          future Pro version will add deeper scenario and evidence checks.
        </p>
      </div>
    </section>
  );
}
