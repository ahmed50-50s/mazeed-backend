import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Reveal from '../../../components/reveal'
import SectionHeading from '../../../components/section-heading'
import StarPattern from '../../../components/star-pattern'
import { useLandingData } from '../../../hooks/use-landing-data'
import { getIcon } from '../../../lib/icons'

function Journey() {
  const { steps } = useLandingData().about

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#5f6c2c] via-primary-dark to-[#3c461c] py-16 lg:py-24">
      <StarPattern className="text-[#e9cf8f] opacity-[0.07]" />

      <div className="relative mx-auto w-full max-w-[1200px] px-6">
        <Reveal>
          <SectionHeading light title="رحلة الطالب معنا" subtitle="خطة تعليمية ومنهجية واضحة من أول حصة حتى الإجازة." />
        </Reveal>

        <ol className="relative mt-14 grid gap-y-10 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 lg:mt-16 lg:grid-cols-5">
          {/* Dotted gold path: vertical on a single column, horizontal through the circles on desktop */}
          <span
            aria-hidden="true"
            className="absolute inset-y-10 start-10 border-s-2 border-dotted border-[#e9cf8f]/40 sm:hidden"
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-[10%] top-10 hidden border-t-2 border-dotted border-[#e9cf8f]/40 lg:block"
          />

          {steps.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 100}
              className="relative flex items-start gap-5 sm:flex-col sm:items-center sm:gap-0 sm:text-center"
            >
              <span className="relative flex size-20 shrink-0 items-center justify-center rounded-full bg-primary-dark text-2xl text-[#e9cf8f] shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)] ring-1 ring-[#e9cf8f]/40 sm:mb-5">
                <FontAwesomeIcon icon={getIcon(step.icon)} />
                <span className="absolute -end-1 -top-1 flex size-7 items-center justify-center rounded-full bg-[#e9cf8f] text-sm font-bold text-primary-dark">
                  {(i + 1).toLocaleString('ar-EG')}
                </span>
              </span>
              <span className="pt-3 sm:pt-0">
                <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
                <p className="leading-relaxed text-white/75">{step.text}</p>
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default Journey
