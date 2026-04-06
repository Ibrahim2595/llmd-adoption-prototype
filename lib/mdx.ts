import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const LATEST_DOCS_DIR = path.join(process.cwd(), 'content/docs')
const VERSIONED_DOCS_BASE = path.join(process.cwd(), 'content/docs-versions')

function getDocsDir(version?: string): string {
  if (version) return path.join(VERSIONED_DOCS_BASE, version)
  return LATEST_DOCS_DIR
}

export type DocFrontmatter = {
  title: string
  description: string
  sidebar_order: number
  sidebar_group?: string
  sidebar_icon?: string
}

export type Heading = {
  id: string
  text: string
  level: number
}

export function toHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/`[^`]*`/g, (m) => m.slice(1, -1)) // strip backticks but keep content
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function extractHeadings(source: string): Heading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: Heading[] = []
  let match
  while ((match = headingRegex.exec(source)) !== null) {
    const level = match[1].length
    const text = match[2].trim().replace(/\*\*/g, '').replace(/`/g, '')
    headings.push({ id: toHeadingId(text), text, level })
  }
  return headings
}

export function getMdxBySlug(slugArray: string[], version?: string): {
  frontmatter: DocFrontmatter
  source: string
  headings: Heading[]
} {
  const docsDir = getDocsDir(version)
  // Try slug as a direct .mdx file first
  let filePath = path.join(docsDir, ...slugArray) + '.mdx'

  if (!fs.existsSync(filePath)) {
    // Fall back to index.mdx inside a folder of that name
    filePath = path.join(docsDir, ...slugArray, 'index.mdx')
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`No MDX file found for slug: ${slugArray.join('/')}`)
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  const frontmatter: DocFrontmatter = {
    title: data.title ?? 'Untitled',
    description: data.description ?? '',
    sidebar_order: data.sidebar_order ?? 99,
    sidebar_group: data.sidebar_group,
    sidebar_icon: data.sidebar_icon,
  }

  return {
    frontmatter,
    source: content,
    headings: extractHeadings(content),
  }
}
