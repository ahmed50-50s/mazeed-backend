import mongoose from 'mongoose';
import { iconField, mediaUrl, stringList, text } from './shared.js';
import { SHOWCASE_TABS } from './ShowcaseItem.js';

// Single document holding the site-wide, rarely changing content: contact details, the prefilled WhatsApp
// messages, the stats card, and the copy lists of the home/about pages. Every array mirrors a hardcoded
// array in the frontend; the comment above each field names it.

const WHATSAPP_REGEX = /^[1-9]\d{7,14}$/;

const sub = (definition) => new mongoose.Schema(definition, { _id: false });

const iconCard = (textKey = 'text', textMax = 300) =>
  sub({
    icon: iconField(),
    title: text('title', 80),
    [textKey]: text(textKey, textMax),
  });

// Empty string = not set; the footer hides empty social links
const optionalUrl = (name) => ({
  ...mediaUrl(name),
  default: '',
  match: [/^(https?:\/\/\S+)?$/, `${name} must be an http(s) URL`],
});

const settingsSchema = new mongoose.Schema(
  {
    // Always "main"; enforces the singleton
    key: { type: String, default: 'main', unique: true, immutable: true },

    // src/config.js → WHATSAPP_NUMBER, EMAIL, SOCIAL_LINKS
    contact: {
      type: sub({
        whatsappNumber: {
          type: String,
          trim: true,
          default: '',
          set: (value) => (typeof value === 'string' ? value.replace(/[\s\-()+]/g, '').replace(/^00/, '') : value),
          validate: [(v) => v === '' || WHATSAPP_REGEX.test(v), 'whatsappNumber must be in international format, e.g. 201001234567'],
        },
        email: {
          type: String,
          trim: true,
          lowercase: true,
          default: '',
          match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email is invalid'],
        },
        socialLinks: {
          type: sub({
            facebook: optionalUrl('facebook'),
            instagram: optionalUrl('instagram'),
            youtube: optionalUrl('youtube'),
            telegram: optionalUrl('telegram'),
            tiktok: optionalUrl('tiktok'),
          }),
          default: () => ({}),
        },
      }),
      default: () => ({}),
    },

    // The prefilled text of the general WhatsApp CTAs (footer, contact section, about page).
    // Service and plan buttons build their own message from the item's name.
    whatsappMessages: {
      type: sub({
        footer: text('whatsappMessages.footer', 300, { default: 'السلام عليكم، أرغب في الاستفسار عن أكاديمية مزيد' }),
        contactInquiry: text('whatsappMessages.contactInquiry', 300, {
          default: 'السلام عليكم، أرغب في الاستفسار عن الحلقات في أكاديمية مزيد',
        }),
        contactTrial: text('whatsappMessages.contactTrial', 300, {
          default: 'السلام عليكم، أرغب في حجز الحصة التجريبية المجانية',
        }),
        aboutTrial: text('whatsappMessages.aboutTrial', 300, { default: 'السلام عليكم، أريد حجز حصة تجريبية مجانية' }),
        // The "احجز حلقتك التجريبية" buttons inside the home/about sections
        trialInquiry: text('whatsappMessages.trialInquiry', 300, {
          default:
            'السلام عليكم، عندي استفسار عن الحلقات في أكاديمية مزيد، وأود حجز الحصة التجريبية المجانية. ممكن أعرف التفاصيل والمواعيد المتاحة؟ شكرًا.',
        }),
      }),
      default: () => ({}),
    },

    // src/data/stats.js → stats (hero + about page card). `key: "teachers"` is also read by the teachers grid.
    stats: {
      type: [
        sub({
          icon: iconField(),
          value: { type: Number, required: [true, 'value is required'], min: 0 },
          label: text('label', 60),
          key: text('key', 30, { required: false }),
        }),
      ],
      default: [],
    },

    home: {
      type: sub({
        // Home about.jsx → features
        aboutFeatures: stringList('aboutFeatures', { maxItems: 8 }),
        // why-us.jsx → features
        whyUsFeatures: { type: [iconCard('description', 200)], default: [] },
        // contact-cta.jsx → perks
        contactPerks: stringList('contactPerks', { maxItems: 8 }),
      }),
      default: () => ({}),
    },

    about: {
      type: sub({
        // About intro.jsx → highlights
        highlights: stringList('highlights', { maxItems: 8 }),
        // vision.jsx → cards (رؤيتنا / رسالتنا / أهدافنا). A card has either `text` or `list`.
        cards: {
          type: [
            sub({
              icon: iconField(),
              title: text('title', 60),
              text: text('text', 600, { required: false }),
              list: { type: [text('list item', 200)], default: undefined },
              featured: { type: Boolean, default: undefined },
            }),
          ],
          default: [],
        },
        // values.jsx → values
        values: { type: [iconCard()], default: [] },
        // journey.jsx → steps
        steps: { type: [iconCard()], default: [] },
        // teachers.jsx → tags
        teacherTags: stringList('teacherTags', { maxItems: 8, maxlength: 60 }),
        // teachers.jsx → teacherPhotos. URLs, or local asset names such as "teachers/1".
        teacherPhotos: stringList('teacherPhotos', { maxItems: 5, maxlength: 2048 }),
      }),
      default: () => ({}),
    },

    // works.jsx → tabs (id, label, icon). Items come from the ShowcaseItem collection.
    showcaseTabs: {
      type: [
        sub({
          id: { type: String, required: true, enum: SHOWCASE_TABS },
          label: text('label', 60),
          icon: iconField(),
        }),
      ],
      default: [],
    },

    // footer.jsx → featuredVideo + tracks
    footerMedia: {
      type: sub({
        featuredVideo: {
          type: sub({
            title: text('featuredVideo.title', 120, { required: false, default: '' }),
            video: mediaUrl('featuredVideo.video'),
            poster: mediaUrl('featuredVideo.poster'),
          }),
          default: () => ({}),
        },
        tracks: {
          type: [sub({ title: text('title', 80), reciter: text('reciter', 80), audio: mediaUrl('audio') })],
          default: [],
        },
      }),
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.key;
        return ret;
      },
    },
  }
);

// Top-level sections the admin can replace through PATCH /settings
export const SETTINGS_SECTIONS = ['contact', 'whatsappMessages', 'stats', 'home', 'about', 'showcaseTabs', 'footerMedia'];

// Returns the settings document, creating it with defaults on first use
settingsSchema.statics.getSingleton = async function getSingleton() {
  const existing = await this.findOne({ key: 'main' });
  if (existing) return existing;
  try {
    return await this.create({ key: 'main' });
  } catch (err) {
    // Another request created it first (unique index on key)
    if (err.code === 11000) return this.findOne({ key: 'main' });
    throw err;
  }
};

export default mongoose.model('SiteSettings', settingsSchema);
