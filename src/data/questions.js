// Pre-test — 8 questions, exactly 2 per skill.
// Parallel form to finalQuestions.js (same skills, different examples).
// Correct-answer positions are deliberately varied across questions.
// Runtime shuffling in InitialAssessment.jsx gives a different display order per session.

export const initialQuestions = [
  // ── claim-1 ─────────────────────────────────────────────────────────────────
  // Parallel: f-claim-1 (vinegar burns fat) → pre: carbs after 6pm
  // Correct at position 1
  {
    id: 'i-claim-1',
    category: 'claim',
    account: 'نصائح صحية',
    accountLabel: 'محتوى غذائي',
    post: 'تناول الكربوهيدرات بعد الساعة 6 مساءً يسبب زيادة الوزن.',
    question: 'كيف تقيمين هذه المعلومة؟',
    options: [
      'صحيحة',
      'غير صحيحة — الوزن يتحدد بالسعرات الكلية لا بوقت الأكل',
      'تحتاج إلى مزيد من المعلومات',
    ],
    correctAnswer: 'غير صحيحة — الوزن يتحدد بالسعرات الكلية لا بوقت الأكل',
  },

  // ── claim-2 ─────────────────────────────────────────────────────────────────
  // Parallel: f-claim-2 (excess protein → fat, absolute claim) → pre: "natural = safe"
  // Correct at position 2
  {
    id: 'i-claim-2',
    category: 'claim',
    account: 'منتجات طبيعية',
    accountLabel: 'محتوى صحي',
    post: 'المنتج طبيعي 100%، لذلك هو آمن للجميع.',
    question: 'كيف تقيمين هذا الادعاء؟',
    options: [
      'صحيح دائمًا',
      'صحيح إذا كان المنتج مشهورًا',
      'غير دقيق — الطبيعي لا يعني بالضرورة أنه آمن للجميع',
    ],
    correctAnswer: 'غير دقيق — الطبيعي لا يعني بالضرورة أنه آمن للجميع',
  },

  // ── misinformation-1 ─────────────────────────────────────────────────────────
  // Parallel: f-misinformation-1 ("guaranteed results in 7 days") → pre: 5kg in one week
  // Correct at position 0
  {
    id: 'i-misinformation-1',
    category: 'misinformation',
    account: 'عالم الريجيم',
    accountLabel: 'محتوى غذائي',
    post: 'اخسري 5 كيلو في أسبوع باستخدام هذا المشروب فقط!',
    question: 'ما أكثر شيء يجعلك تشككين في هذا الادعاء؟',
    options: [
      'النتيجة السريعة والمضمونة دون دليل',
      'استخدام كلمة مشروب',
      'وجود صورة للمنتج',
    ],
    correctAnswer: 'النتيجة السريعة والمضمونة دون دليل',
  },

  // ── misinformation-2 ─────────────────────────────────────────────────────────
  // Parallel: f-misinformation-2 (conspiracy theory) → pre: fear/urgency tactic
  // Correct at position 1
  {
    id: 'i-misinformation-2',
    category: 'misinformation',
    account: 'وصفات المنزل',
    accountLabel: 'محتوى غذائي',
    post: 'احذري! الطعام الذي تأكلينه يوميًا يدمر جهازك الهضمي — اكتشفي الحل الوحيد الآن!',
    question: 'ما علامة التضليل الأبرز في هذا المنشور؟',
    options: [
      'استخدام علامة التعجب',
      'استخدام أسلوب الإثارة والتخويف لدفع القارئ نحو منتج',
      'ذكر الجهاز الهضمي',
    ],
    correctAnswer: 'استخدام أسلوب الإثارة والتخويف لدفع القارئ نحو منتج',
  },

  // ── source-1 ─────────────────────────────────────────────────────────────────
  // Parallel: f-source-1 (celebrity routine) → pre: influencer recommending product
  // Correct at position 2
  {
    id: 'i-source-1',
    category: 'source',
    account: 'حياة صحية',
    accountLabel: 'مؤثرة صحية',
    post: 'مؤثرة على وسائل التواصل تنصح بمنتج غذائي وتقول إنه الأفضل للصحة، لكنها لا تذكر تخصصها أو أي مصدر علمي.',
    question: 'ما الخطوة الأفضل قبل تصديق هذه المعلومة؟',
    options: [
      'تصديقها لأن لديها متابعين كثيرين',
      'شراء المنتج وتجربته مباشرة',
      'التحقق من تخصص صاحبة الحساب ومصدر المعلومة',
    ],
    correctAnswer: 'التحقق من تخصص صاحبة الحساب ومصدر المعلومة',
  },

  // ── source-2 ─────────────────────────────────────────────────────────────────
  // Parallel: f-source-2 (company publishes its own study) → pre: coach personal testimony
  // Correct at position 0
  {
    id: 'i-source-2',
    category: 'source',
    account: 'كوتش صحة',
    accountLabel: 'مدرب لياقة',
    post: 'مدرب صحي يعلن: جربت هذه المكملات بنفسي وأنا متأكد 100% أنها ستفيدك.',
    question: 'لماذا لا تكفي تجربة هذا الشخص دليلًا كافيًا؟',
    options: [
      'التجربة الشخصية لشخص واحد لا تثبت فاعلية المنتج للجميع',
      'لأن المكملات الغذائية ضارة دائمًا',
      'لأن المدربين الصحيين لا خبرة لهم',
    ],
    correctAnswer: 'التجربة الشخصية لشخص واحد لا تثبت فاعلية المنتج للجميع',
  },

  // ── evidence-1 ───────────────────────────────────────────────────────────────
  // Parallel: f-evidence-1 (herbal drink, no source cited) → pre: "studies proved" no citation
  // Correct at position 2
  {
    id: 'i-evidence-1',
    category: 'evidence',
    account: 'صحة وغذاء',
    accountLabel: 'محتوى علمي',
    post: 'دراسات أثبتت أن هذا المشروب يحرق الدهون.',
    question: 'ما المشكلة في هذا المنشور؟',
    options: [
      'استخدم كلمة مشروب',
      'المنشور قصير جدًا',
      'لم يذكر اسم الدراسة أو مصدرها',
    ],
    correctAnswer: 'لم يذكر اسم الدراسة أو مصدرها',
  },

  // ── evidence-2 ───────────────────────────────────────────────────────────────
  // Parallel: f-evidence-2 (mouse study → humans) → pre: single anecdote + unverified claim
  // Correct at position 1
  {
    id: 'i-evidence-2',
    category: 'evidence',
    account: 'تجارب حقيقية',
    accountLabel: 'محتوى غذائي',
    post: 'صديقتي جربت هذا النظام وخسرت 10 كيلو، والأبحاث تؤكد — إذن هو مناسب للجميع.',
    question: 'ما المشكلة الجوهرية في هذا الاستنتاج؟',
    options: [
      'لا مشكلة، التجارب الشخصية دليل قوي',
      'يجمع بين تجربة شخصية وادعاء علمي غير موثق لتعميم نتيجة على الجميع',
      'المشكلة فقط في عدم ذكر اسم النظام الغذائي',
    ],
    correctAnswer: 'يجمع بين تجربة شخصية وادعاء علمي غير موثق لتعميم نتيجة على الجميع',
  },
]
