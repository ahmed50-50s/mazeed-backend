import { useCallback, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckDouble, faChevronLeft, faChevronRight, faStar } from '@fortawesome/free-solid-svg-icons'
import logoEmblem from '../../../assets/logo-emblem.png'
import { useLandingData } from '../../../hooks/use-landing-data'

// Cards come from the API (testimonials); an item's `image` is its chat screenshot URL.

// Neutral chat skeleton shown until a real screenshot is added (left = incoming, right = our reply)
const BUBBLES = [
  { side: 'in', lines: [80, 55] },
  { side: 'in', lines: [65] },
  { side: 'out', lines: [70, 40] },
  { side: 'in', lines: [85, 75, 50] },
  { side: 'out', lines: [45] },
]

function ChatPlaceholder() {
  return (
    <div className="flex h-full flex-col bg-[#efe9dc] bg-[radial-gradient(rgba(184,145,63,0.12)_1px,transparent_1px)] [background-size:14px_14px]">
      <div className="flex items-center gap-2.5 bg-primary-dark px-3.5 pb-3 pt-6 text-white">
        <img src={logoEmblem} alt="" className="size-8 rounded-full bg-white object-cover object-top p-0.5" />
        <span className="leading-tight">
          <span className="block text-xs font-bold">أكاديمية مزيد</span>
          <span className="block text-[10px] text-white/70">متصل الآن</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2.5 p-3">
        {BUBBLES.map((bubble, i) => (
          <div
            key={i}
            className={`max-w-[80%] space-y-1.5 rounded-2xl px-3 py-2.5 shadow-sm ${
              bubble.side === 'in' ? 'self-end rounded-se-sm bg-white' : 'self-start rounded-ss-sm bg-[#e3ecc9]'
            }`}
            style={{ width: `${Math.max(...bubble.lines)}%` }}
          >
            {bubble.lines.map((width, j) => (
              <span key={j} className="block h-1.5 rounded-full bg-ink/10" style={{ width: `${width}%` }} />
            ))}
            {bubble.side === 'out' && (
              <FontAwesomeIcon icon={faCheckDouble} className="block text-[9px] text-sky-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PhoneCard({ item, index }) {
  return (
    <li className="group w-[250px] shrink-0 snap-start sm:w-[270px]">
      {/* Phone frame */}
      <div className="relative rounded-[2.4rem] bg-[#2b2a24] p-2.5 shadow-[0_30px_60px_-30px_rgba(40,30,10,0.6)] ring-1 ring-black/5 transition duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_40px_70px_-30px_rgba(40,30,10,0.65)]">
        <span className="absolute left-1/2 top-4 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#2b2a24]" />
        <div className="aspect-[9/18] overflow-hidden rounded-[1.9rem] bg-white">
          {item.image ? (
            <img
              src={item.image}
              alt={`رسالة من ${item.role} ${index + 1}`}
              loading="lazy"
              className="size-full object-cover object-top"
            />
          ) : (
            <ChatPlaceholder />
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between px-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{item.role}</span>
        <span className="flex gap-0.5 text-xs text-gold" aria-label="5 من 5">
          {[1, 2, 3, 4, 5].map((n) => (
            <FontAwesomeIcon key={n} icon={faStar} />
          ))}
        </span>
      </div>
    </li>
  )
}

const ARROW_CLASS =
  'absolute top-[calc(50%-1.75rem)] z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-primary-dark shadow-md transition hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-0'

function Testimonials() {
  const { testimonials } = useLandingData()
  const trackRef = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  // In RTL, scrollLeft runs from 0 (start, right edge) to a negative value (end)
  const updateEdges = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const scrolled = Math.abs(track.scrollLeft)
    setEdges({ start: scrolled < 4, end: scrolled > track.scrollWidth - track.clientWidth - 4 })
  }, [])

  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)
    return () => window.removeEventListener('resize', updateEdges)
  }, [updateEdges])

  const scroll = (direction) => {
    const track = trackRef.current
    const card = track?.querySelector('li')
    if (!card) return
    const step = card.offsetWidth + 24
    // direction 1 = forward (toward the left in RTL)
    track.scrollBy({ left: -direction * step, behavior: 'smooth' })
  }

  return (
    <section id="testimonials" className="scroll-mt-[77px] section-screen overflow-hidden bg-surface py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="mb-12 flex flex-col items-center gap-6 text-center lg:flex-row lg:items-end lg:justify-between lg:text-start">
          <div className="max-w-[560px]">
            <span className="mb-4 inline-flex items-center gap-3 font-bold text-primary">
              <span className="h-px w-8 bg-primary/60" />
              آراء أولياء الأمور
              <span className="h-px w-8 bg-primary/60 lg:hidden" />
            </span>
            <h2 className="text-[clamp(2rem,3.6vw,2.8rem)] font-extrabold leading-tight text-[#1c1c1c]">
              ماذا قالوا <span className="text-gold">عنّا؟</span>
            </h2>
            <p className="mt-3 text-lg leading-loose text-muted">لقطات حقيقية من رسائل أولياء الأمور والطلاب.</p>
          </div>
        </div>

        <div className="relative">
          <ul
            ref={trackRef}
            onScroll={updateEdges}
            className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto px-6 pb-8 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {testimonials.map((item, i) => (
              <PhoneCard key={item.id ?? i} item={item} index={i} />
            ))}
          </ul>

          {/* Arrows sit on the section's sides, vertically centred on the phones */}
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={edges.start}
            aria-label="السابق"
            className={`${ARROW_CLASS} start-0 xl:-start-20 2xl:-start-28`}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={edges.end}
            aria-label="التالي"
            className={`${ARROW_CLASS} end-0 xl:-end-20 2xl:-end-28`}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
