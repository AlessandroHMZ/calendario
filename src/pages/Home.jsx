import { useState, useMemo } from 'react'
import Calendar    from '../components/Calendar'
import EventModal  from '../components/EventModal'
import Sidebar     from '../components/UpcomingEvents'
import { useEvents } from '../hooks/useEvents'
import { useAuth }   from '../hooks/useAuth'

export default function Home() {
  const { currentUser } = useAuth()
  const { events, loading, getEventsForDate, addEvent, editEvent, removeEvent } = useEvents()

  const [modalOpen, setModalOpen]       = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [eventToEdit, setEventToEdit]   = useState(null)
  const [activeFilter, setActiveFilter] = useState(undefined) // undefined = todos

  // Filtrar eventos según el filtro activo
  const filteredEvents = useMemo(() => {
    if (activeFilter === 'evento')    return events.filter((e) => e.tipo === 'evento')
    if (activeFilter === 'recuerdo')  return events.filter((e) => e.tipo === 'recuerdo')
    if (activeFilter === 'destacado') return events.filter((e) => e.destacado === true)
    return events
  }, [events, activeFilter])

  const allIndicators = useMemo(() => buildIndicators(filteredEvents), [filteredEvents])

  function buildIndicators(evs) {
    const map = {}
    evs.forEach((e) => {
      const start = new Date(e.fecha_inicio + 'T00:00:00')
      const end   = new Date(e.fecha_fin   + 'T00:00:00')
      const cur   = new Date(start)
      while (cur <= end) {
        const key = cur.toISOString().split('T')[0]
        if (!map[key]) map[key] = []
        if (!map[key].includes(e.tipo)) map[key].push(e.tipo)
        cur.setDate(cur.getDate() + 1)
      }
    })
    return map
  }

  function openDayModal(dateStr) {
    setSelectedDate(dateStr)
    setEventToEdit(null)
    setModalOpen(true)
  }

  function openNewEventModal() {
    setSelectedDate(new Date().toISOString().split('T')[0])
    setEventToEdit(null)
    setModalOpen(true)
  }

  function openEditModal(dateStr, event) {
    setSelectedDate(dateStr)
    setEventToEdit(event)
    setModalOpen(true)
  }

  async function handleSave(data, id) {
    if (id) await editEvent(id, data)
    else    await addEvent(data)
  }

  const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="flex h-screen overflow-hidden bg-cream dark:bg-stone-950 transition-colors duration-300">

      {/* ── Sidebar izquierdo ── */}
      <Sidebar
        events={events}
        onNewEvent={openNewEventModal}
        onEventClick={openEditModal}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* ── Área principal ── */}
      <main className="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="h-full card flex items-center justify-center">
              <span className="inline-block w-8 h-8 border-2 border-indigo-200 border-t-indigo-700 rounded-full animate-spin" />
            </div>
          ) : (
            <Calendar
              indicators={allIndicators}
              allEvents={filteredEvents}
              onDayClick={openDayModal}
            />
          )}
        </div>
      </main>

      {/* ── Modal ── */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={removeEvent}
        initialDate={selectedDate}
        eventToEdit={eventToEdit}
        selectedDayEvents={selectedDayEvents}
        currentUserId={currentUser?.uid}
      />
    </div>
  )
}