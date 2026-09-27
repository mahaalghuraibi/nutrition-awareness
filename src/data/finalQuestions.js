// Post-test — 8 questions, exactly 2 per skill.
// Parallel form to questions.js (same skills, different examples).
// Correct-answer positions are deliberately varied across questions.
// Runtime shuffling in FinalAssessment.jsx gives a different display order per session.

export const finalQuestions = [
  // ── claim-1 ─────────────────────────────────────────────────────────────────
  // Parallel: i-claim-1 (carbs after 6pm) → post: vinegar burns fat
  // Correct at position 1
  {
    id: 'f-claim-1',
    category: 'claim',
    account: 'نصائح تغذوية',
    accountLabel: 'محتوى صحي',
    post: 'شرب عصير الخل على الريق يحرق الدهون ويُخسّر 3 كيلو في الأسبوع الواحد 🍶',
    question: 'كيف تقيّمين هذا الادعاء؟',
    options: [
      'صحيح لأن الخل معروف بفوائده الصحية',
      'مبالغة وتحتاج إلى دليل علمي موثوق',
      'صحيح إذا شربته يوميًا بانتظام',
    ],
    correctAnswer: 'مبالغة وتحتاج إلى دليل علمي موثوق',
  },

  // ── claim-2 ─────────────────────────────────────────────────────────────────
  // Parallel: i-claim-2 ("natural = safe") → post: all excess protein → fat
  // Correct at position 0
  {
    id: 'f-claim-2',
    category: 'claim',
    account: 'علم التغذية',
    accountLabel: 'محتوى علمي',
    post: 'كل البروتين الزائد عن حاجة الجسم يتحول حتمًا إلى دهون — هذا ما أثبته العلم.',
    question: 'ما المشكلة في هذا الادعاء؟',
    options: [
      'يستخدم تعميمًا مطلقًا قد لا تدعمه الأدلة بهذه الصورة',
      'لا مشكلة، هذه حقيقة علمية مقبولة تمامًا',
      'المشكلة فقط في استخدام كلمة حتمًا',
    ],
    correctAnswer: 'يستخدم تعميمًا مطلقًا قد لا تدعمه الأدلة بهذه الصورة',
  },

  // ── misinformation-1 ─────────────────────────────────────────────────────────
  // Parallel: i-misinformation-1 (5kg/week) → post: supplement clears toxins in 7 days
  // Correct at position 2
  {
    id: 'f-misinformation-1',
    category: 'misinformation',
    account: 'صحتك أولًا',
    accountLabel: 'محتوى غذائي',
    post: 'مكمل طبيعي 100% يطهّر جسمك من السموم خلال 7 أيام! نتائج مضمونة للجميع ✅',
    question: 'ما أبرز علامات التضليل في هذا المنشور؟',
    options: [
      'استخدام كلمة طبيعي',
      'ذكر مدة زمنية محددة وهي 7 أيام',
      'الوعد بنتائج مضمونة وسريعة للجميع',
    ],
    correctAnswer: 'الوعد بنتائج مضمونة وسريعة للجميع',
  },

  // ── misinformation-2 ─────────────────────────────────────────────────────────
  // Parallel: i-misinformation-2 (fear/urgency) → post: conspiracy "what food companies hide"
  // Correct at position 1
  {
    id: 'f-misinformation-2',
    category: 'misinformation',
    account: 'الحقائق الخفية',
    accountLabel: 'محتوى صحي',
    post: 'السر الذي تخفيه شركات الأغذية الكبرى عن الطريقة الحقيقية لإنقاص الوزن.',
    question: 'ما الأسلوب التضليلي الذي يستخدمه هذا المنشور؟',
    options: [
      'تقديم معلومة علمية موثوقة بطريقة مبسطة',
      'إثارة نظرية مؤامرة لتشكيك القارئ في المصادر الموثوقة',
      'الإشارة إلى مصدر واضح ومعتمد',
    ],
    correctAnswer: 'إثارة نظرية مؤامرة لتشكيك القارئ في المصادر الموثوقة',
  },

  // ── source-1 ─────────────────────────────────────────────────────────────────
  // Parallel: i-source-1 (influencer, no credentials) → post: celebrity diet routine
  // Correct at position 0
  {
    id: 'f-source-1',
    category: 'source',
    account: 'نجمة الشبكة',
    accountLabel: 'مؤثرة ومدوّنة',
    post: 'نجمة مشهورة تنشر روتينها الغذائي اليومي وتنصح متابعيها باتباعه لتحسين الصحة.',
    question: 'ما الخطوة الأهم قبل تبني هذا الروتين الغذائي؟',
    options: [
      'التحقق من تخصصها في التغذية أو استشارة متخصص',
      'اتباعه مباشرة لأنه تجربة شخصية ناجحة',
      'البحث عن منتجات مشابهة لما تستخدمه',
    ],
    correctAnswer: 'التحقق من تخصصها في التغذية أو استشارة متخصص',
  },

  // ── source-2 ─────────────────────────────────────────────────────────────────
  // Parallel: i-source-2 (coach personal testimony) → post: supplement company publishes own study
  // Correct at position 2
  {
    id: 'f-source-2',
    category: 'source',
    account: 'نيوتري برو شوب',
    accountLabel: 'متجر مكملات',
    post: 'شركة مكملات غذائية تنشر مقالًا: دراستنا الجديدة تثبت أن منتجنا يعزز المناعة بشكل استثنائي.',
    question: 'لماذا يُعدّ هذا المصدر غير موثوق بما يكفي؟',
    options: [
      'لأن دراسات الشركات الخاصة كلها خاطئة دائمًا',
      'لأن المنتجات الغذائية لا يمكن أن تؤثر في المناعة',
      'لأن الشركة لها مصلحة مالية مباشرة في نتائج الدراسة',
    ],
    correctAnswer: 'لأن الشركة لها مصلحة مالية مباشرة في نتائج الدراسة',
  },

  // ── evidence-1 ───────────────────────────────────────────────────────────────
  // Parallel: i-evidence-1 ("studies proved", no citation) → post: herbal drink, no source
  // Correct at position 0
  {
    id: 'f-evidence-1',
    category: 'evidence',
    account: 'اكتشف الطاقة',
    accountLabel: 'محتوى غذائي',
    post: 'التجارب أثبتت أن هذا المشروب العشبي يُحسّن مستوى الطاقة بشكل ملحوظ خلال ساعات.',
    question: 'ما المعلومة الأساسية الغائبة عن هذا الادعاء؟',
    options: [
      'لم يذكر أي مصدر أو تجارب يمكن التحقق منها',
      'لم يذكر سعر المشروب',
      'لم يوضح طعم المشروب أو طريقة تحضيره',
    ],
    correctAnswer: 'لم يذكر أي مصدر أو تجارب يمكن التحقق منها',
  },

  // ── evidence-2 ───────────────────────────────────────────────────────────────
  // Parallel: i-evidence-2 (anecdote + unverified claim) → post: mouse study → humans
  // Correct at position 2
  {
    id: 'f-evidence-2',
    category: 'evidence',
    account: 'أبحاث الصحة',
    accountLabel: 'محتوى علمي',
    post: 'دراسة على فئران أثبتت أن هذه العشبة تحسّن وظائف الكلى — إذن هي مفيدة للإنسان.',
    question: 'ما القيد الجوهري على هذا الاستنتاج؟',
    options: [
      'الاستنتاج صحيح لأن الفئران والإنسان يتشاركان تركيبًا جينيًا',
      'الاستنتاج صحيح إذا نُشرت الدراسة في مجلة علمية محكّمة',
      'نتائج الدراسات على الحيوانات لا تُطبَّق تلقائيًا على الإنسان',
    ],
    correctAnswer: 'نتائج الدراسات على الحيوانات لا تُطبَّق تلقائيًا على الإنسان',
  },
]
