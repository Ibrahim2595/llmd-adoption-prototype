import { CommunitySidebar } from '@/components/community-sidebar'
import { TableOfContents } from '@/components/table-of-contents'

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <CommunitySidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main id="docs-main" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <aside className="hidden xl:block w-[200px] shrink-0 border-l border-gray-100 dark:border-gray-700 overflow-y-auto">
        <TableOfContents />
      </aside>
    </div>
  )
}
