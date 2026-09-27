import Navbar from '../components/Navbar'
import { loadResearchSession } from '../utils/researchData'

const SKILL_LABELS = {
  claim:         'تقييم الادعاءات الغذائية',
  misinformation: 'اكتشاف علامات التضليل',
  source:        'تقييم مصدر المعلومة',
  evidence:      'التحقق من الأدلة العلمية',
}

const SKILLS = ['claim', 'misinformation', 'source', 'evidence']

const LEVEL_MOD = {
  مبتدئ:  'beginner',
  متوسط:  'intermediate',
  متقدم:  'advanced',
}

function formatImprovement(value) {
  if (value > 0)  return `+${Math.round(value)} نقطة مئوية`
  if (value < 0)  return `${Math.round(value)} نقطة مئوية`
  return 'لا يوجد تغيير'
}

function improvementClass(value) {
  if (value > 0)  return 'improvement-banner improvement-banner--positive'
  if (value < 0)  return 'improvement-banner improvement-banner--negative'
  return 'improvement-banner improvement-banner--neutral'
}

export default function FinalResults({ researchSession: sessionProp }) {
  // Fallback: load from localStorage if state was lost (e.g. on refresh)
  const session = sessionProp ?? loadResearchSession()

  if (!session) {
    return (
      <div className="page">
        <Navbar />
        <div className="assessment-body" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ color: '#8097b0', fontSize: '1rem' }}>
            لا توجد بيانات جلسة لعرضها. يرجى إكمال التقييم أولًا.
          </p>
        </div>
      </div>
    )
  }

  const { participantId, initialAssessment, finalAssessment, improvement } = session
  const initialLevel = initialAssessment.level

  const overallPts = improvement.overallPercentagePoints

  return (
    <div className="page">
      <Navbar />

      {/* ── Header band ────────────────────────────────────────────────── */}
      <div className="pl-header">
        <div className="assessment-container">
          <h1 className="pl-title">نتائجك النهائية</h1>
          <p className="pl-subtitle">
            قارني بين أدائك قبل وبعد المسار التعليمي.
          </p>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="pl-body">
        <div className="assessment-container">

          {/* Before / After comparison cards */}
          <div className="comparison-grid">

            <div className="comparison-card comparison-card--before">
              <span className="comparison-card-label">قبل التعلم</span>
              <span className="comparison-pct">{Math.round(initialAssessment.percentage)}%</span>
              <span className={`level-pill level-pill--${LEVEL_MOD[initialLevel] ?? 'beginner'}`}>
                {initialLevel}
              </span>
              <span className="comparison-card-sub">
                {initialAssessment.score} من {initialAssessment.total} إجابات صحيحة
              </span>
            </div>

            <div className="comparison-card comparison-card--after">
              <span className="comparison-card-label">بعد التعلم</span>
              <span className="comparison-pct comparison-pct--after">{Math.round(finalAssessment.percentage)}%</span>
              <span className="comparison-card-sub comparison-card-sub--after">
                {finalAssessment.score} من {finalAssessment.total} إجابات صحيحة
              </span>
            </div>

          </div>

          {/* Improvement banner */}
          <div className={improvementClass(overallPts)}>
            <span className="improvement-label">مقدار التحسن الكلي</span>
            <span className="improvement-value">{formatImprovement(overallPts)}</span>
          </div>

          {/* Skill-by-skill comparison */}
          <section className="pl-section">
            <h2 className="pl-section-title">تطور مهاراتك</h2>
            <div className="skills-comparison-list">
              {SKILLS.map((s) => {
                const before = Math.round(initialAssessment.skillResults[s]?.percentage ?? 0)
                const after  = Math.round(finalAssessment.skillResults[s]?.percentage ?? 0)
                const delta  = after - before
                return (
                  <div key={s} className="skill-cmp-row">
                    <span className="skill-cmp-name">{SKILL_LABELS[s]}</span>
                    <div className="skill-cmp-bars">
                      <div className="skill-bar-item">
                        <span className="skill-bar-badge skill-bar-badge--before">قبل</span>
                        <div className="skill-bar-track">
                          <div
                            className="skill-bar-fill skill-bar-fill--before"
                            style={{ width: `${before}%` }}
                          />
                        </div>
                        <span className="skill-bar-pct">{before}%</span>
                      </div>
                      <div className="skill-bar-item">
                        <span className="skill-bar-badge skill-bar-badge--after">بعد</span>
                        <div className="skill-bar-track">
                          <div
                            className="skill-bar-fill skill-bar-fill--after"
                            style={{ width: `${after}%` }}
                          />
                        </div>
                        <span className="skill-bar-pct">{after}%</span>
                        {delta !== 0 && (
                          <span className={`skill-delta ${delta > 0 ? 'skill-delta--pos' : 'skill-delta--neg'}`}>
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Anonymous session note */}
          <div className="info-box session-note">
            <p className="info-box-title">تم حفظ نتائجك</p>
            <p className="info-box-text">
              تم تسجيل بياناتك البحثية بشكل مجهول. رقم الجلسة:{' '}
              <span className="participant-id">{participantId}</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
