import { ComponentPropsWithoutRef, ReactNode, isValidElement } from 'react'
import { CodeBlock } from './code-block'
import { Callout } from './callout'
import { CodeTabs } from './code-tabs'
import { StepGuide, Step } from './step-guide'
import { NavCards, NavCard } from './nav-card'
import { toHeadingId } from '@/lib/mdx'

// Anchor link shown on heading hover
function HeadingAnchor({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      className="ml-2 opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-opacity text-base font-normal no-underline"
      aria-label={`Link to section`}
    >
      #
    </a>
  )
}

function getTextContent(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(getTextContent).join('')
  if (isValidElement(children)) {
    return getTextContent((children.props as { children?: ReactNode }).children)
  }
  return ''
}

// Heading factory
function makeHeading(
  Tag: 'h1' | 'h2' | 'h3',
  className: string,
) {
  return function Heading({ children, ...props }: ComponentPropsWithoutRef<typeof Tag>) {
    const text = getTextContent(children)
    const id = toHeadingId(text)
    return (
      // @ts-expect-error dynamic tag
      <Tag id={id} className={`group ${className}`} {...props}>
        {children}
        <HeadingAnchor id={id} />
      </Tag>
    )
  }
}

function InlineCode({ children, ...props }: ComponentPropsWithoutRef<'code'>) {
  return (
    <code
      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded"
      {...props}
    >
      {children}
    </code>
  )
}

function Pre({ children }: ComponentPropsWithoutRef<'pre'>) {
  const codeEl = children as React.ReactElement<{
    className?: string
    children?: string
  }>

  if (isValidElement(codeEl)) {
    const className = codeEl.props?.className ?? ''
    const language = className.replace('language-', '')
    const code = String(codeEl.props?.children ?? '').trimEnd()
    return <CodeBlock code={code} language={language} />
  }

  return (
    <pre className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-700 dark:text-gray-300 my-6">
      {children}
    </pre>
  )
}

export const mdxComponents = {
  // Headings
  h1: makeHeading('h1', 'text-4xl font-semibold text-gray-900 dark:text-gray-50 mt-10 mb-4 ml-0 pl-0'),
  h2: makeHeading('h2', 'text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-8 mb-3 ml-0 pl-0'),
  h3: makeHeading('h3', 'text-xl font-semibold text-gray-900 dark:text-gray-50 mt-6 mb-2 ml-0 pl-0'),

  // Text
  p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4 ml-0 pl-0" {...props}>{children}</p>
  ),
  a: ({ children, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors" {...props}>{children}</a>
  ),

  // Lists
  ul: ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
    <ul className="text-gray-700 dark:text-gray-300 list-disc pl-5 mb-4 ml-0" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol className="text-gray-700 dark:text-gray-300 list-decimal pl-5 mb-4 ml-0" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: ComponentPropsWithoutRef<'li'>) => (
    <li className="mb-2" {...props}>{children}</li>
  ),

  // Code
  pre: Pre,
  code: InlineCode,

  // Table
  table: ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse text-sm" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
    <th className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-50 font-semibold border border-gray-200 dark:border-gray-700 py-2 px-3 text-left" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
    <td className="text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-2 px-3" {...props}>{children}</td>
  ),

  // Misc
  blockquote: ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 text-gray-500 dark:text-gray-400 italic my-6 ml-0" {...props}>{children}</blockquote>
  ),
  hr: () => <hr className="border-gray-200 dark:border-gray-700 my-8" />,

  // Custom MDX components (used without import in .mdx files)
  Callout,
  CodeTabs,
  StepGuide,
  Step,
  NavCards,
  NavCard,
}
