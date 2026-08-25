import { CalendarDays, Mail, Camera } from 'lucide-react'

const TYPE_CONFIG = {
  evento: {
    Icon:  CalendarDays,
    label: 'Evento',
    cls:   'badge-evento',
  },
  mensaje: {
    Icon:  Mail,
    label: 'Mensaje',
    cls:   'badge-mensaje',
  },
  recuerdo: {
    Icon:  Camera,
    label: 'Recuerdo',
    cls:   'badge-recuerdo',
  },
}

export default function EventBadge({ tipo, showLabel = true }) {
  const cfg = TYPE_CONFIG[tipo] || TYPE_CONFIG.evento
  const { Icon } = cfg
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <Icon size={10} strokeWidth={2.5} />
      {showLabel && cfg.label}
    </span>
  )
}

export { TYPE_CONFIG }
