import { useState, useMemo, useRef, useEffect } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
  addMonths, subMonths, getMonth, getYear, setMonth, setYear,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Search, X, Star, CalendarDays } from 'lucide-react'

const MAX_PILLS  = 3
const WEEKDAYS   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

const COLOR_PILL = {
  rose:    'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200',
  sky:     'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-200',
  amber:   'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200',
  violet:  'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-200',
  orange:  'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-200',
  pink:    'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-200',
  teal:    'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-200',
  indigo:  'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200',
}
const DEFAULT_COLOR = { evento: 'indigo', recuerdo: 'amber' }

function getPillColor(ev) {
  const id = ev.color || DEFAULT_COLOR[ev.tipo] || 'indigo'
  return COLOR_PILL[id] || COLOR_PILL.indigo
}

// ── Tooltip ────────────────────────────────────────────────────────────────────
function DayTooltip({ events, style }) {
  if (!events?.length) return null
  return (
    <div style={style} className="fixed z-50 bg-white dark:bg-stone-800 border border-indigo-100 dark:border-stone-600 rounded-xl shadow-card p-3 w-60 animate-fade-in pointer-events-none">
      <p className="text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide font-body">
        {events.length} evento{events.length > 1 ? 's' : ''}
      </p>
      <ul className="space-y-1.5">
        {events.map(ev => (
          <li key={ev.id} className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${getPillColor(ev).split(' ')[0].replace('bg-', 'bg-').replace('100', '400')}`} />
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 font-body truncate">{ev.titulo}</p>
            {ev.destacado && <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Calendar({ allEvents = [], onDayClick }) {
  const [current, setCurrent]           = useState(new Date())
  const [tooltip, setTooltip]           = useState(null)
  const [highlightedId, setHighlightedId] = useState(null)
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchOpen, setSearchOpen]     = useState(false)
  const searchRef                       = useRef(null)
  const highlightTimerRef               = useRef(null)

  // Build week rows
  const weeks = useMemo(() => {
    const ms   = startOfMonth(current)
    const me   = endOfMonth(current)
    const days = eachDayOfInterval({
      start: startOfWeek(ms, { weekStartsOn: 1 }),
      end:   endOfWeek(me,   { weekStartsOn: 1 }),
    })
    const wks = []
    for (let i = 0; i < days.length; i += 7) wks.push(days.slice(i, i + 7))
    return wks
  }, [current])

  // Monthly stats
  const monthStats = useMemo(() => {
    const first = format(startOfMonth(current), 'yyyy-MM-dd')
    const last  = format(endOfMonth(current),   'yyyy-MM-dd')
    const inMonth = allEvents.filter(e => e.fecha_inicio <= last && e.fecha_fin >= first)
    return { total: inMonth.length, destacados: inMonth.filter(e => e.destacado).length }
  }, [allEvents, current])

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return allEvents
      .filter(e => e.titulo.toLowerCase().includes(q) || e.descripcion?.toLowerCase().includes(q))
      .slice(0, 8)
  }, [searchQuery, allEvents])

  // Year options
  const years = useMemo(() => {
    const allYears = allEvents.map(e => parseInt(e.fecha_inicio.slice(0, 4)))
    const minY = allYears.length ? Math.min(...allYears) : new Date().getFullYear() - 2
    const maxY = new Date().getFullYear() + 2
    const result = []
    for (let y = minY; y <= maxY; y++) result.push(y)
    return result
  }, [allEvents])

  // Close search on outside click
  useEffect(() => {
    function handler(e) {
      if (!searchRef.current?.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function getEventsForDate(dateStr) {
    return allEvents.filter(e => e.fecha_inicio <= dateStr && e.fecha_fin >= dateStr)
  }

  function showTooltip(e, dateStr) {
    const evs = getEventsForDate(dateStr)
    if (evs.length <= MAX_PILLS) return
    const rect = e.currentTarget.getBoundingClientRect()
    const tw = 240, th = 200
    let left = rect.right + 8, top = rect.top
    if (left + tw > window.innerWidth  - 8) left = rect.left - tw - 8
    if (top  + th > window.innerHeight - 8) top  = window.innerHeight - th - 8
    setTooltip({ events: evs, top, left })
  }

  function handleSearchSelect(ev) {
    // Navigate to the event's month
    const [y, m] = ev.fecha_inicio.split('-').map(Number)
    setCurrent(new Date(y, m - 1, 1))
    // Highlight
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    setHighlightedId(ev.id)
    highlightTimerRef.current = setTimeout(() => setHighlightedId(null), 2500)
    // Close search
    setSearchQuery('')
    setSearchOpen(false)
  }

  const monthLabel = format(current, 'MMMM yyyy', { locale: es })

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden rounded-2xl shadow-card border border-indigo-100 dark:border-stone-700 bg-white dark:bg-stone-900">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-indigo-100 dark:border-stone-700 bg-indigo-50/50 dark:bg-stone-800/30">

          {/* Left: arrows */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setCurrent(d => subMonths(d, 1))}
              className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-stone-700 text-indigo-400 dark:text-stone-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrent(d => addMonths(d, 1))}
              className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-stone-700 text-indigo-400 dark:text-stone-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Center: month + year selects */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <select
              value={getMonth(current)}
              onChange={e => setCurrent(d => setMonth(d, +e.target.value))}
              className="bg-white dark:bg-stone-800 border border-indigo-200 dark:border-stone-600 text-indigo-700 dark:text-indigo-300 font-display font-semibold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 capitalize cursor-pointer"
            >
              {MONTHS_ES.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={getYear(current)}
              onChange={e => setCurrent(d => setYear(d, +e.target.value))}
              className="bg-white dark:bg-stone-800 border border-indigo-200 dark:border-stone-600 text-indigo-700 dark:text-indigo-300 font-display font-semibold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Right: search */}
          <div ref={searchRef} className="relative shrink-0 w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 dark:text-stone-500 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Buscar evento..."
              className="w-full bg-white dark:bg-stone-800 border border-indigo-200 dark:border-stone-600 rounded-xl pl-8 pr-8 py-1.5 text-sm font-body text-stone-700 dark:text-stone-200 placeholder-indigo-300 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchOpen(false) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-indigo-500">
                <X size={13} />
              </button>
            )}

            {/* Search dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-1.5 w-72 bg-white dark:bg-stone-800 border border-indigo-100 dark:border-stone-700 rounded-xl shadow-modal z-50 overflow-hidden animate-scale-in">
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-3 pt-2.5 pb-1 font-body">
                  {searchResults.length} resultado{searchResults.length > 1 ? 's' : ''}
                </p>
                <ul>
                  {searchResults.map(ev => {
                    const [y, m, d] = ev.fecha_inicio.split('-')
                    const dateLabel = new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                    return (
                      <li key={ev.id}>
                        <button
                          onClick={() => handleSearchSelect(ev)}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-stone-700 transition-colors"
                        >
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${COLOR_PILL[ev.color || DEFAULT_COLOR[ev.tipo] || 'indigo']?.split(' ')[0]?.replace('100', '400') || 'bg-indigo-400'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 font-body truncate">{ev.titulo}</p>
                            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-body">{dateLabel}</p>
                          </div>
                          {ev.destacado && <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* No results */}
            {searchOpen && searchQuery.trim() && searchResults.length === 0 && (
              <div className="absolute top-full right-0 mt-1.5 w-64 bg-white dark:bg-stone-800 border border-indigo-100 dark:border-stone-700 rounded-xl shadow-card z-50 px-4 py-3 animate-scale-in">
                <p className="text-sm text-stone-400 font-body text-center">Sin resultados para "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Weekday labels ── */}
        <div className="grid grid-cols-7 border-b border-indigo-100 dark:border-stone-700 bg-indigo-50/30 dark:bg-stone-800/20">
          {WEEKDAYS.map(wd => (
            <div key={wd} className="text-center text-xs font-semibold text-indigo-300 dark:text-stone-500 font-body py-2.5 tracking-wide">
              {wd}
            </div>
          ))}
        </div>

                {/* ── Day grid ── */}
        <div className="flex-1 flex flex-col min-h-0 divide-y divide-indigo-50 dark:divide-stone-800">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex-1 grid grid-cols-7 divide-x divide-indigo-50 dark:divide-stone-800 min-h-0">
          {week.map(day => {
            const dateStr  = format(day, 'yyyy-MM-dd')
            const inMonth  = isSameMonth(day, current)
            const today    = isToday(day)
            const dayEvs   = getEventsForDate(dateStr)
            const overflow = dayEvs.length - MAX_PILLS

            return (
              <button
                key={dateStr}
                onClick={() => inMonth && onDayClick(dateStr)}
                onMouseEnter={e => inMonth && showTooltip(e, dateStr)}
                onMouseLeave={() => setTooltip(null)}
                disabled={!inMonth}
                className={`
                  relative flex flex-col text-left p-1.5 w-full h-full transition-colors duration-100
                  ${!inMonth ? 'bg-indigo-50/20 dark:bg-stone-900/30 cursor-default' : 'hover:bg-indigo-50/60 dark:hover:bg-stone-800/40 cursor-pointer'}
                `}
              >
                <span className={`
                  inline-flex items-center justify-center w-7 h-7 rounded-full mb-1 shrink-0
                  text-sm font-semibold font-body transition-colors
                  ${!inMonth ? 'text-indigo-200 dark:text-stone-700' : 'text-stone-700 dark:text-stone-200'}
                  ${today ? '!bg-indigo-700 !text-white shadow-soft' : ''}
                `}>
                  {format(day, 'd')}
                </span>

                <div className="flex flex-col gap-0.5 w-full">
                  {dayEvs.slice(0, MAX_PILLS).map(ev => (
                    <div
                      key={ev.id}
                      className={`
                        w-full px-1.5 py-0.5 rounded-md
                        text-[11px] font-body font-semibold leading-tight
                        flex items-center justify-between gap-0.5
                        transition-all duration-200
                        ${getPillColor(ev)}
                        ${highlightedId === ev.id ? 'animate-highlight ring-2 ring-indigo-500 ring-offset-1' : ''}
                      `}
                    >
                      <span className="truncate">{ev.titulo}</span>
                      {ev.destacado && (
                        <Star size={8} className="shrink-0 fill-current opacity-70" />
                      )}
                    </div>
                  ))}
                  {overflow > 0 && (
                    <span className="text-[10px] text-indigo-400 dark:text-stone-500 font-body px-1 font-semibold">
                      +{overflow} más
                    </span>
                  )}
                </div>
              </button>
            )
            })}
            </div>
          ))}
        </div>

        {/* ── Monthly stats ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-indigo-100 dark:border-stone-700 bg-indigo-50/30 dark:bg-stone-800/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-indigo-400" />
              <span className="text-xs font-body text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">{monthStats.total}</span>
                {' '}evento{monthStats.total !== 1 ? 's' : ''} en{' '}
                <span className="capitalize">{format(current, 'MMMM', { locale: es })}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-body text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-amber-600 dark:text-amber-400">{monthStats.destacados}</span>
                {' '}destacado{monthStats.destacados !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-indigo-300 dark:text-stone-600 font-body">
            Haz clic en un día para ver o agregar eventos
          </p>
        </div>
      </div>

      {tooltip && <DayTooltip events={tooltip.events} style={{ top: tooltip.top, left: tooltip.left }} />}
    </>
  )
}