import { whatsappLink } from '../config'
import { useLandingData } from '../hooks/use-landing-data'
import { serviceInquiryMessage } from '../lib/whatsapp-message'
import { trackGeneralWhatsappClick, trackServiceWhatsappClick } from '../services/api'

// Where each general WhatsApp button sits → which message from the site settings it sends.
// The placement is also what the admin stats page reports, so keep it in sync with the API's GENERAL_PLACEMENTS.
const PLACEMENT_MESSAGES = {
  hero: 'contactInquiry',
  footer: 'footer',
  contactInquiry: 'contactInquiry',
  contactTrial: 'contactTrial',
  homeAbout: 'trialInquiry',
  whyUs: 'trialInquiry',
  aboutIntro: 'trialInquiry',
  aboutTrial: 'aboutTrial',
}

// Opens WhatsApp in one click with a ready message; the visitor chooses whether to send it.
// - General buttons pass `placement` (see PLACEMENT_MESSAGES).
// - Service / plan buttons pass `service` = { type: 'service' | 'plan', id, name, place? }: the message names the item.
// Every click is counted in the background; counting never delays or blocks the link.
function WhatsappLink({ placement, service, onClick, children, ...props }) {
  const { contact, whatsappMessages } = useLandingData()
  const message = service
    ? serviceInquiryMessage(service.name, service.place)
    : whatsappMessages[PLACEMENT_MESSAGES[placement]]

  return (
    <a
      href={whatsappLink(message, contact.whatsappNumber)}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        // Built-in fallback items have no id (API unreachable): nothing to count, the link still opens
        if (service?.id) trackServiceWhatsappClick(service.type, service.id)
        else if (placement) trackGeneralWhatsappClick(placement)
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </a>
  )
}

export default WhatsappLink
