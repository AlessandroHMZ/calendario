import { useState } from 'react'
import { Heart, Plus, Sun, Moon, LogOut, ChevronDown } from 'lucide-react'
import { useAuth }  from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'

export default function Navbar({ onNewEvent }) {
  const { currentUser, logout } = useAuth()
  const { dark, toggle }        = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const initial = currentUser?.displayName?.[0]?.toUpperCase() || '?'

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border-b border-rose-100 dark:border-stone-700 shadow-soft">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Heart size={20} className="text-wine fill-wine" />
          <h1 className="font-display text-xl text-wine font-semibold tracking-tight">
            Nuestro Calendario
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="btn-ghost p-2.5 rounded-xl"
            title={dark ? 'Modo claro' : 'Modo oscuro'}
          >
            {dark
              ? <Sun  size={18} className="text-amber-400" />
              : <Moon size={18} className="text-stone-500" />
            }
          </button>

          {/* New event */}
          <button onClick={onNewEvent} className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4">
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Nuevo evento</span>
            <span className="sm:hidden">Nuevo</span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 hover:bg-parchment dark:hover:bg-stone-800 rounded-xl px-2.5 py-1.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-wine text-white flex items-center justify-center text-xs font-bold shrink-0">
                {initial}
              </div>
              <span className="hidden sm:block text-sm text-stone-600 dark:text-stone-300 font-body max-w-[110px] truncate">
                {currentUser?.displayName || currentUser?.email}
              </span>
              <ChevronDown size={14} className="text-stone-400 hidden sm:block" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-stone-800 border border-rose-100 dark:border-stone-700 rounded-xl shadow-card animate-scale-in overflow-hidden">
                <div className="px-4 py-3 border-b border-rose-100 dark:border-stone-700">
                  <p className="text-xs text-stone-400 font-body">Conectado como</p>
                  <p className="text-sm text-stone-700 dark:text-stone-200 font-body truncate">{currentUser?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-stone-700 transition-colors font-body"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  )
}
