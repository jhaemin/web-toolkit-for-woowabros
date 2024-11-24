export const isDev = Bun.argv.includes('--dev') || Bun.argv.includes('-D')
export const isProd = !isDev
