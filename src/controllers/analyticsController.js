import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Service from '../models/Service.js';
import PricingPlan from '../models/PricingPlan.js';
import ApiError from '../utils/ApiError.js';

// The name shown for each clickable item: a service's title, a plan's label
const SOURCES = {
  service: { Model: Service, nameField: 'title' },
  plan: { Model: PricingPlan, nameField: 'label' },
};

// POST /api/v1/analytics/events — public, fire-and-forget from the site
export async function recordEvent(req, res) {
  const event = req.body;

  if (event.eventType === 'service_whatsapp_click') {
    // The name comes from the database, never from the client, so counts always attach to a real item
    const { Model, nameField } = SOURCES[event.serviceType];
    const item = await Model.findOne({ _id: event.serviceId, isActive: true }).select(nameField).lean();
    if (!item) throw new ApiError(404, `${event.serviceType === 'plan' ? 'Pricing plan' : 'Service'} not found`);
    event.serviceName = item[nameField];
  }

  await AnalyticsEvent.create(event);
  res.status(201).json({ success: true });
}

// GET /api/v1/analytics/summary  (admin)
// whatsappClicks = all WhatsApp buttons; split into service/plan buttons and general buttons
export async function getSummary(req, res) {
  const [pageViews, serviceWhatsappClicks, generalButtons, groups] = await Promise.all([
    AnalyticsEvent.countDocuments({ eventType: 'page_view' }),
    AnalyticsEvent.countDocuments({ eventType: 'service_whatsapp_click' }),
    // General buttons per placement, most clicked first
    AnalyticsEvent.aggregate([
      { $match: { eventType: 'general_whatsapp_click' } },
      { $group: { _id: '$placement', clicks: { $sum: 1 } } },
      { $sort: { clicks: -1, _id: 1 } },
      { $project: { _id: 0, placement: '$_id', clicks: 1 } },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { eventType: 'service_whatsapp_click' } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: { serviceType: '$serviceType', serviceId: '$serviceId' },
          clicks: { $sum: 1 },
          serviceName: { $last: '$serviceName' },
        },
      },
    ]),
  ]);

  // Show the current name when the item was renamed since the click; keep the recorded one if it was deleted
  const currentNames = new Map();
  await Promise.all(
    Object.entries(SOURCES).map(async ([serviceType, { Model, nameField }]) => {
      const ids = groups.filter((g) => g._id.serviceType === serviceType).map((g) => g._id.serviceId);
      if (!ids.length) return;
      const items = await Model.find({ _id: { $in: ids } }).select(nameField).lean();
      for (const item of items) currentNames.set(`${serviceType}:${item._id}`, item[nameField]);
    })
  );

  const services = groups
    .map(({ _id, clicks, serviceName }) => {
      const current = currentNames.get(`${_id.serviceType}:${_id.serviceId}`);
      return {
        serviceType: _id.serviceType,
        serviceId: String(_id.serviceId),
        serviceName: current ?? serviceName,
        clicks,
        deleted: current === undefined,
      };
    })
    .sort((a, b) => b.clicks - a.clicks || a.serviceName.localeCompare(b.serviceName, 'ar'));

  res.set('Cache-Control', 'no-store');
  const generalWhatsappClicks = generalButtons.reduce((sum, b) => sum + b.clicks, 0);

  res.json({
    success: true,
    data: {
      totals: {
        pageViews,
        whatsappClicks: serviceWhatsappClicks + generalWhatsappClicks,
        serviceWhatsappClicks,
        generalWhatsappClicks,
      },
      services,
      generalButtons,
    },
  });
}
