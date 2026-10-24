import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import Reveal from '../../../components/reveal'
import StarPattern from '../../../components/star-pattern'
import WhatsappLink from '../../../components/whatsapp-link'

function AboutCta() {
  return (
    <section id="join" className="scroll-mt-[77px] bg-surface pb-16 lg:pb-24">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#7d8c3c] via-primary to-primary-dark px-6 py-12 text-center shadow-[0_40px_80px_-40px_rgba(87,101,42,0.8)] sm:px-10 lg:py-16">
            <StarPattern />
            <div className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-[#e9cf8f]/20 blur-3xl" />

            <div className="relative mx-auto max-w-[720px]">
              <h2 className="text-[clamp(1.7rem,3.2vw,2.5rem)] font-extrabold leading-snug text-white">
                ابدأ رحلتك مع القرآن اليوم <span className="text-[#e9cf8f]">واحصل على حصة تجريبية مجانية</span>
              </h2>

              <WhatsappLink
                placement="aboutTrial"
                className="mt-9 inline-flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-9 py-4 text-lg font-bold text-white shadow-[0_12px_26px_-10px_rgba(37,211,102,0.8)] transition hover:-translate-y-0.5 hover:bg-[#1fbd5a] max-sm:w-full"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-2xl" />
                احجز عبر واتساب
              </WhatsappLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default AboutCta
