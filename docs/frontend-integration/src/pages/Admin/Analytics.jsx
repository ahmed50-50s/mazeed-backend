import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faEye } from '@fortawesome/free-regular-svg-icons'
import { faArrowsRotate, faChartLine } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { useAdminSession } from './admin-session'

// Admin stats tab: total page views, total WhatsApp clicks and the contact rate, clicks per service/plan,
// and clicks per general WhatsApp button placement. Sign-in is handled by AdminLayout.

const TYPE_LABELS = { service: 'خدمة', plan: 'باقة' }
// Where each general WhatsApp button sits (placement ids from the API)
const PLACEMENT_LABELS = {
  hero: 'الرئيسية، أعلى الصفحة: تواصل معنا على واتساب',
  footer: 'الفوتر: راسلنا على واتساب',
  contactInquiry: 'الرئيسية، قسم التواصل: تواصل عبر واتساب مباشرة',
  contactTrial: 'الرئيسية، قسم التواصل: حجز الحصة التجريبية الآن',
  homeAbout: 'الرئيسية، من نحن: احجز حصتك التجريبية المجانية',
  whyUs: 'الرئيسية، لماذا نحن: احجز حلقتك التجريبية',
  aboutIntro: 'صفحة من نحن، المقدمة: احجز حلقتك التجريبية',
  aboutTrial: 'صفحة من نحن، أسفل الصفحة: احجز عبر واتساب',
}
const formatNumber = (n) => n.toLocaleString('ar-EG')
// WhatsApp clicks per 100 page views; a rough measure of how many visits turn into a contact attempt
const formatRate = (clicks, views) =>
  views ? `${((clicks / views) * 100).toLocaleString('ar-EG', { maximumFractionDigits: 1 })}٪` : '—'

function StatCard({ icon, label, value, hint, accent }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm">
      <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${accent}`}>
        <FontAwesomeIcon icon={icon} />
      </span>
      <span>
        <span className="block text-sm font-medium text-muted">{label}</span>
        <strong className="mt-1 block text-3xl font-extrabold text-ink">
          {typeof value === 'number' ? formatNumber(value) : value}
        </strong>
        {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      </span>
    </div>
  )
}

function ServicesTable({ services }) {
  if (services.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-muted">
        لا توجد ضغطات واتساب مسجلة على الخدمات أو الباقات بعد.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
      <table className="w-full text-start">
        <thead className="bg-sand text-sm text-muted">
          <tr>
            <th className="px-5 py-3 text-start font-bold">#</th>
            <th className="px-5 py-3 text-start font-bold">الخدمة / الباقة</th>
            <th className="px-5 py-3 text-start font-bold">النوع</th>
            <th className="px-5 py-3 text-start font-bold">ضغطات واتساب</th>
          </tr>
        </thead>
        <tbody>
          {services.map((item, i) => (
            <tr key={`${item.serviceType}:${item.serviceId}`} className="border-t border-line">
              <td className="px-5 py-3.5 text-muted">{formatNumber(i + 1)}</td>
              <td className="px-5 py-3.5 font-bold text-ink">
                {item.serviceName}
                {item.deleted && <span className="ms-2 rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-muted">محذوفة</span>}
              </td>
              <td className="px-5 py-3.5 text-muted">{TYPE_LABELS[item.serviceType] ?? item.serviceType}</td>
              <td className="px-5 py-3.5 text-lg font-extrabold text-primary-dark">{formatNumber(item.clicks)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GeneralButtonsTable({ buttons }) {
  if (buttons.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-muted">
        لا توجد ضغطات مسجلة على أزرار واتساب العامة بعد.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
      <table className="w-full text-start">
        <thead className="bg-sand text-sm text-muted">
          <tr>
            <th className="px-5 py-3 text-start font-bold">#</th>
            <th className="px-5 py-3 text-start font-bold">مكان الزر</th>
            <th className="px-5 py-3 text-start font-bold">ضغطات واتساب</th>
          </tr>
        </thead>
        <tbody>
          {buttons.map((item, i) => (
            <tr key={item.placement} className="border-t border-line">
              <td className="px-5 py-3.5 text-muted">{formatNumber(i + 1)}</td>
              <td className="px-5 py-3.5 font-bold text-ink">{PLACEMENT_LABELS[item.placement] ?? item.placement}</td>
              <td className="px-5 py-3.5 text-lg font-extrabold text-primary-dark">{formatNumber(item.clicks)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Analytics() {
  const { api, handleError } = useAdminSession()
  // status: loading | ready | error
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api
      .analyticsSummary({ signal: controller.signal })
      .then((data) => setState({ status: 'ready', data, error: null }))
      .catch((error) => {
        if (axios.isCancel(error)) return
        const message = handleError(error)
        if (message) setState((prev) => ({ ...prev, status: 'error', error: message }))
      })
    return () => controller.abort()
  }, [api, handleError, reloadKey])

  const onRefresh = () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }))
    setReloadKey((k) => k + 1)
  }

  const { status, data, error } = state

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-dark">إحصائيات الموقع</h1>
          <p className="mt-1 text-muted">مشاهدات الصفحات وضغطات أزرار واتساب.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          <FontAwesomeIcon icon={faArrowsRotate} spin={status === 'loading'} />
          تحديث
        </button>
      </header>

      {status === 'loading' && !data && <p className="py-16 text-center text-muted">جارٍ تحميل الإحصائيات…</p>}

      {status === 'error' && (
        <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-bold">تعذر تحميل الإحصائيات.</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {data && (
        <div className={status === 'loading' ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={faEye} label="إجمالي مشاهدات الصفحات" value={data.totals.pageViews} accent="bg-primary/10 text-primary" />
            <StatCard
              icon={faWhatsapp}
              label="إجمالي ضغطات واتساب"
              value={data.totals.whatsappClicks}
              hint={`الخدمات والباقات: ${formatNumber(data.totals.serviceWhatsappClicks)} · الأزرار العامة: ${formatNumber(data.totals.generalWhatsappClicks)}`}
              accent="bg-[#25D366]/15 text-[#1a9e4b]"
            />
            <StatCard
              icon={faChartLine}
              label="نسبة التواصل"
              value={formatRate(data.totals.whatsappClicks, data.totals.pageViews)}
              hint="ضغطات واتساب لكل ١٠٠ مشاهدة"
              accent="bg-gold/10 text-gold"
            />
          </div>

          <h2 className="mb-1 text-xl font-extrabold text-ink">الخدمات الأكثر اهتمامًا</h2>
          <p className="mb-4 text-sm text-muted">ضغطة على زر واتساب، وليست رسالة مُرسلة أو حجزًا مكتملًا.</p>
          <ServicesTable services={data.services} />

          <h2 className="mb-1 mt-10 text-xl font-extrabold text-ink">أزرار واتساب العامة</h2>
          <p className="mb-4 text-sm text-muted">أماكن الأزرار الأكثر جذبًا للتواصل، مرتبة من الأعلى.</p>
          <GeneralButtonsTable buttons={data.generalButtons} />
        </div>
      )}
    </>
  )
}

export default Analytics
