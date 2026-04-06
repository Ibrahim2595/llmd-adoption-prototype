import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog'
import { getAllVideos } from '@/lib/videos'
import { BlogPageClient } from '@/components/blog-page-client'

export const metadata: Metadata = {
  title: 'Blog — llm-d',
  description: 'News, releases, and technical posts from the llm-d project.',
}

export default function BlogPage() {
  const posts = getAllPosts()
  const videos = getAllVideos()
  return <BlogPageClient posts={posts} videos={videos} />
}
