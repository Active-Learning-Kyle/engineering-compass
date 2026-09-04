'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LanguageProvider,
  LanguageSwitcher,
  LocalizedContent,
  useLanguage,
} from '@/components/language';
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
  Cog,
  Box,
  Printer,
  CircuitBoard,
  Code2,
  Cpu,
  Radio,
  ScanEye,
  Workflow,
} from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { exportProfileImage } from '@/lib/assessment/profile-export';
import { Button } from '@/components/ui/button';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { competencyOrder } from '@/lib/assessment/competencies';
import { interpretResults } from '@/lib/assessment/interpretation';
import {
  deriveEngineeringMode,
  deriveLeadingModes,
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
import {
  getQuestions,
  interpretPro,
  currentVersion,
} from '@/lib/assessment/pro';
import {
  compassSpringStep,
  compassRetargetDelay,
  shuffledCompassTargets,
} from '@/lib/assessment/compass-motion';
import { toolkit, toolkitOrder } from '@/lib/assessment/toolkit';
import { getStudyYearLabel, studyYears } from '@/lib/assessment/years';
import type {
  AssessmentAnswers,
  AssessmentEdition,
  AssessmentItem,
  PhaseKey,
  ToolkitKey,
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

import {
  readDraft,
  progressStorageKey,
  legacyStorageKey,
} from '@/lib/assessment/drafts';
const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const phases: Array<{ key: PhaseKey; label: string; range: string }> = [
  { key: 'behaviour', label: 'common.howYouWork', range: '01–15' },
  { key: 'technical', label: 'common.technicalToolkit', range: '16–24' },
  { key: 'context', label: 'common.projectContext', range: '25–26' },
  { key: 'judgment', label: 'common.engineeringJudgment', range: '27–28' },
  { key: 'priorities', label: 'common.interestsGrowth', range: '29–30' },
];
const proPhases = [
  ...phases.slice(0, 2),
  {
    key: 'proScenarios' as const,
    label: 'common.teamDecisions',
    range: '25–36',
  },
  {
    key: 'proEvidence' as const,
    label: 'common.practiceEvidence',
    range: '37–54',
  },
  { key: 'context' as const, label: 'common.projectContext', range: '55–56' },
  {
    key: 'judgment' as const,
    label: 'common.engineeringJudgment',
    range: '57–58',
  },
  {
    key: 'priorities' as const,
    label: 'common.interestsGrowth',
    range: '59–60',
  },
];
const toolkitIcons: Record<ToolkitKey, typeof Compass> = {
  mechanical: Cog,
  cad: Box,
  fabrication: Printer,
  electronics: CircuitBoard,
  programming: Code2,
  physicalComputing: Cpu,
  sensorsIot: Radio,
  aiVision: ScanEye,
  integration: Workflow,
};
const chartConfig = {
  score: { label: 'common.profile', color: '#163f27' },
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
        nextMove = time + compassRetargetDelay();
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
  'common.newToThis',
  'common.guided',
  'common.developing',
  'common.independent',
  'common.adaptable',
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
    eyebrow: 'common.proTeamDecisions',
    note: 'assessment.scenarios.note',
    icon: Lightbulb,
  },
  proEvidence: {
    eyebrow: 'common.proPracticeEvidence',
    note: 'common.recallWorkYouHaveActuallyDoneAndHowYou',
    icon: Wrench,
  },
  behaviour: {
    eyebrow: 'common.howYouWork',
    note: 'assessment.behaviour.helper',
    icon: Compass,
  },
  technical: {
    eyebrow: 'common.technicalToolkit',
    note: 'common.rateYourCurrentExperienceAndIndependenceNotHowInterested',
    icon: Wrench,
  },
  context: {
    eyebrow: 'common.projectContext',
    note: 'common.theseFactualAnswersHelpFrameYourReflectionTheyNever',
    icon: BookOpenCheck,
  },
  priorities: {
    eyebrow: 'common.interestsGrowth',
    note: 'common.yourChoicesPersonaliseTheResultTheyDoNotChange',
    icon: Target,
  },
  judgment: {
    eyebrow: 'common.engineeringJudgment',
    note: 'common.chooseTheResponseClosestToWhatYouWouldGenuinely',
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
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}

function HomeContent() {
  const [edition, setEdition] = useState<AssessmentEdition>('standard');
  const questions = getQuestions(edition);
  const activePhases = edition === 'pro' ? proPhases : phases;
  const version = currentVersion(edition);
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
  const [hasLegacyDraft, setHasLegacyDraft] = useState(false);
  const questionStarted = useRef(0);
  const fastStreak = useRef(0);
  const lastNudgeAt = useRef(-10);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      const result = raw ? readDraft(raw) : null;
      if (result?.status === 'current')
        queueMicrotask(() => setSavedDraft(result.draft));
      const hasOld =
        Boolean(window.localStorage.getItem(legacyStorageKey)) ||
        result?.status === 'legacy';
      if (hasOld) queueMicrotask(() => setHasLegacyDraft(true));
    } catch {
      // Private browsing may disable storage. Do not delete older responses.
    }
  }, []);

  useEffect(() => {
    if (step !== 'assessment') return;
    const draft = { edition, year, current, answers };
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        version,
        questionOrder: 'judgment-before-priorities',
        ...draft,
      }),
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
      JSON.stringify({
        version,
        questionOrder: 'judgment-before-priorities',
        ...draft,
      }),
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
    await exportProfileImage(
      resultPage,
      `engineering-compass-${edition}-${modeKey}-profile.png`,
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {step === 'welcome' && (
        <div className="home-language-bar">
          <LanguageSwitcher />
        </div>
      )}
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
          hasLegacyDraft={hasLegacyDraft}
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
    <LocalizedContent>
      {
        <header className="sticky top-0 z-30 border-b bg-background/92 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[74px] flex-wrap gap-3 max-w-7xl items-center justify-between px-5 py-3 lg:px-12">
            <div className="flex items-center gap-3">
              <div className="brand-mark">
                <Compass className="size-5" />
              </div>
              <div>
                <div className="font-serif text-lg font-semibold leading-none">
                  {'brand.name'}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">
                  {'common.activeLearningHkuEngineering'}
                </div>
              </div>
            </div>
            <div className="header-controls">
              <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
                <span className="size-2 rounded-full bg-emerald-600" />{' '}
                {'common.responsesStayInThisBrowser'}
              </div>
              <LanguageSwitcher embedded />
            </div>
          </div>
          {progress !== null && (
            <Progress
              value={progress}
              className="absolute inset-x-0 bottom-0 gap-0 [&_[data-slot=progress-track]]:h-[3px] [&_[data-slot=progress-track]]:rounded-none"
            />
          )}
        </header>
      }
    </LocalizedContent>
  );
}

function Welcome({
  edition,
  onEditionChange,
  onBegin,
  onResume,
  hasSavedProgress,
  hasLegacyDraft,
}: {
  edition: AssessmentEdition;
  onEditionChange: (edition: AssessmentEdition) => void;
  onBegin: () => void;
  onResume: () => void;
  hasSavedProgress: boolean;
  hasLegacyDraft: boolean;
}) {
  const { t } = useLanguage();
  return (
    <LocalizedContent>
      {
        <section className="relative overflow-hidden">
          <div className="compass-grid absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 lg:min-h-[610px] lg:grid-cols-[1.04fr_.96fr] lg:px-12">
            <div className="max-w-3xl">
              <div className="home-product-kicker mb-6">
                <span className="home-product-mark">
                  <Compass className="size-4" />
                </span>
                <span>{'brand.name'}</span>
              </div>
              <h1 className="display-title text-[clamp(3.2rem,6vw,6.3rem)] leading-[.94] tracking-[-.055em]">
                {'home.hero.title'}
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                {'home.hero.description'}
              </p>
              <div className="assessment-version-grid mt-8">
                <button
                  className={`assessment-version-card ${edition === 'standard' ? 'is-available is-selected' : ''}`}
                  aria-pressed={edition === 'standard'}
                  onClick={() => onEditionChange('standard')}
                >
                  <span className="version-status">
                    {'common.availableNow'}
                  </span>
                  <span className="version-title">Standard</span>
                  <span className="version-purpose">
                    {'home.standard.purpose'}
                  </span>
                  <span className="version-meta">
                    {'common.30Questions810Minutes'}
                  </span>
                  <span className="version-action">
                    {edition === 'standard'
                      ? 'common.selected'
                      : 'common.chooseStandard'}{' '}
                    <Check className="size-4" />
                  </span>
                </button>
                <button
                  className={`assessment-version-card ${edition === 'pro' ? 'is-available is-selected' : ''}`}
                  aria-pressed={edition === 'pro'}
                  onClick={() => onEditionChange('pro')}
                >
                  <span className="version-status">
                    {'common.pilotEdition'}
                  </span>
                  <span className="version-title">Pro</span>
                  <span className="version-purpose">{'home.pro.purpose'}</span>
                  <span className="version-meta">
                    {'common.60QuestionsAbout1825Minutes'}
                  </span>
                  <span className="version-action">
                    {edition === 'pro' ? 'common.selected' : 'common.choosePro'}{' '}
                    <Check className="size-4" />
                  </span>
                </button>
              </div>
              <div className="home-start-actions mt-4">
                <Button
                  size="lg"
                  className="home-begin-button h-13 w-full rounded-full px-6"
                  onClick={onBegin}
                >
                  {t('home.begin', {
                    edition: edition === 'pro' ? 'Pro' : 'Standard',
                  })}{' '}
                  <ArrowRight className="size-4" />
                </Button>
                {hasSavedProgress && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-13 rounded-full px-6"
                    onClick={onResume}
                  >
                    {'common.resumeSavedProgress'}
                  </Button>
                )}
                <div className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
                  <Gauge className="size-4" />{' '}
                  {edition === 'pro'
                    ? 'common.coreProfileTeamScenariosPracticeEvidence'
                    : 'common.yourCoreEngineeringProfile'}
                </div>
              </div>
              {hasLegacyDraft && (
                <output className="block mt-4 text-sm leading-6 text-muted-foreground">
                  {'draft.previous'}
                </output>
              )}
            </div>
            <div className="home-compass-column mx-auto w-full max-w-lg">
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
                  <span>{'common.yourProfile'}</span>
                </div>
                {competencyOrder.map((key, index) => (
                  <div
                    key={key}
                    className={`orbit-point orbit-point-${index + 1}`}
                    style={
                      { '--point-color': '#163f27' } as React.CSSProperties
                    }
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
                    edition === 'pro'
                      ? 'common.proQuestions'
                      : 'common.standardQuestions',
                  ],
                  ['6', 'common.competencies'],
                  ['9', 'common.toolkitAreas'],
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
              <div className="home-assessment-notes">
                {edition === 'pro' && (
                  <p>{'common.proIsAnInitialPilotForFeedbackAndRevision'}</p>
                )}
                <p>{'common.yourResponsesArePrivateAndStayOnThisDevice'}</p>
              </div>
            </div>
          </div>
          <div className="relative mx-auto max-w-7xl px-6 pb-14 lg:px-12">
            <div id="how-it-works" className="method-strip scroll-mt-24">
              <div>
                <div className="panel-eyebrow">{'home.method.eyebrow'}</div>
                <h2>{'common.discoverYourStrengthsAndWhatToPractiseNext'}</h2>
              </div>
              <p>
                {'common.theseResponsesHelpYouExploreSixWaysOfContributing'}
              </p>
            </div>
            <div id="roles" className="modes-preview-heading scroll-mt-24">
              <div>
                <div className="panel-eyebrow">{'home.roles.eyebrow'}</div>
                <h2>{'common.exploreHowYouMayCurrentlyContributeToATeam'}</h2>
              </div>
              <span>
                {'common.differentRolesAreUsefulInDifferentMomentsNotHigher'}
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
                  aria-label={t('role.preview', { name: t(mode.name) })}
                >
                  <div className="role-preview-default">
                    <div className="role-preview-icon" aria-hidden="true">
                      {(() => {
                        const RoleIcon = roleIcons[key];
                        return (
                          <RoleIcon className="size-7" strokeWidth={1.65} />
                        );
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
                      <span>{'common.engineeringRole'}</span>
                      <h3>{mode.name}</h3>
                      <p>{mode.contribution}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div id="toolkit" className="home-toolkit scroll-mt-24">
              <div>
                <div className="panel-eyebrow">{'home.toolkit.eyebrow'}</div>
                <h2>{'home.toolkit.title'}</h2>
                <p>{'common.eachAreaIsReflectedSeparatelySoTheResultShows'}</p>
              </div>
              <div className="toolkit-chip-grid">
                {toolkitOrder.map((key) => {
                  const ToolkitIcon = toolkitIcons[key];
                  return (
                    <article className="toolkit-preview-card" key={key}>
                      <div className="toolkit-preview-title">
                        <span className="toolkit-area-icon">
                          <ToolkitIcon className="size-6" aria-hidden="true" />
                        </span>
                        <h3>{toolkit[key].label}</h3>
                      </div>
                      <p>{toolkit[key].description}</p>
                      <ul className="toolkit-skills-preview">
                        {toolkit[key].skills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
          <footer className="home-footer">
            <div className="home-footer-brand">
              <Compass className="size-5" />
              <span>
                <strong>{'brand.name'}</strong>
                <small>{'common.reflectOnHowYouThinkBuildAndContribute'}</small>
              </span>
            </div>
            <span className="home-footer-privacy">
              {'common.privateByDesignResponsesStayOnYourDevice'}
            </span>
            <a href="https://activelearning.engg.hku.hk/#about">
              {'common.learnAboutActiveLearning'}
              <ArrowRight className="size-4" />
            </a>
          </footer>
        </section>
      }
    </LocalizedContent>
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
    <LocalizedContent>
      {
        <section className="mx-auto max-w-6xl px-6 py-12 lg:px-12 lg:py-18">
          <button className="back-link" onClick={onBack}>
            <ArrowLeft className="size-4" /> {'common.back'}
          </button>
          <div className="max-w-2xl">
            <div className="eyebrow mb-5">{'common.optionalBackground'}</div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {'common.whatYearOfUndergraduateStudyAreYouIn'}
            </h1>
            <p className="mt-4 text-lg leading-7 text-muted-foreground">
              {'common.thisHelpsYouRevisitTheCompassAcrossDifferentYears'}
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
              {'common.skipThisStep'}
            </button>
          </div>
          <div className="mt-9 flex justify-end">
            <Button
              size="lg"
              className="h-12 rounded-full px-7"
              onClick={onContinue}
            >
              {'common.continue'}
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </section>
      }
    </LocalizedContent>
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
  const { t } = useLanguage();
  const phase = phaseCopy[question.phase];
  const PhaseIcon = phase.icon;
  const scale = question.kind === 'behaviour' ? behaviourScale : technicalScale;
  return (
    <LocalizedContent>
      {
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-9 lg:grid-cols-[250px_minmax(0,780px)] lg:px-12 lg:py-13">
          <aside className="hidden lg:block">
            <div className="sticky top-27">
              <div className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
                {'common.assessmentPath'}
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
                    <span className="text-xs tabular-nums text-muted-foreground">
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
                  {t('assessment.questionCount', {
                    current: current + 1,
                    total,
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="assessment-home" onClick={onHome}>
                  <House className="size-4" /> {'common.returnHome'}
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
                    <h2 id="nudge-title">
                      {'common.youReAnsweringALittleQuickly'}
                    </h2>
                    <p id="nudge-description">
                      {'common.takeAMomentToReadEachQuestionBeforeChoosing'}
                    </p>
                  </div>
                  <Button
                    className="nudge-continue"
                    size="lg"
                    onClick={onAdvance}
                  >
                    {'common.skipAnswerAndContinue'}{' '}
                    <ArrowRight className="ml-1 size-4" />
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
              {question.kind === 'behaviour' && (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {'assessment.behaviour.helper'}
                </p>
              )}
              {question.helper && (
                <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                  {question.helper}
                </p>
              )}
              {(question.kind === 'behaviour' ||
                question.kind === 'technical') && (
                <ScaleQuestion
                  selected={typeof selected === 'number' ? selected : undefined}
                  prompt={scale.prompt}
                  low={scale.low}
                  high={scale.high}
                  labels={
                    question.kind === 'behaviour'
                      ? behaviourScale.details
                      : undefined
                  }
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
                  <ArrowLeft className="mr-1 size-4" /> {'common.previous'}
                </Button>
                <Button
                  size="lg"
                  className="h-11 rounded-full px-6"
                  disabled={!canContinue}
                  onClick={onAdvance}
                >
                  {current === total - 1
                    ? 'common.viewMyProfile'
                    : 'common.next'}
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              </div>
            </article>
          </div>
        </section>
      }
    </LocalizedContent>
  );
}

function ScaleQuestion({
  selected,
  prompt,
  low,
  high,
  labels,
  onChoose,
}: {
  selected?: number;
  prompt: string;
  low: string;
  high: string;
  labels?: readonly string[];
  onChoose: (value: number) => void;
}) {
  const { t } = useLanguage();
  return (
    <LocalizedContent>
      {
        <fieldset className="mt-9">
          <legend className="text-sm font-semibold">{prompt}</legend>
          <div className="mt-4 grid grid-cols-5 gap-2.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                key={value}
                className={`scale-position ${labels ? 'scale-frequency' : ''} ${selected === value ? 'scale-position-selected' : ''}`}
                onClick={() => onChoose(value)}
                aria-label={
                  labels
                    ? t(labels[value - 1])
                    : t('assessment.scaleValue', { value })
                }
                aria-pressed={selected === value}
              >
                {value}
                {labels && <span>{labels[value - 1]}</span>}
              </button>
            ))}
          </div>
          {!labels && (
            <div className="mt-2 flex justify-between gap-4 text-xs text-muted-foreground">
              <span>{low}</span>
              <span className="text-right">{high}</span>
            </div>
          )}
        </fieldset>
      }
    </LocalizedContent>
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
    <LocalizedContent>
      {
        <fieldset className="mt-8">
          <legend className="sr-only">{'common.chooseOneResponse'}</legend>
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
      }
    </LocalizedContent>
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
  const { t } = useLanguage();
  return (
    <LocalizedContent>
      {
        <fieldset className="mt-8">
          <legend className="sr-only">{'common.selectAnyThatApply'}</legend>
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
            {t('assessment.selectedCount', { count: selected.length })}
          </div>
        </fieldset>
      }
    </LocalizedContent>
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
  const { t } = useLanguage();
  const [saveError, setSaveError] = useState<string | null>(null);
  const yearLabel = getStudyYearLabel(year);
  const mode = engineeringModes[modeKey];
  const stage = growthStages[growthStageKey];
  const rankedCompetencies = [...competencyScores].sort(
    (a, b) => b.score - a.score,
  );
  const strongest = rankedCompetencies[0];
  const supporting = rankedCompetencies[1];
  const growthEdge = rankedCompetencies.at(-1);
  const modes = deriveLeadingModes(competencyScores);
  const nextAction =
    interpretation.growth[0]?.action ?? 'growthAction.not-sure';
  const workingAnalysis = modes.balanced
    ? t('result.analysis.balanced')
    : t('result.analysis.leading', {
        first: t(strongest.fullLabel),
        second: t(supporting.fullLabel),
      }) +
      (growthEdge && growthEdge.score < supporting.score
        ? ' ' + t('result.analysis.practice', { area: t(growthEdge.fullLabel) })
        : '');

  return (
    <LocalizedContent>
      {
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
                  ? 'result.role.proEyebrow'
                  : 'result.role.eyebrow'}
              </div>
              <div className="mode-stage-row">
                <span className="growth-stage-pill">
                  {'result.scope.label'} · {stage.name}
                </span>
                {yearLabel && (
                  <span className="year-context-pill">
                    <GraduationCap className="size-3.5" /> {yearLabel}
                  </span>
                )}
              </div>
              <h1>
                {modes.balanced
                  ? 'result.role.balanced'
                  : modes.leading
                      .map((item) => t(engineeringModes[item.key].name))
                      .join(' + ')}
              </h1>
              {modes.leading.length > 1 && !modes.balanced && (
                <p className="mode-secondary">
                  {'result.role.tied'} · {modes.leading[0].score}
                </p>
              )}
              <p className="mode-lead">
                {modes.balanced
                  ? 'result.role.balancedNote'
                  : modes.leading.length === 1
                    ? mode.shortDescription
                    : 'result.role.sharedNote'}
              </p>
              {modes.supporting.length > 0 && (
                <p className="mode-secondary">
                  {'result.role.also'}:{' '}
                  {modes.supporting
                    .map(
                      (item) =>
                        `${t(engineeringModes[item.key].name)} · ${item.score}`,
                    )
                    .join(' / ')}
                </p>
              )}
              <p className="mode-scope-description">{stage.description}</p>
              <div className="mode-quick-insights">
                <div className="mode-contribution">
                  <span>
                    {modes.leading.length === 1
                      ? 'result.quick.strength'
                      : 'result.quick.strengths'}
                  </span>
                  <p>
                    {modes.leading.length === 1
                      ? mode.contribution
                      : modes.leading
                          .map((item) => t(item.fullLabel))
                          .join(' · ')}
                  </p>
                </div>
                <div className="mode-contribution">
                  <span>{'result.quick.next'}</span>
                  <p>{nextAction}</p>
                </div>
              </div>
              <p className="mode-disclaimer">{'result.role.disclaimer'}</p>
              <div className="mode-actions" data-capture-exclude="true">
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={isSaving}
                  onClick={async () => {
                    setIsSaving(true);
                    setSaveError(null);
                    try {
                      await onDownload();
                    } catch {
                      setSaveError('result.export.error');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  <Download className="mr-1 size-4" />
                  {isSaving ? 'result.export.preparing' : 'result.export.save'}
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full"
                  onClick={onRestart}
                >
                  <RefreshCw className="mr-1 size-4" />{' '}
                  {'common.takeAssessmentAgain'}
                </Button>
              </div>
              {saveError && (
                <p
                  role="alert"
                  className="mt-3 text-sm text-white"
                  data-capture-exclude="true"
                >
                  {saveError}
                </p>
              )}
            </div>
            <div
              className="mode-art"
              aria-label={t('role.illustration', { name: t(mode.name) })}
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
                  mode.image[
                    initialCharacterVariant(modeKey) === 'a' ? 'b' : 'a'
                  ],
                )}
                alt=""
                width={1200}
                height={1200}
              />
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {'result.scope.note'}
          </p>
          <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1.04fr_.96fr]">
            <article className="result-panel min-w-0">
              <div className="panel-heading">
                <div>
                  <div className="panel-eyebrow">
                    {'common.sixCompetencies'}
                  </div>
                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    {'result.radar.title'}
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  {'common.0100ProfileScale'}
                </span>
              </div>
              <ChartContainer
                config={chartConfig}
                className="mx-auto mt-3 aspect-square max-h-[470px] w-full"
              >
                <RadarChart
                  data={competencyScores.map((item) => ({
                    ...item,
                    subject: t(item.subject),
                  }))}
                  outerRadius="60%"
                >
                  <PolarGrid stroke="#d8e2dc" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={({ x, y, payload, textAnchor }) => (
                      <text
                        x={x}
                        y={y}
                        dx={
                          textAnchor === 'start'
                            ? -12
                            : textAnchor === 'end'
                              ? 12
                              : 0
                        }
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="radar-axis-label"
                      >
                        {payload.value}
                      </text>
                    )}
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
                  <div className="panel-eyebrow">
                    {'common.technicalToolkit'}
                  </div>
                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    {'result.toolkit.title'}
                  </h2>
                </div>
                <Wrench className="size-5 text-primary" />
              </div>
              <div className="mt-7 space-y-4">
                <p className="panel-eyebrow">{'result.toolkit.selfRating'}</p>
                {toolkitScores.map((item) => {
                  const level = getToolkitExperienceLevel(item.score);
                  const evidence = proReflection?.evidence.find(
                    (entry) => entry.area === item.key,
                  );
                  return (
                    <div key={item.key}>
                      <div className="toolkit-score-heading mb-1.5 text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="toolkit-score-meta">
                          <span>
                            {t('result.toolkit.level', {
                              number: level.number,
                              label: t(level.label),
                            })}
                          </span>
                          <strong>{item.score}</strong>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      {evidence && (
                        <div className="toolkit-evidence">
                          <span className="panel-eyebrow">
                            {'result.evidence.label'}
                          </span>
                          {evidence.answered === evidence.total && (
                            <p>
                              {t('result.evidence.depth', {
                                count: evidence.independent,
                                total: evidence.total,
                              })}
                            </p>
                          )}
                          <p>{evidence.consistency}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="result-footnote mt-6">
                {
                  'common.eachLevelReflectsYourSelectedExperienceAndIndependenceIn'
                }
              </p>
              {proReflection && (
                <p className="result-footnote mt-3">
                  {'result.evidence.selfReport'}
                </p>
              )}
            </article>
          </div>
          <div className="result-growth-stack mt-6 grid gap-6">
            <article className="result-panel">
              <div className="panel-eyebrow">{'common.currentStrengths'}</div>
              <h2 className="mt-1 font-serif text-2xl font-semibold">
                {'result.strengths.title'}
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
              <div className="panel-eyebrow">
                {'common.chosenGrowthPriorities'}
              </div>
              <h2 className="mt-1 font-serif text-2xl font-semibold">
                {'result.growth.title'}
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
                  <div className="panel-eyebrow">
                    {'common.evidencePractice'}
                  </div>
                  <p className="mt-2 leading-7">
                    {interpretation.evidenceReflection}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {
                      'common.basedOnTwoScenariosInterpretedQualitativelyAndNeverShown'
                    }
                  </p>
                </div>
              </div>
            </article>
            <article className="context-card">
              <div className="panel-eyebrow">
                {'common.yourProjectExperience'}
              </div>
              <div className="mt-3 font-semibold">
                {interpretation.projectLabel}
              </div>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                <span className="block mt-3 mb-1 font-semibold text-foreground">
                  {'common.highestResponsibilityYouDescribed'}
                </span>
                {interpretation.responsibilityLabel}
              </p>
            </article>
          </div>
          {proReflection && <ProReflection reflection={proReflection} />}
          {interpretation.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4">
              <span className="mr-1 text-xs font-semibold uppercase tracking-[.13em] text-muted-foreground">
                {'common.interestedIn'}
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
              {'common.useThisProfileToChooseAProjectRoleLearning'}
              {proReflection &&
                'common.proIsAPilotEditionItsAdditionalScenariosAnd'}
            </p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t('result.version', {
              version: currentVersion(proReflection ? 'pro' : 'standard'),
            })}
          </p>
        </section>
      }
    </LocalizedContent>
  );
}

function ProReflection({
  reflection,
}: {
  reflection: ReturnType<typeof interpretPro>;
}) {
  const { t } = useLanguage();
  return (
    <LocalizedContent>
      {
        <div className="mt-6 grid gap-6">
          <article className="result-panel">
            <div className="panel-eyebrow">{'common.proTeamDecisions'}</div>
            <h2 className="mt-1 text-2xl font-semibold">
              {'common.howYouApproachProjectSituations'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {'pro.feedback.intro'}
            </p>
            <div className="pro-reflection-grid mt-6">
              {reflection.scenariosByArea.map((group) => (
                <div className="insight-tile" key={group.area}>
                  <h3 className="font-semibold">{group.label}</h3>
                  {group.reflections.map((item) => (
                    <div key={item.id} className="pro-scenario-feedback">
                      <p className="text-sm font-medium">{item.prompt}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">
                          {'pro.choice.label'}
                        </span>
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
            <div className="panel-eyebrow">{'common.proPracticeEvidence'}</div>
            <h2 className="mt-1 text-2xl font-semibold">
              {'common.yourExperienceInSpecificTasks'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {'common.twoPracticalReflectionsPerToolkitAreaHelpYouCompare'}
            </p>
            <div className="pro-reflection-grid mt-6">
              {reflection.evidence.map((item) => (
                <div key={item.area} className="insight-tile">
                  <h3 className="font-semibold">{item.label}</h3>
                  <p className="mt-2 text-sm leading-6">{item.summary}</p>
                  {item.answered === item.total && (
                    <p className="mt-2 text-sm">
                      {t('result.evidence.participation', {
                        count: item.experienced,
                        total: item.total,
                      })}
                    </p>
                  )}
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
      }
    </LocalizedContent>
  );
}
