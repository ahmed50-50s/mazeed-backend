import {
  faCalendarCheck as farCalendarCheck,
  faCalendarDays,
  faCircleCheck,
  faClipboard,
  faClock,
  faComments,
  faEye,
  faFileLines,
  faFlag,
  faGem,
  faHeart,
} from '@fortawesome/free-regular-svg-icons'
import {
  faAward,
  faBookOpen,
  faBookQuran,
  faBullseye,
  faCalendarCheck,
  faChartLine,
  faChildReaching,
  faChildren,
  faGift,
  faGraduationCap,
  faHandHoldingHeart,
  faLaptop,
  faLayerGroup,
  faMicrophoneLines,
  faPeopleRoof,
  faRoute,
  faScroll,
  faStar,
  faTrophy,
  faUserGraduate,
  faUserGroup,
  faUsers,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'

// The API stores icons by name ("faBookQuran"); this maps a name back to the icon object.
// Unprefixed names use the style the site already uses for that icon; "far:" picks the regular style
// where the site uses both. To let the admin use a new icon, import it here.
const icons = {
  faAward,
  faBookOpen,
  faBookQuran,
  faBullseye,
  faCalendarCheck,
  'far:faCalendarCheck': farCalendarCheck,
  faCalendarDays,
  faChartLine,
  faChildReaching,
  faChildren,
  faCircleCheck,
  faClipboard,
  faClock,
  faComments,
  faEye,
  faFileLines,
  faFlag,
  faGem,
  faGift,
  faGraduationCap,
  faHandHoldingHeart,
  faHeart,
  faLaptop,
  faLayerGroup,
  faMicrophoneLines,
  faPeopleRoof,
  faRoute,
  faScroll,
  faStar,
  faTrophy,
  faUserGraduate,
  faUserGroup,
  faUsers,
  faWallet,
}

// Names the admin panel offers in its icon picker
export const ICON_NAMES = Object.keys(icons)

// Unknown names fall back to a neutral check so a typo in the admin never breaks a card
export const getIcon = (name) => icons[name] ?? icons[name?.replace(/^fa[rsb]:/, '')] ?? faCircleCheck
