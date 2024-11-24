import type { ContentScriptDomain } from '@/content-scripts'
import { loadSettings } from '@/settings/load-settings'
import type { Settings } from '@/settings/types'
import { atom, onMount, task } from 'nanostores'
import browser from 'webextension-polyfill'

export const $currentMenu = atom<
  ContentScriptDomain | 'home' | 'advanced' | 'release-notes' | 'search'
>('home')

onMount($currentMenu, () => {
  if (typeof window === 'undefined') return

  function onHashChange() {
    const hash = window.location.hash

    if (hash) {
      $currentMenu.set(
        window.location.hash.replace('#', '') as ContentScriptDomain
      )
    } else {
      $currentMenu.set('home')
    }
  }

  window.addEventListener('hashchange', onHashChange)

  onHashChange()

  return () => {
    window.removeEventListener('hashchange', onHashChange)
  }
})

$currentMenu.listen((currentMenu) => {
  if (currentMenu !== 'search') {
    $searchQueryInput.set('')
  }
})

export const $settings = atom<Settings>({})

onMount($settings, () => {
  task(async () => {
    const settings = await loadSettings()
    $settings.set(settings)
  })

  /**
   * Listen to storage changes(settings change) and update the atom.
   */
  async function onStorageChange(
    changes: Record<string, browser.Storage.StorageChange>
  ) {
    if (changes.settings.newValue) {
      $settings.set(changes.settings.newValue)

      $registeredContentScripts.set(
        await browser.scripting.getRegisteredContentScripts()
      )
    }
  }

  browser.storage.local.onChanged.addListener(onStorageChange)

  return () => {
    browser.storage.local.onChanged.removeListener(onStorageChange)
  }
})

export const $registeredContentScripts = atom<
  browser.Scripting.RegisteredContentScript[]
>([])

onMount($registeredContentScripts, () => {
  task(async () => {
    const contentScripts = await browser.scripting.getRegisteredContentScripts()
    $registeredContentScripts.set(contentScripts)
  })
})

export const $searchQuery = atom<string>('')

export const $searchQueryInput = atom<string>('')

let searchQueryInputTimeout: number

$searchQueryInput.listen((queryInput) => {
  if (typeof window === 'undefined') return

  clearTimeout(searchQueryInputTimeout)

  searchQueryInputTimeout = window.setTimeout(() => {
    $searchQuery.set(queryInput)
  }, 300)
})

$searchQuery.listen((searchQuery) => {
  if (typeof window === 'undefined') return

  if (searchQuery) {
    $currentMenu.set('search')
    window.location.hash = 'search'
  }
})
