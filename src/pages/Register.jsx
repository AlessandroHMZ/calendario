import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Heart } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm]       = useState({ displayName: '', email: '', password: '', confirm: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.displayName.trim())           { setError('Escribe tu nombre.'); return }
    if (form.password.length < 6)           { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (form.password !== form.confirm)     { setError('Las contraseñas no coinciden.'); return }

    setLoading(true)
    try {
      await register(form.email, form.password, form.displayName.trim())
      navigate('/')
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'Ese email ya está registrado.',
        'auth/invalid-email':        'Email no válido.',
        'auth/weak-password':        'Contraseña demasiado débil.',
      }
      setError(messages[err.code] || 'Error al registrarse.')
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
          <h1 className="font-display text-4xl text-wine dark:text-rose-300 font-semibold">Crea tu cuenta</h1>
          <p className="text-stone-400 dark:text-stone-500 font-body mt-2">Comparte momentos especiales</p>
        </div>

        <div className="card">
          <h2 className="font-display text-2xl text-stone-800 dark:text-stone-100 mb-6">Registro</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-1.5 font-body">Tu nombre</label>
              <input type="text" name="displayName" value={form.displayName} onChange={handleChange}
                placeholder="¿Cómo te llamas?" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-1.5 font-body">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="tu@email.com" className="input-field" autoComplete="email" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-1.5 font-body">Contraseña</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="Mínimo 6 caracteres" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-600 dark:text-stone-300 mb-1.5 font-body">Confirmar contraseña</label>
              <input type="password" name="confirm" value={form.confirm} onChange={handleChange}
                placeholder="Repite la contraseña" className="input-field" required />
            </div>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-2.5 font-body animate-fade-in">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
              {loading
                ? <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><UserPlus size={16} /> Crear cuenta</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 font-body mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-wine dark:text-rose-400 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
