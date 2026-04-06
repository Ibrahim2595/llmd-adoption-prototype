import Link from 'next/link'

const COLUMNS = [
  {
    heading: 'Project',
    links: [
      { label: 'Architecture',  href: '/docs/getting-started' },
      { label: 'Guides',        href: '/docs/production-deployment' },
      { label: 'Usage',         href: '/docs/getting-started/prerequisites' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Contributing',    href: '/community' },
      { label: 'Code of Conduct', href: '/community' },
      { label: 'Slack',           href: 'https://llm-d.ai/slack', external: true },
    ],
  },
  {
    heading: 'Social',
    links: [
      { label: 'GitHub',    href: 'https://github.com/llm-d/llm-d',    external: true },
      { label: 'LinkedIn',  href: 'https://linkedin.com/company/llm-d', external: true },
      { label: 'X',         href: 'https://x.com/llm_d',          external: true },
      { label: 'Reddit',    href: 'https://reddit.com/r/llmd',     external: true },
      { label: 'Bluesky',   href: 'https://bsky.app/profile/llm-d.ai', external: true },
      { label: 'YouTube',   href: 'https://youtube.com/@llm-d',    external: true },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">© 2026 llm-d Project</p>
        </div>
      </div>
    </footer>
  )
}
