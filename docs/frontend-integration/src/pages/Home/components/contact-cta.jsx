import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faCalendarCheck, faClock } from '@fortawesome/free-regular-svg-icons'
import { faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons'
import StarPattern from '../../../components/star-pattern'
import logoEmblem from '../../../assets/logo-emblem.png'
import WhatsappLink from '../../../components/whatsapp-link'
import { useLandingData } from '../../../hooks/use-landing-data'

function ContactCta() {
  const perks = useLandingData().home.contactPerks

  return (
    <section id="contact" className="scroll-mt-[77px] section-screen bg-surface py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="relative overflow-hidden rounded-[32px] border border-gold/25 bg-gradient-to-bl from-[#fcf5e3] via-[#f7ebcd] to-[#efdcae] p-8 shadow-[0_40px_80px_-40px_rgba(184,145,63,0.55)] sm:p-10 lg:p-14">
          <StarPattern className="text-gold opacity-[0.12]" />
          {/* Logo watermark in the far corner */}
          <img
            src={logoEmblem}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-16 w-80 opacity-[0.12] mix-blend-multiply max-lg:hidden"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/70 px-4 py-1.5 text-sm font-bold text-gold backdrop-blur">
                <FontAwesomeIcon icon={faClock} />
                احجز موعدك الآن خلال دقيقة واحدة
              </span>

              <h2 className="text-[clamp(1.9rem,3.4vw,2.7rem)] font-extrabold leading-snug text-primary-dark">
                تواصل الآن واحصل على <span className="text-gold">حصة تجريبية مجانية</span>
              </h2>

              <p className="mt-4 text-lg leading-loose text-[#5a5040]">
                انضم إلى عائلة مزيد اليوم واكتشف أسلوبنا الفريد في التحفيظ والتعليم. حدد الموعد الأنسب لك ودع الباقي على
                نخبة معلّمينا ومعلماتنا المعتمدين.
              </p>

              <ul className="mt-7 space-y-3">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3 font-medium text-ink">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action panel */}
            <div className="rounded-3xl bg-white/85 p-6 shadow-[0_24px_50px_-26px_rgba(60,45,20,0.45)] ring-1 ring-white backdrop-blur sm:p-8">
              <p className="mb-5 text-center font-bold text-ink">اختر طريقة التواصل المناسبة لك</p>

              <div className="space-y-4">
                <WhatsappLink
                  placement="contactInquiry"
                  className="group flex items-center gap-4 rounded-2xl bg-[#25D366] px-5 py-4 font-bold text-white shadow-[0_12px_26px_-10px_rgba(37,211,102,0.7)] transition hover:-translate-y-0.5 hover:bg-[#1fbd5a]"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">
                    <FontAwesomeIcon icon={faWhatsapp} />
                  </span>
                  <span className="flex-1">تواصل عبر واتساب مباشرة</span>
                  <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
                </WhatsappLink>

                <WhatsappLink
                  placement="contactTrial"
                  className="group flex items-center gap-4 rounded-2xl bg-primary px-5 py-4 font-bold text-white shadow-[0_12px_26px_-10px_rgba(107,122,50,0.65)] transition hover:-translate-y-0.5 hover:bg-primary-dark"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                  </span>
                  <span className="flex-1">حجز الحصة التجريبية الآن</span>
                  <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
                </WhatsappLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactCta
