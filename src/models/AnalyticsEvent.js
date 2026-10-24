import mongoose from 'mongoose';

// Anonymous site events for the admin stats page. Nothing here identifies a visitor:
// no IP, no user agent, no name or phone. A WhatsApp click is only a click, not a sent message or a booking.
export const EVENT_TYPES = ['page_view', 'service_whatsapp_click', 'general_whatsapp_click'];
// What the clicked button belongs to: a Service card or a PricingPlan card
export const SERVICE_TYPES = ['service', 'plan'];
// Where a general (not service-specific) WhatsApp button sits on the site
export const GENERAL_PLACEMENTS = [
  'hero', // home hero: "تواصل معنا على واتساب"
  'footer', // footer button
  'contactInquiry', // home contact section: "تواصل عبر واتساب مباشرة"
  'contactTrial', // home contact section: "حجز الحصة التجريبية الآن"
  'homeAbout', // home "من نحن": "احجز حصتك التجريبية المجانية"
  'whyUs', // home "لماذا نحن": "احجز حلقتك التجريبية"
  'aboutIntro', // about page intro: "احجز حلقتك التجريبية"
  'aboutTrial', // about page bottom banner: "احجز عبر واتساب"
];

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true, enum: EVENT_TYPES },
    // Route path, e.g. "/" or "/about" (no query string or hash)
    pagePath: { type: String, required: true, trim: true, maxlength: 300 },

    // service_whatsapp_click only
    serviceType: { type: String, enum: SERVICE_TYPES },
    serviceId: { type: mongoose.Schema.Types.ObjectId },
    // Name at click time, so the report still has a label if the item is later deleted
    serviceName: { type: String, trim: true, maxlength: 120 },

    // general_whatsapp_click only
    placement: { type: String, enum: GENERAL_PLACEMENTS },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ eventType: 1, serviceType: 1, serviceId: 1 });

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
