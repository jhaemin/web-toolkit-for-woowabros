import { ContentScriptUtil } from '@/content-script-util'
import type { ContentScript } from '@/content-scripts'
import { useStore } from '@nanostores/react'
import { Box, Card, Flex, Heading, Switch, Text } from '@radix-ui/themes'
import { $registeredContentScripts, $settings } from '../store'

export function ContentScriptCard({
  contentScript,
}: { contentScript: ContentScript }) {
  const registeredContentScripts = useStore($registeredContentScripts)
  const settings = useStore($settings)

  const settingsEnabled =
    settings[ContentScriptUtil.contentScriptSettingsKey(contentScript.name)] ===
    true
  const scriptRegistered = registeredContentScripts.some(
    (script) => script.id === contentScript.name
  )

  const isContentScriptEnabled = settingsEnabled && scriptRegistered

  return (
    <Card
      key={contentScript.name}
      variant="classic"
      size="2"
      className="content-script-item"
    >
      <Flex justify="between" align="center" gap="5" flexGrow="1">
        <Box>
          <Heading size="3" mb="2">
            <Flex align="center" gap="2">
              {contentScript.title}
            </Flex>
          </Heading>
          <Text as="p" size="2" color="gray" className="description">
            {contentScript.description}
          </Text>
        </Box>
        <Box>
          <Switch
            color="blue"
            variant="classic"
            checked={isContentScriptEnabled}
            onCheckedChange={async (checked) => {
              if (checked) {
                await ContentScriptUtil.enableContentScript(contentScript)
              } else {
                await ContentScriptUtil.disableContentScript(contentScript.name)
              }
            }}
          />
        </Box>
      </Flex>
    </Card>
  )
}
