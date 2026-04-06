import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { mdxComponents } from '@/components/mdx-components'
import type { Author } from '@/lib/blog'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function avatarUrl(author: Author): string | undefined {
  if (author.github) return `https://github.com/${author.github}.png`
  return author.avatar
}

function AuthorGrid({ authors }: { authors: Author[] }) {
  return (
    <div className={`grid gap-4 ${authors.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
      {authors.map((author) => {
        const url = avatarUrl(author)
        return (
          <div key={author.name} className="flex items-center gap-3">
            {url ? (
              <img
                src={url}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover bg-gray-100 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {author.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{author.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{author.title}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = getPostBySlug(slug)
  if (!result) return {}
  return {
    title: `${result.post.title} — llm-d`,
    description: result.post.description,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = getPostBySlug(slug)
  if (!result) notFound()

  const { post, source } = result

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/blog"
        className="text-sm text-gray-500 hover:text-purple transition-colors inline-block mb-8"
      >
        ← Back to Blog
      </Link>

      <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-50 leading-snug">{post.title}</h1>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(post.date)}
        {post.readingTime && <span> · {post.readingTime}</span>}
      </p>

      {post.authors.length > 0 && (
        <div className="mt-6">
          <AuthorGrid authors={post.authors} />
        </div>
      )}

      <div className="mt-10 prose-custom">
        <MDXRemote source={source} components={mdxComponents as Record<string, unknown>} />
      </div>

    </div>
  )
}
