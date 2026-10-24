import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons'
import Reveal from '../../../components/reveal'
import SectionHeading from '../../../components/section-heading'
import StarPattern from '../../../components/star-pattern'
import WhatsappLink from '../../../components/whatsapp-link'
import { useLandingData } from '../../../hooks/use-landing-data'
import Photo from './photo'

function Intro() {
  const { highlights } = useLandingData().about

  return (
    // Extra bottom padding leaves room for the stats card that overlaps this section
    <section className="overflow-x-clip bg-surface pb-32 pt-14 lg:pb-36 lg:pt-20">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <SectionHeading
            align="start"
            eyebrow="تعرّف علينا"
            title={
              <>
                أكاديمية <span className="text-primary">مزيد</span> لتحفيظ القرآن الكريم
              </>
            }
          />

          <div className="mt-7 space-y-4 text-lg leading-loose text-[#4a4a4a]">
            <p>أكاديمية متخصصة في تعليم وتحفيظ القرآن الكريم والعلوم الشرعية، وتأسيس الأطفال عربي وإنجليزي.</p>
            <p>
              نجمع بين أصالة المنهج وحداثة الوسيلة؛ فنستخدم الوسائل الحديثة جنبًا إلى جنب مع الأساليب التقليدية، على أيدي
              معلمين ومعلمات مؤهلين وذوي خبرة طويلة، لنرافق طلابنا من تصحيح التلاوة حتى نيل الإجازة بإذن الله.
            </p>
          </div>

          <ul className="mt-8 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 font-medium text-ink">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          {/* Opens WhatsApp directly with the general trial message */}
          <WhatsappLink
            placement="aboutIntro"
            className="group mt-10 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-9 py-4 text-lg font-bold text-white shadow-[0_10px_24px_-6px_rgba(107,122,50,0.55)] transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_14px_28px_-6px_rgba(107,122,50,0.6)] max-sm:w-full"
          >
            احجز حلقتك التجريبية
            <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
          </WhatsappLink>
        </Reveal>

        <Reveal delay={150} className="relative mx-auto w-full max-w-[520px] pb-24 sm:pb-16 lg:pb-12">
          {/* Soft glow and offset gold frame behind the photo */}
          <div aria-hidden="true" className="absolute -inset-6 rounded-[40px] bg-primary/10 blur-3xl" />
          <div
            aria-hidden="true"
            className="absolute -end-3 -top-3 h-[80%] w-[80%] rounded-[24px] border-2 border-gold/50 sm:-end-5 sm:-top-5"
          />
          <Photo
            name="about/story"
            alt="من حلقات أكاديمية مزيد لتحفيظ القرآن الكريم"
            className="relative aspect-[4/3] w-full rounded-[20px] shadow-[0_30px_60px_-25px_rgba(60,45,20,0.45)] lg:aspect-[4/5]"
          />

          {/* Name card overlapping the photo corner */}
          <figure className="absolute bottom-0 start-4 w-[min(320px,calc(100%-2rem))] overflow-hidden rounded-[20px] bg-gradient-to-br from-primary-dark to-[#3c461c] p-6 text-white shadow-[0_24px_50px_-20px_rgba(40,45,15,0.6)] sm:-start-6">
            <StarPattern className="text-[#e9cf8f] opacity-[0.1]" />
            <p className="relative text-sm font-bold text-[#e9cf8f]">من أين جاء اسم «مزيد»؟</p>
            <blockquote className="relative mt-3 font-ruqaa text-[1.7rem] leading-relaxed">
              ﴿لِيَزْدَادُوا إِيمَانًا مَّعَ إِيمَانِهِمْ﴾
            </blockquote>
            <figcaption className="relative mt-2 text-xs text-white/70">سورة الفتح — الآية ٤</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}

export default Intro
