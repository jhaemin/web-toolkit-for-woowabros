import type { ReactNode } from 'react'

export type ReleaseNoteContent = {
  message: ReactNode
  contributors?: string[]
}

export type ReleaseNote = {
  version: string
  date: string
  content?: {
    news?: ReleaseNoteContent[]
    fixes?: ReleaseNoteContent[]
    engineering?: ReleaseNoteContent[]
  }
  skipNotice?: boolean
}

export const releaseNotes: ReleaseNote[] = []
