import { browser } from './browser'
import {
  type ContentScript,
  type ContentScriptDefinition,
  type ContentScriptName,
  contentScripts,
} from './content-scripts'
import { loadSettings } from './settings/load-settings'
import { saveSettings } from './settings/save-settings'
import type { Settings } from './settings/types'
import { writeSettings } from './settings/write-settings'

export const IS_UPDATING_CONTENT_SCRIPTS_KEY = 'isUpdatingContentScripts'

export class ContentScriptUtil {
  /**
   * Check if the content scripts are updating.
   */
  static async isUpdating() {
    const result = await browser.storage.local.get(
      IS_UPDATING_CONTENT_SCRIPTS_KEY
    )
    return result[IS_UPDATING_CONTENT_SCRIPTS_KEY] ?? false
  }

  private static setIsUpdating(isUpdating: boolean) {
    return browser.storage.local.set({
      [IS_UPDATING_CONTENT_SCRIPTS_KEY]: isUpdating,
    })
  }

  static contentScriptSettingsKey(contentScriptName: ContentScriptName) {
    return `${contentScriptName}.enabled` as `${ContentScriptName}.enabled`
  }

  static async checkContentScriptEnabled(contentScriptName: ContentScriptName) {
    const settings = await loadSettings()
    return settings[this.contentScriptSettingsKey(contentScriptName)] === true
  }

  /**
   * Enable a content script.
   *
   * Do not use this for multiple content scripts. Use `enableContentScripts` instead.
   */
  static async enableContentScript(contentScript: ContentScript) {
    this.setIsUpdating(true)

    await this.registerContentScript(contentScript)
    await saveSettings(this.contentScriptSettingsKey(contentScript.name), true)

    this.setIsUpdating(false)
  }

  /**
   * Enable multiple content scripts
   */
  static async enableContentScripts(contentScripts: ContentScript[]) {
    this.setIsUpdating(true)

    for (const contentScript of contentScripts) {
      await this.registerContentScript(contentScript)
    }

    const settings = await loadSettings()

    for (const contentScript of contentScripts) {
      settings[this.contentScriptSettingsKey(contentScript.name)] = true
    }

    await writeSettings(settings)

    this.setIsUpdating(false)
  }

  /**
   * Disable a content script.
   *
   * Do not use this for multiple content scripts. Use `disableContentScripts` instead.
   */
  static async disableContentScript(contentScriptName: ContentScriptName) {
    this.setIsUpdating(true)

    await this.unregisterContentScript(contentScriptName)
    await saveSettings(
      this.contentScriptSettingsKey(contentScriptName),
      undefined
    )

    this.setIsUpdating(false)
  }

  /**
   * Disable multiple content scripts
   */
  static async disableContentScripts(contentScriptNames: ContentScriptName[]) {
    this.setIsUpdating(true)

    for (const contentScriptName of contentScriptNames) {
      await this.unregisterContentScript(contentScriptName)
    }

    const settings = await loadSettings()

    for (const contentScriptName of contentScriptNames) {
      delete settings[this.contentScriptSettingsKey(contentScriptName)]
    }

    await writeSettings(settings)

    this.setIsUpdating(false)
  }

  /**
   * TODO: Accept multiple content scripts and register them at once
   */
  private static async registerContentScript(
    contentScript: ContentScriptDefinition
  ) {
    try {
      const contentScripts =
        await browser.scripting.getRegisteredContentScripts()

      // Unregister first if the content script is already registered
      if (contentScripts.some((script) => script.id === contentScript.name)) {
        await browser.scripting.unregisterContentScripts({
          ids: [contentScript.name],
        })
      }

      // Register the content script
      await browser.scripting.registerContentScripts([
        {
          id: contentScript.name,
          matches: contentScript.matches,
          js: [`content-scripts/${contentScript.name}/index.js`],
          allFrames: contentScript.allFrames,
          // This property doesn't exist in polyfill
          // It's same as `match_about_blank` in manifest
          matchOriginAsFallback:
            contentScript.allFrames &&
            contentScript.matches.includes('<all_urls>')
              ? true
              : undefined,
          runAt: 'document_start',
        } as any,
      ])
    } catch (error) {
      // Registering content scripts would fail if there are no js files.
      console.error(error)
    }
  }

  private static async unregisterContentScript(
    contentScriptName: ContentScriptName
  ) {
    const contentScripts = await browser.scripting.getRegisteredContentScripts()

    try {
      // Unregister only if the content script is already registered
      if (contentScripts.some((script) => script.id === contentScriptName)) {
        await browser.scripting.unregisterContentScripts({
          ids: [contentScriptName],
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Refresh all content scripts
   *
   * TODO: Check if it works in parallel (Promise.all)
   */
  static async refreshAllContentScripts(settings: Settings) {
    this.setIsUpdating(true)

    for (const contentScript of contentScripts) {
      const key = this.contentScriptSettingsKey(contentScript.name)

      if (settings[key]) {
        await this.registerContentScript(contentScript)
      } else {
        await this.unregisterContentScript(contentScript.name)
      }
    }

    this.setIsUpdating(false)
  }
}
