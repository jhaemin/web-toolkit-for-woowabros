import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { contentScripts } from '@/content-scripts'

const CONTENT_SCRIPTS_DIR = path.resolve(process.cwd(), 'src/content-scripts')

export async function readContentScriptEntries() {
  const entries: string[] = []

  for (const contentScript of contentScripts) {
    try {
      const contentScriptDir = path.resolve(
        CONTENT_SCRIPTS_DIR,
        contentScript.name
      )
      const files = await readdir(contentScriptDir)

      let hasIndexFile = false

      for (const file of files) {
        if (file === 'index.ts' || file === 'index.tsx') {
          hasIndexFile = true
          entries.push(path.resolve(contentScriptDir, file))
          break
        }
      }

      if (!hasIndexFile) {
        throw new Error(
          `Content script ${contentScript.name} does not have an index file`
        )
      }
    } catch (error) {
      throw new Error(`Failed to read content script: ${contentScript.name}`)
    }
  }

  return entries
}
