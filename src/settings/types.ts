import type { ContentScriptName } from '@/content-scripts'

/**
 * Enabled flag for each content script.
 */
export type ContentScriptEnabledSettings = Partial<
  Record<`${ContentScriptName}.enabled`, boolean>
>

/**
 * Custom matches for each content script.
 */
export type ContentScriptCustomMatchesSettings = Partial<
  Record<`${ContentScriptName}.customMatches`, string[]>
>

/**
 * Common settings for all content scripts.
 */
export type ContentScriptSettings = ContentScriptEnabledSettings &
  ContentScriptCustomMatchesSettings

export const otherSettingKeys = [
  'general.speller.inputOnly',
] satisfies `${ContentScriptName}.${string}`[]

type OtherSettingsStructure = {
  'general.speller.inputOnly': boolean
}

export type OtherSettings = {
  [K in (typeof otherSettingKeys)[number]]?: OtherSettingsStructure[K]
}

export type Settings = ContentScriptSettings & OtherSettings
