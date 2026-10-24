import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons'
import { faArrowDown, faArrowUp, faPen, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { RESOURCES } from './admin-config'
import { useAdminSession } from './admin-session'
import { ErrorSummary, FieldList } from './fields'
import { apiErrorsToMap, cleanForSave, emptyValues, labelForPath, setIn, toFormValues, validate } from './form-utils'

// One admin tab per content collection (services, plans, showcase, testimonials): list, reorder, show/hide, edit.
const SAVED = 'تم الحفظ. يظهر التعديل في الموقع خلال دقيقة تقريبًا.'

const byOrder = (a, b) => a.order - b.order || String(a.createdAt).localeCompare(String(b.createdAt))

function Editor({ spec, item, defaults, nextOrder, onSaved, onCancel }) {
  const { api, handleError } = useAdminSession()
  const [values, setValues] = useState(() => (item ? toFormValues(spec.fields, item) : { ...emptyValues(spec.fields), ...defaults }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    const found = validate(spec.fields, values)
    setErrors(found)
    setFormError(null)
    if (Object.keys(found).length) return

    const body = cleanForSave(spec.fields, values)
    setSaving(true)
    try {
      if (item) await api.update(spec.path, item.id, body)
      else await api.create(spec.path, { ...body, order: nextOrder })
      onSaved(SAVED)
    } catch (error) {
      setSaving(false)
      const message = handleError(error)
      if (!message) return
      const fieldErrors = apiErrorsToMap(error)
      setErrors(fieldErrors)
      if (!Object.keys(fieldErrors).length) setFormError(message)
    }
  }

  const summary = Object.entries(errors).map(([path, message]) => ({ label: labelForPath(spec.fields, path), message }))

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-6 text-xl font-extrabold text-ink">
        {item ? `تعديل: ${spec.itemTitle(item)}` : `إضافة ${spec.singular}`}
      </h2>
      <ErrorSummary items={summary} />
      {formError && (
        <p role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          {formError}
        </p>
      )}
      <FieldList fields={spec.fields} values={values} onChange={(name, v) => setValues((prev) => setIn(prev, name, v))} errors={errors} />
      <div className="mt-8 flex gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-primary px-8 py-3 font-bold text-white hover:bg-primary-dark disabled:opacity-60">
          {saving ? 'جارٍ الحفظ…' : 'حفظ'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="rounded-full border border-line px-6 py-3 font-bold text-muted hover:text-ink">
          إلغاء
        </button>
      </div>
    </form>
  )
}

function ResourceManager({ spec }) {
  const { api, handleError } = useAdminSession()
  const [items, setItems] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [group, setGroup] = useState(spec.groupBy?.options[0].value)
  // null = list view; { item: null } = new; { item } = edit
  const [editing, setEditing] = useState(null)
  const [flash, setFlash] = useState(null)
  const [busy, setBusy] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const reload = () => setReloadKey((k) => k + 1)

  useEffect(() => {
    let current = true
    api
      .list(spec.path)
      .then((list) => {
        if (!current) return
        setItems(list.sort(byOrder))
        setLoadError(null)
      })
      .catch((error) => {
        const message = current && handleError(error)
        if (message) setLoadError(message)
      })
    return () => {
      current = false
    }
  }, [api, handleError, spec.path, reloadKey])

  // Runs an admin action, then reloads the list
  const run = async (action, successMessage) => {
    setBusy(true)
    setFlash(null)
    try {
      await action()
      setFlash(successMessage)
    } catch (error) {
      const message = handleError(error)
      if (message) setFlash(`تعذر التنفيذ: ${message}`)
    }
    setBusy(false)
    reload()
  }

  const visible = (items ?? []).filter((item) => !spec.groupBy || item[spec.groupBy.field] === group)
  const nextOrder = Math.max(-1, ...(items ?? []).map((item) => item.order)) + 1

  // Moves an item one step within the visible list by rewriting the order values of the visible items
  const reorder = (from, to) =>
    run(async () => {
      let slots = visible.map((item) => item.order).sort((a, b) => a - b)
      if (new Set(slots).size !== slots.length) slots = visible.map((_, k) => (slots[0] ?? 0) + k)
      const next = [...visible]
      next.splice(to, 0, next.splice(from, 1)[0])
      await Promise.all(
        next.map((item, k) => (item.order !== slots[k] ? api.update(spec.path, item.id, { order: slots[k] }) : null)),
      )
    }, 'تم تغيير الترتيب.')

  const toggle = (item) =>
    run(() => api.update(spec.path, item.id, { isActive: !item.isActive }), item.isActive ? 'تم الإخفاء من الموقع.' : 'أصبح ظاهرًا في الموقع.')

  const remove = (item) => {
    if (!window.confirm(`حذف «${spec.itemTitle(item)}»؟ لا يمكن التراجع عن الحذف.`)) return
    run(() => api.remove(spec.path, item.id), 'تم الحذف.')
  }

  if (editing) {
    return (
      <Editor
        spec={spec}
        item={editing.item}
        defaults={spec.groupBy ? { [spec.groupBy.field]: group } : {}}
        nextOrder={nextOrder}
        onCancel={() => setEditing(null)}
        onSaved={(message) => {
          setEditing(null)
          setFlash(message)
          reload()
        }}
      />
    )
  }

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[640px]">
          <h1 className="text-3xl font-extrabold text-primary-dark">{spec.title}</h1>
          <p className="mt-1 text-muted">{spec.description}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ item: null })}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
        >
          <FontAwesomeIcon icon={faPlus} />
          إضافة {spec.singular}
        </button>
      </header>

      {spec.groupBy && (
        <div role="tablist" className="mb-5 flex flex-wrap gap-2">
          {spec.groupBy.options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={group === option.value}
              onClick={() => setGroup(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                group === option.value ? 'bg-primary-dark text-white' : 'border border-line bg-white text-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {flash && (
        <p role="status" className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-bold text-primary-dark">
          {flash}
        </p>
      )}

      {loadError && (
        <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-bold">تعذر تحميل البيانات.</p>
          <p className="mt-1 text-sm">{loadError}</p>
        </div>
      )}

      {items === null && !loadError && <p className="py-16 text-center text-muted">جارٍ التحميل…</p>}

      {items !== null && visible.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-muted">
          لا يوجد عناصر بعد. اضغط «إضافة {spec.singular}». (طالما القسم فارغ، يعرض الموقع المحتوى الافتراضي.)
        </p>
      )}

      <ul className={`space-y-3 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        {visible.map((item, i) => (
          <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <button type="button" aria-label="لأعلى" title="لأعلى" disabled={i === 0} onClick={() => reorder(i, i - 1)} className="text-muted hover:text-primary disabled:opacity-25">
                <FontAwesomeIcon icon={faArrowUp} />
              </button>
              <button type="button" aria-label="لأسفل" title="لأسفل" disabled={i === visible.length - 1} onClick={() => reorder(i, i + 1)} className="text-muted hover:text-primary disabled:opacity-25">
                <FontAwesomeIcon icon={faArrowDown} />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">
                {spec.itemTitle(item)}
                {!item.isActive && <span className="ms-2 rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-muted">مخفي</span>}
                {item.featured && <span className="ms-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">مميز</span>}
              </p>
              {spec.itemSubtitle && <p className="truncate text-sm text-muted">{spec.itemSubtitle(item)}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggle(item)}
                className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm font-bold text-muted hover:text-ink"
              >
                <FontAwesomeIcon icon={item.isActive ? faEyeSlash : faEye} />
                {item.isActive ? 'إخفاء' : 'إظهار'}
              </button>
              <button
                type="button"
                onClick={() => setEditing({ item })}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-3.5 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white"
              >
                <FontAwesomeIcon icon={faPen} />
                تعديل
              </button>
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label={`حذف ${spec.itemTitle(item)}`}
                className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm font-bold text-red-700 hover:border-red-300 hover:bg-red-50"
              >
                <FontAwesomeIcon icon={faTrashCan} />
                حذف
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function ResourcePage() {
  const { resource } = useParams()
  const spec = RESOURCES[resource]
  if (!spec) return <Navigate to="/admin/analytics" replace />
  // key: switching tabs starts with fresh state
  return <ResourceManager key={resource} spec={spec} />
}

export default ResourcePage
