// What the admin panel can edit, as field specs. Each spec mirrors the API's schema (src/models in the API repo).
// Field types: text, textarea, number, url, checkbox, select, icon, readonly, stringList, pairs, objectList.
// Options: required, max, help, default, placeholder, showIf(values), omitEmpty (don't send when empty),
// allowEmpty (url: send "" instead of null), media ('image' | 'audio' | 'video': preview), fixed (objectList: no add/remove).

const isActive = { name: 'isActive', label: 'ظاهر في الموقع', type: 'checkbox', default: true }
const icon = (required = true) => ({ name: 'icon', label: 'الأيقونة', type: 'icon', required })

export const SHOWCASE_TABS = [
  { value: 'reports', label: 'تقارير الطلاب الدورية' },
  { value: 'recitations', label: 'تلاوات صوتية للأطفال' },
  { value: 'certificates', label: 'شهادات الإجازة والتكريم' },
]
const tabIs = (...tabs) => (values) => tabs.includes(values.tab)

// ---------- Lists (one API collection each) ----------

export const RESOURCES = {
  services: {
    path: '/services',
    title: 'الخدمات',
    singular: 'خدمة',
    description: 'كروت «خدماتنا وبرامجنا القرآنية» في الصفحة الرئيسية. زر كل خدمة يفتح واتساب برسالة فيها عنوانها.',
    itemTitle: (item) => item.title,
    itemSubtitle: (item) => item.badge,
    fields: [
      { name: 'title', label: 'عنوان الخدمة', type: 'text', required: true, max: 120, help: 'يظهر في الكارت وفي رسالة واتساب.' },
      { name: 'badge', label: 'الشارة', type: 'text', required: true, max: 40, help: 'كلمة قصيرة فوق العنوان، مثل: حفظ متقن' },
      { name: 'description', label: 'الوصف', type: 'textarea', required: true, max: 600 },
      { name: 'link', label: 'نص زر واتساب', type: 'text', required: true, max: 60, help: 'مثل: ابدأ رحلة الحفظ' },
      icon(),
      { name: 'featured', label: 'مميزة (بإطار ذهبي)', type: 'checkbox' },
      isActive,
    ],
  },

  plans: {
    path: '/pricing-plans',
    title: 'الباقات والعروض',
    singular: 'باقة',
    description: 'كروت «باقات وعروض حصرية». زر كل باقة يفتح واتساب برسالة فيها اسمها.',
    itemTitle: (item) => item.label,
    itemSubtitle: (item) => item.title,
    fields: [
      { name: 'label', label: 'اسم الباقة', type: 'text', required: true, max: 60, help: 'يظهر فوق العنوان وفي رسالة واتساب، مثل: باقة الأسرة الكبرى' },
      { name: 'title', label: 'العنوان', type: 'text', required: true, max: 100, help: 'مثل: خصم 15% للإخوة' },
      { name: 'description', label: 'الوصف', type: 'textarea', required: true, max: 400 },
      { name: 'price.before', label: 'السعر: كلمة قبل الرقم (اختياري)', type: 'text', max: 30, placeholder: 'خصم' },
      { name: 'price.value', label: 'السعر: الرقم', type: 'text', required: true, max: 20, placeholder: '15%' },
      { name: 'price.after', label: 'السعر: كلمة بعد الرقم', type: 'text', required: true, max: 40, placeholder: 'شهريًا' },
      { name: 'price.suffix', label: 'السعر: ملاحظة صغيرة (اختياري)', type: 'text', max: 60, placeholder: 'بسعر 3 شهور فقط' },
      { name: 'note', label: 'سطر التوفير', type: 'text', required: true, max: 150 },
      { name: 'features', label: 'المميزات', type: 'stringList', max: 150, help: 'حتى 10 مميزات' },
      { name: 'cta', label: 'نص زر واتساب', type: 'text', required: true, max: 60 },
      icon(),
      { name: 'featured', label: 'الباقة المميزة (في المنتصف مع «العرض الأكثر طلبًا»)', type: 'checkbox' },
      isActive,
    ],
  },

  showcase: {
    path: '/showcase',
    title: 'نماذج الأعمال',
    singular: 'نموذج',
    description: 'قسم «نماذج من أعمالنا وثمار طلابنا»: تقارير، وتلاوات صوتية، وشهادات.',
    groupBy: { field: 'tab', options: SHOWCASE_TABS },
    itemTitle: (item) => item.title,
    itemSubtitle: (item) => item.caption,
    fields: [
      { name: 'tab', label: 'القسم', type: 'select', required: true, options: SHOWCASE_TABS, default: 'reports' },
      { name: 'title', label: 'العنوان', type: 'text', required: true, max: 120 },
      { name: 'caption', label: 'الوصف المختصر', type: 'text', required: true, max: 200 },
      { ...icon(), showIf: tabIs('reports') },
      { name: 'period', label: 'دورية التقرير', type: 'text', required: true, max: 40, placeholder: 'كل شهر', showIf: tabIs('reports') },
      { name: 'fields', label: 'بنود التقرير', type: 'pairs', pairLabels: ['البند', 'القيمة'], showIf: tabIs('reports'), help: 'مثل: الحفظ الجديد ← سورة الملك. (أو ضع صورة التقرير بدلًا منها)' },
      { name: 'note', label: 'ملاحظة المعلم', type: 'textarea', required: true, max: 300, showIf: tabIs('reports') },
      { name: 'image', label: 'رابط الصورة', type: 'url', media: 'image', showIf: tabIs('reports', 'certificates'), help: 'اتركه فارغًا لعرض التصميم الافتراضي.' },
      { name: 'audio', label: 'رابط ملف التلاوة', type: 'url', media: 'audio', showIf: tabIs('recitations'), help: 'اتركه فارغًا وسيظهر زر التشغيل معطّلًا.' },
      isActive,
    ],
  },

  testimonials: {
    path: '/testimonials',
    title: 'آراء أولياء الأمور',
    singular: 'رأي',
    description: 'لقطات محادثات في قسم «ماذا قالوا عنّا؟».',
    itemTitle: (item) => item.role,
    itemSubtitle: (item) => (item.image ? 'بصورة' : 'بدون صورة (يظهر شكل افتراضي)'),
    fields: [
      { name: 'role', label: 'صاحب الرأي', type: 'text', required: true, max: 40, placeholder: 'ولي أمر' },
      { name: 'image', label: 'رابط صورة المحادثة', type: 'url', media: 'image' },
      isActive,
    ],
  },
}

// ---------- Site settings (one document, saved section by section) ----------

const iconCard = (textName, textLabel, max) => [
  icon(),
  { name: 'title', label: 'العنوان', type: 'text', required: true, max: 80 },
  { name: textName, label: textLabel, type: 'textarea', required: true, max },
]

export const SETTINGS_SECTIONS = [
  {
    key: 'contact',
    title: 'بيانات التواصل',
    description: 'رقم واتساب الذي تفتحه جميع الأزرار، والبريد الإلكتروني وروابط التواصل الاجتماعي في الفوتر.',
    fields: [
      { name: 'contact.whatsappNumber', label: 'رقم واتساب الأكاديمية', type: 'text', dir: 'ltr', placeholder: '+20 100 123 4567', help: 'بكود الدولة. يُحفظ بالأرقام فقط.' },
      { name: 'contact.email', label: 'البريد الإلكتروني', type: 'text', dir: 'ltr' },
      { name: 'contact.socialLinks.facebook', label: 'فيسبوك', type: 'url', allowEmpty: true },
      { name: 'contact.socialLinks.instagram', label: 'إنستغرام', type: 'url', allowEmpty: true },
      { name: 'contact.socialLinks.youtube', label: 'يوتيوب', type: 'url', allowEmpty: true },
      { name: 'contact.socialLinks.telegram', label: 'تيليجرام', type: 'url', allowEmpty: true },
      { name: 'contact.socialLinks.tiktok', label: 'تيك توك', type: 'url', allowEmpty: true },
    ],
  },
  {
    key: 'whatsappMessages',
    title: 'رسائل واتساب الجاهزة',
    description: 'النص الذي يظهر جاهزًا في واتساب عند الضغط على الأزرار العامة. (أزرار الخدمات والباقات تكتب اسم الخدمة تلقائيًا.)',
    fields: [
      { name: 'whatsappMessages.trialInquiry', label: 'أزرار «احجز حلقتك التجريبية» (الرئيسية وصفحة من نحن)', type: 'textarea', required: true, max: 300 },
      { name: 'whatsappMessages.contactInquiry', label: 'زر أعلى الصفحة الرئيسية، و«تواصل عبر واتساب مباشرة»', type: 'textarea', required: true, max: 300 },
      { name: 'whatsappMessages.contactTrial', label: 'زر «حجز الحصة التجريبية الآن»', type: 'textarea', required: true, max: 300 },
      { name: 'whatsappMessages.aboutTrial', label: 'زر «احجز عبر واتساب» أسفل صفحة من نحن', type: 'textarea', required: true, max: 300 },
      { name: 'whatsappMessages.footer', label: 'زر الفوتر', type: 'textarea', required: true, max: 300 },
    ],
  },
  {
    key: 'stats',
    title: 'أرقام الأكاديمية',
    description: 'بطاقة الأرقام في الصفحة الرئيسية وصفحة من نحن (3 أرقام).',
    fields: [
      {
        name: 'stats',
        label: 'الأرقام',
        type: 'objectList',
        itemFields: [
          icon(),
          { name: 'value', label: 'الرقم', type: 'number', required: true },
          { name: 'label', label: 'النص', type: 'text', required: true, max: 60 },
          { name: 'key', label: 'مفتاح خاص (اختياري)', type: 'text', max: 30, omitEmpty: true, dir: 'ltr', help: 'اكتب teachers للرقم الذي يظهر في قسم المحفظين.' },
        ],
        newItem: { icon: 'faUsers', value: '', label: '', key: '' },
      },
    ],
  },
  {
    key: 'home',
    title: 'نصوص الصفحة الرئيسية',
    fields: [
      { name: 'home.aboutFeatures', label: 'نقاط قسم «من نحن»', type: 'stringList', max: 200 },
      {
        name: 'home.whyUsFeatures',
        label: 'مميزات «لماذا أكاديمية مزيد؟»',
        type: 'objectList',
        itemFields: iconCard('description', 'الوصف', 200),
        newItem: { icon: 'faGift', title: '', description: '' },
      },
      { name: 'home.contactPerks', label: 'مميزات الحصة التجريبية (قسم التواصل)', type: 'stringList', max: 200 },
    ],
  },
  {
    key: 'about',
    title: 'نصوص صفحة «من نحن»',
    fields: [
      { name: 'about.highlights', label: 'نقاط المقدمة', type: 'stringList', max: 200 },
      {
        name: 'about.cards',
        label: 'رؤيتنا ورسالتنا وأهدافنا',
        type: 'objectList',
        fixed: true,
        itemFields: [
          icon(),
          { name: 'title', label: 'العنوان', type: 'text', required: true, max: 60 },
          { name: 'text', label: 'النص', type: 'textarea', max: 600, omitEmpty: true },
          { name: 'list', label: 'أو قائمة نقاط بدل النص', type: 'stringList', max: 200, omitEmpty: true },
          { name: 'featured', label: 'كارت مميز (بالخلفية الخضراء)', type: 'checkbox' },
        ],
      },
      {
        name: 'about.values',
        label: 'قيمنا',
        type: 'objectList',
        itemFields: iconCard('text', 'النص', 300),
        newItem: { icon: 'faHeart', title: '', text: '' },
      },
      {
        name: 'about.steps',
        label: 'رحلة الطالب معنا',
        type: 'objectList',
        itemFields: iconCard('text', 'النص', 300),
        newItem: { icon: 'faRoute', title: '', text: '' },
      },
      { name: 'about.teacherTags', label: 'وسوم قسم المحفظين', type: 'stringList', max: 60 },
      { name: 'about.teacherPhotos', label: 'صور المحفظين (حتى 5)', type: 'stringList', max: 2048, dir: 'ltr', help: 'روابط صور، أو أسماء الصور الموجودة في الموقع مثل teachers/1' },
    ],
  },
  {
    key: 'showcaseTabs',
    title: 'تبويبات «نماذج الأعمال»',
    description: 'أسماء وأيقونات التبويبات الثلاثة وترتيبها.',
    fields: [
      {
        name: 'showcaseTabs',
        label: 'التبويبات',
        type: 'objectList',
        fixed: true,
        itemFields: [
          { name: 'id', label: 'القسم', type: 'readonly', format: (id) => SHOWCASE_TABS.find((t) => t.value === id)?.label ?? id },
          { name: 'label', label: 'الاسم', type: 'text', required: true, max: 60 },
          icon(),
        ],
      },
    ],
  },
  {
    key: 'footerMedia',
    title: 'وسائط الفوتر',
    description: 'الفيديو والتلاوات أعلى الفوتر.',
    fields: [
      { name: 'footerMedia.featuredVideo.title', label: 'عنوان الفيديو', type: 'text', max: 120 },
      { name: 'footerMedia.featuredVideo.video', label: 'رابط الفيديو (mp4)', type: 'url', media: 'video' },
      { name: 'footerMedia.featuredVideo.poster', label: 'صورة غلاف الفيديو', type: 'url', media: 'image' },
      {
        name: 'footerMedia.tracks',
        label: 'التلاوات',
        type: 'objectList',
        itemFields: [
          { name: 'title', label: 'السورة', type: 'text', required: true, max: 80 },
          { name: 'reciter', label: 'القارئ', type: 'text', required: true, max: 80 },
          { name: 'audio', label: 'رابط ملف الصوت', type: 'url', media: 'audio' },
        ],
        newItem: { title: '', reciter: '', audio: '' },
      },
    ],
  },
]
