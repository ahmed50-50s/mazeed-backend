import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faInstagram, faTiktok, faWhatsapp, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { faClock, faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faArrowUp, faChevronLeft, faHeadphones, faPause, faPlay, faVideo } from '@fortawesome/free-solid-svg-icons'
import StarPattern from './star-pattern'
import logoEmblem from '../assets/logo-emblem.png'
import videoPoster from '../assets/about.webp'
import { useLandingData } from '../hooks/use-landing-data'
import WhatsappLink from './whatsapp-link'

// The featured video and recitation tracks come from the API (footerMedia); a missing poster uses the about photo

const quickLinks = [
  { label: 'الرئيسية', to: '/' },
  { label: 'من نحن', to: '/about' },
  { label: 'خدماتنا', to: '/#courses' },
  { label: 'المحفظون', to: '/teachers' },
  { label: 'الباقات والعروض', to: '/#pricing' },
  { label: 'تواصل معنا', to: '/contact' },
]

const scrollToTop = () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}

const socialIcons = [
  { key: 'facebook', icon: faFacebookF, label: 'فيسبوك' },
  { key: 'instagram', icon: faInstagram, label: 'إنستغرام' },
  { key: 'youtube', icon: faYoutube, label: 'يوتيوب' },
  { key: 'tiktok', icon: faTiktok, label: 'تيك توك' },
]

// ---------- Media: featured video + recitation playlist ----------

function FeaturedVideo() {
  const { title, video, poster: posterUrl } = useLandingData().footerMedia.featuredVideo
  const poster = posterUrl || videoPoster

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black/30 ring-1 ring-white/15">
      {video ? (
        <video src={video} poster={poster} controls preload="metadata" className="size-full object-cover" />
      ) : (
        <>
          <img src={poster} alt="" className="size-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <span className="relative flex size-12 items-center justify-center rounded-full bg-white/90 text-primary-dark">
              <span className="absolute inset-0 rounded-full bg-white/40 motion-safe:animate-ping" />
              <FontAwesomeIcon icon={faPlay} className="relative" />
            </span>
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur">قريبًا</span>
          </div>
        </>
      )}
      {!video && (
        <p className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3 text-sm font-bold text-white">
          <FontAwesomeIcon icon={faVideo} className="text-[#e9cf8f]" />
          {title}
        </p>
      )}
    </div>
  )
}

function Playlist() {
  const { tracks } = useLandingData().footerMedia
  const audioRef = useRef(null)
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)

  const toggle = (index) => {
    const audio = audioRef.current
    if (!audio || !tracks[index].audio) return
    if (current === index) {
      if (playing) audio.pause()
      else audio.play()
      return
    }
    audio.src = tracks[index].audio
    setCurrent(index)
    audio.play()
  }

  return (
    <ul className="grid gap-2.5 sm:grid-cols-3">
      {tracks.map((track, i) => {
        const active = current === i && playing
        return (
          <li key={track.title}>
            <button
              type="button"
              onClick={() => toggle(i)}
              disabled={!track.audio}
              title={track.audio ? undefined : 'سيتم إضافة التسجيل قريبًا'}
              className={`group flex w-full items-center gap-3 rounded-xl p-2.5 text-start ring-1 transition disabled:cursor-default ${
                active ? 'bg-white/15 ring-[#e9cf8f]/50' : 'bg-white/5 ring-white/10 enabled:hover:bg-white/10'
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm transition ${
                  active ? 'bg-[#e9cf8f] text-primary-dark' : 'bg-white/10 text-[#e9cf8f] group-enabled:group-hover:bg-[#e9cf8f] group-enabled:group-hover:text-primary-dark'
                }`}
              >
                <FontAwesomeIcon icon={active ? faPause : track.audio ? faPlay : faHeadphones} />
              </span>
              <span className="flex-1">
                <span className="block font-ruqaa text-lg leading-tight text-white">{track.title}</span>
                <span className="block text-[11px] text-white/60">{track.reciter}</span>
              </span>
              {/* Equalizer bars while playing */}
              {active ? (
                <span className="flex h-5 items-end gap-0.5" aria-hidden="true">
                  {[0, 150, 300, 450].map((delay) => (
                    <span
                      key={delay}
                      className="w-1 rounded-full bg-[#e9cf8f] motion-safe:animate-[eq_0.9s_ease-in-out_infinite]"
                      style={{ animationDelay: `${delay}ms`, height: '40%' }}
                    />
                  ))}
                </span>
              ) : (
                !track.audio && <span className="text-[11px] text-white/40">قريبًا</span>
              )}
            </button>
          </li>
        )
      })}
      <audio ref={audioRef} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    </ul>
  )
}

// ---------- Footer ----------

function FooterHeading({ children }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
      <span className="h-4 w-1 rounded-full bg-[#e9cf8f]" />
      {children}
    </h3>
  )
}

function Footer() {
  const { email, whatsappNumber, socialLinks } = useLandingData().contact
  const socials = socialIcons
    .map((social) => ({ ...social, href: socialLinks[social.key] }))
    .filter((social) => social.href)

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#5f6c2c] via-primary-dark to-[#3c461c] text-white/80">
      <StarPattern className="text-[#e9cf8f] opacity-[0.07]" />

      <div className="relative mx-auto max-w-[1200px] px-6">
        {/* Media band */}
        <div className="grid items-center gap-6 border-b border-white/10 py-10 lg:grid-cols-[300px_1fr] lg:gap-10">
          <FeaturedVideo />
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#e9cf8f]">
              <FontAwesomeIcon icon={faHeadphones} />
              من حلقاتنا
            </span>
            <h2 className="mb-5 text-2xl font-extrabold leading-snug text-white">
              استمع لبراعمنا وهم <span className="text-[#e9cf8f]">يتلون القرآن</span>
            </h2>
            <Playlist />
          </div>
        </div>

        {/* Link columns */}
        <div className="grid gap-8 py-10 text-sm sm:grid-cols-2 lg:grid-cols-[1.3fr_1.2fr_1fr]">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-3">
              <img src={logoEmblem} alt="" className="size-12 rounded-full bg-white object-cover object-top p-1" />
              <span className="leading-none">
                <span className="block text-2xl font-bold text-white">مزيـد</span>
                <span className="mt-1.5 block text-xs text-[#e9cf8f]">ليزدادوا إيمانا</span>
              </span>
            </Link>
            <p className="leading-relaxed">
              أكاديمية متخصصة في تعليم وتحفيظ القرآن الكريم والعلوم الشرعية وتأسيس الأطفال.
            </p>
            {socials.length > 0 && (
              <div className="mt-4 flex gap-2.5">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-[#e9cf8f] hover:text-primary-dark"
                  >
                    <FontAwesomeIcon icon={social.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <FooterHeading>روابط سريعة</FooterHeading>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="group inline-flex items-center gap-2 transition hover:text-[#e9cf8f]">
                    <FontAwesomeIcon icon={faChevronLeft} className="text-[10px] text-[#e9cf8f]/60 transition-transform group-hover:-translate-x-1" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading>تواصل معنا</FooterHeading>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <FontAwesomeIcon icon={faClock} className="text-[#e9cf8f]" />
                حلقات أونلاين لكل الأعمار ومن الجنسين
              </li>
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="flex items-center gap-3 transition hover:text-[#e9cf8f]">
                    <FontAwesomeIcon icon={faEnvelope} className="text-[#e9cf8f]" />
                    <span dir="ltr">{email}</span>
                  </a>
                </li>
              )}
            </ul>
            <WhatsappLink
              placement="footer"
              className="mt-4 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-5 py-2.5 font-bold text-white shadow-[0_10px_22px_-10px_rgba(37,211,102,0.8)] transition hover:-translate-y-0.5 hover:bg-[#1fbd5a]"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
              {whatsappNumber ? <span dir="ltr">+{whatsappNumber}</span> : 'راسلنا على واتساب'}
            </WhatsappLink>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-white/10 py-4 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} أكاديمية مزيد. جميع الحقوق محفوظة.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2 font-bold text-[#e9cf8f] transition hover:text-white"
          >
            العودة للأعلى
            <span className="flex size-8 items-center justify-center rounded-full bg-white/10 transition group-hover:-translate-y-1 group-hover:bg-[#e9cf8f] group-hover:text-primary-dark">
              <FontAwesomeIcon icon={faArrowUp} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
