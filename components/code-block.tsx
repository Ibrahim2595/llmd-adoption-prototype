'use client'

import { useState } from 'react'

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function CodeBlock({
  code,
  language,
}: {
  code: string
  language?: string
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const lang = language?.replace(/language-/, '') || 'text'
  const displayLang = lang === 'text' ? '' : lang

  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{displayLang}</span>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code area */}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed" style={{ margin: 0 }}>
        <code className="font-mono text-gray-700 dark:text-gray-300">{code}</code>
      </pre>
    </div>
  )
}
