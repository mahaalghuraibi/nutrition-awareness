import { useState } from 'react'
import Navbar from '../components/Navbar'
import AssessmentQuestion from '../components/AssessmentQuestion'
import { initialQuestions } from '../data/questions'
import { shuffleArray } from '../utils/researchData'

const TOTAL  = initialQuestions.length
const SKILLS = ['claim', 'misinformation', 'source', 'evidence']

function calcLevel(score) {
  if (score <= 3) return 'مبتدئ'
  if (score <= 6) return 'متوسط'
  return 'متقدم'
}

const LEVEL_MOD = {
  مبتدئ: 'beginner',
  متوسط: 'intermediate',
  متقدم: 'advanced',
}

function buildSkillResults(answers) {
  const skillResults = {}
  for (const s of SKILLS) {
    const catAnswers = answers.filter((a) => a.category === s)
    const total   = catAnswers.length
    const correct = catAnswers.filter((a) => a.isCorrect).length
    skillResults[s] = {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    }
  }
  return skillResults
}

export default function InitialAssessment({ onComplete }) {
  const [currentIdx, setCurrentIdx]     = useState(0)
  const [selectedAnswer, setSelected]   = useState(null)
  const [answers, setAnswers]           = useState([])
  const [phase, setPhase]               = useState('assessment') // 'assessment' | 'result'
  const [score, setScore]               = useState(0)
  const [mistakeCounts, setMistakes]    = useState({
    claim: 0,
    misinformation: 0,
    source: 0,
    evidence: 0,
  })

  const [shuffledOptionsMap] = useState(() => {
    const map = {}
    for (const q of initialQuestions) {
      map[q.id] = shuffleArray(q.options)
    }
    return map
  })

  const question  = initialQuestions[currentIdx]
  const isLast    = currentIdx === TOTAL - 1
  const progress  = ((currentIdx + 1) / TOTAL) * 100

  function handleNext() {
    const isCorrect = selectedAnswer === question.correctAnswer
    const entry = {
      questionId:           question.id,
      category:             question.category,
      selectedAnswer,
      correctAnswer:        question.correctAnswer,
      isCorrect,
      displayedOptionOrder: shuffledOptionsMap[question.id],
    }
    const newAnswers  = [...answers, entry]
    const newMistakes = { ...mistakeCounts }
    if (!isCorrect) newMistakes[question.category] += 1

    if (isLast) {
      const finalScore = newAnswers.filter((a) => a.isCorrect).length
      setAnswers(newAnswers)
      setMistakes(newMistakes)
      setScore(finalScore)
      setPhase('result')
    } else {
      setAnswers(newAnswers)
      setMistakes(newMistakes)
      setCurrentIdx(currentIdx + 1)
      setSelected(null)
    }
  }

  /* ── Result screen ─────────────────────────────── */
  if (phase === 'result') {
    const level = calcLevel(score)
    return (
      <div className="page">
        <Navbar />

        <div className="assessment-header">
          <div className="assessment-container">
            <p className="completion-badge">تم إكمال التقييم الأولي ✅</p>
          </div>
        </div>

        <div className="assessment-body">
          <div className="assessment-container">
            <div className="result-card">
              <p className="result-label">مستواك الحالي</p>

              <div className={`level-badge level-badge--${LEVEL_MOD[level]}`}>
                {level}
              </div>

              <p className="result-score">
                {score} من {TOTAL} إجابات صحيحة
              </p>

              <p className="result-message">
                سيتم تخصيص الأنشطة القادمة بناءً على أدائك في هذا التقييم.
              </p>

              <button
                className="cta-btn result-cta"
                onClick={() => {
                  const initialPercentage = Math.round((score / TOTAL) * 100)
                  const skillResults      = buildSkillResults(answers)
                  onComplete({
                    // existing fields — other pages depend on these
                    level,
                    score,
                    mistakeCounts,
                    // extended research fields
                    initialTotal:       TOTAL,
                    initialPercentage,
                    responses:          answers,
                    skillResults,
                  })
                }}
              >
                ابدئي التعلم
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Assessment screen ─────────────────────────── */
  return (
    <div className="page">
      <Navbar />

      {/* Header with progress */}
      <div className="assessment-header">
        <div className="assessment-container">
          <h1 className="assessment-title">التقييم الأولي</h1>
          <p className="assessment-subtitle">
            أجيبي عن الأسئلة التالية لتحديد مستواك الحالي في تقييم المعلومات الغذائية الرقمية.
          </p>
          <p className="progress-label">
            السؤال {currentIdx + 1} من {TOTAL}
          </p>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Question + next button */}
      <div className="assessment-body">
        <div className="assessment-container">
          <AssessmentQuestion
            question={{ ...question, options: shuffledOptionsMap[question.id] }}
            selectedAnswer={selectedAnswer}
            onSelect={setSelected}
          />

          <div className="next-row">
            <button
              className="cta-btn"
              disabled={selectedAnswer === null}
              onClick={handleNext}
            >
              {isLast ? 'إنهاء التقييم' : 'التالي ←'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
