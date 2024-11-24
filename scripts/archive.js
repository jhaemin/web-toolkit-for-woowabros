const archiver = require('archiver')
const fs = require('node:fs')

const distDir = './dist'
const artifactsDir = './artifacts'

const packageJson = fs.readFileSync('package.json', 'utf8')
const packageInfo = JSON.parse(packageJson)

const version = packageInfo.version

archive('chrome')
archive('firefox')
archiveSourceCode()

/**
 * @param {'chrome' | 'firefox'} browser
 */
function archive(browser) {
  if (!fs.existsSync(`${artifactsDir}/${browser}`)) {
    fs.mkdirSync(`${artifactsDir}/${browser}`, { recursive: true })
  }

  const archiveName = `wtk_${browser}_${version}`

  const output = fs.createWriteStream(
    `${artifactsDir}/${browser}/${archiveName}.zip`
  )
  const zip = archiver('zip')

  output.on('close', () => {
    console.log(`Archive ${archiveName} created (${zip.pointer()} bytes)`)
  })

  zip.pipe(output)

  // zip.directory('build/release/', archiveName)
  zip.directory(`${distDir}/${browser}`, false)

  zip.finalize()
}

function archiveSourceCode() {
  const output = fs.createWriteStream('./source.zip')
  const zip = archiver('zip')

  output.on('close', () => {
    console.log(`Archive source.zip created (${zip.pointer()} bytes)`)
  })

  zip.pipe(output)

  zip.glob('**/*', {
    cwd: './src',
    ignore: [
      '.git',
      '.git/**/*',
      '.vscode',
      '.vscode/**/*',
      'dist',
      'dist/**/*',
      '.DS_Store',
      '.env',
      '.env.local',
      '.idea',
      '.idea/**/*',
      'node_modules',
      'node_modules/**/*',
      'build',
      'dist',
      'dist/**/*',
      'build/**/*',
      'artifacts',
      'artifacts/**/*',
      'source.zip',
    ],
  })

  zip.finalize()
}
