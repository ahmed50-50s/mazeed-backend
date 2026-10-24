import SiteSettings from '../models/SiteSettings.js';
import Service from '../models/Service.js';
import PricingPlan from '../models/PricingPlan.js';
import Testimonial from '../models/Testimonial.js';
import ShowcaseItem, { toShowcasePublic } from '../models/ShowcaseItem.js';
import { toPublic } from '../models/shared.js';

// Everything the home + about pages render, in one payload. The content changes only when an admin edits it,
// so it is cached in memory; every admin write clears the cache, and the TTL bounds staleness when several
// API instances run side by side.
const TTL_MS = 60 * 1000;

let cache = null; // { promise, expiresAt }

export function invalidateLandingCache() {
  cache = null;
}

const activeSorted = (Model) => Model.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

async function buildLandingData() {
  const [settingsDoc, services, plans, showcaseItems, testimonials] = await Promise.all([
    SiteSettings.getSingleton(),
    activeSorted(Service),
    activeSorted(PricingPlan),
    activeSorted(ShowcaseItem),
    activeSorted(Testimonial),
  ]);

  const settings = settingsDoc.toJSON();

  return {
    contact: settings.contact,
    whatsappMessages: settings.whatsappMessages,
    stats: settings.stats,
    home: settings.home,
    about: settings.about,
    footerMedia: settings.footerMedia,
    services: services.map((item) => toPublic(item)),
    plans: plans.map((item) => toPublic(item)),
    showcase: {
      // Tab order and labels come from settings; each tab gets its active items
      tabs: settings.showcaseTabs.map((tab) => ({
        ...tab,
        items: showcaseItems.filter((item) => item.tab === tab.id).map(toShowcasePublic),
      })),
    },
    testimonials: testimonials.map((item) => toPublic(item)),
    updatedAt: settings.updatedAt,
  };
}

export async function getLandingData() {
  if (!cache || cache.expiresAt < Date.now()) {
    const promise = buildLandingData();
    cache = { promise, expiresAt: Date.now() + TTL_MS };
    // Don't keep a failed build around; the next request retries
    promise.catch(() => {
      if (cache?.promise === promise) cache = null;
    });
  }
  return cache.promise;
}
