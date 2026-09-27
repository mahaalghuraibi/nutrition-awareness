import { useState } from 'react'
import HomePage             from './pages/HomePage'
import InitialAssessment    from './pages/InitialAssessment'
import PersonalizedLearning from './pages/PersonalizedLearning'
import LearningModule       from './pages/LearningModule'
import AdaptiveChallenges   from './pages/AdaptiveChallenges'
import FinalAssessment      from './pages/FinalAssessment'
import FinalResults         from './pages/FinalResults'
import {
  getOrCreateParticipantId,
  buildResearchSession,
  validateResearchSession,
  saveResearchSession,
  loadResearchSession,
  saveProgressSession,
  loadProgressSession,
} from './utils/researchData'
import './App.css'

const INITIAL_COMPLETED = {
  claim:          false,
  misinformation: false,
  source:         false,
  evidence:       false,
}

const NEEDS_ASSESSMENT = new Set(['learning', 'module', 'challenges', 'finalAssessment'])

// Compute all initial state from localStorage in one lazy call.
// Called exactly once by useState on first render.
function getInitialAppState() {
  const progress = loadProgressSession()

  if (!progress) {
    return {
      participantId:       getOrCreateParticipantId(),
      sessionStartedAt:    new Date().toISOString(),
      assessmentStartedAt: null,
      currentPage:         'home',
      assessmentResult:    null,
      completedModules:    { ...INITIAL_COMPLETED },
      adaptiveResults:     null,
      adaptiveInProgress:  null,
      researchSession:     null,
    }
  }

  if (NEEDS_ASSESSMENT.has(progress.currentPage) && !progress.assessmentResult) {
    console.warn('[App] Saved progress is inconsistent — starting fresh (preserving participantId)')
    return {
      participantId:       progress.participantId,
      sessionStartedAt:    new Date().toISOString(),
      assessmentStartedAt: null,
      currentPage:         'home',
      assessmentResult:    null,
      completedModules:    { ...INITIAL_COMPLETED },
      adaptiveResults:     null,
      adaptiveInProgress:  null,
      researchSession:     null,
    }
  }

  const currentPage     = progress.currentPage === 'module' ? 'learning' : progress.currentPage
  const researchSession = progress.studyCompleted === true ? loadResearchSession() : null

  return {
    participantId:       progress.participantId,
    sessionStartedAt:    progress.sessionStartedAt,
    assessmentStartedAt: progress.assessmentStartedAt   ?? null,
    currentPage,
    assessmentResult:    progress.assessmentResult       ?? null,
    completedModules:    progress.completedModules       ?? { ...INITIAL_COMPLETED },
    adaptiveResults:     progress.adaptiveResults        ?? null,
    adaptiveInProgress:  progress.adaptiveInProgress     ?? null,
    researchSession,
  }
}

export default function App() {
  const [init] = useState(getInitialAppState)

  const [currentPage, setCurrentPage]           = useState(init.currentPage)
  const [assessmentResult, setAssessmentResult] = useState(init.assessmentResult)
  const [currentModule, setCurrentModule]       = useState(null)
  const [completedModules, setCompleted]        = useState(init.completedModules)
  const [adaptiveResults, setAdaptiveResults]   = useState(init.adaptiveResults)
  const [adaptiveInProgress, setAdaptiveInProgress] = useState(init.adaptiveInProgress ?? null)
  const [researchSession, setResearchSession]   = useState(init.researchSession)

  const [participantId]    = useState(init.participantId)
  const [sessionStartedAt] = useState(init.sessionStartedAt)
  const [assessmentStartedAt, setAssessmentStartedAt] = useState(init.assessmentStartedAt)

  // ── Progress persistence ──────────────────────────────────────────────────
  // Reads current state from the render closure; pass overrides for values
  // whose setState has been called but not yet committed by React.

  function saveProgress(overrides = {}) {
    saveProgressSession({
      participantId,
      sessionStartedAt,
      assessmentStartedAt,
      currentPage,
      assessmentResult,
      completedModules,
      adaptiveResults,
      adaptiveInProgress,
      studyCompleted: false,
      ...overrides,
    })
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleStartAssessment() {
    const ts = new Date().toISOString()
    setAssessmentStartedAt(ts)
    setCurrentPage('assessment')
    saveProgress({ assessmentStartedAt: ts, currentPage: 'assessment' })
  }

  function handleAssessmentComplete(result) {
    setAssessmentResult(result)
    setCurrentPage('learning')
    saveProgress({ assessmentResult: result, currentPage: 'learning' })
  }

  function handleModuleStart(moduleKey) {
    setCurrentModule(moduleKey)
    setCurrentPage('module')
  }

  function handleModuleComplete(moduleKey) {
    const newCompleted = { ...completedModules, [moduleKey]: true }
    setCompleted(newCompleted)
    setCurrentPage('learning')
    saveProgress({ completedModules: newCompleted, currentPage: 'learning' })
  }

  function handleBackToLearning() {
    setCurrentPage('learning')
  }

  function handleChallengeStart() {
    setCurrentPage('challenges')
  }

  // Called by AdaptiveChallenges after each submit/next — persists in-progress adaptive state
  function handleSaveAdaptiveProgress(adaptiveState) {
    setAdaptiveInProgress(adaptiveState)
    saveProgress({ adaptiveInProgress: adaptiveState, currentPage: 'challenges' })
  }

  // Called via "العودة إلى مساري" on the adaptive completion screen
  function handleChallengeComplete(finalResults) {
    setAdaptiveResults(finalResults)
    setAdaptiveInProgress(null)
    setCurrentPage('learning')
    saveProgress({ adaptiveResults: finalResults, adaptiveInProgress: null, currentPage: 'learning' })
  }

  // Called via "الانتقال إلى التقييم النهائي"
  function handleProceedToFinal(adaptiveFinalResults) {
    setAdaptiveResults(adaptiveFinalResults)
    setAdaptiveInProgress(null)
    setCurrentPage('finalAssessment')
    saveProgress({ adaptiveResults: adaptiveFinalResults, adaptiveInProgress: null, currentPage: 'finalAssessment' })
  }

  function handleFinalAssessmentComplete(finalResult) {
    const session = buildResearchSession({
      participantId,
      sessionStartedAt,
      assessmentStartedAt,
      assessmentResult,
      completedModules,
      adaptiveResults,
      finalResult,
    })

    const errors = validateResearchSession(session)
    if (errors.length > 0) {
      console.warn('[researchData] Validation warnings:', errors)
    }

    saveResearchSession(session)
    saveProgress({ currentPage: 'finalResults', studyCompleted: true })

    setResearchSession(session)
    setCurrentPage('finalResults')
  }

  // ── Routing ───────────────────────────────────────────────────────────────

  if (currentPage === 'finalResults') {
    return <FinalResults researchSession={researchSession} />
  }

  if (currentPage === 'finalAssessment') {
    return <FinalAssessment onComplete={handleFinalAssessmentComplete} />
  }

  if (currentPage === 'challenges') {
    return (
      <AdaptiveChallenges
        level={assessmentResult.level}
        mistakeCounts={assessmentResult.mistakeCounts}
        onComplete={handleChallengeComplete}
        onBack={handleBackToLearning}
        onProceedToFinal={handleProceedToFinal}
        savedAdaptiveState={adaptiveInProgress}
        onSaveProgress={handleSaveAdaptiveProgress}
      />
    )
  }

  if (currentPage === 'module') {
    return (
      <LearningModule
        moduleKey={currentModule}
        mistakeCounts={assessmentResult.mistakeCounts}
        onComplete={handleModuleComplete}
        onBack={handleBackToLearning}
      />
    )
  }

  if (currentPage === 'learning') {
    return (
      <PersonalizedLearning
        result={assessmentResult}
        completedModules={completedModules}
        onModuleStart={handleModuleStart}
        onStartChallenge={handleChallengeStart}
      />
    )
  }

  if (currentPage === 'assessment') {
    return <InitialAssessment onComplete={handleAssessmentComplete} />
  }

  return <HomePage onStartAssessment={handleStartAssessment} />
}
