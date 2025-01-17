import chalk from 'chalk'
import esbuild from 'esbuild'
import path from 'node:path'
import { isDev } from './build-env'
import { chromeOutdir, firefoxOutdir } from './outdir'
import { readContentScriptEntries } from './read-content-script-entries'

const popupEntry = './src/popup/index.ts'
const serviceWorkerEntry = './src/service-worker/index.ts'
const optionsPageEntry = './src/options-page/index.tsx'
const contentScriptEntries = await readContentScriptEntries()

const allEntries = [
  popupEntry,
  serviceWorkerEntry,
  optionsPageEntry,
  ...contentScriptEntries,
]

const envKeys = Object.keys(process.env).filter((key) => key.startsWith('WTK_'))
const envDefines = envKeys.reduce(
  (acc, key) => ({
    ...acc,
    [`process.env.${key}`]: `"${process.env[key]}"`,
  }),
  {}
)

export const buildContext = await esbuild.context({
  entryPoints: allEntries,
  bundle: true,
  target: 'ES2020',
  minify: !isDev,
  outdir: './temp',
  write: false,
  sourcemap: isDev ? 'inline' : false,
  define: {
    'process.env.NODE_ENV': `"${isDev ? 'development' : 'production'}"`,
    DEBUG_RELEASE_NOTES: String(Bun.argv.includes('--debug-release-notes')),
    ...envDefines,
  },
  plugins: [
    {
      name: 'write-output',
      setup(build) {
        build.onEnd(async (result) => {
          const { outputFiles } = result

          if (!outputFiles) return

          await Promise.all(
            outputFiles.map(async (file) => {
              const relativePath = path
                .relative(process.cwd(), file.path)
                .replace('temp/', '')

              await Promise.all([
                Bun.write(path.join(chromeOutdir, relativePath), file.contents),
                Bun.write(
                  path.join(firefoxOutdir, relativePath),
                  file.contents
                ),
              ])
            })
          )
        })
      },
    },
    {
      name: 'rebuild-notify',
      setup(build) {
        build.onEnd((result) => {
          console.log(
            `${chalk.green('[bundled]')} ${result.errors.length} errors, ${result.warnings.length} warnings - ${new Date().toLocaleTimeString()}`
          )
        })
      },
    },
  ],
})
