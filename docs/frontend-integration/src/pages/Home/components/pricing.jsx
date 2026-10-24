import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons'
import { faArrowLeft, faShieldHalved, faStar, faTags } from '@fortawesome/free-solid-svg-icons'
import WhatsappLink from '../../../components/whatsapp-link'
import { useLandingData } from '../../../hooks/use-landing-data'
import { getIcon } from '../../../lib/icons'

function PlanCard({ plan }) {
  const { featured } = plan

  return (
    <li
      className={`group relative flex flex-col rounded-[28px] p-7 transition duration-300 lg:p-8 ${
        featured
          ? 'border-2 border-gold bg-gradient-to-b from-[#fcf6e7] to-white shadow-[0_34px_70px_-30px_rgba(184,145,63,0.6)] ring-8 ring-gold/10 max-lg:order-first lg:-my-6 lg:py-12'
          : 'border border-line bg-white shadow-[0_18px_40px_-30px_rgba(60,45,20,0.35)] hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_28px_55px_-28px_rgba(60,45,20,0.4)]'
      }`}
    >
      {featured && (
        <>
          <span className="absolute -top-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-l from-[#e9cf8f] to-gold px-5 py-2 text-sm font-extrabold text-primary-dark shadow-[0_10px_20px_-8px_rgba(184,145,63,0.7)]">
            <FontAwesomeIcon icon={faStar} />
            العرض الأكثر طلبًا
          </span>
        </>
      )}

      <div className="relative flex flex-1 flex-col">
        <div className="mb-5 flex items-center gap-3">
          <span
            className={`flex size-12 items-center justify-center rounded-2xl text-lg ${
              featured ? 'bg-gold text-white shadow-[0_8px_18px_-6px_rgba(184,145,63,0.7)]' : 'bg-gold/10 text-gold'
            }`}
          >
            <FontAwesomeIcon icon={getIcon(plan.icon)} />
          </span>
          <span className="text-sm font-bold text-gold">{plan.label}</span>
        </div>

        <h3 className="text-2xl font-extrabold text-ink">{plan.title}</h3>
        <p className="mt-2 leading-relaxed text-muted">{plan.description}</p>

        {/* Price shown as a dashed-edge coupon */}
        <div
          className={`my-7 rounded-2xl border-2 border-dashed px-5 py-5 ${
            featured ? 'border-gold/50 bg-gold/10' : 'border-gold/30 bg-gold/5'
          }`}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {plan.price.before && (
              <span className="text-2xl font-extrabold text-primary-dark">{plan.price.before}</span>
            )}
            <span className={`text-5xl font-extrabold leading-none ${featured ? 'text-gold' : 'text-primary'}`}>
              {plan.price.value}
            </span>
            <span className="text-lg font-bold text-ink">{plan.price.after}</span>
            {plan.price.suffix && <span className="text-sm text-muted">{plan.price.suffix}</span>}
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-muted">
            <FontAwesomeIcon icon={faTags} className="text-gold" />
            {plan.note}
          </p>
        </div>

        <ul className="mb-8 space-y-3.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-ink">
              <FontAwesomeIcon
                icon={faCircleCheck}
                className={`mt-1 shrink-0 ${featured ? 'text-gold' : 'text-primary'}`}
              />
              {feature}
            </li>
          ))}
        </ul>

        {/* Opens WhatsApp directly with a message naming this plan */}
        <WhatsappLink
          service={{ type: 'plan', id: plan.id, name: plan.label }}
          className={`group/btn mt-auto inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-4 font-bold transition hover:-translate-y-0.5 ${
            featured
              ? 'bg-primary text-white shadow-[0_10px_24px_-6px_rgba(107,122,50,0.55)] hover:bg-primary-dark'
              : 'border-2 border-primary/25 text-primary hover:border-primary hover:bg-primary hover:text-white'
          }`}
        >
          {plan.cta}
          <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover/btn:-translate-x-1" />
        </WhatsappLink>
      </div>
    </li>
  )
}

function Pricing() {
  // The featured plan sits in the middle column
  const { plans } = useLandingData()

  return (
    <section id="pricing" className="scroll-mt-[77px] section-screen border-t border-line bg-sand py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="mx-auto mb-16 max-w-[640px] text-center lg:mb-20">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-bold text-gold">
            <FontAwesomeIcon icon={faTags} />
            عروض متجددة وخصومات حصرية
          </span>
          <h2 className="text-[clamp(2rem,3.6vw,2.8rem)] font-extrabold leading-tight text-primary-dark">
            باقات وعروض حصرية لا تفوتك
          </h2>
          <p className="mt-4 text-lg leading-loose text-muted">
            استثمر في حفظ كتاب الله لأبنائك مع باقاتنا التوفيرية المصممة لدعم العائلات والأفراد.
          </p>
        </div>

        <ul className="grid items-stretch gap-8 lg:grid-cols-3 lg:gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.label} plan={plan} />
          ))}
        </ul>

        <p className="mt-14 flex items-center justify-center gap-2 text-center text-muted">
          <FontAwesomeIcon icon={faShieldHalved} className="text-primary" />
          جميع الباقات تبدأ بحلقة تجريبية مجانية، بلا أي التزام.
        </p>
      </div>
    </section>
  )
}

export default Pricing
