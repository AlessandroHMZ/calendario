import { useState, useMemo, useRef, useEffect } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
  addMonths, subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays, Mail, Camera } from 'lucide-react'

const DOT_COLORS = {
  evento:   'bg-rose-400',
  mensaje:  'bg-sky-400',
  recuerdo: 'bg-amber-400',
}

const TYPE_ICONS = {
  evento:   CalendarDays,
  mensaje:  Mail,
  recuerdo: Camera,
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Floating tooltip shown on hover over days with events
function DayTooltip({ events, style }) {
  if (!events || events.length === 0) return null
  return (
    <div
      style={style}
      className="
        fixed z-50 bg-white dark:bg-stone-800
        border border-rose-100 dark:border-stone-600
        rounded-xl shadow-card p-3 w-56
        animate-fade-in pointer-events-none
      "
    >
      <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 mb-2 uppercase tracking-wide font-body">
        {events.length} evento{events.length > 1 ? 's' : ''}
      </p>
      <ul className="space-y-1.5">
        {events.slice(0, 4).map((ev) => {
          const Icon = TYPE_ICONS[ev.tipo] || CalendarDays
          const colorMap = {
            evento:   'text-rose-500',
            mensaje:  'text-sky-500',
            recuerdo: 'text-amber-500',
          }
          return (
            <li key={ev.id} className="flex items-start gap-2">
              <Icon size={12} className={`mt-0.5 shrink-0 ${colorMap[ev.tipo] || 'text-stone-400'}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 font-body truncate leading-tight">
                  {ev.titulo}
                </p>
                {ev.descripcion && (
                  <p className="text-xs text-stone-400 dark:text-stone-500 font-body line-clamp-1 mt-0.5">
                    {ev.descripcion}
                  </p>
                )}
              </div>
            </li>
          )
        })}
        {events.length > 4 && (
          <li className="text-xs text-stone-400 dark:text-stone-500 font-body pl-5">
            +{events.length - 4} más...
          </li>
        )}
      </ul>
    </div>
  )
}

export default function Calendar({ indicators, allEvents = [], onDayClick }) {
  const [current, setCurrent]   = useState(new Date())
  const [tooltip, setTooltip]   = useState(null) // { events, top, left }
  const gridRef                 = useRef(null)

  const days = useMemo(() => {
    const monthStart = startOfMonth(current)
    const monthEnd   = endOfMonth(current)
    const start      = startOfWeek(monthStart, { weekStartsOn: 1 })
    const end        = endOfWeek(monthEnd,     { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [current])

  const monthLabel = format(current, 'MMMM yyyy', { locale: es })

  function getEventsForDate(dateStr) {
    return allEvents.filter(
      (e) => e.fecha_inicio <= dateStr && e.fecha_fin >= dateStr
    )
  }

  function handleMouseEnter(e, dateStr, inMonth) {
    if (!inMonth) return
    const dayEvents = getEventsForDate(dateStr)
    if (dayEvents.length === 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const tooltipW = 224 // w-56
    const tooltipH = 180

    let left = rect.right + 8
    let top  = rect.top

    // Flip left if overflows viewport right
    if (left + tooltipW > window.innerWidth - 12) {
      left = rect.left - tooltipW - 8
    }
    // Flip up if overflows viewport bottom
    if (top + tooltipH > window.innerHeight - 12) {
      top = window.innerHeight - tooltipH - 12
    }

    setTooltip({ events: dayEvents, top, left })
  }

  function handleMouseLeave() {
    setTooltip(null)
  }

  return (
    <>
      <div className="card" ref={gridRef}>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrent((d) => subMonths(d, 1))}
            className="btn-ghost p-2 rounded-full"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="font-display text-2xl text-wine dark:text-rose-300 capitalize font-semibold tracking-tight">
            {monthLabel}
          </h2>

          <button
            onClick={() => setCurrent((d) => addMonths(d, 1))}
            className="btn-ghost p-2 rounded-full"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="text-center text-xs font-semibold text-stone-400 dark:text-stone-500 font-body py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const inMonth = isSameMonth(day, current)
            const today   = isToday(day)
            const dayDots = indicators[dateStr] || []
            const hasEvents = dayDots.length > 0

            return (
              <button
                key={dateStr}
                onClick={() => inMonth && onDayClick(dateStr)}
                onMouseEnter={(e) => handleMouseEnter(e, dateStr, inMonth)}
                onMouseLeave={handleMouseLeave}
                disabled={!inMonth}
                className={`
                  relative flex flex-col items-center justify-start
                  aspect-square rounded-xl pt-1.5 px-1 pb-1
                  transition-all duration-150
                  ${!inMonth  ? 'opacity-20 cursor-default' : 'hover:bg-parchment dark:hover:bg-stone-800 active:scale-95 cursor-pointer'}
                  ${today     ? 'bg-wine text-white hover:bg-rose-800 shadow-soft' : ''}
                  ${hasEvents && !today ? 'bg-rose-50 dark:bg-rose-900/10' : ''}
                `}
              >
                <span className={`
                  text-sm font-body font-semibold leading-none
                  ${today ? 'text-white' : 'text-stone-700 dark:text-stone-200'}
                `}>
                  {format(day, 'd')}
                </span>

                {dayDots.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dayDots.slice(0, 3).map((tipo) => (
                      <span
                        key={tipo}
                        className={`w-1.5 h-1.5 rounded-full ${today ? 'bg-white/70' : DOT_COLORS[tipo] || 'bg-stone-300'}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-5 pt-4 border-t border-rose-100 dark:border-stone-700">
          {[
            { tipo: 'evento',   label: 'Evento' },
            { tipo: 'mensaje',  label: 'Mensaje' },
            { tipo: 'recuerdo', label: 'Recuerdo' },
          ].map(({ tipo, label }) => (
            <div key={tipo} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[tipo]}`} />
              <span className="text-xs text-stone-400 dark:text-stone-500 font-body">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating tooltip rendered outside card to avoid clip */}
      {tooltip && (
        <DayTooltip
          events={tooltip.events}
          style={{ top: tooltip.top, left: tooltip.left }}
        />
      )}
    </>
  )
}
