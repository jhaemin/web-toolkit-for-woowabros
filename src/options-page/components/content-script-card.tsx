import { ContentScriptUtil } from '@/content-script-util'
import type { ContentScript } from '@/content-scripts'
import { loadSettings } from '@/settings/load-settings'
import { useStore } from '@nanostores/react'
import {
  Button,
  Card,
  Flex,
  Heading,
  Link,
  Popover,
  Switch,
  Text,
} from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { $registeredContentScripts, $settings } from '../store'

export function ContentScriptCard({
  contentScript,
}: { contentScript: ContentScript }) {
  const registeredContentScripts = useStore($registeredContentScripts)
  const settings = useStore($settings)
  const [isDirty, setIsDirty] = useState(false)

  const settingsEnabled =
    settings[ContentScriptUtil.contentScriptSettingsKey(contentScript.name)] ===
    true
  const scriptRegistered = registeredContentScripts.some(
    (script) => script.id === contentScript.name
  )

  const isContentScriptEnabled = settingsEnabled && scriptRegistered

  const [customMatches, setCustomMatches] = useState<
    {
      value: string
      tested: boolean
      valid: boolean
    }[]
  >([
    {
      value: '',
      tested: false,
      valid: false,
    },
  ])

  useEffect(() => {
    // if (contentScript.matches !== 'custom') {
    //   return
    // }

    loadSettings().then((settings) => {
      const matches = settings[`${contentScript.name}.customMatches`]
      if (matches) {
        setCustomMatches(
          matches.map((match) => ({ value: match, tested: true, valid: true }))
        )
      }
    })
  }, [contentScript.name])

  return (
    <Card
      key={contentScript.name}
      variant="surface"
      size="2"
      className="content-script-item"
    >
      <Flex direction="column">
        <Flex align="center" justify="between" mb="2">
          <Heading size="3">{contentScript.title}</Heading>

          <Flex align="center" gap="2">
            <Popover.Root>
              <Popover.Trigger>
                <Button variant="soft" size="1" radius="full" color="gray">
                  URL 패턴
                </Button>
              </Popover.Trigger>
              <Popover.Content align="center">
                <Flex direction="column">
                  <Text size="1" mb="2" weight="medium">
                    아래 패턴과 일치하는 URL에서 기능이 활성화됩니다.
                  </Text>
                  <Card>
                    {contentScript.matches.map((match, i) => (
                      <Text
                        key={i}
                        as="p"
                        size="1"
                        color="gray"
                        className="description"
                      >
                        {match === '<all_urls>' ? '모든 URL' : match}
                      </Text>
                    ))}
                  </Card>
                  <Link
                    href="https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns?hl=ko"
                    size="1"
                    mt="2"
                    target="_blank"
                  >
                    패턴 일치 더 알아보기
                  </Link>
                </Flex>
              </Popover.Content>
            </Popover.Root>
            <Switch
              variant="surface"
              checked={isContentScriptEnabled}
              onCheckedChange={async (checked) => {
                if (checked) {
                  await ContentScriptUtil.enableContentScript(contentScript)
                } else {
                  await ContentScriptUtil.disableContentScript(
                    contentScript.name
                  )
                }
              }}
            />
          </Flex>
        </Flex>
        <Text as="p" size="2" color="gray" className="description">
          {contentScript.description}
        </Text>
        {/* {contentScript.matches === 'custom' && (
          <>
            <Separator size="4" my="3" />
            <Box>
              <Flex align="center" justify="between" mb="2">
                <Text as="p" size="2" weight="bold">
                  커스텀 매치
                </Text>
                <Flex gap="3" align="center">
                  <Button
                    size="1"
                    color="red"
                    variant="ghost"
                    disabled={!(customMatches.every((m) => m.valid) && isDirty)}
                  >
                    취소
                  </Button>
                  <Button
                    size="1"
                    color="green"
                    variant="soft"
                    disabled={!(customMatches.every((m) => m.valid) && isDirty)}
                  >
                    저장
                  </Button>
                </Flex>
              </Flex>
              <Flex direction="column" gap="2">
                {customMatches.map(({ value, tested, valid }, i) => (
                  <Flex key={i} direction="column" gap="1">
                    <Flex width="100%" gap="1">
                      <TextField.Root
                        style={{ width: '100%', fontFamily: 'monospace' }}
                        size="1"
                        value={value}
                        onChange={(e) => {
                          setCustomMatches(
                            customMatches.map((m, index) =>
                              index === i
                                ? {
                                    value: e.currentTarget.value,
                                    tested: false,
                                    valid: false,
                                  }
                                : m
                            )
                          )
                          setIsDirty(true)
                        }}
                        onBlur={(e) => {
                          const isValid = matchPattern(
                            e.currentTarget.value
                          ).valid
                          setCustomMatches(
                            customMatches.map((m, index) =>
                              index === i
                                ? {
                                    value: e.currentTarget.value,
                                    tested: true,
                                    valid: isValid,
                                  }
                                : m
                            )
                          )
                        }}
                      />
                      <IconButton
                        size="1"
                        variant="soft"
                        onClick={() => {
                          setCustomMatches(
                            customMatches
                              .slice(0, i + 1)
                              .concat({
                                value: '',
                                tested: false,
                                valid: false,
                              })
                              .concat(customMatches.slice(i + 1))
                          )
                          setIsDirty(true)
                        }}
                      >
                        <PlusIcon />
                      </IconButton>
                      <IconButton
                        color="red"
                        variant="soft"
                        size="1"
                        disabled={customMatches.length === 1}
                        onClick={() => {
                          setCustomMatches(
                            customMatches.filter((_, index) => index !== i)
                          )
                          setIsDirty(true)
                        }}
                      >
                        <MinusIcon />
                      </IconButton>
                    </Flex>
                    {tested && !valid && (
                      <Text as="p" size="1" color="red">
                        매치가 올바르지 않습니다.
                      </Text>
                    )}
                  </Flex>
                ))}
              </Flex>
            </Box>
          </>
        )} */}
      </Flex>
    </Card>
  )
}
