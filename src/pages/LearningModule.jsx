import { useState } from 'react'
import Navbar from '../components/Navbar'
import { modulesData } from '../data/modules'
import { shuffleArray } from '../utils/researchData'

const STEPS = ['تعلمي', 'شاهدي مثالًا', 'طبقي']

export default function LearningModule({ moduleKey, mistakeCounts, onComplete, onBack }) {
  const [step, setStep]                 = useState(0)
  const [selectedAnswer, setSelected]   = useState(null)
  const [submitted, setSubmitted]       = useState(false)

  const mod           = modulesData[moduleKey]
  const [shuffledOptions] = useState(() => shuffleArray(mod.options))
  const isRecommended = mistakeCounts[moduleKey] > 0
  const isCorrect     = submitted && selectedAnswer === mod.correctAnswer

  function optionClass(option) {
    if (!submitted) {
      return `option-btn${selectedAnswer === option ? ' option-selected' : ''}`
    }
    if (option === mod.correctAnswer)    return 'option-btn option-correct'
    if (option === selectedAnswer)       return 'option-btn option-wrong-selected'
    return 'option-btn option-submitted-neutral'
  }

  return (
    <div className="page">
      <Navbar />

      {/* ── Module header ─────────────────────────── */}
      <div className="module-header">
        <div className="assessment-container">

          <button className="back-btn" onClick={onBack}>
            العودة إلى مساري
          </button>

          <p className="module-meta-label">مهارات التعلم</p>

          <div className="module-title-row">
            <h1 className="module-main-title">{mod.title}</h1>
            <span className="module-tag">درس قصير</span>
          </div>

          <div className="module-steps">
            {STEPS.map((label, i) => (
              <span
                key={i}
                className={`step-chip${
                  i === step ? ' step-chip--active' :
                  i < step   ? ' step-chip--done'   :
                               ' step-chip--pending'
                }`}
              >
                {i < step ? `✓ ${label}` : `${i + 1}. ${label}`}
              </span>
            ))}
          </div>

          {isRecommended && (
            <div className="recommended-notice">
              تم اختيار هذا الدرس لك بناءً على نتائج تقييمك الأولي.
            </div>
          )}

        </div>
      </div>

      {/* ── Module body ───────────────────────────── */}
      <div className="module-body">
        <div className="assessment-container">

          {/* ── Step 0: Learn ──────────────────────── */}
          {step === 0 && (
            <div className="module-step-content">
              <div className="learn-card">
                <p className="learn-intro">{mod.intro}</p>
              </div>

              <div className="tip-box">
                <span className="tip-icon">💡</span>
                <p className="tip-text">{mod.tip}</p>
              </div>

              <div className="step-action-row">
                <button className="cta-btn" onClick={() => setStep(1)}>
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Example ────────────────────── */}
          {step === 1 && (
            <div className="module-step-content">
              <p className="step-eyebrow">مثال من وسائل التواصل</p>

              <div className="post-card">
                <div className="post-header">
                  <div className="post-avatar">🧑</div>
                  <div className="post-profile">
                    <span className="post-account">{mod.exampleAccount}</span>
                    <span className="post-account-label">{mod.exampleAccountLabel}</span>
                  </div>
                </div>
                <p className="post-text">{mod.examplePost}</p>
              </div>

              <div className="example-note">
                <span className="example-note-icon">🔎</span>
                <p>{mod.exampleNote}</p>
              </div>

              <div className="step-action-row">
                <button className="cta-btn" onClick={() => setStep(2)}>
                  جربي بنفسك
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Practice ───────────────────── */}
          {step === 2 && (
            <div className="module-step-content">
              <p className="step-eyebrow">تطبيقي</p>

              <div className="post-card">
                <div className="post-header">
                  <div className="post-avatar">🧑</div>
                  <div className="post-profile">
                    <span className="post-account">{mod.practiceAccount}</span>
                    <span className="post-account-label">{mod.practiceAccountLabel}</span>
                  </div>
                </div>
                <p className="post-text">{mod.practicePost}</p>
              </div>

              <p className="question-prompt">{mod.question}</p>

              <div className="options-list">
                {shuffledOptions.map((option) => (
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

              {!submitted ? (
                <div className="step-action-row">
                  <button
                    className="cta-btn"
                    disabled={!selectedAnswer}
                    onClick={() => setSubmitted(true)}
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
                      {isCorrect ? mod.correctFeedback : mod.incorrectFeedback}
                    </p>
                  </div>

                  <div className="step-action-row">
                    <button className="cta-btn" onClick={() => onComplete(moduleKey)}>
                      إكمال الدرس
                    </button>
                  </div>
                </>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
