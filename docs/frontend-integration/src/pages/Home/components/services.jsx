import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBookQuran } from '@fortawesome/free-solid-svg-icons'
import WhatsappLink from '../../../components/whatsapp-link'
import { useLandingData } from '../../../hooks/use-landing-data'
import { getIcon } from '../../../lib/icons'

function Services() {
  const { services } = useLandingData()

  return (
    <section id="courses" className="scroll-mt-[77px] section-screen border-t border-line bg-sand py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="mx-auto mb-14 max-w-[640px] text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-1.5 text-sm font-bold text-primary">
            <FontAwesomeIcon icon={faBookQuran} />
            مسارات تعليمية متكاملة
          </span>
          <h2 className="text-[clamp(2rem,3.6vw,2.8rem)] font-extrabold leading-tight text-primary-dark">
            خدماتنا وبرامجنا القرآنية
          </h2>
          <p className="mt-4 text-lg leading-loose text-muted">
            خطط تعليمية مصممة بعناية لتلائم احتياجات كل طالب، وفق أعلى معايير الضبط القرآني والتربوي.
          </p>
        </div>

        {/* 4 cards on the first row, 3 wider cards on the second */}
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-12">
          {services.map((service, i) => (
            <li
              key={service.title}
              className={`group flex flex-col rounded-3xl border bg-white p-7 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-24px_rgba(60,45,20,0.35)] ${
                i < 4 ? 'lg:col-span-3' : 'lg:col-span-4'
              } ${service.featured ? 'border-gold/40 shadow-[0_18px_40px_-26px_rgba(184,145,63,0.6)]' : 'border-line/70 shadow-sm'} ${
                i === services.length - 1 ? 'sm:max-lg:col-span-2' : ''
              }`}
            >
              <span
                className={`mb-5 flex size-14 items-center justify-center rounded-full text-xl transition-colors duration-300 ${
                  service.featured
                    ? 'bg-gold/20 text-gold group-hover:bg-gold group-hover:text-white'
                    : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={getIcon(service.icon)} />
              </span>

              <span
                className={`mb-3 self-start rounded-full px-3 py-1 text-xs font-bold ${
                  service.featured ? 'bg-gold/15 text-gold' : 'bg-sand text-primary'
                }`}
              >
                {service.badge}
              </span>

              <h3 className="mb-3 text-xl font-bold text-ink">{service.title}</h3>
              <p className="mb-6 leading-relaxed text-muted">{service.description}</p>

              {/* Opens WhatsApp directly with a message naming this service */}
              <WhatsappLink
                service={{ type: 'service', id: service.id, name: service.title }}
                className="mt-auto flex items-center justify-between border-t border-line/70 pt-5 text-sm font-bold text-ink transition-colors hover:text-primary"
              >
                {service.link}
                <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
              </WhatsappLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Services
