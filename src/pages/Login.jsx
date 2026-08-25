import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      const messages = {
        'auth/user-not-found':    'No existe una cuenta con ese email.',
        'auth/wrong-password':    'Contraseña incorrecta.',
        'auth/invalid-email':     'Email no válido.',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
        'auth/invalid-credential':'Email o contraseña incorrectos.',
      }
      setError(messages[err.code] || 'Error al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream dark:bg-stone-950">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-wine rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <h1 className="font-display text-4xl text-wine dark:text-rose-300 font-semibold">Nuestro Calendario</h1>
          <p className="text-stone-400 dark:text-stone-500 font-body mt-2">Tu espacio compartido de momentos</p>
        </div>

        <div className="card">
          <h2 className="font-display text-2xl text-stone-800 dark:text-stone-100 mb-6">Bienvenido de vuelta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-1.5 font-body">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="tu@email.com" className="input-field" autoComplete="email" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-1.5 font-body">Contraseña</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" className="input-field" autoComplete="current-password" required />
            </div>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-2.5 font-body animate-fade-in">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
              {loading
                ? <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><LogIn size={16} /> Entrar</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 font-body mt-5">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-wine dark:text-rose-400 font-semibold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
