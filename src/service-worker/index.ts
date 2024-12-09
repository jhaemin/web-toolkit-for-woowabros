import { ContentScriptUtil } from '@/content-script-util'
import { releaseNotes } from '@/options-page/release-notes'
import { loadSettings } from '@/settings/load-settings'
import { LastChecked } from '@/utils/last-checked'
import { showReleaseNotes } from '@/utils/show-release-notes'
import browser from 'webextension-polyfill'

console.log('Web Toolkit Service Worker Loaded')

browser.runtime.onInstalled.addListener(async () => {
  console.log('Installed')

  const extensionVersion = browser.runtime.getManifest().version

  const settings = await loadSettings()

  const skipNotice = releaseNotes[0]?.skipNotice ?? false

  // Show release notes page (open in a new tab) if the extension is updated.
  // Skip the notice if the first release notes has `skipNotice: true`.
  if ((await LastChecked.lastCheckedVersion()) !== extensionVersion) {
    await LastChecked.setLastCheckedVersion(extensionVersion)

    // Show release notes page if the skipNotice flag is not set.
    if (!skipNotice) {
      showReleaseNotes()
    }
  }

  // Always show release notes in debug mode.
  if (DEBUG_RELEASE_NOTES) {
    showReleaseNotes()
  }

  // Initial registration of content scripts.
  await ContentScriptUtil.refreshAllContentScripts(settings)
})

browser.runtime.onStartup.addListener(async () => {
  // TODO: Implement if needed.
})

/**
 * General message listener for handling fetch requests.
 */
browser.runtime.onMessage.addListener(async (message: any, sender) => {
  const tabId = sender.tab?.id

  if (!tabId) {
    return
  }

  if (message.action === 'fetch-request') {
    try {
      const response = await fetch(message.input, {
        ...message.init,
        headers: {
          'Content-Type': 'application/json',
          'X-Atlassian-Token': 'no-check', // Bypass Atlassian's CSRF protection
          'User-Agent': 'PostmanRuntime/7.30.0', // Bypass Atlassian's CSRF protection
          ...message.init?.headers,
        },
      })

      if (!response.ok) {
        console.error('Fetch error:', response)

        browser.tabs.sendMessage(tabId, {
          action: 'fetch-error',
          data: response,
          requestId: message.requestId,
        })

        return
      }

      if (response.status === 204) {
        browser.tabs.sendMessage(tabId, {
          action: 'fetch-response',
          data: null,
          requestId: message.requestId,
        })

        return
      }

      const data = await response.json()

      console.log('Fetch response:', data)

      browser.tabs.sendMessage(tabId, {
        action: 'fetch-response',
        data,
        requestId: message.requestId,
      })
    } catch (err) {
      console.error('Fetch error:', err)

      browser.tabs.sendMessage(tabId, {
        action: 'fetch-error',
        data: err,
        requestId: message.requestId,
      })
    }
  }
})
