import { useState } from 'react'
import { CalendarDays, Mail, Camera } from 'lucide-react'
import Navbar         from '../components/Navbar'
import Calendar       from '../components/Calendar'
import EventModal     from '../components/EventModal'
import UpcomingEvents from '../components/UpcomingEvents'
import { useEvents }  from '../hooks/useEvents'
import { useAuth }    from '../hooks/useAuth'

export default function Home() {
  const { currentUser } = useAuth()
  const { events, loading, getEventsForDate, addEvent, editEvent, removeEvent } = useEvents()

  const [modalOpen, setModalOpen]       = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [eventToEdit, setEventToEdit]   = useState(null)

  // Build full indicators map for all months
  const allIndicators = buildIndicators(events)

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

  const stats = [
    { label: 'Eventos',   count: events.filter((e) => e.tipo === 'evento').length,   Icon: CalendarDays, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' },
    { label: 'Mensajes',  count: events.filter((e) => e.tipo === 'mensaje').length,  Icon: Mail,         color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800' },
    { label: 'Recuerdos', count: events.filter((e) => e.tipo === 'recuerdo').length, Icon: Camera,       color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-cream dark:bg-stone-950 transition-colors duration-300">
      <Navbar onNewEvent={openNewEventModal} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map(({ label, count, Icon, color }) => (
            <div key={label} className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${color} animate-fade-in`}>
              <Icon size={20} strokeWidth={1.5} />
              <div>
                <p className="text-xl font-display font-semibold">{count}</p>
                <p className="text-xs font-body opacity-70">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="card flex items-center justify-center py-20">
                <span className="inline-block w-8 h-8 border-2 border-rose-200 border-t-wine rounded-full animate-spin" />
              </div>
            ) : (
              <Calendar
                indicators={allIndicators}
                allEvents={events}
                onDayClick={openDayModal}
              />
            )}
          </div>
          <div className="lg:col-span-1">
            <UpcomingEvents events={events} onEventClick={openEditModal} currentUserId={currentUser?.uid} />
          </div>
        </div>
      </main>

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
