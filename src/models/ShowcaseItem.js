import mongoose from 'mongoose';
import { baseSchemaOptions, displayFields, iconField, mediaUrl, text } from './shared.js';

// "نماذج من أعمالنا وثمار طلابنا" (#works). One collection for the three tabs in
// src/pages/Home/components/works.jsx; `tab` decides which fields an item uses.
export const SHOWCASE_TABS = ['reports', 'recitations', 'certificates'];

// The exact keys each tab's card reads, in the frontend's order
export const TAB_FIELDS = {
  reports: ['title', 'icon', 'period', 'caption', 'fields', 'note', 'image'],
  recitations: ['title', 'caption', 'audio'],
  certificates: ['title', 'caption', 'image'],
};

const REQUIRED_BY_TAB = {
  reports: ['icon', 'period', 'note'],
  recitations: [],
  certificates: [],
};

const showcaseItemSchema = new mongoose.Schema(
  {
    tab: {
      type: String,
      required: [true, 'tab is required'],
      enum: { values: SHOWCASE_TABS, message: `tab must be one of: ${SHOWCASE_TABS.join(', ')}` },
    },
    title: text('title', 120),
    caption: text('caption', 200),

    // reports only
    icon: iconField(false),
    period: text('period', 40, { required: false }),
    // Label/value rows kept as [label, value] pairs, exactly as the frontend destructures them
    fields: {
      type: [[{ type: String, trim: true, maxlength: 100 }]],
      default: undefined,
      validate: [
        (rows) => !rows || (rows.length <= 8 && rows.every((row) => row.length === 2 && row.every(Boolean))),
        'fields must be at most 8 [label, value] pairs of non-empty strings',
      ],
    },
    note: text('note', 300, { required: false }),

    // Report scan or certificate photo (reports + certificates); null shows the built-in preview
    image: mediaUrl('image'),
    // Recitation recording (recitations); null disables the play button
    audio: mediaUrl('audio'),

    ...displayFields,
  },
  baseSchemaOptions
);

showcaseItemSchema.pre('validate', function requireTabFields() {
  for (const field of REQUIRED_BY_TAB[this.tab] || []) {
    if (!this[field]) this.invalidate(field, `${field} is required for ${this.tab} items`);
  }
  if (this.tab === 'reports' && !this.image && !this.fields?.length) {
    this.invalidate('fields', 'reports need either fields or an image');
  }
});

showcaseItemSchema.index({ tab: 1, isActive: 1, order: 1 });

// Public shape of one item: only the keys its tab's card uses, plus id
export function toShowcasePublic(item) {
  const out = { id: String(item._id ?? item.id) };
  for (const key of TAB_FIELDS[item.tab]) {
    out[key] = item[key] ?? (key === 'image' || key === 'audio' ? null : undefined);
  }
  return out;
}

export default mongoose.model('ShowcaseItem', showcaseItemSchema);
