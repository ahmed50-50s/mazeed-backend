import aboutImage from '../../../assets/about.webp'
import logoEmblem from '../../../assets/logo-emblem.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons'
import WhatsappLink from '../../../components/whatsapp-link'
import { useLandingData } from '../../../hooks/use-landing-data'

function About() {
  const features = useLandingData().home.aboutFeatures

  return (
    <section id="about" className="scroll-mt-[77px] section-screen bg-surface py-16 lg:py-20">
      <div className="mx-auto w-full grid max-w-[1200px] items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20">
        <div>
          <span className="mb-5 inline-flex items-center gap-3 font-bold text-primary">
            <span className="h-px w-8 bg-primary/60" />
            من نحن
            <span className="h-px w-8 bg-primary/60" />
          </span>

          <h2 className="text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold leading-tight text-[#1c1c1c]">
            أكاديمية{' '}
            <span className="bg-gradient-to-l from-gold to-primary bg-clip-text text-transparent">مزيد</span>
          </h2>

          <p className="mt-3 font-ruqaa text-[clamp(1.6rem,2.6vw,2.1rem)] text-gold">صرحٌ قرآنيٌّ برؤيةٍ عصرية</p>

          <div className="mt-7 space-y-4 text-lg leading-loose text-[#4a4a4a]">
            <p>
              أكاديمية متخصصة في تعليم وتحفيظ القرآن الكريم والعلوم الشرعية، وتأسيس الأطفال في اللغتين العربية
              والإنجليزية.
            </p>
            <p>نجمع بين أصالة المنهج وحداثة الوسيلة، لنرافق طلابنا من أول حرف حتى الإجازة بإذن الله.</p>
          </div>

          <ul className="mt-8 space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-lg font-medium text-ink">
                <FontAwesomeIcon icon={faCircleCheck} className="shrink-0 text-xl text-primary" />
                {feature}
              </li>
            ))}
          </ul>

          {/* Opens WhatsApp directly with the general trial message */}
          <WhatsappLink
            placement="homeAbout"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-primary px-9 py-4 text-lg font-bold text-white shadow-[0_10px_24px_-6px_rgba(107,122,50,0.55)] transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_14px_28px_-6px_rgba(107,122,50,0.6)] max-sm:w-full"
          >
            احجز حصتك التجريبية المجانية
          </WhatsappLink>
        </div>

        <div className="relative pb-8 lg:pb-0">
          {/* Soft glow behind the frame */}
          <div className="absolute -inset-6 -z-0 rounded-[40px] bg-primary/10 blur-3xl" />

          <div className="relative rounded-[30px] bg-gradient-to-br from-[#c9a25a] via-[#ecdcb0] to-[#8f8a3a] p-3.5 shadow-[0_30px_60px_-25px_rgba(60,45,20,0.45)]">
            <img
              src={aboutImage}
              alt="مكتبة بها مصاحف وكتب شرعية ونافذة مشربية يدخل منها ضوء الشمس"
              loading="lazy"
              className="aspect-[3/2] w-full rounded-[20px] object-cover"
            />
          </div>

          {/* Brand card overlapping the frame corner */}
          <div className="absolute -bottom-2 start-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_18px_40px_-14px_rgba(60,45,20,0.35)] sm:-start-6 lg:-bottom-8">
            <span className="size-11 overflow-hidden">
              <img src={logoEmblem} alt="" className="h-[108%] w-full object-cover object-top mix-blend-multiply" />
            </span>
            <span>
              <span className="block font-bold text-ink">أكاديمية مزيد</span>
              <span className="block text-sm text-muted">ليزدادوا إيمانا</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
