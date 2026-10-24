// Prefilled WhatsApp text for a service or plan button. The visitor sees it in WhatsApp and decides to send it.
// `place` (a branch or area name) is added only when given and not already part of the name.
export function serviceInquiryMessage(name, place) {
  const subject = place && !name.includes(place) ? `${name} في ${place}` : name
  return `السلام عليكم، عندي استفسار بخصوص ${subject}. ممكن أعرف التفاصيل والأسعار المتاحة؟ شكرًا.`
}
