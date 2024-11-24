import type { ContentScriptName } from '@/content-scripts'

export type ContentScriptSettings = Partial<
  Record<`${ContentScriptName}.enabled`, boolean>
>

export const dataSettingKeys = [] satisfies `${ContentScriptName}.${string}`[]

type DataSettingsStructure = {}

export type DataSettings = {
  [K in (typeof dataSettingKeys)[number]]?: DataSettingsStructure[K]
}

export type Settings = ContentScriptSettings & DataSettings
