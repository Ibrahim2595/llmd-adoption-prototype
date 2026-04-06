'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { versions, type VersionEntry } from '@/lib/versions'

function getCurrentVersion(pathname: string): VersionEntry {
  if (pathname.startsWith('/docs/v/')) {
    const versionStr = pathname.split('/')[3]
    return versions.find((v) => v.version === versionStr) ?? versions.find((v) => v.isLatest)!
  }
  return versions.find((v) => v.isLatest)!
}

function getSlugPath(pathname: string): string {
  if (pathname.startsWith('/docs/v/')) {
    return pathname.split('/').slice(4).join('/')
  }
  return pathname.slice('/docs/'.length)
}

function buildUrl(version: VersionEntry, slugPath: string): string {
  if (version.isLatest) return `/docs/${slugPath}`
  return `/docs/v/${version.version}/${slugPath}`
}

export function VersionSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentVersion = getCurrentVersion(pathname)
  const slugPath = getSlugPath(pathname)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(version: VersionEntry) {
    setOpen(false)
    router.push(buildUrl(version, slugPath))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{currentVersion.label}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full mt-1 left-0 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm z-50 overflow-hidden"
        >
          {versions.map((v) => {
            const isSelected = v.version === currentVersion.version
            return (
              <button
                key={v.version}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(v)}
                className={[
                  'w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors',
                  isSelected
                    ? 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  {isSelected ? <CheckIcon /> : <span className="w-3" />}
                  <span>{v.label}</span>
                </div>
                <span className="text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                  {v.badge}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
