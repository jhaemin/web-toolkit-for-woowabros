/**
 * A top-level domain for content scripts.
 * Each content script should be categorized by its domain.
 */
export type ContentScriptDomain = 'swagger'

export const contentScriptDomains: ContentScriptDomain[] = ['swagger']

/**
 * A label for each content script domain.
 */
export const contentScriptDomainLabel: Record<ContentScriptDomain, string> = {
  swagger: 'Swagger',
}

/**
 * An interface for defining content scripts.
 * It is general interface for all content scripts.
 * If you need the exact type of content script, use `ContentScript` type.
 */
export interface ContentScriptDefinition {
  name: `${ContentScriptDomain}.${string}`
  title: string
  description: string
  matches: string[] | 'custom'
  allFrames?: boolean
}

/**
 * An array of content scripts.
 */
export const contentScripts = [
  {
    name: 'swagger.search',
    title: 'Swagger 검색',
    description: 'API 스펙 기반으로 검색할 수 있습니다.',
    matches: [
      '*://*/*/swagger-ui/*',
      '*://*/swagger-ui/*',
      '*://*/*/swagger-ui.html',
      '*://*/swagger-ui.html',
      '*://*/*/swagger-ui.html?*',
      '*://*/swagger-ui.html?*',
      '*://*/*/swagger',
      '*://*/swagger',
    ],
  },
] satisfies ContentScriptDefinition[]

/**
 * Content script types directly inferred from the contentScripts array.
 */
export type ContentScript = (typeof contentScripts)[number]

export type ContentScriptName = ContentScript['name']
