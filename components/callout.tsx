import { ReactNode } from 'react'

type CalloutType = 'info' | 'tip' | 'warning'

const styles: Record<
  CalloutType,
  { bg: string; border: string; icon: ReactNode; iconColor: string }
> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-500',
    iconColor: '#3B82F6',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  tip: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-500',
    iconColor: '#22C55E',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-500',
    iconColor: '#F59E0B',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
}

export function Callout({
  type = 'info',
  children,
}: {
  type?: CalloutType
  children: ReactNode
}) {
  const s = styles[type]
  return (
    <div className={`${s.bg} border-l-[3px] ${s.border} rounded-lg p-4 my-6 flex gap-3 text-gray-700 dark:text-gray-300`}>
      <span className="mt-0.5 shrink-0" style={{ color: s.iconColor }}>
        {s.icon}
      </span>
      <div className="flex-1 text-sm leading-6">{children}</div>
    </div>
  )
}
