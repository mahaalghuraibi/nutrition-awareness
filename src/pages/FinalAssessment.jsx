import { useState } from 'react'
import Navbar from '../components/Navbar'
import AssessmentQuestion from '../components/AssessmentQuestion'
import { finalQuestions } from '../data/finalQuestions'
import { shuffleArray } from '../utils/researchData'

const TOTAL = finalQuestions.length   // 8
const SKILLS = ['claim', 'misinformation', 'source', 'evidence']

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

export default function FinalAssessment({ onComplete }) {
  const [currentIdx, setCurrentIdx]   = useState(0)
  const [selectedAnswer, setSelected] = useState(null)
  const [answers, setAnswers]         = useState([])
  const [phase, setPhase]             = useState('assessment') // 'assessment' | 'done'

  const [shuffledOptionsMap] = useState(() => {
    const map = {}
    for (const q of finalQuestions) {
      map[q.id] = shuffleArray(q.options)
    }
    return map
  })

  const question  = finalQuestions[currentIdx]
  const isLast    = currentIdx === TOTAL - 1
  const progress  = ((currentIdx + 1) / TOTAL) * 100

  function handleNext() {
    const isCorrect  = selectedAnswer === question.correctAnswer
    const entry = {
      questionId:           question.id,
      category:             question.category,
      selectedAnswer,
      correctAnswer:        question.correctAnswer,
      isCorrect,
      displayedOptionOrder: shuffledOptionsMap[question.id],
    }
    const newAnswers = [...answers, entry]

    if (isLast) {
      setAnswers(newAnswers)
      setPhase('done')
    } else {
      setAnswers(newAnswers)
      setCurrentIdx(currentIdx + 1)
      setSelected(null)
    }
  }

  // ── Completion screen ─────────────────────────────────────────────────────
  if (phase === 'done') {
    const score        = answers.filter((a) => a.isCorrect).length
    const percentage   = Math.round((score / TOTAL) * 100)
    const skillResults = buildSkillResults(answers)

    function handleViewResults() {
      onComplete({
        score,
        total: TOTAL,
        percentage,
        responses: answers,
        skillResults,
      })
    }

    return (
      <div className="page">
        <Navbar />

        <div className="assessment-header">
          <div className="assessment-container">
            <p className="completion-badge">تم إكمال التقييم النهائي ✅</p>
          </div>
        </div>

        <div className="assessment-body">
          <div className="assessment-container">
            <div className="result-card">
              <p className="result-label">إجاباتك</p>

              <p className="result-score" style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
                {score} من {TOTAL} إجابات صحيحة
              </p>

              <p className="result-message">
                تم تسجيل إجاباتك. انقري على الزر أدناه لعرض نتائجك النهائية ومقارنة أدائك قبل وبعد المسار التعليمي.
              </p>

              <button className="cta-btn result-cta" onClick={handleViewResults}>
                عرض النتائج النهائية
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Assessment screen ─────────────────────────────────────────────────────
  return (
    <div className="page">
      <Navbar />

      <div className="assessment-header">
        <div className="assessment-container">
          <h1 className="assessment-title">التقييم النهائي</h1>
          <p className="assessment-subtitle">
            أجيبي عن الأسئلة التالية لقياس تطور مهاراتك بعد إكمال المسار التعليمي.
          </p>
          <p className="progress-label">
            السؤال {currentIdx + 1} من {TOTAL}
          </p>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

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
              {isLast ? 'إنهاء التقييم' : 'السؤال التالي →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
