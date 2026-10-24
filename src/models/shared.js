// Building blocks shared by the landing-page content models.

// Icons are stored by their FontAwesome export name (e.g. "faBookQuran"). The frontend maps the name
// back to the icon object through its registry in src/lib/icons.js. A "far:" / "fas:" / "fab:" prefix picks
// the style when the site uses the same icon in two styles (e.g. "far:faCalendarCheck").
export const ICON_REGEX = /^(fa[rsb]:)?fa[A-Z][A-Za-z0-9]*$/;

export const iconField = (required = true) => ({
  type: String,
  trim: true,
  ...(required && { required: [true, 'icon is required'] }),
  match: [ICON_REGEX, 'icon must be a FontAwesome icon name, e.g. faBookQuran'],
});

export const text = (name, maxlength, { required = true, ...rest } = {}) => ({
  type: String,
  trim: true,
  ...(required && { required: [true, `${name} is required`] }),
  maxlength: [maxlength, `${name} must be at most ${maxlength} characters`],
  ...rest,
});

// Media is referenced by URL (CDN, S3, Cloudinary...). null means "not uploaded yet",
// which the frontend already handles by showing its built-in placeholder.
export const mediaUrl = (name) => ({
  type: String,
  trim: true,
  default: null,
  maxlength: [2048, `${name} must be at most 2048 characters`],
  match: [/^(https?:\/\/|\/)\S+$/, `${name} must be an absolute URL or a path starting with /`],
});

export const stringList = (name, { maxItems = 20, maxlength = 200 } = {}) => ({
  type: [text(name, maxlength)],
  default: [],
  validate: [(list) => list.length <= maxItems, `${name} can have at most ${maxItems} items`],
});

// Admin-only fields every sortable content collection has
export const displayFields = {
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
};

// Fields the public site never needs; stripped from public responses
export const ADMIN_ONLY_FIELDS = ['order', 'isActive', 'createdAt', 'updatedAt'];

export const baseSchemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      return ret;
    },
  },
  toObject: { virtuals: true },
};

// Lean query results keep `_id`; this gives them the same `id` shape as toJSON.
export function toPublic(doc, omit = ADMIN_ONLY_FIELDS) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  for (const key of omit) delete rest[key];
  return { id: String(_id), ...rest };
}
