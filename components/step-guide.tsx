import { ReactNode } from 'react'

export function StepGuide({ children }: { children: ReactNode }) {
  return <div className="my-8 flex flex-col gap-8">{children}</div>
}

export function Step({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children?: ReactNode
  last?: boolean
}) {
  return (
    <div>
      {/* Number on its own line, then title flush to the left edge */}
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">
        Step {number}
      </p>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">{title}</h3>
      {children && (
        <div className="text-gray-700 dark:text-gray-300">{children}</div>
      )}
    </div>
  )
}
