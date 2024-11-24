import { version } from '../package.json'

const chromeOnlyProperties: Pick<
  chrome.runtime.ManifestV3,
  'minimum_chrome_version' | 'background' | 'author'
> = {
  background: {
    service_worker: 'service-worker/index.js',
  },
  minimum_chrome_version: '107',
  author: { email: 'io@jhaemin.com' },
}

const firefoxOnlyProperties: {
  /**
   * Firefox currently doesn't support background service workers with manifest v3
   */
  background: {
    scripts: string[]
  }
  browser_specific_settings: {
    gecko: {
      id: string
      strict_min_version: string
      update_url: string
    }
  }
  author: string
} = {
  background: {
    scripts: ['service-worker/index.js'],
  },
  browser_specific_settings: {
    gecko: {
      id: '{1227760a-222e-4ae2-b747-07ed498062f3}',
      strict_min_version: '107.0',
      update_url: 'https://www.jhaemin.com/web-toolkit/firefox/updates.json',
    },
  },
  author: 'io@jhaemin.com',
}

const commonManifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: '웹 툴킷',
  description: '브라우저 확장 프로그램',
  version,
  permissions: [
    'bookmarks',
    'clipboardWrite',
    'favicon',
    'management',
    'notifications',
    'scripting',
    'storage',
    'unlimitedStorage',
  ],
  host_permissions: ['<all_urls>'],
  options_ui: {
    page: 'options-page.html',
    open_in_tab: true,
  },
  action: {
    default_icon: {
      16: 'icons/icon16.png',
      24: 'icons/icon24.png',
      32: 'icons/icon32.png',
    },
    default_popup: 'popup/popup.html',
  },
  icons: {
    16: 'icons/icon16.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
  web_accessible_resources: [
    {
      resources: [
        'icons/icon16.png',
        'icons/icon24.png',
        'icons/icon32.png',
        'icons/icon48.png',
        'icons/icon64.png',
        'icons/icon128.png',
        'icons/icon512.png',
      ],
      matches: ['<all_urls>'],
    },
  ],
  content_scripts: [
    // Static content scripts
  ],
}

export const chromeManifest = { ...commonManifest, ...chromeOnlyProperties }
export const firefoxManifest = { ...commonManifest, ...firefoxOnlyProperties }
