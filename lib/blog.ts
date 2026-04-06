import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'

export interface Author {
  name: string
  title: string
  avatar?: string
  github?: string
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  authors: Author[]
  tags: string[]
  readingTime?: string
  content?: string
}

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true })
  }
}

export function getAllPosts(): BlogPost[] {
  ensureBlogDir()
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
    const { data } = matter(raw)

    return {
      slug,
      title: data.title ?? '',
      description: data.description ?? '',
      date: data.date ?? '',
      authors: (data.authors ?? []) as Author[],
      tags: (data.tags ?? []) as string[],
      readingTime: data.readingTime,
    } satisfies BlogPost
  })

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string): { post: BlogPost; source: string } {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  const post: BlogPost = {
    slug,
    title: data.title ?? '',
    description: data.description ?? '',
    date: data.date ?? '',
    authors: (data.authors ?? []) as Author[],
    tags: (data.tags ?? []) as string[],
    readingTime: data.readingTime,
  }

  return { post, source: content }
}
