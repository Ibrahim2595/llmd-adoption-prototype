'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Welcome to llm-d', href: '/community' },
  { label: 'Contributing', href: '/community/contribute' },
  { label: 'Upcoming Events', href: '/community/events' },
  { label: 'Code of Conduct', href: '/community/code-of-conduct' },
  { label: 'Special Interest Groups', href: '/community/sigs' },
  { label: 'Security Policy', href: '/community/security' },
]

export function CommunitySidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <nav className="py-6 px-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 px-2">
          Community
        </p>
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    'block px-2 py-1.5 rounded text-sm transition-colors',
                    active
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
