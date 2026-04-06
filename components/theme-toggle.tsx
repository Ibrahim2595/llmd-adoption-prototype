'use client'

import { useEffect, useState } from 'react'

function SunIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Sync with the class that the inline script set before paint
    setDark(document.documentElement.classList.contains('dark'))
    setMounted(true)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Render a placeholder with the same dimensions before mount to avoid layout shift
  if (!mounted) {
    return <div className="w-14 h-7 rounded-full bg-gray-200" aria-hidden="true" />
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors flex items-center shrink-0"
    >
      {/* Sun icon — left side */}
      <span className="absolute left-1.5 text-gray-500 dark:text-gray-400 pointer-events-none">
        <SunIcon />
      </span>
      {/* Moon icon — right side */}
      <span className="absolute right-1.5 text-gray-500 dark:text-gray-400 pointer-events-none">
        <MoonIcon />
      </span>
      {/* Sliding thumb */}
      <span
        className={`absolute w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-150 ${
          dark ? 'translate-x-[30px]' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
