import { useState, useRef, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { adaptiveQuestions } from '../data/adaptiveQuestions'
import { shuffleArray } from '../utils/researchData'

const TOTAL_QUESTIONS = 6
const CATEGORIES = ['claim', 'misinformation', 'source', 'evidence']

const CATEGORY_LABELS = {
  claim:          'تقييم الادعاءات',
  misinformation: 'اكتشاف التضليل',
  source:         'تقييم المصدر',
  evidence:       'التحقق من الأدلة',
}

const DIFF_ORDER = ['easy', 'medium', 'hard']

const DIFF_LABELS = {
  easy:   'سهل',
  medium: 'متوسط',
  hard:   'متقدم',
}

// Starting difficulty mirrors the user's assessed level
function getStartDifficulty(level) {
  if (level === 'متقدم') return 'hard'
  if (level === 'متوسط') return 'medium'
  return 'easy'
}

// Pick an unasked question for the given category + difficulty.
// Falls back to same category any difficulty, then any unasked question.
function selectQuestion(category, difficulty, askedIds) {
  const pool = adaptiveQuestions.filter((q) => !askedIds.includes(q.id))
  return (
    pool.find((q) => q.category === category && q.difficulty === difficulty) ||
    pool.find((q) => q.category === category) ||
    pool[0] ||
    null
  )
}

// Difficulty adjustment: correct → harder, incorrect → easier
function computeNextDifficulty(wasCorrect, currentDifficulty) {
  const idx = DIFF_ORDER.indexOf(currentDifficulty)
  if (wasCorrect) {
    return idx < DIFF_ORDER.length - 1
      ? { nextDifficulty: DIFF_ORDER[idx + 1], diffMsg: 'أحسنتِ! ننتقل إلى سؤال أصعب.' }
      : { nextDifficulty: currentDifficulty, diffMsg: null }
  } else {
    return idx > 0
      ? { nextDifficulty: DIFF_ORDER[idx - 1], diffMsg: 'سنجرب سؤالًا أيسر قليلًا.' }
      : { nextDifficulty: currentDifficulty, diffMsg: null }
  }
}

// Build a TOTAL_QUESTIONS-slot category schedule that guarantees every weak category
// appears at least once. Weak categories are sorted by mistake count (most mistakes first)
// and cycled to fill all slots. Falls back to all four categories if no weak skills exist.
function buildCategorySchedule(mistakeCounts) {
  const weak = [...CATEGORIES]
    .filter((c) => (mistakeCounts[c] || 0) > 0)
    .sort((a, b) => (mistakeCounts[b] || 0) - (mistakeCounts[a] || 0))
  const base = weak.length > 0 ? weak : CATEGORIES
  const schedule = []
  let i = 0
  while (schedule.length < TOTAL_QUESTIONS) {
    schedule.push(base[i % base.length])
    i++
  }
  return schedule
}

// Single source of truth: build final results from the raw answer history.
function buildFinalResults(answers) {
  const totalQuestions = answers.length
  const totalCorrect   = answers.filter((a) => a.isCorrect).length
  const pct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  const byCategory = {}
  for (const cat of CATEGORIES) {
    const catAnswers = answers.filter((a) => a.category === cat)
    const catTotal   = catAnswers.length
    if (catTotal === 0) continue
    const catCorrect = catAnswers.filter((a) => a.isCorrect).length
    byCategory[cat] = {
      label:   CATEGORY_LABELS[cat],
      total:   catTotal,
      correct: Math.min(catCorrect, catTotal),
    }
  }

  return { totalQuestions, totalCorrect, pct, byCategory, responses: answers }
}

// ── Saved state validation ────────────────────────────────────────────────────
// Returns true only when every field needed for safe restoration is present and typed correctly.

function isValidAdaptiveState(s) {
  if (!s || typeof s !== 'object') return false
  if (!Array.isArray(s.categorySchedule) || s.categorySchedule.length !== TOTAL_QUESTIONS) return false
  if (!s.shuffledOptionsMap || typeof s.shuffledOptionsMap !== 'object') return false
  if (!Array.isArray(s.answers)) return false
  if (!Array.isArray(s.askedIds)) return false
  if (typeof s.questionNum !== 'number' || s.questionNum < 1 || s.questionNum > TOTAL_QUESTIONS) return false
  if (!DIFF_ORDER.includes(s.currentDifficulty)) return false
  if (typeof s.currentQuestionId !== 'string') return false
  if (!adaptiveQuestions.some((q) => q.id === s.currentQuestionId)) return false
  return true
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdaptiveChallenges({
  level,
  mistakeCounts,
  onComplete,
  onBack,
  onProceedToFinal,
  savedAdaptiveState,
  onSaveProgress,
}) {
  // Determine once at mount whether we are restoring a valid saved challenge
  const restoring = isValidAdaptiveState(savedAdaptiveState)

  // ── State initialisation (from saved state when restoring, fresh otherwise) ──

  // Pre-planned category sequence — must be identical to the original run when restoring
  const categorySchedule = useRef(
    restoring ? savedAdaptiveState.categorySchedule : buildCategorySchedule(mistakeCounts)
  ).current

  // Shuffled option order — use saved map to keep displayed options identical after refresh
  const [shuffledOptionsMap] = useState(() => {
    if (restoring) return savedAdaptiveState.shuffledOptionsMap
    const map = {}
    for (const q of adaptiveQuestions) {
      map[q.id] = shuffleArray(q.options)
    }
    return map
  })

  const [currentDifficulty, setDifficulty] = useState(
    restoring ? savedAdaptiveState.currentDifficulty : getStartDifficulty(level)
  )
  const [askedIds, setAskedIds]       = useState(restoring ? savedAdaptiveState.askedIds   : [])
  const [questionNum, setQuestionNum] = useState(restoring ? savedAdaptiveState.questionNum : 1)
  const [phase, setPhase]             = useState(restoring ? savedAdaptiveState.phase       : 'question')

  // "submitted" state: non-null submittedAnswer means the question was submitted and
  // we are waiting for the participant to click "next".
  const isRestoredSubmitted = restoring && savedAdaptiveState.submittedAnswer != null
  const [selectedAnswer, setSelected] = useState(isRestoredSubmitted ? savedAdaptiveState.submittedAnswer : null)
  const [submitted, setSubmitted]     = useState(isRestoredSubmitted)
  const [adaptationNote, setNote]     = useState(null) // UI-only; acceptable to lose on refresh

  // Canonical answer history
  const answersRef = useRef(restoring ? savedAdaptiveState.answers : [])

  // Current question — resolved by ID lookup when restoring to guarantee the exact same question
  const currentQRef = useRef(null)
  if (currentQRef.current === null) {
    currentQRef.current = restoring
      ? (adaptiveQuestions.find((q) => q.id === savedAdaptiveState.currentQuestionId) ??
         selectQuestion(categorySchedule[0], getStartDifficulty(level), []))
      : selectQuestion(categorySchedule[0], getStartDifficulty(level), [])
  }

  // Pre-computed next state stored between submit and "next" click.
  // When restoring from "submitted" state, it is recomputed deterministically:
  // selectQuestion is pure and deterministic over the same fixed question bank.
  const pendingRef = useRef(null)
  if (isRestoredSubmitted && pendingRef.current === null && currentQRef.current) {
    const cq = currentQRef.current
    const wasCorrect = savedAdaptiveState.submittedAnswer === cq.correctAnswer
    const { nextDifficulty, diffMsg } = computeNextDifficulty(wasCorrect, savedAdaptiveState.currentDifficulty)
    const newAskedIds = savedAdaptiveState.askedIds.includes(cq.id)
      ? savedAdaptiveState.askedIds
      : [...savedAdaptiveState.askedIds, cq.id]
    const nextQNum     = savedAdaptiveState.questionNum + 1
    const nextCategory = nextQNum <= TOTAL_QUESTIONS ? categorySchedule[nextQNum - 1] : null
    const nextQ        = savedAdaptiveState.questionNum < TOTAL_QUESTIONS
      ? selectQuestion(nextCategory, nextDifficulty, newAskedIds)
      : null
    pendingRef.current = { nextQ, nextDifficulty, newAskedIds, note: diffMsg }
  }

  // For fresh challenges: persist the initial question and shuffled options immediately
  // so that a refresh before any answer restores the exact same question (test case 1).
  useEffect(() => {
    if (!restoring && currentQRef.current && onSaveProgress) {
      onSaveProgress({
        answers:           [],
        currentQuestionId: currentQRef.current.id,
        currentDifficulty: getStartDifficulty(level),
        askedIds:          [],
        questionNum:       1,
        submittedAnswer:   null,
        categorySchedule,
        shuffledOptionsMap,
        phase:             'question',
      })
    }
  // Intentional: run only once on mount. savedAdaptiveState/restoring are captured by closure.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Completion guard ──────────────────────────────────────────────────────────

  const currentQ = currentQRef.current

  if (!currentQ || phase === 'completed') {
    const finalResults = buildFinalResults(answersRef.current)
    if (phase !== 'completed') setPhase('completed') // safety
    return (
      <CompletionScreen
        results={finalResults}
        onBack={() => onComplete(finalResults)}
        onProceedToFinal={() => onProceedToFinal(finalResults)}
      />
    )
  }

  // currentQ is guaranteed non-null below this line
  const currentCategory = currentQ.category
  const isCorrect       = submitted && selectedAnswer === currentQ.correctAnswer
  const progressPct     = ((questionNum - 1) / TOTAL_QUESTIONS) * 100

  function optionClass(option) {
    if (!submitted) return `option-btn${selectedAnswer === option ? ' option-selected' : ''}`
    if (option === currentQ.correctAnswer) return 'option-btn option-correct'
    if (option === selectedAnswer)         return 'option-btn option-wrong-selected'
    return 'option-btn option-submitted-neutral'
  }

  function handleSubmit() {
    const wasCorrect = selectedAnswer === currentQ.correctAnswer

    // Full answer record — single source of truth for all result calculations
    const entry = {
      questionId:           currentQ.id,
      category:             currentQ.category,
      difficulty:           currentQ.difficulty,
      selectedAnswer,
      correctAnswer:        currentQ.correctAnswer,
      isCorrect:            wasCorrect,
      displayedOptionOrder: shuffledOptionsMap[currentQ.id],
    }
    // Mutate ref synchronously so it is always current regardless of React batching
    answersRef.current = [...answersRef.current, entry]

    const newAskedIds = [...askedIds, currentQ.id]
    const { nextDifficulty, diffMsg } = computeNextDifficulty(wasCorrect, currentDifficulty)

    // Next category comes from the pre-planned schedule — guarantees weak coverage
    const nextQNum     = questionNum + 1
    const nextCategory = nextQNum <= TOTAL_QUESTIONS ? categorySchedule[nextQNum - 1] : null
    const nextQ        = questionNum < TOTAL_QUESTIONS
      ? selectQuestion(nextCategory, nextDifficulty, newAskedIds)
      : null

    pendingRef.current = {
      nextQ,
      nextDifficulty,
      newAskedIds,
      note: diffMsg,
    }

    // Persist the submitted state: a refresh will restore the feedback card and the
    // answer that was submitted, without re-asking the question.
    if (onSaveProgress) {
      onSaveProgress({
        answers:           answersRef.current,
        currentQuestionId: currentQ.id,
        currentDifficulty,
        askedIds,            // does NOT include currentQ.id yet — mirrors exact state
        questionNum,
        submittedAnswer:   selectedAnswer,
        categorySchedule,
        shuffledOptionsMap,
        phase:             'question',
      })
    }

    setSubmitted(true)
    setNote(diffMsg)
  }

  function handleNext() {
    const p = pendingRef.current
    if (!p) return

    if (questionNum >= TOTAL_QUESTIONS) {
      setPhase('completed')
      return
      // Completion path: adaptiveInProgress is cleared by App.jsx via onComplete/onProceedToFinal
    }

    currentQRef.current = p.nextQ
    setDifficulty(p.nextDifficulty)
    setAskedIds(p.newAskedIds)
    setQuestionNum((n) => n + 1)
    setSelected(null)
    setSubmitted(false)
    setNote(null)
    pendingRef.current = null

    // Persist the next question's initial state so a refresh resumes there, not at question 1.
    if (onSaveProgress) {
      onSaveProgress({
        answers:           answersRef.current,
        currentQuestionId: p.nextQ.id,
        currentDifficulty: p.nextDifficulty,
        askedIds:          p.newAskedIds,
        questionNum:       questionNum + 1,
        submittedAnswer:   null,
        categorySchedule,
        shuffledOptionsMap,
        phase:             'question',
      })
    }
  }

  return (
    <div className="page">
      <Navbar />

      {/* ── Header ─────────────────────────────────── */}
      <div className="module-header">
        <div className="assessment-container">
          <button className="back-btn" onClick={onBack}>العودة إلى مساري</button>

          <p className="module-meta-label">التحديات التكيفية</p>

          <div className="module-title-row">
            <h1 className="module-main-title">تحدي مهارات التغذية</h1>
            <span className="module-tag">تكيفي</span>
          </div>

          {/* Progress bar */}
          <div className="progress-track" style={{ marginTop: '1rem' }}>
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.4rem' }}>
            السؤال {questionNum} من {TOTAL_QUESTIONS}
          </p>

          {/* Current category + difficulty badges */}
          <div className="challenge-meta-row">
            <span className="category-badge">{CATEGORY_LABELS[currentCategory]}</span>
            <span className={`difficulty-badge difficulty-badge--${currentQ.difficulty}`}>
              {DIFF_LABELS[currentQ.difficulty]}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="module-body">
        <div className="assessment-container">

          {/* Adaptation note (shown after submit) */}
          {submitted && adaptationNote && (
            <div className="adaptation-note">{adaptationNote}</div>
          )}

          {/* Social post card */}
          <div className="post-card">
            <div className="post-header">
              <div className="post-avatar">🧑</div>
              <div className="post-profile">
                <span className="post-account">{currentQ.account}</span>
                <span className="post-account-label">{currentQ.accountLabel}</span>
              </div>
            </div>
            <p className="post-text">{currentQ.post}</p>
          </div>

          {/* Question */}
          <p className="question-prompt">{currentQ.question}</p>

          {/* Options — displayed in session-stable shuffled order */}
          <div className="options-list">
            {shuffledOptionsMap[currentQ.id].map((option) => (
              <button
                key={option}
                className={optionClass(option)}
                onClick={() => !submitted && setSelected(option)}
              >
                <span className="option-indicator" />
                {option}
              </button>
            ))}
          </div>

          {/* Actions */}
          {!submitted ? (
            <div className="step-action-row">
              <button
                className="cta-btn"
                disabled={!selectedAnswer}
                onClick={handleSubmit}
              >
                تحققي من الإجابة
              </button>
            </div>
          ) : (
            <>
              <div className={`feedback-card ${isCorrect ? 'feedback-card--correct' : 'feedback-card--incorrect'}`}>
                <p className="feedback-result">
                  {isCorrect ? 'إجابة صحيحة ✓' : 'ليست الإجابة الأفضل'}
                </p>
                <p className="feedback-text">
                  {isCorrect ? currentQ.correctFeedback : currentQ.incorrectFeedback}
                </p>
              </div>

              <div className="step-action-row">
                <button className="cta-btn" onClick={handleNext}>
                  {questionNum < TOTAL_QUESTIONS ? 'السؤال التالي' : 'عرض النتائج'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Completion screen ─────────────────────────────────────────────────────────

function CompletionScreen({ results, onBack, onProceedToFinal }) {
  const { totalQuestions, totalCorrect, pct, byCategory } = results

  return (
    <div className="page">
      <Navbar />

      <div className="pl-header">
        <div className="assessment-container">
          <h1 className="pl-title">انتهى التحدي!</h1>
          <p className="pl-subtitle">إليكِ ملخص أدائك في التحديات التكيفية.</p>
        </div>
      </div>

      <div className="pl-body">
        <div className="assessment-container">

          <div className="challenge-summary">
            {/* Overall score card */}
            <div className="summary-score-card">
              <p className="summary-score-label">مجموع إجاباتك الصحيحة</p>
              {/* dir="ltr" prevents RTL bidi from swapping the numbers visually */}
              <p className="summary-score-display" dir="ltr">
                <span className="summary-score-num">{totalCorrect}</span>
                <span className="summary-score-denom"> / {totalQuestions}</span>
              </p>
              <p className="summary-score-pct">{pct}%</p>
            </div>

            {/* Per-category breakdown — only categories that appeared */}
            <div className="summary-cat-section">
              <h3 className="pl-section-title">الأداء حسب المهارة</h3>
              <div className="summary-cat-grid">
                {CATEGORIES.map((cat) => {
                  const d = byCategory[cat]
                  if (!d) return null
                  return (
                    <div key={cat} className="summary-cat-row">
                      <span className="summary-cat-label">{d.label}</span>
                      {/* dir="ltr" ensures correct / total never reverses visually */}
                      <span className="summary-cat-score" dir="ltr">
                        {d.correct} / {d.total}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="summary-actions">
              <button className="cta-btn" onClick={onProceedToFinal}>
                الانتقال إلى التقييم النهائي
              </button>
              <button
                className="cta-btn"
                style={{ background: 'transparent', border: '1.5px solid #3d78c8', color: '#3d78c8' }}
                onClick={onBack}
              >
                العودة إلى مساري
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
