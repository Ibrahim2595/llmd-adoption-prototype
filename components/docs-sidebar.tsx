'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { DocGroup, DocPage } from '@/lib/docs'

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
      className={`transition-transform ${open ? 'rotate-90' : ''}`}
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function SidebarLink({ item, pathname }: { item: DocPage; pathname: string }) {
  const active = pathname === item.href || pathname === item.href + '/'
  return (
    <Link
      href={item.href}
      className={[
        'flex items-center py-2 pl-3 pr-2 rounded-md text-sm transition-colors',
        active
          ? 'bg-gray-100 dark:bg-gray-700 font-medium text-gray-900 dark:text-gray-50'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
      ].join(' ')}
    >
      {item.title}
    </Link>
  )
}

function groupContainsActive(group: DocGroup, pathname: string): boolean {
  if (group.index && (pathname === group.index.href || pathname.startsWith(group.index.href + '/'))) return true
  for (const child of group.children) {
    if (child.type === 'page' && (pathname === child.href || pathname.startsWith(child.href + '/'))) return true
    if (child.type === 'group' && groupContainsActive(child, pathname)) return true
  }
  return false
}

function SidebarGroup({
  group,
  pathname,
  depth = 0,
}: {
  group: DocGroup
  pathname: string
  depth?: number
}) {
  const hasActive = groupContainsActive(group, pathname)
  const [open, setOpen] = useState(hasActive || depth <= 1)

  const isTopLevel = depth === 0

  return (
    <div>
      {/* Group heading */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center justify-between w-full py-2 pr-2 text-left',
          isTopLevel ? 'pl-1' : 'pl-3',
        ].join(' ')}
        aria-expanded={open}
      >
        <span
          className={
            isTopLevel
              ? 'text-xs font-semibold text-gray-900 dark:text-gray-50'
              : 'text-sm font-medium text-gray-700 dark:text-gray-300'
          }
        >
          {group.name}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className={['flex flex-col gap-0.5', !isTopLevel ? 'pl-3' : ''].join(' ')}>
          {/* Index page (group landing) */}
          {group.index && (
            <SidebarLink item={group.index} pathname={pathname} />
          )}

          {/* Children */}
          {group.children.map((child) => {
            if (child.type === 'page') {
              return <SidebarLink key={child.href} item={child} pathname={pathname} />
            }
            return (
              <SidebarGroup
                key={child.href}
                group={child}
                pathname={pathname}
                depth={depth + 1}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Close icon ───────────────────────────────────────────────
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

/** Extract version key from pathname for treesMap lookup. */
function getActiveVersionKey(pathname: string): string {
  if (pathname.startsWith('/docs/v/')) {
    return pathname.split('/')[3] ?? ''
  }
  return 'v0.6' // latest
}

// ─── Main export ──────────────────────────────────────────────
export function DocsSidebar({ treesMap }: { treesMap: Record<string, DocGroup[]> }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeKey = getActiveVersionKey(pathname)
  const tree = treesMap[activeKey] ?? treesMap['v0.6'] ?? []

  const SidebarContent = (
    <nav className="flex flex-col gap-1 py-6 px-3">
      {tree.map((group, i) => (
        <div key={group.href} className={i > 0 ? 'mt-6' : ''}>
          <SidebarGroup group={group} pathname={pathname} depth={0} />
        </div>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[250px] shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        {SidebarContent}
      </aside>

      {/* Mobile: floating button + off-canvas drawer */}
      <div className="md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 shadow-md"
        >
          <MenuIcon />
          Menu
        </button>

        {drawerOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">Navigation</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <CloseIcon />
                </button>
              </div>
              {SidebarContent}
            </aside>
          </>
        )}
      </div>
    </>
  )
}
