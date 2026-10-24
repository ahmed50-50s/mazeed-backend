import heroBackground from '../../../assets/hero section 2.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import StatsCard from '../../../components/stats-card'
import WhatsappLink from '../../../components/whatsapp-link'

function Hero() {
  return (
    <section id="home" className="relative flex min-h-[calc(100svh-77px)] flex-col bg-cream pb-14 lg:pb-10">
      {/* Section fills the viewport below the 77px navbar (76px + border) */}
      <div className="relative flex flex-col overflow-hidden lg:min-h-[460px] lg:flex-1 lg:flex-row lg:items-center">
        {/* Photo covers the whole banner; it already fades out on the right, the overlays match it to the page tone */}
        <div
          className="relative h-[280px] w-full overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-t after:from-cream after:to-transparent after:to-45% sm:h-[360px] lg:absolute lg:inset-0 lg:h-auto lg:after:bg-gradient-to-l lg:after:from-cream lg:after:via-cream/85 lg:after:via-30% lg:after:to-transparent lg:after:to-55%"
        >
          <img
            src={heroBackground}
            alt="حلقة تحفيظ قرآن في رواق مسجد بأقواس مزخرفة في ضوء الشمس"
            className="h-full w-full object-cover object-left"
          />
          {/* Warm haze from the right, matching the photo's own light */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#f3e2c6]/90 via-[#f3e2c6]/50 via-35% to-transparent to-70%" />
          {/* Fades the bottom edge so the stats card sits on a soft ground */}
          <div className="absolute inset-0 hidden bg-gradient-to-t from-cream to-transparent to-25% lg:block" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6">
          <div className="pb-10 pt-2 lg:max-w-[660px] lg:pb-32 lg:pt-16">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-1.5 text-sm font-bold text-primary shadow-sm backdrop-blur motion-safe:animate-fade-up">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              حلقات تحفيظ القرآن الكريم
            </span>

            <h1 className="mb-5 text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-[1.4] text-[#1c1c1c] motion-safe:animate-fade-up motion-safe:[animation-delay:100ms]">
              ارتقِ بتلاوتك وحفظك مع
              <br />
              <span className="text-primary [text-shadow:0_3px_10px_rgba(0,0,0,0.18)] lg:whitespace-nowrap">
                أفضل المحفظين المعتمدين
              </span>
            </h1>

            <p className="mb-9 max-w-[560px] text-lg leading-loose text-[#4a4a4a] motion-safe:animate-fade-up motion-safe:[animation-delay:200ms]">
              مزيد هي أكاديمية أونلاين لتحفيظ القرآن الكريم وتلاوته والعلوم الشرعية وتأسيس الأطفال ونور البيان لجميع الأعمار من الجنسين.
            </p>

            <div className="flex motion-safe:animate-fade-up motion-safe:[animation-delay:300ms]">
              {/* Same message as before (whatsappMessages.contactInquiry); the click is counted as placement "hero" */}
              <WhatsappLink
                placement="hero"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-8 py-3.5 font-bold text-white shadow-[0_10px_24px_-6px_rgba(107,122,50,0.55)] transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_14px_28px_-6px_rgba(107,122,50,0.6)] max-sm:w-full"
              >
                تواصل معنا على واتساب
                <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
              </WhatsappLink>
            </div>
          </div>
        </div>
      </div>

      {/* Stats card floats over the bottom edge of the banner */}
      <div className="relative z-20 mx-auto w-full max-w-[1200px] px-6 lg:-mt-20">
        <StatsCard className="motion-safe:animate-fade-up motion-safe:[animation-delay:450ms]" />
      </div>
    </section>
  )
}

export default Hero
