import Navbar from '../components/Navbar'

const SKILLS = [
  {
    key: 'claim',
    label: 'تقييم الادعاءات الغذائية',
    icon: '📋',
    desc: 'تعلمي كيف تميزين بين الحقيقة العلمية والادعاء الغذائي غير المدعوم.',
  },
  {
    key: 'misinformation',
    label: 'اكتشاف علامات التضليل',
    icon: '🚩',
    desc: 'تعرفي على الكلمات والوعود المبالغ فيها التي قد تشير إلى محتوى مضلل.',
  },
  {
    key: 'source',
    label: 'تقييم مصدر المعلومة',
    icon: '🔍',
    desc: 'تعلمي كيف تتحققين من هوية ناشر المعلومة ومدى موثوقيته.',
  },
  {
    key: 'evidence',
    label: 'التحقق من الأدلة العلمية',
    icon: '🔬',
    desc: 'تعلمي كيف تتأكدين من وجود دليل علمي موثوق خلف الادعاءات الغذائية.',
  },
]

const LEVEL_MOD = {
  مبتدئ: 'beginner',
  متوسط: 'intermediate',
  متقدم: 'advanced',
}

export default function PersonalizedLearning({ result, completedModules, onModuleStart, onStartChallenge }) {
  const { level, mistakeCounts } = result
  const weakSkills = SKILLS.filter((s) => mistakeCounts[s.key] > 0)
  const hasIncompleteRecommended = SKILLS.some((s) => mistakeCounts[s.key] > 0 && !completedModules[s.key])

  return (
    <div className="page">
      <Navbar />

      {/* ── Header band ────────────────────────────── */}
      <div className="pl-header">
        <div className="assessment-container">
          <h1 className="pl-title">مسارك التعليمي</h1>
          <p className="pl-subtitle">
            بناءً على نتائج تقييمك الأولي، تم تحديد المهارات التي تحتاجين إلى تطويرها.
          </p>
          <span className={`level-pill level-pill--${LEVEL_MOD[level]}`}>
            مستواك الحالي: {level}
          </span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="pl-body">
        <div className="assessment-container">

          {/* Skill analysis */}
          <section className="pl-section">
            <h2 className="pl-section-title">تحليل أدائك</h2>
            <div className="skills-list">
              {SKILLS.map((skill) => {
                const isWeak = mistakeCounts[skill.key] > 0
                return (
                  <div
                    key={skill.key}
                    className={`skill-row${isWeak ? ' skill-row--weak' : ''}`}
                  >
                    <span className="skill-name">{skill.label}</span>
                    {isWeak ? (
                      <span className="skill-tag skill-tag--weak">! يحتاج إلى تدريب</span>
                    ) : (
                      <span className="skill-tag skill-tag--good">✓ جيد</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Personalized message */}
          <div className="pl-message">
            {weakSkills.length === 0 ? (
              <p>
                أداؤك ممتاز في التقييم الأولي. سنقدم لك أنشطة أكثر تقدمًا لتطوير مهاراتك.
              </p>
            ) : (
              <>
                <p>بناءً على إجاباتك، سنركز أكثر على المهارات التي تحتاجين إلى تطويرها.</p>
                <p className="pl-recommendation">
                  {'نوصي بالتركيز على: '}
                  {weakSkills.map((s, i) => (
                    <span key={s.key}>
                      <strong>{s.label}</strong>
                      {i < weakSkills.length - 1 ? '، ' : ''}
                    </span>
                  ))}
                </p>
              </>
            )}
          </div>

          {/* Learning modules */}
          <section className="pl-section">
            <h2 className="pl-section-title">مهارات التعلم</h2>
            <div className="modules-grid">
              {SKILLS.map((skill) => {
                const recommended = mistakeCounts[skill.key] > 0
                const completed   = completedModules[skill.key]
                return (
                  <div
                    key={skill.key}
                    className={`module-card${recommended ? ' module-card--recommended' : ''}`}
                  >
                    {recommended && (
                      <span className="recommended-badge">موصى به لك</span>
                    )}
                    {completed && (
                      <span className="done-badge">تم ✓</span>
                    )}
                    <div className="module-icon">{skill.icon}</div>
                    <h3 className="module-title">{skill.label}</h3>
                    <p className="module-desc">{skill.desc}</p>
                    <button
                      className="module-btn"
                      onClick={() => onModuleStart(skill.key)}
                    >
                      {completed ? 'مراجعة' : 'ابدئي'}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Adaptive Challenges teaser */}
          <section className="pl-section">
            <h2 className="pl-section-title">التحديات التكيفية</h2>
            <div className="challenge-teaser-card">
              <p className="challenge-teaser-text">
                اختبري مهاراتك من خلال أسئلة تتكيف تلقائيًا مع مستواك وأدائك في كل سؤال.
              </p>
              {hasIncompleteRecommended && (
                <div className="challenge-warning">
                  يُنصح بإكمال الدروس الموصى بها قبل بدء التحدي للحصول على أفضل تجربة.
                </div>
              )}
              <button className="cta-btn" onClick={onStartChallenge}>
                ابدئي التحدي
              </button>
            </div>
          </section>

          {/* Info box */}
          <div className="info-box">
            <h4 className="info-box-title">كيف يتم تخصيص مسارك؟</h4>
            <p className="info-box-text">
              تستخدم المنصة نتائج تقييمك لتحديد المهارات التي تحتاجين إلى تدريب إضافي فيها،
              ثم تقدم لك محتوى وأنشطة مناسبة لأدائك.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
