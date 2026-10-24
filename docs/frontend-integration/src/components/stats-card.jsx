import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLandingData } from '../hooks/use-landing-data'
import { getIcon } from '../lib/icons'

// Academy numbers in a floating card, shared by the home hero and the about page. Stays 3 columns on mobile.
function StatsCard({ className = '' }) {
  const { stats } = useLandingData()

  return (
    <ul
      className={`relative grid grid-cols-3 rounded-3xl border border-line bg-surface shadow-[0_24px_60px_-24px_rgba(60,45,20,0.3)] ${className}`}
    >
      {/* Thin olive accent along the top edge */}
      <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      {stats.map((stat, i) => (
        <li
          key={stat.label}
          className={`group relative flex flex-col items-center gap-3 px-2 py-6 text-center sm:px-4 lg:flex-row lg:justify-center lg:gap-5 lg:px-8 lg:py-8 lg:text-start ${
            i > 0 ? 'before:absolute before:inset-y-6 before:start-0 before:w-px before:bg-line lg:before:inset-y-8' : ''
          }`}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_8px_18px_-6px_rgba(107,122,50,0.6)] transition-transform duration-300 group-hover:-translate-y-1 lg:size-14 lg:text-[1.35rem]">
            <FontAwesomeIcon icon={getIcon(stat.icon)} />
          </span>
          <span className="flex flex-col">
            <strong dir="ltr" className="text-2xl font-extrabold leading-none text-ink lg:text-end lg:text-4xl">
              <span className="text-primary">+</span>
              {stat.value}
            </strong>
            <span className="mt-2 text-sm font-medium leading-snug text-muted lg:text-base">{stat.label}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export default StatsCard
