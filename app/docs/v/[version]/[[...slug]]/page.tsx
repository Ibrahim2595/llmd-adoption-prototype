import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getMdxBySlug } from '@/lib/mdx'
import { getAllDocSlugs } from '@/lib/docs'
import { versions } from '@/lib/versions'
import { mdxComponents } from '@/components/mdx-components'

function titleCase(str: string) {
  return str.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function Breadcrumb({ version, slug }: { version: string; slug: string[] }) {
  const parts = slug.slice(0, -1).map(titleCase)
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
      <span>Docs</span>
      <span className="flex items-center gap-1.5">
        <span>/</span>
        <span>{version}</span>
      </span>
      {parts.map((part) => (
        <span key={part} className="flex items-center gap-1.5">
          <span>/</span>
          <span>{part}</span>
        </span>
      ))}
    </nav>
  )
}

// Any path not returned by generateStaticParams is a hard 404 — never tries to
// render a versioned page whose .mdx file doesn't exist.
export const dynamicParams = false

interface PageProps {
  params: Promise<{ version: string; slug?: string[] }>
}

export async function generateStaticParams() {
  const nonLatest = versions.filter((v) => !v.isLatest)
  const params: { version: string; slug: string[] | undefined }[] = []
  for (const v of nonLatest) {
    params.push({ version: v.version, slug: undefined })
    const slugs = getAllDocSlugs(v.version)
    for (const slug of slugs) {
      params.push({ version: v.version, slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { version, slug = [] } = await params
  if (slug.length === 0) return {}
  try {
    const { frontmatter } = getMdxBySlug(slug, version)
    return {
      title: `${frontmatter.title} (${version}) — llm-d`,
      description: frontmatter.description,
    }
  } catch {
    return {}
  }
}

export default async function VersionedDocsPage({ params }: PageProps) {
  const { version, slug = [] } = await params

  const versionEntry = versions.find((v) => v.version === version)
  if (!versionEntry) notFound()

  if (slug.length === 0) {
    redirect(`/docs/v/${version}/getting-started`)
  }

  let frontmatter, source
  try {
    ;({ frontmatter, source } = getMdxBySlug(slug, version))
  } catch {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto px-8 py-10">
      <Breadcrumb version={version} slug={slug} />
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
