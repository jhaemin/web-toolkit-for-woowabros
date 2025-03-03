/**
 * A top-level domain for content scripts.
 * Each content script should be categorized by its domain.
 */
export type ContentScriptDomain = 'swagger' | 'general' | 'jira'

export const contentScriptDomains: ContentScriptDomain[] = [
  'general',
  'swagger',
  'jira',
]

/**
 * A label for each content script domain.
 */
export const contentScriptDomainLabel: Record<ContentScriptDomain, string> = {
  swagger: 'Swagger',
  general: '일반',
  jira: 'Jira',
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
    name: 'general.speller',
    title: '맞춤법 검사',
    description:
      '모든 웹 페이지에서 텍스트를 선택하고 맞춤법을 검사할 수 있습니다.',
    matches: ['<all_urls>'],
    allFrames: true,
  },
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
  {
    name: 'jira.copySlackPreviewableURL',
    title: 'Slack에서 미리보기가 되는 Jira 티켓 링크 복사',
    description: 'Slack에서 미리보기가 되는 Jira 티켓 링크를 복사합니다.',
    matches: [`https://${process.env.WTK_WOOWABROS_JIRA_HOST}/browse/*`],
  },
] satisfies ContentScriptDefinition[]

/**
 * Content script types directly inferred from the contentScripts array.
 */
export type ContentScript = (typeof contentScripts)[number]

export type ContentScriptName = ContentScript['name']
