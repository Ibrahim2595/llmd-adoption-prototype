export type VersionEntry = {
  version: string
  label: string
  badge: string
  isLatest: boolean
}

export const versions: VersionEntry[] = [
  { version: 'v0.6', label: 'Latest (v0.6)', badge: 'Stable', isLatest: true },
  { version: 'v0.5.1', label: 'v0.5.1', badge: 'Stable', isLatest: false },
]

export const latestVersion = versions.find((v) => v.isLatest)!
