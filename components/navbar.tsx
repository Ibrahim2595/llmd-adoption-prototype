'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

const NAV_TABS = [
  { label: 'Docs',      href: '/docs/getting-started' },
  { label: 'Simulator', href: '/simulator' },
  { label: 'Blog',      href: '/blog' },
  { label: 'Community', href: '/community' },
]

function LlmDLogo() {
  return (
    <Image
      src="/img/llm-d-logotype-and-icon.png"
      alt="llm-d"
      width={90}
      height={26}
      className="h-auto w-auto"
      style={{ maxWidth: 90 }}
      priority
    />
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/docs/getting-started') return pathname.startsWith('/docs')
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <nav className="max-w-6xl mx-auto flex items-center h-14 px-6 gap-8">
        {/* Left: logo */}
        <Link href="/" className="flex-shrink-0 flex items-center">
          <LlmDLogo />
        </Link>

        {/* Center: nav tabs (desktop) */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_TABS.map((tab) => {
            const active = isActive(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  'px-3 py-1 text-base font-medium rounded-sm transition-colors relative',
                  active
                    ? 'text-purple'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50',
                ].join(' ')}
                style={active ? {
                  borderBottom: '2px solid #7B2D8E',
                  paddingBottom: '2px',
                } : {
                  borderBottom: '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Right: GitHub badge + theme toggle + Join Slack (desktop) */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {/* TODO: replace static star count with live fetch from https://api.github.com/repos/llm-d/llm-d (.stargazers_count) */}
          <a
            href="https://github.com/llm-d/llm-d"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 text-base text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <GithubIcon />
            GitHub
            <span className="ml-0.5 px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              ★ 2.9k
            </span>
          </a>
          <a
            href="https://llm-d.ai/slack"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-1 text-base text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Join Slack
          </a>
          <ThemeToggle />
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="md:hidden ml-auto p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-col gap-2">
          {NAV_TABS.map((tab) => {
            const active = isActive(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMenuOpen(false)}
                className={[
                  'block py-2 px-3 text-base rounded-md font-medium',
                  active
                    ? 'text-purple bg-purple-light dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                {tab.label}
              </Link>
            )
          })}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 flex flex-col gap-2">
            <a
              href="https://github.com/llm-d/llm-d"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 py-2 px-3 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              <GithubIcon />
              GitHub
              <span className="ml-0.5 px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                ★ 2.9k
              </span>
            </a>
            <a
              href="https://llm-d.ai/slack"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              Join Slack
            </a>
            <div className="py-2 px-3 flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
