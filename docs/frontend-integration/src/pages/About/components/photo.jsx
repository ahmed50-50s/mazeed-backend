import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-regular-svg-icons'
import StarPattern from '../../../components/star-pattern'

// Optional photos: drop them into src/assets/about/ and src/assets/teachers/ (jpg, png or webp).
// The glob resolves at build time, so a missing file never breaks the build.
const photos = import.meta.glob('../../../assets/{about,teachers}/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

// name is the path under src/assets without extension, e.g. 'about/story', or a full URL from the API
const findPhoto = (name) => {
  if (/^(https?:)?\/\//.test(name) || name.startsWith('/')) return name
  const key = Object.keys(photos).find((path) => path.replace(/\.\w+$/, '').endsWith(`/assets/${name}`))
  return key ? photos[key] : null
}

// Shows the photo, or a soft gold/olive placeholder while it is missing or fails to load.
// className sets size and rounding for both states.
function Photo({ name, alt, className = '' }) {
  const src = findPhoto(name)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6eedb] via-[#f1ecd8] to-[#e3e6c9] ${className}`}
      >
        <StarPattern className="text-gold opacity-[0.14]" />
        <FontAwesomeIcon icon={faImage} className="relative text-3xl text-gold/45" />
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}

export default Photo
