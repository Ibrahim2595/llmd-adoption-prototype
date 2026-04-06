import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getMdxBySlug } from '@/lib/mdx'
import { getAllDocSlugs } from '@/lib/docs'
import { mdxComponents } from '@/components/mdx-components'

function titleCase(str: string) {
  return str.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function Breadcrumb({ slug }: { slug: string[] }) {
  const parts = slug.slice(0, -1).map(titleCase)
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
      <span>Docs</span>
      {parts.map((part) => (
        <span key={part} className="flex items-center gap-1.5">
          <span>/</span>
          <span>{part}</span>
        </span>
      ))}
    </nav>
  )
}

interface PageProps {
  params: { slug?: string[] }
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs()
  return [
    { slug: undefined },
    ...slugs.map((slug) => ({ slug })),
  ]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug ?? []
  if (slug.length === 0) return {}
  try {
    const { frontmatter } = getMdxBySlug(slug)
    return {
      title: `${frontmatter.title} — llm-d`,
      description: frontmatter.description,
    }
  } catch {
    return {}
  }
}

export default async function DocsPage({ params }: PageProps) {
  const slug = params.slug ?? []

  if (slug.length === 0) {
    redirect('/docs/getting-started')
  }

  let frontmatter, source
  try {
    ;({ frontmatter, source } = getMdxBySlug(slug))
  } catch {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto px-8 py-10">
      <Breadcrumb slug={slug} />
      <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-50 mb-3">
        {frontmatter!.title}
      </h1>
      {frontmatter!.description && (
        <p className="text-base text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          {frontmatter!.description}
        </p>
      )}
      <div className="docs-content">
        <MDXRemote source={source!} components={mdxComponents} />
      </div>
    </article>
  )
}
