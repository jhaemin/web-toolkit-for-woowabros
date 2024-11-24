import { browser } from '@/browser'
import type { Settings } from '@/settings/types'

/**
 * Load settings from storage
 */
export async function loadSettings(): Promise<Settings> {
  const storage = await browser.storage.local.get('settings')
  return storage.settings ?? {}
}
