import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments } from '@fortawesome/free-regular-svg-icons'
import {
  faArrowUpRightFromSquare,
  faBookQuran,
  faChartLine,
  faGear,
  faLock,
  faMedal,
  faRightFromBracket,
  faTags,
} from '@fortawesome/free-solid-svg-icons'
import { createAdminApi, isUnauthorized } from '../../services/admin-api'
import { AdminSessionContext } from './admin-session'

// Admin panel shell: sign-in with the API's admin secret, then tabs for stats and every editable part of the site.
// The secret is kept in sessionStorage for this tab only; it is never part of the site's code.
const SECRET_KEY = 'mazeed:admin-secret'

const readSecret = () => {
  try {
    return sessionStorage.getItem(SECRET_KEY) || ''
  } catch {
    return ''
  }
}

const saveSecret = (value) => {
  try {
    if (value) sessionStorage.setItem(SECRET_KEY, value)
    else sessionStorage.removeItem(SECRET_KEY)
  } catch {
    // Private mode: the secret just isn't remembered
  }
}

const NAV = [
  { to: 'analytics', label: 'الإحصائيات', icon: faChartLine },
  { to: 'settings', label: 'الإعدادات العامة', icon: faGear },
  { to: 'services', label: 'الخدمات', icon: faBookQuran },
  { to: 'plans', label: 'الباقات', icon: faTags },
  { to: 'showcase', label: 'نماذج الأعمال', icon: faMedal },
  { to: 'testimonials', label: 'الآراء', icon: faComments },
]

function LoginForm({ notice, onSignedIn }) {
  const [value, setValue] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(notice)

  const onSubmit = async (event) => {
    event.preventDefault()
    const secret = value.trim()
    if (!secret) return
    setChecking(true)
    setError(null)
    try {
      // Any admin-only request verifies the secret
      await createAdminApi(secret).analyticsSummary()
      saveSecret(secret)
      onSignedIn(secret)
    } catch (err) {
      if (isUnauthorized(err)) setValue('') // clear a wrong secret, like any password field
      setError(isUnauthorized(err) ? 'رمز الإدارة غير صحيح.' : err.message)
      setChecking(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-16 max-w-[420px] rounded-2xl border border-line bg-white p-7 shadow-sm">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-xl text-primary">
        <FontAwesomeIcon icon={faLock} />
      </span>
      <h1 className="mb-1 text-2xl font-extrabold text-primary-dark">لوحة تحكم مزيد</h1>
      <p className="mb-5 text-sm text-muted">لتعديل محتوى الموقع ومتابعة الإحصائيات.</p>
      <label htmlFor="admin-secret" className="mb-2 block font-bold text-ink">
        رمز الإدارة
      </label>
      <input
        id="admin-secret"
        type="password"
        autoComplete="current-password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        dir="ltr"
        className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-primary"
      />
      {error && (
        <p role="alert" className="mt-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={checking}
        className="mt-5 w-full rounded-full bg-primary py-3 font-bold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {checking ? 'جارٍ التحقق…' : 'دخول'}
      </button>
    </form>
  )
}

function AdminLayout() {
  const [secret, setSecret] = useState(readSecret)
  const [notice, setNotice] = useState(null)

  const session = useMemo(() => {
    if (!secret) return null
    const logout = (message = null) => {
      saveSecret('')
      setNotice(message)
      setSecret('')
    }
    return {
      api: createAdminApi(secret),
      logout,
      // Returns a message to show, or null after signing out (wrong / rotated secret)
      handleError: (error) => {
        if (isUnauthorized(error)) {
          logout('انتهت الجلسة أو تغيّر رمز الإدارة. سجّل الدخول مرة أخرى.')
          return null
        }
        return error?.message || 'حدث خطأ غير متوقع.'
      },
    }
  }, [secret])

  return (
    <div className="min-h-svh bg-sand pb-16">
      <title>لوحة التحكم | أكاديمية مزيد</title>
      <meta name="robots" content="noindex, nofollow" />

      {!session ? (
        <div className="px-6">
          <LoginForm key={notice} notice={notice} onSignedIn={setSecret} />
        </div>
      ) : (
        <AdminSessionContext.Provider value={session}>
          <header className="border-b border-line bg-white">
            <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-4">
              <span className="text-lg font-extrabold text-primary-dark">لوحة تحكم مزيد</span>
              <div className="flex gap-2">
                <Link
                  to="/"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-ink hover:border-primary hover:text-primary"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                  الموقع
                </Link>
                <button
                  type="button"
                  onClick={() => session.logout()}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-muted hover:text-ink"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  خروج
                </button>
              </div>
            </div>
            <nav aria-label="أقسام لوحة التحكم" className="mx-auto max-w-[1100px] overflow-x-auto px-6">
              <ul className="flex gap-1">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold transition ${
                          isActive ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
                        }`
                      }
                    >
                      <FontAwesomeIcon icon={item.icon} className="text-xs" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </header>

          <main className="mx-auto w-full max-w-[1100px] px-6 pt-8">
            <Outlet />
          </main>
        </AdminSessionContext.Provider>
      )}
    </div>
  )
}

export default AdminLayout
