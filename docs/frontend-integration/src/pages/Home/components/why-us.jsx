import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import StarPattern from '../../../components/star-pattern'
import { faArrowLeft, faGift } from '@fortawesome/free-solid-svg-icons'
import WhatsappLink from '../../../components/whatsapp-link'
import { useLandingData } from '../../../hooks/use-landing-data'
import { getIcon } from '../../../lib/icons'

function WhyUs() {
  const features = useLandingData().home.whyUsFeatures

  return (
    <section id="why-us" className="scroll-mt-[77px] section-screen bg-surface py-16 lg:py-20">
      <div className="mx-auto w-full grid max-w-[1200px] items-start gap-8 px-6 lg:grid-cols-[380px_1fr]">
        {/* Olive intro panel, stays in view while the feature list scrolls */}
        <aside className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#7d8c3c] via-primary to-primary-dark p-8 text-white shadow-[0_30px_60px_-28px_rgba(87,101,42,0.8)] lg:sticky lg:top-28 lg:p-10">
          <StarPattern />
          <div className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-[#e9cf8f]/20 blur-3xl" />

          <div className="relative">
            <span className="mb-5 inline-flex items-center gap-3 font-bold text-[#e9cf8f]">
              <span className="h-px w-8 bg-[#e9cf8f]/60" />
              لماذا نحن
              <span className="h-px w-8 bg-[#e9cf8f]/60" />
            </span>

            <h2 className="text-[clamp(2rem,3.4vw,2.6rem)] font-extrabold leading-snug">
              لماذا أكاديمية <span className="text-[#e9cf8f]">مزيد؟</span>
            </h2>

            <p className="mt-4 text-lg leading-loose text-white/85">
              لأننا نؤمن أن رحلة القرآن تستحق معلمًا متقنًا، ومنهجًا واضحًا، ومتابعة لا تنقطع.
            </p>

            {/* Opens WhatsApp directly with the general trial message */}
            <WhatsappLink
              placement="whyUs"
              className="group mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-8 py-4 font-bold text-primary-dark shadow-[0_12px_24px_-10px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-[#fbf6e9] sm:w-auto"
            >
              احجز حلقتك التجريبية
              <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
            </WhatsappLink>

            <div className="mt-8 flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#e9cf8f]/15 text-xl text-[#e9cf8f] ring-1 ring-[#e9cf8f]/30">
                <FontAwesomeIcon icon={faGift} />
              </span>
              <p className="font-bold leading-relaxed">الحلقة التجريبية الأولى مجانية بالكامل</p>
            </div>
          </div>
        </aside>

        <ul className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, i) => (
            <li
              key={feature.title}
              className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-line/80 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_20px_40px_-24px_rgba(60,45,20,0.4)]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-lg text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-white">
                <FontAwesomeIcon icon={getIcon(feature.icon)} />
              </span>
              <span className="flex-1 pt-0.5">
                <h3 className="font-bold text-ink">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{feature.description}</p>
              </span>
              <span
                aria-hidden="true"
                className="text-2xl font-extrabold leading-none text-line transition-colors duration-300 group-hover:text-gold/30"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default WhyUs
