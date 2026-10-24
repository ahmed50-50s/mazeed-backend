import { useEffect, useState } from 'react'
import { SETTINGS_SECTIONS } from './admin-config'
import { useAdminSession } from './admin-session'
import { ErrorSummary, FieldList } from './fields'
import { apiErrorsToMap, cleanForSave, labelForPath, setIn, toFormValues, validate } from './form-utils'

// Site-wide settings tab. Each section is saved on its own (PATCH /settings { [section]: … }), so saving one
// section never overwrites another.

function SectionForm({ section, settings, onSaved }) {
  const { api, handleError } = useAdminSession()
  const [values, setValues] = useState(() => toFormValues(section.fields, settings))
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null) // { ok: boolean, message }
  const [saving, setSaving] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    const found = validate(section.fields, values)
    setErrors(found)
    setStatus(null)
    if (Object.keys(found).length) return

    setSaving(true)
    try {
      const updated = await api.updateSettings(cleanForSave(section.fields, values))
      setValues(toFormValues(section.fields, updated))
      setStatus({ ok: true, message: 'تم الحفظ. يظهر التعديل في الموقع خلال دقيقة تقريبًا.' })
      onSaved(updated)
    } catch (error) {
      const message = handleError(error)
      if (message) {
        const fieldErrors = apiErrorsToMap(error)
        setErrors(fieldErrors)
        if (!Object.keys(fieldErrors).length) setStatus({ ok: false, message })
      }
    }
    setSaving(false)
  }

  const summary = Object.entries(errors).map(([path, message]) => ({ label: labelForPath(section.fields, path), message }))

  return (
    <form id={`section-${section.key}`} onSubmit={onSubmit} noValidate className="scroll-mt-6 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-extrabold text-ink">{section.title}</h2>
      {section.description && <p className="mt-1 text-sm text-muted">{section.description}</p>}
      <div className="mt-6">
        <ErrorSummary items={summary} />
        <FieldList fields={section.fields} values={values} onChange={(name, v) => setValues((prev) => setIn(prev, name, v))} errors={errors} />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={saving} className="rounded-full bg-primary px-8 py-3 font-bold text-white hover:bg-primary-dark disabled:opacity-60">
          {saving ? 'جارٍ الحفظ…' : `حفظ ${section.title}`}
        </button>
        {status && (
          <p role={status.ok ? 'status' : 'alert'} className={`text-sm font-bold ${status.ok ? 'text-primary-dark' : 'text-red-700'}`}>
            {status.message}
          </p>
        )}
      </div>
    </form>
  )
}

function SettingsPage() {
  const { api, handleError } = useAdminSession()
  const [settings, setSettings] = useState(null)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let current = true
    api
      .getSettings()
      .then((data) => current && setSettings(data))
      .catch((error) => {
        const message = current && handleError(error)
        if (message) setLoadError(message)
      })
    return () => {
      current = false
    }
  }, [api, handleError])

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-primary-dark">الإعدادات العامة</h1>
        <p className="mt-1 text-muted">بيانات التواصل، ورسائل واتساب الجاهزة، والأرقام، ونصوص الصفحات. احفظ كل قسم على حدة.</p>
      </header>

      {loadError && (
        <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-bold">تعذر تحميل الإعدادات.</p>
          <p className="mt-1 text-sm">{loadError}</p>
        </div>
      )}
      {!settings && !loadError && <p className="py-16 text-center text-muted">جارٍ التحميل…</p>}

      {settings && (
        <>
          <nav aria-label="أقسام الإعدادات" className="mb-6 flex flex-wrap gap-2">
            {SETTINGS_SECTIONS.map((section) => (
              <a
                key={section.key}
                href={`#section-${section.key}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(`section-${section.key}`)?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-bold text-muted hover:border-primary hover:text-primary"
              >
                {section.title}
              </a>
            ))}
          </nav>
          <div className="space-y-6">
            {SETTINGS_SECTIONS.map((section) => (
              <SectionForm key={section.key} section={section} settings={settings} onSaved={setSettings} />
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default SettingsPage
