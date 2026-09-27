export default function AssessmentQuestion({ question, selectedAnswer, onSelect }) {
  return (
    <div className="question-wrapper">
      {/* Social post card */}
      <div className="post-card">
        <div className="post-header">
          <div className="post-avatar">🧑</div>
          <div className="post-profile">
            <span className="post-account">{question.account}</span>
            <span className="post-account-label">{question.accountLabel}</span>
          </div>
        </div>
        <p className="post-text">{question.post}</p>
      </div>

      {/* Question */}
      <p className="question-prompt">{question.question}</p>

      {/* Answer options */}
      <div className="options-list">
        {question.options.map((option) => (
          <button
            key={option}
            className={`option-btn${selectedAnswer === option ? ' option-selected' : ''}`}
            onClick={() => onSelect(option)}
          >
            <span className="option-indicator" />
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
