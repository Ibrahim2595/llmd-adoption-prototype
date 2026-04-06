'use client'

import { useState, Children, isValidElement } from 'react'
import { CodeBlock } from './code-block'

// Extract code + language from a <pre><code className="language-X"> element
function getCodeAndLang(child: React.ReactNode): { code: string; language: string } {
  if (typeof child === 'string') return { code: child.trim(), language: '' }

  if (isValidElement(child)) {
    const preEl = child as React.ReactElement<{ children?: React.ReactNode }>
    const codeEl = preEl.props?.children

    if (isValidElement(codeEl)) {
      const c = codeEl as React.ReactElement<{ className?: string; children?: React.ReactNode }>
      const language = c.props?.className?.replace('language-', '') ?? ''
      const code =
        typeof c.props?.children === 'string' ? c.props.children.trimEnd() : ''
      return { code, language }
    }

    if (typeof preEl.props?.children === 'string') {
      return { code: preEl.props.children.trimEnd(), language: '' }
    }
  }

  return { code: '', language: '' }
}

/**
 * Tabbed code block component.
 *
 * Usage in MDX:
 *   <CodeTabs labels="curl,Python">
 *     ```shell
 *     curl ...
 *     ```
 *     ```python
 *     import ...
 *     ```
 *   </CodeTabs>
 *
 * `labels` is a comma-separated string so it survives RSC serialization.
 * If omitted, tab labels are auto-derived from each child's language.
 */
export function CodeTabs({
  labels,
  children,
}: {
  labels?: string        // comma-separated, e.g. "curl,Python"
  children: React.ReactNode
}) {
  const [active, setActive] = useState(0)
  const childArray = Children.toArray(children)

  // Parse labels: comma-separated string → string[]
  // If not provided, derive from child language classnames
  const parsedLabels: string[] = labels
    ? labels.split(',').map((l) => l.trim())
    : childArray.map((child, i) => {
        const { language } = getCodeAndLang(child)
        return language || `Tab ${i + 1}`
      })

  return (
    <div className="my-6">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        {parsedLabels.map((label, i) => (
          <button
            key={label}
            onClick={() => setActive(i)}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              active === i
                ? 'text-purple border-purple'
                : 'text-gray-500 border-transparent hover:text-gray-700',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div>
        {childArray.map((child, i) => {
          if (i !== active) return null
          const { code, language } = getCodeAndLang(child)
          return (
            <div key={i}>
              <CodeBlock code={code} language={language} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
