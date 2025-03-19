export type ReleaseNote = {
  version: string
  date: string
  messages?: string[]
  skipNotice?: boolean
}

export const releaseNotes: ReleaseNote[] = [
  {
    version: '1.0.0',
    date: '2025-03-19',
    messages: ['웹 툴킷 for 우아한형제들 릴리즈'],
  },
]
