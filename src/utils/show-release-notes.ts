import { browser } from '@/browser'

/**
 * Open the release notes page in a new tab.
 */
export function showReleaseNotes() {
  const optionsPage = browser.runtime.getURL('options-page.html')
  browser.tabs.create({ url: `${optionsPage}#release-notes`, active: true })
}
