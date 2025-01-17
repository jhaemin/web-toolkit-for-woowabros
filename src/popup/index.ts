import { showReleaseNotes } from '@/utils/show-release-notes'
import browser from 'webextension-polyfill'

const manifestData = browser.runtime.getManifest()

const title = document.getElementById('title')!
const settingsButton = document.getElementById('settings-button')!
const version = document.getElementById('version')!
const releaseNotes = document.getElementById('release-notes')!

/**
 * Add a reload button in development mode.
 */
if (process.env.NODE_ENV === 'development') {
  title.innerHTML += ' (DEV)'

  const reloadButton = document.createElement('button')

  reloadButton.style.display = 'block'
  reloadButton.style.marginTop = '10px'
  reloadButton.textContent = 'Reload (DEV)'

  settingsButton.parentElement?.insertBefore(
    reloadButton,
    settingsButton.nextSibling
  )

  reloadButton.addEventListener('click', () => {
    browser.runtime.reload()
  })
}

settingsButton.addEventListener('click', () => {
  browser.runtime.openOptionsPage()
})

version.textContent = manifestData.version

releaseNotes.addEventListener('click', () => {
  showReleaseNotes()
})
