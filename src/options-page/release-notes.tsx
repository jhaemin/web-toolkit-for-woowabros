export type ReleaseNote = {
  version: string
  date: string
  messages?: string[]
  skipNotice?: boolean
}

export const releaseNotes: ReleaseNote[] = []
