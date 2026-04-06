'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)
  const pathname = usePathname()

  // Re-scan headings whenever the page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const main = document.getElementById('docs-main')
      if (!main) return
      const els = Array.from(main.querySelectorAll('h2, h3'))
      const found: Heading[] = els
        .map((el) => ({
          id: el.id,
          text: (el.textContent ?? '').replace(/#\s*$/, '').trim(),
          level: el.tagName === 'H2' ? 2 : 3,
        }))
        .filter((h) => h.id && h.text)
      setHeadings(found)
      setActiveId('')
    }, 50)
    return () => clearTimeout(timer)
  }, [pathname])

  // Set up IntersectionObserver against the docs-main scroll container
  useEffect(() => {
    if (headings.length === 0) return

    const main = document.getElementById('docs-main')
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    if (elements.length === 0) return

    const visible = new Set<string>()
    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id)
          } else {
            visible.delete(entry.target.id)
          }
        }
        for (const h of headings) {
          if (visible.has(h.id)) {
            setActiveId(h.id)
            break
          }
        }
      },
      { root: main, rootMargin: '0px 0px -60% 0px', threshold: 0 },
    )

    elements.forEach((el) => observerRef.current!.observe(el))
    return () => observerRef.current?.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="On this page" className="px-4 py-10">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
        On this page
      </p>
      <ul className="flex flex-col gap-0.5">
        {headings.map((h) => {
          const active = h.id === activeId
          return (
            <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
              <a
                href={`#${h.id}`}
                className={[
                  'block py-1 text-[13px] leading-snug transition-colors border-l-2',
                  active
                    ? 'border-purple text-gray-900 dark:text-gray-50 font-medium pl-3'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 pl-3',
                ].join(' ')}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
