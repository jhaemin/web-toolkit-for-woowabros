declare global {
  // Global debug flags are defined by `build-context.ts`.
  // Use `dev:debug:` scripts for debugging.
  const DEBUG_RELEASE_NOTES: boolean

  interface Window {
    isSavingSettings: boolean
    saveSettingsQueue: (() => void)[]
  }
}

export type {}
