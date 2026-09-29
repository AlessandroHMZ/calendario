import { useState, useMemo, useRef } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
  addMonths, subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays, Mail, Camera } from 'lucide-react'

const CELL_MIN_H = 110   // altura mínima de cada celda en px
const MAX_PILLS  = 3     // máximo de eventos visibles por día antes de "+N más"

const DOT_COLORS = {
  evento:   'bg-rose-400',
  mensaje:  'bg-sky-400',
  recuerdo: 'bg-amber-400',
}

// Colores de las píldoras que se ven directamente en cada día
const PILL_COLORS = {
  evento:   'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200',
  mensaje:  'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-200',
  recuerdo: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200',
}

const TYPE_ICONS = {
  evento:   CalendarDays,
  mensaje:  Mail,
  recuerdo: Camera,
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Tooltip flotante — solo aparece cuando hay más eventos de los visibles
function DayTooltip({ events, style }) {
  if (!events || events.length === 0) return null
  return (
    <div
      style={style}
      className="
        fixed z-50 bg-white dark:bg-stone-800
        border border-rose-100 dark:border-stone-600
        rounded-xl shadow-card p-3 w-60
        animate-fade-in pointer-events-none
      "
    >
      <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 mb-2 uppercase tracking-wide font-body">
        {events.length} evento{events.length > 1 ? 's' : ''}
      </p>
      <ul className="space-y-1.5">
        {events.map((ev) => {
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
                {ev.creado_por_nombre && (
                  <p className="text-[10px] text-stone-300 dark:text-stone-600 font-body mt-0.5">
                    por {ev.creado_por_nombre}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Calendar({ indicators, allEvents = [], onDayClick }) {
  const [current, setCurrent] = useState(new Date())
  const [tooltip, setTooltip] = useState(null)
  const gridRef               = useRef(null)

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
    // Solo mostrar tooltip si hay más eventos de los que caben en la celda
    if (dayEvents.length <= MAX_PILLS) return

    const rect     = e.currentTarget.getBoundingClientRect()
    const tooltipW = 240
    const tooltipH = 200
    let left = rect.right + 8
    let top  = rect.top
    if (left + tooltipW > window.innerWidth  - 12) left = rect.left - tooltipW - 8
    if (top  + tooltipH > window.innerHeight - 12) top  = window.innerHeight - tooltipH - 12
    setTooltip({ events: dayEvents, top, left })
  }

  function handleMouseLeave() {
    setTooltip(null)
  }

  return (
    <>
      <div className="card !p-0 overflow-hidden" ref={gridRef}>

        {/* Navegación de mes */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 dark:border-stone-700">
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

        {/* Encabezados de días */}
        <div className="grid grid-cols-7 border-b border-rose-100 dark:border-stone-700 bg-rose-50/50 dark:bg-stone-800/50">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="text-center text-xs font-semibold text-stone-400 dark:text-stone-500 font-body py-2.5">
              {wd}
            </div>
          ))}
        </div>

        {/* Cuadrícula de días */}
        <div className="grid grid-cols-7 divide-x divide-y divide-rose-100 dark:divide-stone-800">
          {days.map((day) => {
            const dateStr   = format(day, 'yyyy-MM-dd')
            const inMonth   = isSameMonth(day, current)
            const today     = isToday(day)
            const dayEvents = getEventsForDate(dateStr)
            const overflow  = dayEvents.length - MAX_PILLS

            return (
              <button
                key={dateStr}
                onClick={() => inMonth && onDayClick(dateStr)}
                onMouseEnter={(e) => handleMouseEnter(e, dateStr, inMonth)}
                onMouseLeave={handleMouseLeave}
                disabled={!inMonth}
                style={{ minHeight: `${CELL_MIN_H}px` }}
                className={`
                  relative flex flex-col text-left p-1.5 w-full
                  transition-colors duration-100
                  ${!inMonth
                    ? 'bg-stone-50/40 dark:bg-stone-900/30 cursor-default'
                    : 'hover:bg-rose-50/60 dark:hover:bg-stone-800/40 cursor-pointer'}
                `}
              >
                {/* Número del día */}
                <span className={`
                  inline-flex items-center justify-center
                  w-7 h-7 rounded-full mb-1 shrink-0
                  text-sm font-semibold font-body transition-colors
                  ${!inMonth ? 'text-stone-300 dark:text-stone-700' : 'text-stone-700 dark:text-stone-200'}
                  ${today ? '!bg-wine !text-white shadow-soft' : ''}
                `}>
                  {format(day, 'd')}
                </span>

                {/* Píldoras de eventos — visibles directamente sin hover */}
                <div className="flex flex-col gap-0.5 w-full">
                  {dayEvents.slice(0, MAX_PILLS).map((ev) => (
                    <div
                      key={ev.id}
                      className={`
                        w-full px-1.5 py-0.5 rounded-md
                        text-[11px] font-body font-semibold truncate leading-tight
                        ${PILL_COLORS[ev.tipo] || PILL_COLORS.evento}
                      `}
                    >
                      {ev.titulo}
                    </div>
                  ))}

                  {/* Overflow */}
                  {overflow > 0 && (
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-body px-1 font-semibold">
                      +{overflow} más
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 border-t border-rose-100 dark:border-stone-700 bg-rose-50/40 dark:bg-stone-800/30">
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

      {/* Tooltip flotante — solo cuando hay más de 3 eventos en un día */}
      {tooltip && (
        <DayTooltip
          events={tooltip.events}
          style={{ top: tooltip.top, left: tooltip.left }}
        />
      )}
    </>
  )
}