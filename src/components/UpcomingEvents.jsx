import { useMemo } from 'react'
import { CalendarDays, Shuffle } from 'lucide-react'
import EventBadge from './EventBadge'

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

function getCardColor(ev) {
  const id = ev.color || DEFAULT_COLOR[ev.tipo] || 'rose'
  return COLOR_PILL[id] || COLOR_PILL.rose
}

export default function Sidebar({ events, onEventClick }) {
  const today = new Date().toISOString().split('T')[0]

  // Próximos eventos (desde hoy)
  const upcoming = useMemo(() => (
    events
      .filter((e) => e.fecha_fin >= today)
      .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))
      .slice(0, 6)
  ), [events, today])

  // Recuerdo del día — evento pasado, mismo índice cada día (determinista por fecha)
  const recuerdoDelDia = useMemo(() => {
    const pasados = events.filter((e) => e.fecha_fin < today)
    if (!pasados.length) return null
    const seed = parseInt(today.replace(/-/g, ''), 10)
    return pasados[seed % pasados.length]
  }, [events, today])

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-')
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  function formatDateLong(dateStr) {
    const [y, m, d] = dateStr.split('-')
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Recuerdo del día ── */}
      {recuerdoDelDia && (
        <div className="card !p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-rose-100 dark:border-stone-700 flex items-center gap-2">
            <Shuffle size={14} className="text-rose-300 dark:text-stone-500" />
            <h3 className="font-display text-base text-wine dark:text-rose-300 font-semibold">
              Recuerdo del día
            </h3>
          </div>
          <button
            onClick={() => onEventClick(recuerdoDelDia.fecha_inicio, recuerdoDelDia)}
            className={`w-full text-left p-5 transition-opacity hover:opacity-80 ${getCardColor(recuerdoDelDia)}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <EventBadge tipo={recuerdoDelDia.tipo} showLabel={true} />
              {recuerdoDelDia.destacado && (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="currentColor" className="shrink-0 text-amber-500 mt-0.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              )}
            </div>
            <p className="font-display text-lg font-semibold leading-snug mb-1 line-clamp-2">
              {recuerdoDelDia.titulo}
            </p>
            {recuerdoDelDia.descripcion && (
              <p className="text-xs font-body line-clamp-2 opacity-70 mb-2">
                {recuerdoDelDia.descripcion}
              </p>
            )}
            <p className="text-xs font-body opacity-60 capitalize">
              {formatDateLong(recuerdoDelDia.fecha_inicio)}
            </p>
            {recuerdoDelDia.creado_por_nombre && (
              <p className="text-[11px] font-body opacity-50 mt-1">
                por {recuerdoDelDia.creado_por_nombre}
              </p>
            )}
          </button>
        </div>
      )}

      {/* ── Próximos eventos ── */}
      <div className="card">
        <h3 className="font-display text-base text-wine dark:text-rose-300 mb-3 font-semibold">
          Próximos eventos
        </h3>

        {upcoming.length === 0 ? (
          <div className="text-center py-6 text-stone-400 dark:text-stone-500">
            <CalendarDays size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-body">No hay eventos próximos</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((ev) => (
              <li key={ev.id}>
                <button
                  onClick={() => onEventClick(ev.fecha_inicio, ev)}
                  className="w-full text-left p-2.5 rounded-xl bg-parchment dark:bg-stone-800 border border-rose-100 dark:border-stone-700 hover:border-wine dark:hover:border-rose-600 hover:shadow-soft transition-all duration-150 group"
                >
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">
                      <EventBadge tipo={ev.tipo} showLabel={false} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 font-body truncate group-hover:text-wine dark:group-hover:text-rose-300 transition-colors">
                          {ev.titulo}
                        </p>
                        {ev.destacado && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                            fill="currentColor" className="shrink-0 text-amber-400">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 dark:text-stone-500 font-body mt-0.5">
                        {formatDate(ev.fecha_inicio)}
                        {ev.fecha_fin !== ev.fecha_inicio && ` → ${formatDate(ev.fecha_fin)}`}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}