'use client'

import { useState } from 'react'
import Link from 'next/link'

const ANNOUNCEMENT_MESSAGE = 'llm-d 0.5 is now released!'
const ANNOUNCEMENT_LINK_TEXT = 'Read the announcement'
const ANNOUNCEMENT_LINK_HREF = '/blog/llm-d-v0.5'

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative flex items-center justify-center w-full bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-2">
      <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
        {ANNOUNCEMENT_MESSAGE}{' '}
        <Link
          href={ANNOUNCEMENT_LINK_HREF}
          className="text-purple hover:text-purple-dark underline underline-offset-2"
        >
          {ANNOUNCEMENT_LINK_TEXT} →
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}
