import { useState, useEffect } from 'react'
import { X, Pencil, Trash2, Lock, ChevronDown, CalendarDays, Mail, Camera, Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import EventBadge  from './EventBadge'

const EMPTY_FORM = {
  titulo:       '',
  descripcion:  '',
  fecha_inicio: '',
  fecha_fin:    '',
  tipo:         'evento',
  nota_privada: '',
}

const TYPE_OPTIONS = [
  { value: 'evento',   label: 'Evento',   Icon: CalendarDays, desc: 'Algo que van a hacer juntos' },
  { value: 'mensaje',  label: 'Mensaje',  Icon: Mail,         desc: 'Un mensaje especial' },
  { value: 'recuerdo', label: 'Recuerdo', Icon: Camera,       desc: 'Un momento para no olvidar' },
]

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate = null,
  eventToEdit = null,
  selectedDayEvents = [],
  currentUserId,
}) {
  const { currentUser } = useAuth()
  const [mode, setMode]       = useState('list')
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [showPrivate, setShowPrivate] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (eventToEdit) {
      setForm({
        titulo:       eventToEdit.titulo       || '',
        descripcion:  eventToEdit.descripcion  || '',
        fecha_inicio: eventToEdit.fecha_inicio || '',
        fecha_fin:    eventToEdit.fecha_fin    || '',
        tipo:         eventToEdit.tipo         || 'evento',
        nota_privada: eventToEdit.nota_privada || '',
      })
      setMode('form')
    } else {
      const today = initialDate || new Date().toISOString().split('T')[0]
      setForm({ ...EMPTY_FORM, fecha_inicio: today, fecha_fin: today })
      setMode(selectedDayEvents.length > 0 ? 'list' : 'form')
    }
    setError('')
    setShowPrivate(false)
  }, [isOpen, eventToEdit, initialDate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'fecha_inicio' && next.fecha_fin < value) next.fecha_fin = value
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.titulo.trim())              { setError('El título es obligatorio'); return }
    if (!form.fecha_inicio)               { setError('La fecha de inicio es obligatoria'); return }
    if (form.fecha_fin < form.fecha_inicio){ setError('La fecha fin no puede ser anterior al inicio'); return }

    setSaving(true)
    setError('')
    try {
      await onSave({ ...form, titulo: form.titulo.trim(), descripcion: form.descripcion.trim(), creado_por: currentUser.uid }, eventToEdit?.id)
      onClose()
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este evento?')) return
    await onDelete(id)
    if (selectedDayEvents.length <= 1) onClose()
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  if (!isOpen) return null

  const isFormMode = mode === 'form' || mode === 'form-edit'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm animate-fade-in" />

      <div className="relative w-full sm:max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-modal animate-slide-up max-h-[90vh] flex flex-col overflow-hidden border border-rose-100 dark:border-stone-700">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 dark:border-stone-700">
          <div>
            <h2 className="font-display text-lg text-wine dark:text-rose-300">
              {mode === 'list'
                ? formatDate(initialDate)
                : (eventToEdit ? 'Editar evento' : 'Nuevo evento')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'list' && (
              <button
                onClick={() => { setForm({ ...EMPTY_FORM, fecha_inicio: initialDate, fecha_fin: initialDate }); setMode('form') }}
                className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1"
              >
                <Plus size={14} />
                Añadir
              </button>
            )}
            <button onClick={onClose} className="btn-ghost p-1.5 rounded-full">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">

          {/* LIST MODE */}
          {mode === 'list' && (
            <div className="p-6 space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-10 text-stone-400 dark:text-stone-500 font-body">
                  <CalendarDays size={36} className="mx-auto mb-3 opacity-30" />
                  <p>No hay eventos este día</p>
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div key={ev.id} className="bg-parchment dark:bg-stone-800 rounded-2xl p-4 border border-rose-100 dark:border-stone-700 animate-fade-in">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <EventBadge tipo={ev.tipo} />
                          <span className="font-body font-semibold text-stone-800 dark:text-stone-100 truncate">{ev.titulo}</span>
                        </div>
                        {ev.descripcion && (
                          <p className="text-sm text-stone-500 dark:text-stone-400 font-body line-clamp-2">{ev.descripcion}</p>
                        )}
                        {ev.fecha_inicio !== ev.fecha_fin && (
                          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-body">
                            Hasta {formatDate(ev.fecha_fin)}
                          </p>
                        )}
                        {ev.nota_privada && ev.creado_por === currentUserId && (
                          <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-2">
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                              <Lock size={10} /> Nota privada
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">{ev.nota_privada}</p>
                          </div>
                        )}
                      </div>
                      {ev.creado_por === currentUserId && (
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setForm({ titulo: ev.titulo, descripcion: ev.descripcion, fecha_inicio: ev.fecha_inicio, fecha_fin: ev.fecha_fin, tipo: ev.tipo, nota_privada: ev.nota_privada || '' })
                              setMode('form-edit')
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-stone-700 text-stone-400 hover:text-wine transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-stone-700 text-stone-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FORM MODE */}
          {isFormMode && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-2 font-body">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, tipo: value }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all duration-150 ${
                        form.tipo === value
                          ? 'border-wine dark:border-rose-500 bg-parchment dark:bg-stone-800 scale-[1.02]'
                          : 'border-rose-100 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-rose-300 dark:hover:border-stone-500'
                      }`}
                    >
                      <Icon size={18} className={`mx-auto mb-1 ${form.tipo === value ? 'text-wine dark:text-rose-400' : 'text-stone-400'}`} />
                      <div className="text-xs font-body font-semibold text-stone-700 dark:text-stone-200">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-1.5 font-body">Título *</label>
                <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="¿Qué pasó o pasará?" className="input-field" autoFocus />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-1.5 font-body">Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Cuéntanos más..." rows={3} className="input-field resize-none" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-1.5 font-body">Fecha inicio *</label>
                  <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-1.5 font-body">Fecha fin *</label>
                  <input type="date" name="fecha_fin" value={form.fecha_fin} min={form.fecha_inicio} onChange={handleChange} className="input-field" />
                </div>
              </div>

              {/* Private note */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPrivate(!showPrivate)}
                  className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-body font-semibold transition-colors"
                >
                  <Lock size={13} />
                  Nota privada (solo tú la ves)
                  <ChevronDown size={13} className={`transition-transform ${showPrivate ? 'rotate-180' : ''}`} />
                </button>
                {showPrivate && (
                  <textarea
                    name="nota_privada"
                    value={form.nota_privada}
                    onChange={handleChange}
                    placeholder="Algo que solo quieres recordar tú..."
                    rows={2}
                    className="input-field resize-none mt-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 focus:ring-amber-400"
                  />
                )}
              </div>

              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-2 font-body animate-fade-in">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {isFormMode && (
          <div className="flex gap-3 px-6 py-4 border-t border-rose-100 dark:border-stone-700 bg-white dark:bg-stone-900">
            <button
              type="button"
              onClick={() => mode === 'form-edit' ? setMode('list') : onClose()}
              className="btn-secondary flex-1"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving
                ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : (mode === 'form-edit' ? 'Guardar cambios' : 'Crear evento')
              }
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
