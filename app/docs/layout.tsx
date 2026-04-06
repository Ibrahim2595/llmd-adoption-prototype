import { getDocsTree, getAllDocSlugs } from '@/lib/docs'
import { versions } from '@/lib/versions'
import { DocsSidebar } from '@/components/docs-sidebar'
import { VersionSwitcher } from '@/components/version-switcher'
import { TableOfContents } from '@/components/table-of-contents'
import type { DocGroup } from '@/lib/docs'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  // Build ALL version trees server-side. DocsSidebar is a client component with
  // usePathname() — it picks the right tree reactively on every navigation,
  // which means switching versions updates the sidebar without a full page reload.
  const treesMap: Record<string, DocGroup[]> = {}
  for (const v of versions) {
    treesMap[v.version] = v.isLatest ? getDocsTree() : getDocsTree(v.version)
  }

  // Pre-compute valid slug paths per version so VersionSwitcher (client component)
  // can check before navigating — falling back to version root when the current
  // page doesn't exist in the target version.
  const validSlugsPerVersion: Record<string, string[]> = {}
  for (const v of versions) {
    const slugs = v.isLatest ? getAllDocSlugs() : getAllDocSlugs(v.version)
    validSlugsPerVersion[v.version] = slugs.map((s) => s.join('/'))
  }

  // Three-column layout where each column manages its own scroll independently.
  // The outer div has a fixed height (viewport minus navbar). The parent does NOT
  // scroll — only the three children do, each via overflow-y-auto.
  return (
    <div className="flex" style={{ height: 'calc(100vh - 3.5rem)' }}>

      {/* Sidebar — scrolls independently */}
      <DocsSidebar treesMap={treesMap} />

      {/* Center column: version bar pinned at top, then scrollable content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="shrink-0 h-10 flex items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8">
          <VersionSwitcher validSlugsPerVersion={validSlugsPerVersion} />
        </div>
        <main
          id="docs-main"
          className="flex-1 overflow-y-auto"
        >
          {children}
        </main>
      </div>

      {/* TOC — scrolls independently, hidden below xl */}
      <aside className="hidden xl:block w-[200px] shrink-0 border-l border-gray-100 dark:border-gray-700 overflow-y-auto">
        <TableOfContents />
      </aside>

    </div>
  )
}
