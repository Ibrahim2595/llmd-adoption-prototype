import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export interface Video {
  title: string
  description: string
  youtubeId: string
  date: string
  speaker?: string
  event?: string
  tags?: string[]
}

export function getAllVideos(): Video[] {
  const filePath = path.join(process.cwd(), 'content/videos.yaml')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const videos = yaml.load(raw) as Video[]
  return videos.sort((a, b) => (a.date < b.date ? 1 : -1))
}
