import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import EventBadge from './EventBadge'

export default function UpcomingEvents({ events, onEventClick, currentUserId }) {
  const today = new Date().toISOString().split('T')[0]

  const upcoming = useMemo(() => (
    events.filter((e) => e.fecha_fin >= today).slice(0, 8)
  ), [events, today])

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-')
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="card">
      <h3 className="font-display text-lg text-wine dark:text-rose-300 mb-4 font-semibold">
        Próximos eventos
      </h3>

      {upcoming.length === 0 ? (
        <div className="text-center py-8 text-stone-400 dark:text-stone-500">
          <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-body">No hay eventos próximos</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {upcoming.map((ev) => (
            <li key={ev.id}>
              <button
                onClick={() => onEventClick(ev.fecha_inicio, ev)}
                className="w-full text-left p-3 rounded-xl bg-parchment dark:bg-stone-800 border border-rose-100 dark:border-stone-700 hover:border-wine dark:hover:border-rose-600 hover:shadow-soft transition-all duration-150 group"
              >
                <div className="flex items-start gap-2">
                  <div className="shrink-0 mt-0.5">
                    <EventBadge tipo={ev.tipo} showLabel={false} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 font-body truncate group-hover:text-wine dark:group-hover:text-rose-300 transition-colors">
                      {ev.titulo}
                    </p>
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
  )
}
