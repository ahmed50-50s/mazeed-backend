import { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faChalkboardUser,
  faHeadphones,
  faMedal,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons'
import StarPattern from '../../../components/star-pattern'
import logoEmblem from '../../../assets/logo-emblem.png'
import { useLandingData } from '../../../hooks/use-landing-data'
import { getIcon } from '../../../lib/icons'

// Tabs and items come from the API (showcase.tabs). An item's `image` / `audio` URL replaces the built-in preview.

// ---------- Built-in previews (shown until a real image is provided) ----------

const SkeletonLine = ({ className = '' }) => <span className={`block h-1.5 rounded-full bg-line ${className}`} />

function CertificatePreview({ title }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border-4 border-double border-gold/60 bg-[#fffaf0] px-4 text-center shadow-[0_14px_30px_-16px_rgba(60,45,20,0.45)] transition duration-500 group-hover:scale-[1.02]">
      <img src={logoEmblem} alt="" className="mb-1 size-10 object-cover object-top mix-blend-multiply" />
      <p className="font-ruqaa text-2xl leading-tight text-gold">{title}</p>
      <SkeletonLine className="mt-3 w-1/2" />
      <SkeletonLine className="mt-1.5 w-1/3" />
      <span className="mt-3 text-lg text-gold/80">
        <FontAwesomeIcon icon={faMedal} />
      </span>
    </div>
  )
}

// ---------- Cards ----------

// One self-contained card per report: olive header, label/value rows, teacher's note
function ReportCard({ item }) {
  return (
    <li className="group flex flex-col overflow-hidden rounded-3xl border border-line/80 bg-white transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_55px_-28px_rgba(60,45,20,0.45)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7d8c3c] via-primary to-primary-dark px-6 pb-12 pt-6 text-white">
        <StarPattern />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <span className="mb-2 inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-[#e9cf8f]">
              {item.period}
            </span>
            <h3 className="text-xl font-extrabold">{item.title}</h3>
            <p className="mt-1 text-sm text-white/75">{item.caption}</p>
          </div>
          <img src={logoEmblem} alt="" className="size-11 shrink-0 rounded-full bg-white object-cover object-top p-1" />
        </div>
      </div>

      {/* Icon badge straddling the header edge */}
      <span className="relative z-10 -mt-7 ms-6 flex size-14 items-center justify-center rounded-2xl bg-white text-xl text-gold shadow-[0_10px_24px_-10px_rgba(60,45,20,0.5)] ring-4 ring-white transition-transform duration-300 group-hover:-translate-y-1">
        <FontAwesomeIcon icon={getIcon(item.icon)} />
      </span>

      <div className="flex flex-1 flex-col p-6 pt-4">
        {item.image ? (
          <a href={item.image} target="_blank" rel="noreferrer" className="mb-5 block overflow-hidden rounded-xl">
            <img src={item.image} alt={item.title} loading="lazy" className="w-full object-cover" />
          </a>
        ) : (
          <dl className="mb-5 space-y-2.5">
            {item.fields.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="text-sm font-bold text-primary-dark">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <figure className="mt-auto border-s-4 border-gold/60 ps-4">
          <blockquote className="leading-relaxed text-ink">{item.note}</blockquote>
          <figcaption className="mt-2 flex items-center gap-2 text-xs font-bold text-gold">
            <FontAwesomeIcon icon={faChalkboardUser} />
            ملاحظة المعلم
          </figcaption>
        </figure>
      </div>
    </li>
  )
}

function DocumentCard({ item }) {
  return (
    <li className="group flex flex-col overflow-hidden rounded-3xl border border-line/80 bg-white transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-26px_rgba(60,45,20,0.4)]">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-cream to-sand p-6">
        {item.image ? (
          <img src={item.image} alt={item.title} loading="lazy" className="size-full rounded-xl object-cover shadow-md" />
        ) : (
          <CertificatePreview title={item.title} />
        )}
      </div>
      <div className="flex items-center gap-3 p-5">
        <div className="flex-1">
          <h3 className="font-bold text-ink">{item.title}</h3>
          <p className="mt-1 text-sm text-muted">{item.caption}</p>
        </div>
        {item.image && (
          <a
            href={item.image}
            target="_blank"
            rel="noreferrer"
            aria-label={`عرض ${item.title}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </a>
        )}
      </div>
    </li>
  )
}

// Fixed bar heights so the waveform looks the same on every render
const WAVE = [30, 55, 40, 70, 50, 85, 60, 45, 75, 95, 65, 50, 80, 60, 40, 70, 90, 55, 45, 65, 85, 50, 35, 60, 75, 45, 55, 30]

function AudioCard({ item }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      return
    }
    // Only one recitation plays at a time
    document.querySelectorAll('audio').forEach((other) => other !== audio && other.pause())
    audio.play()
  }

  return (
    <li className="group flex flex-col rounded-3xl border border-line/80 bg-white p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-26px_rgba(60,45,20,0.4)]">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-gold/10 text-lg text-gold">
          <FontAwesomeIcon icon={faHeadphones} />
        </span>
        <div>
          <h3 className="font-ruqaa text-2xl leading-tight text-primary-dark">{item.title}</h3>
          <p className="text-sm text-muted">{item.caption}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-4 rounded-2xl bg-cream p-3">
        <button
          type="button"
          onClick={toggle}
          disabled={!item.audio}
          aria-label={playing ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}
          title={item.audio ? undefined : 'لم تتم إضافة التسجيل بعد'}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_18px_-6px_rgba(107,122,50,0.6)] transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FontAwesomeIcon icon={playing ? faPause : faPlay} />
        </button>

        {/* Waveform fills from the right as the recitation plays */}
        <div dir="rtl" className="flex h-10 flex-1 items-center gap-[3px]" aria-hidden="true">
          {WAVE.map((height, i) => (
            <span
              key={i}
              className={`flex-1 rounded-full transition-colors ${i / WAVE.length < progress ? 'bg-primary' : 'bg-gold/30'}`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {item.audio && (
          <audio
            ref={audioRef}
            src={item.audio}
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / e.currentTarget.duration || 0)}
            onEnded={() => setProgress(0)}
          />
        )}
      </div>
    </li>
  )
}

// ---------- Section ----------

function Works() {
  const { tabs } = useLandingData().showcase
  const [active, setActive] = useState('reports')
  const tabRefs = useRef([])
  // Falls back to the first tab if the active one is no longer in the data
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]

  // Arrow keys move between tabs (left = next in RTL)
  const onKeyDown = (e) => {
    const step = { ArrowLeft: 1, ArrowRight: -1 }[e.key]
    if (!step) return
    const index = (tabs.findIndex((tab) => tab.id === current.id) + step + tabs.length) % tabs.length
    setActive(tabs[index].id)
    tabRefs.current[index]?.focus()
  }

  return (
    <section id="works" className="scroll-mt-[77px] section-screen border-t border-line bg-sand py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="mx-auto mb-10 max-w-[640px] text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/70 px-4 py-1.5 text-sm font-bold text-gold">
            <FontAwesomeIcon icon={faMedal} />
            مخرجات تعليمية ملموسة
          </span>
          <h2 className="text-[clamp(2rem,3.6vw,2.8rem)] font-extrabold leading-tight text-primary-dark">
            نماذج من أعمالنا وثمار طلابنا
          </h2>
          <p className="mt-4 text-lg leading-loose text-muted">
            نشارككم باعتزاز وثائق الإنجاز وتقارير المتابعة الدورية ونماذج تلاوات طلابنا البراعم.
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <div
            role="tablist"
            aria-label="نماذج الأعمال"
            onKeyDown={onKeyDown}
            className="flex w-full flex-col gap-1 rounded-3xl border border-line bg-white p-1.5 shadow-[0_12px_30px_-20px_rgba(60,45,20,0.4)] sm:w-auto sm:flex-row sm:rounded-full"
          >
            {tabs.map((tab, i) => {
              const selected = tab.id === current.id
              return (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[i] = el)}
                  type="button"
                  role="tab"
                  id={`works-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`works-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(tab.id)}
                  className={`flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold transition outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:px-6 ${
                    selected
                      ? 'bg-primary-dark text-white shadow-[0_8px_18px_-8px_rgba(87,101,42,0.8)]'
                      : 'text-muted hover:bg-cream hover:text-primary'
                  }`}
                >
                  <FontAwesomeIcon icon={getIcon(tab.icon)} className={selected ? 'text-[#e9cf8f]' : ''} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <ul
          key={current.id}
          role="tabpanel"
          id={`works-panel-${current.id}`}
          aria-labelledby={`works-tab-${current.id}`}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 motion-safe:animate-fade-up"
        >
          {current.items.map((item) =>
            current.id === 'recitations' ? (
              <AudioCard key={item.id ?? item.title} item={item} />
            ) : current.id === 'reports' ? (
              <ReportCard key={item.id ?? item.title} item={item} />
            ) : (
              <DocumentCard key={item.id ?? item.title} item={item} />
            ),
          )}
        </ul>
      </div>
    </section>
  )
}

export default Works
