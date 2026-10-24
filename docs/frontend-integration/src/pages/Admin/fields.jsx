import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowUp, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { getIcon, ICON_NAMES } from '../../lib/icons'
import { emptyValues, getIn, setIn } from './form-utils'

// Generic form fields for the admin panel, driven by the specs in admin-config.js

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 aria-invalid:border-red-400'

const fieldId = (path) => `field-${path.replace(/\W/g, '-')}`

function IconButton({ icon, label, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex size-8 items-center justify-center rounded-lg border border-line bg-white text-xs transition disabled:opacity-30 ${
        danger ? 'text-red-700 hover:border-red-300 hover:bg-red-50' : 'text-muted hover:border-primary hover:text-primary'
      }`}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  )
}

const move = (list, from, to) => {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

// Up / down / delete controls for one row of a list
function RowControls({ index, length, onMove, onRemove, removeLabel = 'حذف' }) {
  return (
    <div className="flex shrink-0 gap-1">
      <IconButton icon={faArrowUp} label="لأعلى" onClick={() => onMove(index, index - 1)} disabled={index === 0} />
      <IconButton icon={faArrowDown} label="لأسفل" onClick={() => onMove(index, index + 1)} disabled={index === length - 1} />
      {onRemove && <IconButton icon={faTrashCan} label={removeLabel} onClick={() => onRemove(index)} danger />}
    </div>
  )
}

function AddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 inline-flex items-center gap-2 rounded-full border border-dashed border-primary/50 px-4 py-1.5 text-sm font-bold text-primary hover:bg-primary/5"
    >
      <FontAwesomeIcon icon={faPlus} className="text-xs" />
      {label}
    </button>
  )
}

function MediaPreview({ media, url }) {
  if (!url || !/^(https?:\/\/|\/)\S+$/.test(url)) return null
  if (media === 'image') return <img src={url} alt="" className="mt-2 h-24 rounded-lg border border-line object-cover" />
  if (media === 'audio') return <audio src={url} controls preload="none" className="mt-2 w-full" />
  if (media === 'video') return <video src={url} controls preload="none" className="mt-2 h-32 rounded-lg" />
  return null
}

function StringListField({ field, value = [], onChange, id }) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            id={i === 0 ? id : `${id}-${i}`}
            value={item}
            dir={field.dir}
            maxLength={field.max}
            onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
            className={inputClass}
          />
          <RowControls
            index={i}
            length={value.length}
            onMove={(from, to) => onChange(move(value, from, to))}
            onRemove={(index) => onChange(value.filter((_, j) => j !== index))}
          />
        </div>
      ))}
      <AddButton label="إضافة سطر" onClick={() => onChange([...value, ''])} />
    </div>
  )
}

function PairsField({ field, value = [], onChange, id }) {
  const [first, second] = field.pairLabels ?? ['', '']
  const update = (i, j, text) => onChange(value.map((row, r) => (r === i ? row.map((v, c) => (c === j ? text : v)) : row)))
  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input id={i === 0 ? id : `${id}-${i}`} value={row[0] ?? ''} placeholder={first} onChange={(e) => update(i, 0, e.target.value)} className={inputClass} />
          <input value={row[1] ?? ''} placeholder={second} onChange={(e) => update(i, 1, e.target.value)} className={inputClass} />
          <RowControls
            index={i}
            length={value.length}
            onMove={(from, to) => onChange(move(value, from, to))}
            onRemove={(index) => onChange(value.filter((_, j) => j !== index))}
          />
        </div>
      ))}
      <AddButton label="إضافة بند" onClick={() => onChange([...value, ['', '']])} />
    </div>
  )
}

function ObjectListField({ field, value = [], onChange, errors, path }) {
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="rounded-2xl border border-line bg-sand/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-muted">العنصر {(i + 1).toLocaleString('ar-EG')}</span>
            <RowControls
              index={i}
              length={value.length}
              onMove={(from, to) => onChange(move(value, from, to))}
              onRemove={field.fixed ? undefined : (index) => onChange(value.filter((_, j) => j !== index))}
            />
          </div>
          <FieldList
            fields={field.itemFields}
            values={item}
            onChange={(name, v) => onChange(value.map((it, j) => (j === i ? setIn(it, name, v) : it)))}
            errors={errors}
            prefix={`${path}.${i}`}
          />
        </div>
      ))}
      {!field.fixed && (
        <AddButton label="إضافة عنصر" onClick={() => onChange([...value, field.newItem ?? emptyValues(field.itemFields)])} />
      )}
    </div>
  )
}

function Control({ field, value, onChange, errors, path, id, invalid }) {
  const common = { id, 'aria-invalid': invalid || undefined, className: inputClass }
  switch (field.type) {
    case 'textarea':
      return <textarea {...common} rows={3} value={value} maxLength={field.max} onChange={(e) => onChange(e.target.value)} />
    case 'number':
      return <input {...common} type="number" dir="ltr" value={value} onChange={(e) => onChange(e.target.value)} />
    case 'url':
      return (
        <>
          <input {...common} type="url" dir="ltr" value={value ?? ''} placeholder="https://" onChange={(e) => onChange(e.target.value)} />
          <MediaPreview media={field.media} url={value} />
        </>
      )
    case 'checkbox':
      return null // rendered inline by FieldList
    case 'select':
      return (
        <select {...common} value={value} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
    case 'icon':
      return (
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg text-primary">
            <FontAwesomeIcon icon={getIcon(value)} />
          </span>
          <select {...common} dir="ltr" value={value} onChange={(e) => onChange(e.target.value)}>
            {!ICON_NAMES.includes(value) && <option value={value}>{value || '— اختر أيقونة —'}</option>}
            {ICON_NAMES.map((name) => (
              <option key={name} value={name}>
                {name.replace(/^far:/, '').replace(/^fa/, '')}
                {name.startsWith('far:') ? ' (outline)' : ''}
              </option>
            ))}
          </select>
        </div>
      )
    case 'readonly':
      return <p className="rounded-xl bg-sand px-3.5 py-2.5 text-sm font-bold text-ink">{field.format ? field.format(value) : value}</p>
    case 'stringList':
      return <StringListField field={field} value={value} onChange={onChange} id={id} />
    case 'pairs':
      return <PairsField field={field} value={value} onChange={onChange} id={id} />
    case 'objectList':
      return <ObjectListField field={field} value={value} onChange={onChange} errors={errors} path={path} />
    default:
      return <input {...common} type="text" dir={field.dir} value={value ?? ''} placeholder={field.placeholder} maxLength={field.max} onChange={(e) => onChange(e.target.value)} />
  }
}

// Renders the visible fields of a spec. `onChange(name, value)` receives the field's (dotted) name.
export function FieldList({ fields, values, onChange, errors = {}, prefix = '' }) {
  return (
    <div className="space-y-5">
      {fields
        .filter((field) => !field.showIf || field.showIf(values))
        .map((field) => {
          const path = prefix ? `${prefix}.${field.name}` : field.name
          const id = fieldId(path)
          const value = getIn(values, field.name)
          const error = errors[path]
          const set = (v) => onChange(field.name, v)

          if (field.type === 'checkbox') {
            return (
              <label key={field.name} className="flex cursor-pointer items-center gap-3 text-sm font-bold text-ink">
                <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(e.target.checked)} className="size-5 accent-primary" />
                {field.label}
              </label>
            )
          }

          return (
            <div key={field.name}>
              <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
                {field.label}
                {field.required && <span className="ms-1 text-red-600">*</span>}
              </label>
              <Control field={field} value={value} onChange={set} errors={errors} path={path} id={id} invalid={Boolean(error)} />
              {field.help && <p className="mt-1.5 text-xs text-muted">{field.help}</p>}
              {error && (
                <p role="alert" className="mt-1.5 text-xs font-bold text-red-700">
                  {error}
                </p>
              )}
            </div>
          )
        })}
    </div>
  )
}

// Error summary above a form: [{ label, message }]
export function ErrorSummary({ items }) {
  if (!items.length) return null
  return (
    <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="mb-1 font-bold">راجع الحقول التالية:</p>
      <ul className="list-inside list-disc space-y-0.5">
        {items.map((item) => (
          <li key={item.label + item.message}>
            {item.label}: {item.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
