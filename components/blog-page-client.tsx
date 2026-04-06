'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VideoEmbed } from '@/components/video-embed'
import type { BlogPost, Author } from '@/lib/blog'
import type { Video } from '@/lib/videos'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getYear(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').getFullYear().toString()
}

function avatarUrl(author: Author): string | undefined {
  if (author.github) return `https://github.com/${author.github}.png`
  return author.avatar
}

function AuthorRow({ authors, size = 8 }: { authors: Author[]; size?: number }) {
  const sizeClass = size === 10 ? 'w-10 h-10' : 'w-8 h-8'
  const textClass = size === 10 ? 'text-sm' : 'text-xs'
  return (
    <div className={`grid gap-3 ${authors.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
      {authors.map((author) => {
        const url = avatarUrl(author)
        return (
          <div key={author.name} className="flex items-center gap-2">
            {url ? (
              <img
                src={url}
                alt={author.name}
                className={`${sizeClass} rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0`}
              />
            ) : (
              <div className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center`}>
                <span className={`${textClass} font-medium text-gray-500 dark:text-gray-400`}>
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

function PostsList({ posts }: { posts: BlogPost[] }) {
  const byYear: Record<string, BlogPost[]> = {}
  for (const post of posts) {
    const year = getYear(post.date)
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(post)
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="flex gap-12">
      {/* Left sidebar: year + post title navigation */}
      <aside className="hidden lg:block w-[220px] shrink-0">
        <div className="sticky top-8">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Recent posts
          </p>
          {years.map((year) => (
            <div key={year} className="mb-6">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">{year}</p>
              <ul className="flex flex-col">
                {byYear[year].map((post) => (
                  <li key={post.slug} className="flex items-start gap-2 py-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple transition-colors leading-snug block"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main posts feed */}
      <div className="flex-1 min-w-0">
        {posts.map((post, i) => (
          <article
            key={post.slug}
            className={i > 0 ? 'mt-16 pt-16 border-t border-gray-100 dark:border-gray-700' : ''}
          >
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-50 hover:text-purple transition-colors leading-snug">
                {post.title}
              </h2>
            </Link>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {formatDate(post.date)}
              {post.readingTime && <span> · {post.readingTime}</span>}
            </p>

            {post.authors.length > 0 && (
              <div className="mt-4">
                <AuthorRow authors={post.authors} size={8} />
              </div>
            )}

            <p className="mt-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {post.description}
            </p>

            <div className="mt-4 flex justify-end">
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple transition-colors"
              >
                Read more →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function VideosList({ videos }: { videos: Video[] }) {
  const isOdd = videos.length % 2 !== 0
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">Learn llm-d</h2>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
          Explore our video collection to learn about llm-d's capabilities, architecture, and best practices.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {videos.map((video, i) => {
          const isLastOdd = isOdd && i === videos.length - 1
          return (
            <div
              key={`${video.youtubeId}-${video.title}`}
              className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden${isLastOdd ? ' md:col-span-2 md:max-w-[calc(50%-1rem)] md:mx-auto md:w-full' : ''}`}
            >
              <VideoEmbed youtubeId={video.youtubeId} title={video.title} />
              <div className="p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{video.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{video.description}</p>
                {(video.speaker || video.event) && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {video.speaker}
                    {video.speaker && video.event && ' · '}
                    {video.event}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface BlogPageClientProps {
  posts: BlogPost[]
  videos: Video[]
}

export function BlogPageClient({ posts, videos }: BlogPageClientProps) {
  const [tab, setTab] = useState<'posts' | 'videos'>('posts')

  return (
    <div className="flex-1 flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-6 py-12 flex flex-col flex-1">
        <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-50 mb-8">Blog</h1>

        {/* Tab bar */}
        <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700 mb-10">
          {(['posts', 'videos'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'pb-3 text-base font-medium transition-colors capitalize border-b-2 -mb-px',
                tab === t
                  ? 'border-gray-900 dark:border-gray-50 text-gray-900 dark:text-gray-50'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
              ].join(' ')}
            >
              {t === 'posts' ? 'Posts' : 'Videos'}
            </button>
          ))}
        </div>

        {tab === 'posts' ? <PostsList posts={posts} /> : <VideosList videos={videos} />}
      </div>
    </div>
  )
}
