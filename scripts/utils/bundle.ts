import { rm } from 'node:fs/promises'
import path from 'node:path'
import { isDev } from './build-env'
import { logger } from './logger'
import { chromeOutdir, firefoxOutdir } from './outdir'

export async function bundle(entries: string[]) {
  const tempDir = './dist/temp'
  const isSingle = entries.length === 1

  const result = await Bun.build({
    entrypoints: entries,
    outdir: tempDir,
    target: 'browser',
    minify: !isDev,
    sourcemap: isDev ? 'inline' : 'none',
  })

  if (!result.success) {
    result.logs.forEach((log) => {
      console.log(log)
    })
    return
  }

  await Promise.all(
    result.outputs.map(async (output) => {
      const text = await output.text()
      let fileName = ''

      if (output.path.endsWith('index.js')) {
        const folderName = (isSingle ? entries[0] : output.path)
          .split('/')
          .at(-2)

        fileName = `${folderName}.js`
      } else {
        fileName = output.path.split('/').at(-1)!
      }

      await Promise.all([
        Bun.write(path.join(chromeOutdir, fileName), text),
        Bun.write(path.join(firefoxOutdir, fileName), text),
      ])

      await rm(output.path)
    })
  )

  await rm(tempDir, { recursive: true, force: true })

  logger.success('bundled')
}
