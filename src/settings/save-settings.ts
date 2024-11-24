import { browser } from '@/browser'
import { loadSettings } from './load-settings'
import type { Settings } from './types'

/**
 * Update specific settings.
 * Pass `undefined` to remove the key.
 *
 * If multiple content scripts call saveSettings() at the same time, the last one will be saved.
 * There is no way to wait others to finish because they are in different contexts.
 * So it is implemented with queue to prevent losing data between different scripts (mutex lock).
 * The queue is stored in window object to be shared across multiple contexts.
 */
export async function saveSettings<T extends keyof Settings>(
  key: T,
  value: Settings[T]
): Promise<void> {
  const hasWindow = typeof window !== 'undefined'

  // Prevent saving settings while saving settings
  if (hasWindow && window.isSavingSettings === true) {
    window.saveSettingsQueue = window.saveSettingsQueue ?? []

    // Add to queue
    window.saveSettingsQueue.push(() => saveSettings(key, value))
    return
  }

  // Flag on
  if (hasWindow) {
    window.isSavingSettings = true
  }

  const settings = await loadSettings()

  const newSettings = {
    ...settings,
    [key]: value,
  }

  // Remove key if value is undefined
  if (value === undefined) {
    delete newSettings[key]
  }

  await browser.storage.local.set({
    settings: newSettings,
  })

  // Flag off
  if (hasWindow) {
    window.isSavingSettings = false
  }

  // Run next queue if exists
  if (hasWindow && window.saveSettingsQueue?.length) {
    window.saveSettingsQueue.shift()?.()
  }
}
