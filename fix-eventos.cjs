const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore }        = require('firebase-admin/firestore')
const fs                      = require('fs')

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount.json', 'utf8'))

initializeApp({ credential: cert(serviceAccount) })

const db = getFirestore()

const USUARIOS = {
  "aZhEhrRaAIS6eGpkDS7031pxPjx1": "Alessandro",
  "kLPYE8eVB3dNW2PwsIaujz5PKdm2": "Valeria",
}

const COLORES = ['rose', 'sky', 'amber', 'emerald', 'violet', 'orange', 'pink', 'teal']

function colorAleatorio() {
  return COLORES[Math.floor(Math.random() * COLORES.length)]
}

async function fixEventos() {
  const snap = await db.collection('events').get()
  let actualizados = 0

  for (const d of snap.docs) {
    const data = d.data()

    const update = {}

    // Poner nombre si no tiene
    if (!data.creado_por_nombre) {
      const nombre = USUARIOS[data.creado_por]
      if (nombre) update.creado_por_nombre = nombre
    }

    // Poner color aleatorio si no tiene
    if (!data.color) {
      update.color = colorAleatorio()
    }

    if (Object.keys(update).length > 0) {
      await d.ref.update(update)
      actualizados++
      console.log(`✅ ${d.id} →`, update)
    }
  }

  console.log(`\nListo: ${actualizados} documentos actualizados.`)
}

fixEventos().catch(console.error)