export const STORAGE_KEY        = 'nutritionAwarenessResearchSession'
export const PARTICIPANT_ID_KEY = 'nutritionAwarenessParticipantId'
export const PROGRESS_KEY       = 'nutritionAwarenessProgressSession'
export const PROGRESS_VERSION   = 1

const SKILLS = ['claim', 'misinformation', 'source', 'evidence']

// ── Fisher-Yates shuffle — returns a new shuffled copy, never mutates input ──

export function shuffleArray(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// ── Participant ID ────────────────────────────────────────────────────────────

export function generateParticipantId() {
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('').toUpperCase()
  return `P-${hex}`
}

// Returns the persisted participantId from localStorage, or generates and stores
// a fresh one. A page refresh therefore never creates a duplicate identity.
export function getOrCreateParticipantId() {
  try {
    const existing = localStorage.getItem(PARTICIPANT_ID_KEY)
    if (existing) return existing
    const id = generateParticipantId()
    localStorage.setItem(PARTICIPANT_ID_KEY, id)
    return id
  } catch (e) {
    // localStorage unavailable (strict private-browsing mode)
    console.warn('[researchData] Could not persist participantId in localStorage:', e)
    return generateParticipantId()
  }
}

// ── Raw percentage — no rounding, preserves full precision for research data ──

function rawPercentage(correct, total) {
  if (!total || total === 0) return 0
  const pct = (Math.min(correct, total) / total) * 100
  return isNaN(pct) ? 0 : Math.max(0, Math.min(100, pct))
}

// ── Build research session ────────────────────────────────────────────────────

export function buildResearchSession({
  participantId,
  sessionStartedAt,
  assessmentStartedAt,
  assessmentResult,
  completedModules,
  adaptiveResults,
  finalResult,
}) {
  const sessionCompletedAt = new Date().toISOString()

  // Time from pre-test start to study completion (null when assessmentStartedAt unavailable)
  const assessmentFlowDurationSeconds = assessmentStartedAt
    ? Math.round((new Date(sessionCompletedAt) - new Date(assessmentStartedAt)) / 1000)
    : null

  // ── Initial assessment ──────────────────────────────────────────────────────

  const initialTotal   = assessmentResult.initialTotal ?? 8
  const initialCorrect = assessmentResult.score ?? 0
  const initialSkillResults = assessmentResult.skillResults ?? {}

  // Recompute all skill percentages from raw counts — never from pre-rounded values
  const initialSkillResultsFull = {}
  for (const s of SKILLS) {
    const sr      = initialSkillResults[s]
    const correct = sr?.correct ?? 0
    const total   = sr?.total   ?? 0
    initialSkillResultsFull[s] = {
      correct,
      total,
      percentage: rawPercentage(correct, total),
    }
  }

  const initial = {
    score:        initialCorrect,
    total:        initialTotal,
    percentage:   rawPercentage(initialCorrect, initialTotal),
    level:        assessmentResult.level ?? '',
    responses:    assessmentResult.responses ?? [],
    skillResults: initialSkillResultsFull,
  }

  // ── Learning stage ──────────────────────────────────────────────────────────

  const recommendedModules   = SKILLS.filter((s) => (assessmentResult.mistakeCounts?.[s] ?? 0) > 0)
  const completedModulesList = SKILLS.filter((s) => !!completedModules[s])

  const learning = {
    recommendedModules,
    completedModules: completedModulesList,
  }

  // ── Adaptive challenge ──────────────────────────────────────────────────────

  const adaptiveTotal   = adaptiveResults?.totalQuestions ?? 0
  const adaptiveCorrect = adaptiveResults?.totalCorrect   ?? 0
  const adaptiveResponses       = adaptiveResults?.responses  ?? []
  const adaptiveCategoryResults = adaptiveResults?.byCategory ?? {}

  const adaptive = {
    score:           adaptiveCorrect,
    total:           adaptiveTotal,
    percentage:      rawPercentage(adaptiveCorrect, adaptiveTotal),
    responses:       adaptiveResponses,
    categoryResults: adaptiveCategoryResults,
  }

  // ── Final assessment ────────────────────────────────────────────────────────

  const finalCorrect      = finalResult.score ?? 0
  const finalTotal        = finalResult.total ?? 8
  const finalSkillResults = finalResult.skillResults ?? {}

  const finalSkillResultsFull = {}
  for (const s of SKILLS) {
    const sr      = finalSkillResults[s]
    const correct = sr?.correct ?? 0
    const total   = sr?.total   ?? 0
    finalSkillResultsFull[s] = {
      correct,
      total,
      percentage: rawPercentage(correct, total),
    }
  }

  const final = {
    score:        finalCorrect,
    total:        finalTotal,
    percentage:   rawPercentage(finalCorrect, finalTotal),
    responses:    finalResult.responses ?? [],
    skillResults: finalSkillResultsFull,
  }

  // ── Improvement (derived from raw percentages — no rounding error) ──────────

  const overallImprovement = final.percentage - initial.percentage

  const skillImprovement = {}
  for (const s of SKILLS) {
    const before = initial.skillResults[s]?.percentage ?? 0
    const after  = final.skillResults[s]?.percentage   ?? 0
    skillImprovement[s] = after - before
  }

  const improvement = {
    overallPercentagePoints: overallImprovement,
    skills: skillImprovement,
  }

  return {
    participantId,
    sessionStartedAt,
    assessmentStartedAt:           assessmentStartedAt ?? null,
    sessionCompletedAt,
    assessmentFlowDurationSeconds,
    initialAssessment:  initial,
    learning,
    adaptiveChallenge:  adaptive,
    finalAssessment:    final,
    improvement,
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateResearchSession(session) {
  const errors = []

  const ia = session.initialAssessment
  if (ia.total !== 8)                           errors.push(`initial: expected total=8, got ${ia.total}`)
  if (ia.score > ia.total)                      errors.push(`initial: score ${ia.score} > total ${ia.total}`)
  if (isNaN(ia.percentage))                     errors.push('initial: percentage is NaN')
  if (ia.percentage < 0 || ia.percentage > 100) errors.push(`initial: percentage ${ia.percentage} out of range`)
  if (ia.responses.length !== 8)                errors.push(`initial: expected 8 responses, got ${ia.responses.length}`)
  let iaSkillTotal   = 0
  let iaSkillCorrect = 0
  for (const s of SKILLS) {
    const sr = ia.skillResults[s]
    if (!sr) { errors.push(`initial: missing skillResults for ${s}`); continue }
    if (sr.total !== 2)        errors.push(`initial ${s}: expected total=2, got ${sr.total}`)
    if (sr.correct > sr.total) errors.push(`initial ${s}: correct ${sr.correct} > total ${sr.total}`)
    if (isNaN(sr.percentage))  errors.push(`initial ${s}: percentage is NaN`)
    iaSkillTotal   += sr.total
    iaSkillCorrect += sr.correct
  }
  if (iaSkillTotal !== 8)          errors.push(`initial: sum of skill totals = ${iaSkillTotal}, expected 8`)
  if (iaSkillCorrect !== ia.score) errors.push(`initial: skill correct sum ${iaSkillCorrect} ≠ score ${ia.score}`)

  const ac = session.adaptiveChallenge
  if (ac.total > 0 && ac.score > ac.total) errors.push(`adaptive: score ${ac.score} > total ${ac.total}`)
  if (isNaN(ac.percentage))                errors.push('adaptive: percentage is NaN')

  const fa = session.finalAssessment
  if (fa.total !== 8)                           errors.push(`final: expected total=8, got ${fa.total}`)
  if (fa.score > fa.total)                      errors.push(`final: score ${fa.score} > total ${fa.total}`)
  if (isNaN(fa.percentage))                     errors.push('final: percentage is NaN')
  if (fa.percentage < 0 || fa.percentage > 100) errors.push(`final: percentage ${fa.percentage} out of range`)
  if (fa.responses.length !== 8)                errors.push(`final: expected 8 responses, got ${fa.responses.length}`)
  let faSkillTotal   = 0
  let faSkillCorrect = 0
  for (const s of SKILLS) {
    const sr = fa.skillResults[s]
    if (!sr) { errors.push(`final: missing skillResults for ${s}`); continue }
    if (sr.total !== 2)        errors.push(`final ${s}: expected total=2, got ${sr.total}`)
    if (sr.correct > sr.total) errors.push(`final ${s}: correct ${sr.correct} > total ${sr.total}`)
    if (isNaN(sr.percentage))  errors.push(`final ${s}: percentage is NaN`)
    faSkillTotal   += sr.total
    faSkillCorrect += sr.correct
  }
  if (faSkillTotal !== 8)          errors.push(`final: sum of skill totals = ${faSkillTotal}, expected 8`)
  if (faSkillCorrect !== fa.score) errors.push(`final: skill correct sum ${faSkillCorrect} ≠ score ${fa.score}`)

  return errors
}

// ── Completed research session (localStorage) ─────────────────────────────────

export function saveResearchSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch (e) {
    console.warn('[researchData] Could not save session to localStorage:', e)
  }
}

export function loadResearchSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.warn('[researchData] Could not load session from localStorage:', e)
    return null
  }
}

// ── In-progress session persistence ──────────────────────────────────────────
//
// Shape (version 1):
// {
//   version:             1,
//   participantId:       "P-XXXXXXXX",
//   sessionStartedAt:    ISO string,
//   assessmentStartedAt: ISO string | null,
//   currentPage:         string,
//   assessmentResult:    object | null,
//   completedModules:    { claim, misinformation, source, evidence } (booleans),
//   adaptiveResults:     object | null,
//   studyCompleted:      boolean,
// }

const VALID_PAGES = new Set([
  'home', 'assessment', 'learning', 'module',
  'challenges', 'finalAssessment', 'finalResults',
])

export function saveProgressSession(progress) {
  try {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ version: PROGRESS_VERSION, ...progress })
    )
  } catch (e) {
    console.warn('[researchData] Could not save progress session:', e)
  }
}

export function loadProgressSession() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      console.warn('[researchData] Progress session is not an object — ignoring')
      return null
    }
    if (parsed.version !== PROGRESS_VERSION) {
      console.warn(
        `[researchData] Progress session version mismatch (got ${parsed.version}, ` +
        `expected ${PROGRESS_VERSION}) — ignoring`
      )
      return null
    }
    if (typeof parsed.participantId !== 'string' || !parsed.participantId.startsWith('P-')) {
      console.warn('[researchData] Progress session has invalid participantId — ignoring')
      return null
    }
    if (typeof parsed.sessionStartedAt !== 'string') {
      console.warn('[researchData] Progress session has invalid sessionStartedAt — ignoring')
      return null
    }
    if (!VALID_PAGES.has(parsed.currentPage)) {
      console.warn(`[researchData] Progress session has unknown page "${parsed.currentPage}" — ignoring`)
      return null
    }
    return parsed
  } catch (e) {
    console.warn('[researchData] Could not load progress session:', e)
    return null
  }
}

// Exported for future use (e.g. after confirmed Supabase upload).
export function clearProgressSession() {
  try {
    localStorage.removeItem(PROGRESS_KEY)
  } catch (e) {
    console.warn('[researchData] Could not clear progress session:', e)
  }
}
