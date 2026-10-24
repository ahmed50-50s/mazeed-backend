import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import Reveal from '../../../components/reveal'
import SectionHeading from '../../../components/section-heading'
import StarPattern from '../../../components/star-pattern'
import StatsCard from '../../../components/stats-card'
import { useLandingData } from '../../../hooks/use-landing-data'
import { getIcon } from '../../../lib/icons'

function Vision() {
  // رؤيتنا / رسالتنا / أهدافنا: a card has either `text` or `list`
  const { cards } = useLandingData().about

  return (
    // flow-root keeps the stats card's negative margin from collapsing through the section
    <section className="flow-root bg-sand pb-16 lg:pb-24">
      <Reveal className="relative z-10 mx-auto -mt-16 w-full max-w-[1200px] px-6 lg:-mt-20">
        <StatsCard />
      </Reveal>

      <div className="mx-auto mt-16 w-full max-w-[1200px] px-6 lg:mt-24">
        <Reveal>
          <SectionHeading title="رؤيتنا ورسالتنا" />
        </Reveal>

        <ul className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-3 lg:items-stretch">
          {cards.map((card, i) => (
            <Reveal as="li" key={card.title} delay={i * 100}>
              <div
                className={`relative h-full overflow-hidden rounded-[20px] p-8 transition duration-300 hover:-translate-y-1 ${
                  card.featured
                    ? 'bg-gradient-to-br from-[#7d8c3c] via-primary to-primary-dark text-white shadow-[0_30px_60px_-28px_rgba(87,101,42,0.8)] lg:-translate-y-4 lg:hover:-translate-y-5'
                    : 'border border-line/70 bg-white shadow-sm hover:shadow-[0_24px_50px_-24px_rgba(60,45,20,0.35)]'
                }`}
              >
                {card.featured && <StarPattern className="text-[#e9cf8f] opacity-[0.12]" />}

                <span
                  className={`relative mb-5 flex size-14 items-center justify-center rounded-2xl text-xl ${
                    card.featured ? 'bg-white/15 text-[#e9cf8f] ring-1 ring-[#e9cf8f]/30' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <FontAwesomeIcon icon={getIcon(card.icon)} />
                </span>

                <h3 className={`relative mb-3 text-2xl font-bold ${card.featured ? 'text-white' : 'text-ink'}`}>
                  {card.title}
                </h3>

                {card.text && (
                  <p className={`relative text-lg leading-loose ${card.featured ? 'text-white/85' : 'text-muted'}`}>
                    {card.text}
                  </p>
                )}

                {card.list && (
                  <ul className="relative space-y-3">
                    {card.list.map((item) => (
                      <li key={item} className="flex items-start gap-3 leading-relaxed text-muted">
                        <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[10px] text-gold">
                          <FontAwesomeIcon icon={faCheck} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Vision
