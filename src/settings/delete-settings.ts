import { browser } from '@/browser'
import { loadSettings } from './load-settings'
import type { Settings } from './types'

export async function deleteSettings<T extends keyof Settings>(
  key: T
): Promise<void> {
  const settings = await loadSettings()

  delete settings[key]

  await browser.storage.local.set({ settings })
}
