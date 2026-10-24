import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons'
import Reveal from '../../../components/reveal'
import SectionHeading from '../../../components/section-heading'
import { useLandingData } from '../../../hooks/use-landing-data'
import Photo from './photo'

function Teachers() {
  const { stats, about } = useLandingData()
  const { teacherTags: tags, teacherPhotos } = about
  // Photos are URLs, or local names such as 'teachers/1' for src/assets/teachers/1.jpg
  const teachersStat = stats.find((stat) => stat.key === 'teachers')
  return (
    <section className="bg-surface py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <Reveal>
          <div className="grid items-center gap-12 rounded-[28px] border border-line/80 bg-white p-7 shadow-[0_30px_60px_-36px_rgba(60,45,20,0.35)] sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
            <div>
              <SectionHeading align="start" title="نخبة من المحفظين والمحفظات" />
              <p className="mt-6 text-lg leading-loose text-[#4a4a4a]">
                معلمون ومعلمات مؤهلون وذوو خبرة طويلة في التحفيظ والتجويد والقراءات، معلمات للطالبات ومعلمون للطلاب.
              </p>

              <ul className="mt-6 flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-sand px-4 py-1.5 text-sm font-bold text-primary"
                  >
                    <FontAwesomeIcon icon={faCheck} className="text-xs text-gold" />
                    {tag}
                  </li>
                ))}
              </ul>

              <Link
                to="/teachers"
                className="group mt-9 inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-primary px-8 py-3.5 font-bold text-primary transition hover:-translate-y-0.5 hover:bg-primary hover:text-white max-sm:w-full"
              >
                تعرّف على المحفظين
                <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>

            {/* 3x2 grid, middle column dropped a little */}
            <ul className="grid grid-cols-3 gap-3 pb-8 sm:gap-4">
              {teacherPhotos.map((name, i) => (
                <li key={`${i}-${name}`} className={i % 3 === 1 ? 'translate-y-8' : ''}>
                  <Photo name={name} alt="من محفظي ومحفظات أكاديمية مزيد" className="aspect-square w-full rounded-2xl" />
                </li>
              ))}
              {teachersStat && (
                <li>
                  <div className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-2 text-center text-white shadow-[0_14px_30px_-14px_rgba(87,101,42,0.8)]">
                    <strong dir="ltr" className="text-2xl font-extrabold leading-none sm:text-4xl">
                      <span className="text-[#e9cf8f]">+</span>
                      {teachersStat.value}
                    </strong>
                    <span className="mt-1.5 text-xs font-medium leading-snug text-white/85 sm:text-sm">
                      {teachersStat.label}
                    </span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Teachers
