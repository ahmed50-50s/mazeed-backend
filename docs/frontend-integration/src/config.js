// Backend base URL, e.g. https://api.mazeed.academy/api/v1 (set VITE_API_URL in .env / Vercel env vars)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Academy contact details, shared by the contact section and the footer.
// Fill these in with your real details; all contact points in the site update automatically.
// WHATSAPP_NUMBER / EMAIL / SOCIAL_LINKS are also the fallback for the values the admin manages through
// PATCH /api/v1/settings, used until (or if) the API responds.

// International format, digits only (e.g. '201000000000')
export const WHATSAPP_NUMBER = '201000000000'

export const PHONE_NUMBERS = [
  {
    title: 'التسجيل والاستفسارات العامة',
    display: '+20 100 000 0000',
    raw: '201000000000',
    note: 'متاح للاتصال ورسائل الواتساب',
  },
  {
    title: 'المتابعة والشؤون التعليمية',
    display: '+20 110 000 0000',
    raw: '201100000000',
    note: 'لأولياء الأمور والطلاب المشتركين',
  },
]

export const EMAIL = 'contact@mazeed-academy.com'

export const SOCIAL_LINKS = {
  whatsapp: 'https://wa.me/201000000000',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
  telegram: 'https://t.me',
  tiktok: 'https://tiktok.com',
}

export const whatsappLink = (message = '', number = WHATSAPP_NUMBER) => {
  const targetNumber = number || '201000000000'
  return `https://wa.me/${targetNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
