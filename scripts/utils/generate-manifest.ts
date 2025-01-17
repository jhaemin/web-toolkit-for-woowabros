import { chromeManifest, firefoxManifest } from '@/manifest'
import type { ArrayElement } from '@/types/helpers'
import path from 'node:path'
import { isDev } from './build-env'
import { logger } from './logger'
import { chromeOutdir, firefoxOutdir } from './outdir'

export async function generateManifest(staticFiles: string[]) {
  const name = isDev ? chromeManifest.name + ' (Dev)' : chromeManifest.name

  const webAccessibleResources: ArrayElement<
    NonNullable<chrome.runtime.ManifestV3['web_accessible_resources']>
  > = {
    matches: ['<all_urls>'],
    resources: staticFiles,
  }

  chromeManifest.name = name
  firefoxManifest.name = name

  chromeManifest.web_accessible_resources?.push(webAccessibleResources)
  firefoxManifest.web_accessible_resources?.push(webAccessibleResources)

  await Promise.all([
    await Bun.write(
      path.join(chromeOutdir, 'manifest.json'),
      JSON.stringify(chromeManifest, null, 2)
    ),
    await Bun.write(
      path.join(firefoxOutdir, 'manifest.json'),
      JSON.stringify(firefoxManifest, null, 2)
    ),
  ])

  logger.success('generated manifest.json')
}
