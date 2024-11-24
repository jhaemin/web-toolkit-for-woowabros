import { browser } from '@/browser'

const LAST_CHECKED_VERSION_KEY = 'lastCheckedVersion'

export class LastChecked {
  static async lastCheckedVersion(): Promise<string> {
    return ((await browser.storage.local.get(LAST_CHECKED_VERSION_KEY))[
      LAST_CHECKED_VERSION_KEY
    ] ?? '') as string
  }

  static async setLastCheckedVersion(version: string) {
    await browser.storage.local.set({ [LAST_CHECKED_VERSION_KEY]: version })
  }

  static async resetLastCheckedVersion() {
    await browser.storage.local.remove(LAST_CHECKED_VERSION_KEY)
  }
}
