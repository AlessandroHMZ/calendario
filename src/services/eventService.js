/**
 * eventService.js
 * All Firestore operations for events.
 *
 * Firestore structure:
 *
 * /events/{eventId}
 *   titulo:        string
 *   descripcion:   string
 *   fecha_inicio:  string  (ISO date: "2024-06-15")
 *   fecha_fin:     string  (ISO date: "2024-06-15")
 *   tipo:          "evento" | "mensaje" | "recuerdo"
 *   creado_por:    string  (user uid)
 *   nota_privada:  string  (optional, visible only to creator)
 *   creado_en:     Timestamp
 *   actualizado_en: Timestamp
 *
 * /users/{uid}
 *   email:         string
 *   display_name:  string
 *   creado_en:     Timestamp
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const EVENTS_COLLECTION = 'events'
const USERS_COLLECTION  = 'users'

// ─── Users ────────────────────────────────────────────────────────────────────

export async function saveUserProfile(uid, data) {
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    ...data,
    creado_en: serverTimestamp(),
  }, { merge: true })
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function createEvent(eventData) {
  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
    ...eventData,
    nota_privada:   eventData.nota_privada || '',
    creado_en:      serverTimestamp(),
    actualizado_en: serverTimestamp(),
  })
  return docRef.id
}

export async function updateEvent(eventId, eventData) {
  const ref = doc(db, EVENTS_COLLECTION, eventId)
  await updateDoc(ref, {
    ...eventData,
    actualizado_en: serverTimestamp(),
  })
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, EVENTS_COLLECTION, eventId))
}

/**
 * Real-time subscription to all events.
 * Returns an unsubscribe function.
 */
export function subscribeToEvents(callback) {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    orderBy('fecha_inicio', 'asc')
  )
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(events)
  })
}
