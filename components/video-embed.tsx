interface VideoEmbedProps {
  youtubeId: string
  title?: string
}

export function VideoEmbed({ youtubeId, title = 'YouTube video' }: VideoEmbedProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
