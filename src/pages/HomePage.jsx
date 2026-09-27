import Navbar from '../components/Navbar'

export default function HomePage({ onStartAssessment }) {
  return (
    <div className="page">
      <Navbar />

      {/* ── Hero ───────────────────────────────── */}
      <section className="hero">
        <div className="container hero-layout">

          <div className="hero-text">
            <h1 className="hero-heading">
              هل كل معلومة غذائية تشاهدينها صحيحة؟
            </h1>
            <p className="hero-subtitle">
              تعلمي كيف تميزين بين المعلومات الغذائية الصحيحة والمضللة
              بطريقة بسيطة وتفاعلية.
            </p>
            <button className="cta-btn" onClick={onStartAssessment}>
              ابدئي التقييم
            </button>
            <p className="secondary-text">
              اختبري قدرتك على تقييم المعلومات الغذائية الرقمية
            </p>
          </div>

          <div className="hero-visual">
            <div className="social-card">
              <div className="card-header">
                <div className="avatar">🧑</div>
                <div className="card-profile">
                  <span className="profile-name">نصائح صحية</span>
                  <span className="profile-sub">محتوى غذائي</span>
                </div>
              </div>
              <div className="card-body">
                <p className="card-text">
                  🍋 ماء الليمون على الريق يحرق دهون البطن
                </p>
                <div className="card-stats">
                  <span>❤️ 4,821</span>
                  <span>💬 312</span>
                  <span>🔁 980</span>
                </div>
              </div>
              <div className="card-verify">
                صحيحة أم مضللة؟ ⚠️
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Steps Section ──────────────────────── */}
      <section className="steps">
        <div className="container steps-grid">

          <div className="step-card">
            <div className="step-icon">👁️</div>
            <h3>شاهدي المعلومة</h3>
            <p>تعرض لك المنصة أمثلة مشابهة لما تشاهدينه في وسائل التواصل.</p>
          </div>

          <div className="step-card">
            <div className="step-icon">🔍</div>
            <h3>قيّميها</h3>
            <p>حددي هل المعلومة موثوقة أم تحتاج إلى التحقق.</p>
          </div>

          <div className="step-card step-card--green">
            <div className="step-icon">📖</div>
            <h3>تعلّمي</h3>
            <p>تحصلين على تدريب يناسب مستواك بناءً على إجاباتك.</p>
          </div>

        </div>
      </section>
    </div>
  )
}
