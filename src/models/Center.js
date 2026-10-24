import mongoose from 'mongoose';

// Stored as international digits only, e.g. "201001234567" (no "+", spaces or leading zeros),
// which is exactly the format wa.me links expect.
const WHATSAPP_REGEX = /^[1-9]\d{7,14}$/;

const centerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      maxlength: [150, 'name must be at most 150 characters'],
    },
    // Location is optional: the academy teaches online, so a center may have no physical address
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'address must be at most 300 characters'],
    },
    region: {
      type: String,
      trim: true,
      maxlength: [100, 'region must be at most 100 characters'],
    },
    whatsappNumber: {
      type: String,
      required: [true, 'whatsappNumber is required'],
      trim: true,
      // Accept "+20 100 123 4567", "00201001234567", "20-100-123-4567" and store "201001234567"
      set: (value) => (typeof value === 'string' ? value.replace(/[\s\-()+]/g, '').replace(/^00/, '') : value),
      match: [WHATSAPP_REGEX, 'whatsappNumber must be in international format with country code, e.g. 201001234567'],
    },
    details: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'details must be at most 5000 characters'],
    },
    cardClicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    whatsappClicks: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      // Expose a single "id" string to clients instead of both "_id" and "id"
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

centerSchema.virtual('whatsappLink').get(function whatsappLink() {
  return this.whatsappNumber ? `https://wa.me/${this.whatsappNumber}` : undefined;
});

centerSchema.index({ region: 1, name: 1 });
centerSchema.index({ createdAt: -1 });

export default mongoose.model('Center', centerSchema);
