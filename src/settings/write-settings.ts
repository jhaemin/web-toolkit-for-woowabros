import { browser } from '@/browser'
import { ContentScriptUtil } from '@/content-script-util'
import type { Settings } from './types'

/**
 * Override whole settings.
 *
 * If you want to refresh content scripts, use `writeSettingsAndRefreshContentScripts` instead.
 *
 * @param settings
 * @param preventSync Prevent syncing the settings. It still triggers the storage change event.
 */
export async function writeSettings(
  settings: Settings,
  preventSync = false
): Promise<void> {
  await browser.storage.local.set({
    settings,
    preventSync: preventSync === true ? true : undefined,
  })
}

export async function writeSettingsAndRefreshContentScripts(
  settings: Settings,
  preventSync = false
) {
  await ContentScriptUtil.refreshAllContentScripts(settings)

  // Write after refreshing content scripts to trigger the storage change event after the content scripts are completely registered or unregistered.
  // For example, $registeredContentScripts atom in src/options-page/store.ts listens to the storage change event and updates the atom.
  // If we write settings before refreshing content scripts, the atom will be updated before the content scripts are completely registered or unregistered.
  await writeSettings(settings, preventSync)
}
