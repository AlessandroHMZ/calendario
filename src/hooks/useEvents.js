import { useState, useEffect } from 'react'
import { subscribeToEvents, createEvent, updateEvent, deleteEvent } from '../services/eventService'

/**
 * Provides real-time events and CRUD helpers.
 */
export function useEvents() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeToEvents((data) => {
      setEvents(data)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  /**
   * Returns all events that fall on a given date string ("YYYY-MM-DD").
   * An event spans [fecha_inicio, fecha_fin] inclusive.
   */
  function getEventsForDate(dateStr) {
    return events.filter(
      (e) => e.fecha_inicio <= dateStr && e.fecha_fin >= dateStr
    )
  }

  /**
   * Returns a map { "YYYY-MM-DD": ["evento","mensaje","recuerdo",...] }
   * for quick indicator rendering on the calendar.
   */
  function getIndicatorsForMonth(year, month) {
    const indicators = {}
    events.forEach((e) => {
      const start = new Date(e.fecha_inicio + 'T00:00:00')
      const end   = new Date(e.fecha_fin   + 'T00:00:00')
      const cur   = new Date(start)
      while (cur <= end) {
        if (cur.getFullYear() === year && cur.getMonth() === month) {
          const key = cur.toISOString().split('T')[0]
          if (!indicators[key]) indicators[key] = []
          if (!indicators[key].includes(e.tipo)) indicators[key].push(e.tipo)
        }
        cur.setDate(cur.getDate() + 1)
      }
    })
    return indicators
  }

  async function addEvent(data) {
    try {
      setError(null)
      return await createEvent(data)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  async function editEvent(id, data) {
    try {
      setError(null)
      await updateEvent(id, data)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  async function removeEvent(id) {
    try {
      setError(null)
      await deleteEvent(id)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return { events, loading, error, getEventsForDate, getIndicatorsForMonth, addEvent, editEvent, removeEvent }
}
