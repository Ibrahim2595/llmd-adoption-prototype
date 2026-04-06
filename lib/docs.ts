import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const LATEST_DOCS_DIR = path.join(process.cwd(), 'content/docs')
const VERSIONED_DOCS_BASE = path.join(process.cwd(), 'content/docs-versions')

function getDocsDir(version?: string): string {
  if (version) return path.join(VERSIONED_DOCS_BASE, version)
  return LATEST_DOCS_DIR
}

export type DocPage = {
  type: 'page'
  title: string
  description: string
  sidebar_order: number
  sidebar_icon?: string
  slug: string[]
  href: string
}

export type DocGroup = {
  type: 'group'
  name: string      // display name
  slug: string[]
  href: string
  index?: DocPage   // only set when folder has an index.mdx
  children: Array<DocPage | DocGroup>
  groupOrder: number
  minOrder: number  // alias for groupOrder (used in recursive min calculations)
}

function titleCase(str: string): string {
  return str
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function readPageMeta(filePath: string, slug: string[], version?: string): DocPage {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(raw)
  const hrefBase = version ? `/docs/v/${version}` : '/docs'
  return {
    type: 'page',
    title: data.title ?? titleCase(slug[slug.length - 1]),
    description: data.description ?? '',
    sidebar_order: data.sidebar_order ?? 99,
    sidebar_icon: data.sidebar_icon,
    slug,
    href: `${hrefBase}/${slug.join('/')}`,
  }
}

type GroupMeta = {
  order?: number
  title?: string
}

/** Read optional _group.json for non-page group metadata (order + display title). */
function readGroupJson(dir: string): GroupMeta {
  const p = path.join(dir, '_group.json')
  if (!fs.existsSync(p)) return {}
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as GroupMeta
  } catch {
    return {}
  }
}

function walkDir(dir: string, slugPrefix: string[], version?: string): Array<DocPage | DocGroup> {
  if (!fs.existsSync(dir)) return []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const items: Array<DocPage | DocGroup> = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = path.join(dir, entry.name)
      const subSlug = [...slugPrefix, entry.name]

      // index.mdx → group landing page (optional)
      const indexPath = path.join(subDir, 'index.mdx')
      const index = fs.existsSync(indexPath)
        ? readPageMeta(indexPath, subSlug, version)
        : undefined

      // _group.json → lightweight group metadata (no page created)
      const groupJson = readGroupJson(subDir)

      // Recurse — pages inside (excluding index.mdx)
      const children = walkDir(subDir, subSlug, version)

      // Display name: _group.json title > index.mdx group_title > titleCase(folder)
      let groupName = titleCase(entry.name)
      if (index) {
        const raw = fs.readFileSync(indexPath, 'utf-8')
        const gt = (matter(raw).data as { group_title?: string }).group_title
        if (gt) groupName = gt
      }
      if (groupJson.title) groupName = groupJson.title

      // Group sort key (position among sibling groups):
      //   1. index.mdx sidebar_order  — explicit, decoupled from item ordering
      //   2. _group.json order        — for groups without a navigable index
      //   3. min child order          — fallback for sub-groups (e.g. quickstart/)
      const minChildOrder = Math.min(
        ...children.map((c) =>
          c.type === 'page' ? c.sidebar_order : c.minOrder,
        ),
        999,
      )
      const groupOrder =
        index?.sidebar_order ?? groupJson.order ?? minChildOrder

      const hrefBase = version ? `/docs/v/${version}` : '/docs'
      items.push({
        type: 'group',
        name: groupName,
        slug: subSlug,
        href: index?.href ?? `${hrefBase}/${subSlug.join('/')}`,
        index,
        children,
        groupOrder,
        minOrder: groupOrder,
      })
    } else if (
      entry.name.endsWith('.mdx') &&
      entry.name !== 'index.mdx'
    ) {
      const filePath = path.join(dir, entry.name)
      const fileSlug = [...slugPrefix, entry.name.replace(/\.mdx$/, '')]
      items.push(readPageMeta(filePath, fileSlug, version))
    }
    // _group.json is intentionally ignored as a page entry
  }

  // Sort: groups by groupOrder, pages by sidebar_order
  items.sort((a, b) => {
    const aOrder = a.type === 'page' ? a.sidebar_order : a.groupOrder
    const bOrder = b.type === 'page' ? b.sidebar_order : b.groupOrder
    return aOrder - bOrder
  })

  return items
}

export function getDocsTree(version?: string): DocGroup[] {
  const docsDir = getDocsDir(version)
  if (!fs.existsSync(docsDir)) return []
  const items = walkDir(docsDir, [], version)
  return items.filter((i): i is DocGroup => i.type === 'group')
}

/** Flat list of every page slug (for generateStaticParams). */
export function getAllDocSlugs(version?: string): string[][] {
  function flatten(items: Array<DocPage | DocGroup>): string[][] {
    const out: string[][] = []
    for (const item of items) {
      if (item.type === 'page') {
        out.push(item.slug)
      } else {
        if (item.index) out.push(item.index.slug)
        out.push(...flatten(item.children))
      }
    }
    return out
  }
  return flatten(getDocsTree(version))
}
