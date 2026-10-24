import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Reveal from '../../../components/reveal'
import SectionHeading from '../../../components/section-heading'
import StarPattern from '../../../components/star-pattern'
import { useLandingData } from '../../../hooks/use-landing-data'
import { getIcon } from '../../../lib/icons'

function Values() {
  const { values } = useLandingData().about

  return (
    <section className="relative overflow-hidden border-t border-line bg-surface py-16 lg:py-24">
      <StarPattern className="text-gold opacity-[0.06]" />

      <div className="relative mx-auto w-full max-w-[1200px] px-6">
        <Reveal>
          <SectionHeading title="قيمنا" />
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {values.map((value, i) => (
            <Reveal as="li" key={value.title} delay={(i % 3) * 100}>
              <div className="group h-full rounded-[20px] border border-line/80 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_20px_40px_-24px_rgba(60,45,20,0.4)]">
                <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-xl text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-white">
                  <FontAwesomeIcon icon={getIcon(value.icon)} />
                </span>
                <h3 className="mb-2 text-xl font-bold text-ink">{value.title}</h3>
                <p className="leading-relaxed text-muted">{value.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Values
