import path from 'node:path'
import prettier from 'prettier'

/**
 * Read prettier options from .prettierrc file
 */
const prettierOptions =
  (await prettier.resolveConfig(path.resolve(process.cwd(), '.prettierrc'))) ??
  undefined

/**
 * Format the source code with Prettier
 */
export async function format(source: string) {
  await prettier.format(source, prettierOptions)
}
