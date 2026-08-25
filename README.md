# 💑 Nuestro Calendario

Calendario compartido para parejas — crea eventos, mensajes y recuerdos en tiempo real con tu pareja.

## Stack

- **Frontend**: React 18 + Vite
- **Estilos**: TailwindCSS 3
- **Backend**: Firebase (Auth + Firestore)
- **Deploy**: Vercel

---

## 🗂️ Estructura del proyecto

```
couple-calendar/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── AuthContext.jsx      ← Proveedor de autenticación
    ├── hooks/
    │   ├── useAuth.js           ← Hook de autenticación
    │   └── useEvents.js         ← Hook de eventos (CRUD + tiempo real)
    ├── services/
    │   ├── firebase.js          ← Inicialización de Firebase
    │   └── eventService.js      ← Operaciones Firestore
    ├── components/
    │   ├── Calendar.jsx         ← Vista mensual del calendario
    │   ├── EventModal.jsx       ← Modal crear/editar/ver eventos
    │   ├── EventBadge.jsx       ← Badge visual por tipo de evento
    │   ├── UpcomingEvents.jsx   ← Sidebar de próximos eventos
    │   ├── Navbar.jsx           ← Barra de navegación
    │   └── ProtectedRoute.jsx   ← Protección de rutas
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        └── Home.jsx
```

---

## 🔥 Configuración de Firebase

### 1. Crear proyecto Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Clic en **Agregar proyecto** → sigue los pasos
3. Desactiva Google Analytics si no lo necesitas

### 2. Habilitar Authentication

1. En el menú lateral: **Authentication** → **Comenzar**
2. En la pestaña **Sign-in method**: habilita **Correo electrónico/contraseña**

### 3. Habilitar Firestore

1. En el menú lateral: **Firestore Database** → **Crear base de datos**
2. Elige **Modo de producción** (ajustaremos las reglas)
3. Elige la región más cercana (ej: `us-central1`)

### 4. Reglas de seguridad de Firestore

En **Firestore → Reglas**, pega esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuarios autenticados pueden leer/escribir su propio perfil
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Cualquier usuario autenticado puede leer y escribir eventos
    // (ideal para una pareja que comparte el mismo proyecto)
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && resource.data.creado_por == request.auth.uid;
    }
  }
}
```

### 5. Obtener credenciales

1. En la consola: ⚙️ **Configuración del proyecto** → **Tus apps**
2. Clic en el icono **Web** (`</>`)
3. Registra la app con un nombre
4. Copia el objeto `firebaseConfig`

---

## 💾 Estructura de Firestore

### Colección `/events`

```json
{
  "titulo":         "Cena romántica",
  "descripcion":    "Reserva en restaurante italiano",
  "fecha_inicio":   "2024-06-15",
  "fecha_fin":      "2024-06-15",
  "tipo":           "evento",
  "creado_por":     "uid_del_usuario",
  "nota_privada":   "¡Tengo una sorpresa preparada!",
  "creado_en":      "<Timestamp>",
  "actualizado_en": "<Timestamp>"
}
```

**Valores válidos para `tipo`**: `"evento"` | `"mensaje"` | `"recuerdo"`

### Colección `/users`

```json
{
  "email":        "usuario@ejemplo.com",
  "display_name": "María",
  "creado_en":    "<Timestamp>"
}
```

---

## 🚀 Correr localmente

### Requisitos previos

- Node.js 18+
- npm o pnpm

### Pasos

```bash
# 1. Clonar / descomprimir el proyecto
cd couple-calendar

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase:
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# VITE_FIREBASE_PROJECT_ID=...
# VITE_FIREBASE_STORAGE_BUCKET=...
# VITE_FIREBASE_MESSAGING_SENDER_ID=...
# VITE_FIREBASE_APP_ID=...

# 4. Iniciar servidor de desarrollo
npm run dev
```

La app estará en `http://localhost:5173`

---

## ☁️ Deploy en Vercel

### Opción A — Interfaz web de Vercel (recomendada)

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) e inicia sesión
3. Clic en **Add New Project** → importa tu repositorio
4. En **Environment Variables**, añade las 6 variables de Firebase
5. Clic en **Deploy** → ¡listo!

### Opción B — CLI de Vercel

```bash
# Instalar CLI
npm i -g vercel

# En la carpeta del proyecto
vercel

# Seguir los pasos interactivos
# Cuando pregunte por variables de entorno, añade las 6 variables de Firebase
```

### Variables de entorno requeridas en Vercel

| Variable                             | Descripción                  |
|--------------------------------------|------------------------------|
| `VITE_FIREBASE_API_KEY`              | API Key de Firebase          |
| `VITE_FIREBASE_AUTH_DOMAIN`          | Auth domain                  |
| `VITE_FIREBASE_PROJECT_ID`           | ID del proyecto              |
| `VITE_FIREBASE_STORAGE_BUCKET`       | Storage bucket               |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`  | Sender ID                    |
| `VITE_FIREBASE_APP_ID`               | App ID                       |

> El archivo `vercel.json` ya incluye la configuración de rewrite para que el enrutamiento de React funcione correctamente.

---

## ✨ Funcionalidades

- **Autenticación** — Login y registro con email/contraseña, sesión persistente
- **Calendario mensual** — Navega entre meses, indicadores visuales en días con contenido
- **3 tipos de contenido** — 📅 Evento, 💌 Mensaje, 📸 Recuerdo
- **Crear / editar / eliminar** — Solo puedes editar tus propios eventos
- **Tiempo real** — Ambos usuarios ven los cambios al instante (Firestore `onSnapshot`)
- **Notas privadas** — Añade notas que solo tú puedes ver dentro de cada evento
- **Sidebar de próximos eventos** — Vista rápida de lo que viene
- **Responsive** — Optimizado para móvil y escritorio
- **Animaciones suaves** — Fade in, slide up, scale in

---

## 🔧 Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción (genera /dist)
npm run preview  # Preview del build de producción
```
