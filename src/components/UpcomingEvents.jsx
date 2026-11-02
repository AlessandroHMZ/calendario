import { useState, useMemo } from 'react'
import {
  Heart, Plus, CalendarDays, Camera, Star,
  Sun, Moon, LogOut, Shuffle, ChevronRight,
} from 'lucide-react'
import { useAuth }  from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import EventBadge   from './EventBadge'

const COLOR_DOT = {
  rose:    'bg-rose-400',
  sky:     'bg-sky-400',
  amber:   'bg-amber-400',
  emerald: 'bg-emerald-400',
  violet:  'bg-violet-400',
  orange:  'bg-orange-400',
  pink:    'bg-pink-400',
  teal:    'bg-teal-400',
}
const COLOR_PILL = {
  rose:    'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200',
  sky:     'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-200',
  amber:   'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200',
  violet:  'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-200',
  orange:  'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-200',
  pink:    'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-200',
  teal:    'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-200',
}
const DEFAULT_COLOR = { evento: 'rose', recuerdo: 'amber' }

function getDot(ev) {
  return COLOR_DOT[ev.color] || COLOR_DOT[DEFAULT_COLOR[ev.tipo]] || 'bg-rose-400'
}
function getPill(ev) {
  return COLOR_PILL[ev.color] || COLOR_PILL[DEFAULT_COLOR[ev.tipo]] || COLOR_PILL.rose
}

function formatDateShort(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}
function formatDateLong(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function Sidebar({
  events,
  onNewEvent,
  onEventClick,
  activeFilter,
  onFilterChange,
}) {
  const { currentUser, logout } = useAuth()
  const { dark, toggle }        = useTheme()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const initial = currentUser?.displayName?.[0]?.toUpperCase() || '?'

  // Counts for filters
  const counts = {
    all:       events.length,
    evento:    events.filter((e) => e.tipo === 'evento').length,
    recuerdo:  events.filter((e) => e.tipo === 'recuerdo').length,
    destacado: events.filter((e) => e.destacado === true).length,
  }

  const FILTERS = [
    { id: null,        label: 'Todos los eventos', dot: 'bg-stone-300 dark:bg-stone-500', count: counts.all },
    { id: 'evento',    label: 'Eventos',            dot: 'bg-rose-400',                   count: counts.evento },
    { id: 'recuerdo',  label: 'Recuerdos',          dot: 'bg-amber-400',                  count: counts.recuerdo },
    { id: 'destacado', label: 'Destacados',          dot: 'bg-yellow-400',                 count: counts.destacado },
  ]

  // Upcoming events
  const upcoming = useMemo(() => (
    events
      .filter((e) => e.fecha_fin >= today)
      .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))
      .slice(0, 6)
  ), [events, today])

  // Recuerdo del día
  const recuerdoDelDia = useMemo(() => {
    const pasados = events.filter((e) => e.fecha_fin < today)
    if (!pasados.length) return null
    const seed = parseInt(today.replace(/-/g, ''), 10)
    return pasados[seed % pasados.length]
  }, [events, today])

  return (
    <aside className="w-64 shrink-0 h-screen flex flex-col bg-white dark:bg-stone-900 border-r border-rose-100 dark:border-stone-700 shadow-soft">

      {/* ── Logo + frase ── */}
      <div className="shrink-0 px-5 pt-6 pb-5">
        <div className="flex items-center gap-2 mb-5">
          <Heart size={17} className="text-wine fill-wine shrink-0" />
          <span className="font-display text-base text-wine dark:text-rose-300 font-semibold leading-tight tracking-tight">
            Mi amor por ti
          </span>
        </div>

        <button
          onClick={onNewEvent}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5"
        >
          <Plus size={15} strokeWidth={2.5} />
          Nuevo evento
        </button>
      </div>

      {/* ── Filtros ── */}
      <div className="shrink-0 px-4 mb-3">
        <p className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1.5 px-1">
          Filtrar
        </p>
        <ul className="space-y-0.5">
          {FILTERS.map(({ id, label, dot, count }) => {
            const active = activeFilter === id
            return (
              <li key={String(id)}>
                <button
                  onClick={() => onFilterChange(active ? undefined : id)}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                    transition-colors duration-100 text-left
                    ${active
                      ? 'bg-indigo-50 dark:bg-stone-800 text-indigo-700 dark:text-indigo-300'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-indigo-50/60 dark:hover:bg-stone-800/60'}
                  `}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                  <span className={`flex-1 text-sm font-body ${active ? 'font-semibold' : ''}`}>
                    {label}
                  </span>
                  <span className={`
                    text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                    ${active
                      ? 'bg-indigo-700 text-white'
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500'}
                  `}>
                    {count}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Divider */}
      <div className="shrink-0 h-px bg-rose-100 dark:bg-stone-700 mx-4 mb-3" />

      {/* ── Scrollable middle: próximos + recuerdo ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">

        {/* Próximos eventos */}
        <div>
          <p className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1.5 px-1">
            Próximos eventos
          </p>
          {upcoming.length === 0 ? (
            <p className="text-xs text-stone-400 dark:text-stone-500 font-body px-1 py-2">
              Sin eventos próximos
            </p>
          ) : (
            <ul className="space-y-0.5">
              {upcoming.map((ev) => (
                <li key={ev.id}>
                  <button
                    onClick={() => onEventClick(ev.fecha_inicio, ev)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${getDot(ev)}`} />
                      <p className="text-sm font-body text-stone-700 dark:text-stone-200 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors flex-1">
                        {ev.titulo}
                      </p>
                      {ev.destacado && (
                        <Star size={10} className="shrink-0 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 font-body mt-0.5 pl-4">
                      {formatDateShort(ev.fecha_inicio)}
                      {ev.fecha_fin !== ev.fecha_inicio && ` → ${formatDateShort(ev.fecha_fin)}`}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recuerdo del día */}
        {recuerdoDelDia && (
          <div>
            <p className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1">
              <Shuffle size={10} />
              Recuerdo del día
            </p>
            <button
              onClick={() => onEventClick(recuerdoDelDia.fecha_inicio, recuerdoDelDia)}
              className={`w-full text-left p-3 rounded-xl transition-all hover:opacity-90 hover:shadow-soft ${getPill(recuerdoDelDia)}`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <EventBadge tipo={recuerdoDelDia.tipo} showLabel={true} />
                {recuerdoDelDia.destacado && (
                  <Star size={11} className="text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                )}
              </div>
              <p className="text-sm font-display font-semibold leading-snug line-clamp-2 mt-1.5">
                {recuerdoDelDia.titulo}
              </p>
              {recuerdoDelDia.descripcion && (
                <p className="text-[11px] font-body opacity-60 line-clamp-1 mt-0.5">
                  {recuerdoDelDia.descripcion}
                </p>
              )}
              <p className="text-[10px] font-body opacity-50 mt-1.5 capitalize">
                {formatDateLong(recuerdoDelDia.fecha_inicio)}
              </p>
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom: usuario + controles ── */}
      <div className="shrink-0 px-4 py-4 border-t border-rose-100 dark:border-stone-700">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {initial}
          </div>

          {/* Nombre + email */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 font-body truncate leading-tight">
              {currentUser?.displayName || 'Usuario'}
            </p>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 font-body truncate">
              {currentUser?.email}
            </p>
          </div>

          {/* Dark mode */}
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
            title={dark ? 'Modo claro' : 'Modo oscuro'}
          >
            {dark
              ? <Sun  size={15} className="text-amber-400" />
              : <Moon size={15} className="text-stone-400" />
            }
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-stone-800 text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0"
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}