// Helpers for the admin forms. Field specs live in admin-config.js; values use the API's own shape,
// and paths are dotted ("price.value", "stats.0.label") like the API's validation error `field`s.

const isIndex = (key) => /^\d+$/.test(key)

export function getIn(obj, path) {
  if (!path) return obj
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

export function setIn(obj, path, value) {
  const [key, ...rest] = path.split('.')
  const base = obj ?? (isIndex(key) ? [] : {})
  const next = Array.isArray(base) ? [...base] : { ...base }
  next[key] = rest.length ? setIn(base[key], rest.join('.'), value) : value
  return next
}

// Fields hidden by `showIf` are neither validated nor sent
const visibleFields = (fields, values) => fields.filter((field) => !field.showIf || field.showIf(values))

const EMPTY_BY_TYPE = { checkbox: false, stringList: [], objectList: [], pairs: [], url: '', number: '' }

export function emptyValues(fields) {
  return fields.reduce(
    (acc, field) => setIn(acc, field.name, field.default ?? EMPTY_BY_TYPE[field.type] ?? ''),
    {},
  )
}

// API document → form values: fills every field so inputs are always controlled
export function toFormValues(fields, doc) {
  return fields.reduce((acc, field) => {
    let value = getIn(doc, field.name)
    if (field.type === 'objectList') {
      value = (value ?? []).map((item) => ({ ...item, ...toFormValues(field.itemFields, item) }))
    }
    if (value === undefined || value === null) value = field.default ?? EMPTY_BY_TYPE[field.type] ?? ''
    return setIn(acc, field.name, value)
  }, {})
}

function cleanValue(field, value) {
  switch (field.type) {
    case 'number':
      return value === '' ? undefined : Number(value)
    case 'checkbox':
      return Boolean(value)
    case 'url': {
      const url = String(value ?? '').trim()
      return url || (field.allowEmpty ? '' : null)
    }
    case 'stringList':
      return (value ?? []).map((s) => s.trim()).filter(Boolean)
    case 'pairs':
      return (value ?? []).map(([a = '', b = '']) => [a.trim(), b.trim()]).filter(([a, b]) => a && b)
    case 'objectList':
      return (value ?? []).map((item) => cleanForSave(field.itemFields, item))
    default:
      return typeof value === 'string' ? value.trim() : value
  }
}

const isEmptyValue = (value) => value == null || value === '' || (Array.isArray(value) && value.length === 0)

// Form values → request body: only the spec's fields, typed and trimmed
export function cleanForSave(fields, values) {
  return visibleFields(fields, values).reduce((acc, field) => {
    const value = cleanValue(field, getIn(values, field.name))
    if (value === undefined || (field.omitEmpty && isEmptyValue(value))) return acc
    return setIn(acc, field.name, value)
  }, {})
}

// Client-side checks with Arabic messages, mirroring the API's rules. Returns { [path]: message }.
export function validate(fields, values, prefix = '') {
  const errors = {}
  for (const field of visibleFields(fields, values)) {
    const path = prefix ? `${prefix}.${field.name}` : field.name
    const value = getIn(values, field.name)

    if (field.type === 'objectList') {
      ;(value ?? []).forEach((item, i) => Object.assign(errors, validate(field.itemFields, item, `${path}.${i}`)))
      if (field.required && !(value ?? []).length) errors[path] = 'أضف عنصرًا واحدًا على الأقل'
      continue
    }

    const empty = field.type === 'checkbox' ? false : isEmptyValue(typeof value === 'string' ? value.trim() : value)
    if (field.required && empty) errors[path] = 'هذا الحقل مطلوب'
    else if (field.max && typeof value === 'string' && value.trim().length > field.max) {
      errors[path] = `الحد الأقصى ${field.max} حرف`
    } else if (field.type === 'number' && !empty && Number.isNaN(Number(value))) errors[path] = 'اكتب رقمًا'
  }
  return errors
}

// "stats.1.label" → "أرقام الأكاديمية ← العنصر ٢ ← النص", for error summaries
export function labelForPath(fields, path) {
  const parts = path.split('.')
  for (const field of fields) {
    const nameParts = field.name.split('.')
    if (nameParts.some((p, i) => p !== parts[i])) continue
    const rest = parts.slice(nameParts.length)
    if (field.type === 'objectList' && rest.length && isIndex(rest[0])) {
      const inner = rest.length > 1 ? labelForPath(field.itemFields, rest.slice(1).join('.')) : null
      const item = `${field.label} ← العنصر ${(Number(rest[0]) + 1).toLocaleString('ar-EG')}`
      return inner ? `${item} ← ${inner}` : item
    }
    return field.label
  }
  return path
}

// API validation details ([{ field, message }]) → { [path]: message }
export const apiErrorsToMap = (error) =>
  Object.fromEntries((error?.details ?? []).map((d) => [d.field, d.message]))
