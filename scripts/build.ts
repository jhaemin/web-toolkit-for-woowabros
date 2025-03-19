import { confirm } from '@inquirer/prompts'
import chalk from 'chalk'
import chok from 'chokidar'
import { cp, rm } from 'node:fs/promises'
import { buildContext } from './utils/build-context'
import { isDev, isProd } from './utils/build-env'
import { copyAllStaticFiles } from './utils/copy-all-static-files'
import { generateManifest } from './utils/generate-manifest'
import { chromeOutdir, firefoxOutdir } from './utils/outdir'
import { compileAllSCSS } from './utils/sass'

const packageJSON = JSON.parse(await Bun.file('package.json').text())
const version = packageJSON.version

console.log(`${chalk.yellow('[version]')} ${version}`)
console.log(`${chalk.green('[mode]')} ${isDev ? 'development' : 'production'}`)

if (isProd) {
  const yes = await confirm({
    message: 'Did you update release notes? (release-notes.tsx)',
  })

  if (!yes) {
    process.exit()
  }
}

// Clear output directories
await Promise.all([
  rm(chromeOutdir, { recursive: true, force: true }),
  rm(firefoxOutdir, { recursive: true, force: true }),
])

if (isDev) {
  await buildContext.watch()
} else {
  await buildContext.rebuild()
}

await compileAllSCSS()

const staticFiles = await copyAllStaticFiles()
await generateManifest(staticFiles)

if (isProd) {
  process.exit()
}

if (isDev) {
  console.log(`${chalk.cyan('[watch]')} watching for changes...`)

  chok
    .watch('./src', {
      ignoreInitial: true,
    })
    .on('all', async (event, path) => {
      const relativePath = path.replace(/^src\//g, '')

      // Static files that don't require building
      if (
        path.endsWith('.html') ||
        path.endsWith('.css') ||
        path.endsWith('.png') ||
        path.endsWith('.svg')
      ) {
        if (event === 'add' || event === 'change') {
          console.log(`${chalk.green('[copied]')} ${path}`)

          await Promise.all([
            cp(path, `${chromeOutdir}/${relativePath}`, { force: true }),
            cp(path, `${firefoxOutdir}/${relativePath}`, { force: true }),
          ])

          if (event === 'add') {
            staticFiles.push(relativePath)
            await generateManifest(staticFiles)
          }
        } else if (event === 'unlink') {
          console.log(`${chalk.red('[removed]')} ${path}`)

          await Promise.all([
            rm(`${chromeOutdir}/${relativePath}`, { force: true }),
            rm(`${firefoxOutdir}/${relativePath}`, { force: true }),
          ])

          const index = staticFiles.indexOf(relativePath)

          if (index > -1) {
            staticFiles.splice(index, 1)
            await generateManifest(staticFiles)
          }
        }
      } else if (path.endsWith('.scss')) {
        if (event === 'add' || event === 'change') {
          console.log(`${chalk.yellow('[compiled]')} ${path}`)
          // Compile all SCSS files because we don't know
          // which SCSS files are importing the changed file
          await compileAllSCSS()
        } else if (event === 'unlink') {
          console.log(`${chalk.red('[removed]')} ${path}`)
          const cssPath = relativePath.replace('.entry.scss', '.css')

          await Promise.all([
            rm(`${chromeOutdir}/${cssPath}`, { force: true }),
            rm(`${firefoxOutdir}/${cssPath}`, { force: true }),
          ])
        }
      }
    })
}
