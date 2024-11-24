import { ContentScriptUtil } from '@/content-script-util'
import { contentScripts } from '@/content-scripts'
import { loadSettings } from '@/settings/load-settings'
import type { Settings } from '@/settings/types'
import { writeSettingsAndRefreshContentScripts } from '@/settings/write-settings'
import { LastChecked } from '@/utils/last-checked'
import { useStore } from '@nanostores/react'
import {
  CheckIcon,
  DownloadIcon,
  InfoCircledIcon,
  ResetIcon,
  UploadIcon,
} from '@radix-ui/react-icons'
import {
  AlertDialog,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  IconButton,
  Spinner,
} from '@radix-ui/themes'
import dayjs from 'dayjs'
import { atom } from 'nanostores'
import browser from 'webextension-polyfill'

const $resetConfirmOpen = atom(false)
const $doneMessage = atom('')
const $doneOpen = atom(false)

const $loading = atom(false)

const $enableAllContentScriptsTriggered = atom(false)
const $disableAllContentScriptsTriggered = atom(false)

$enableAllContentScriptsTriggered.listen(() => {
  setTimeout(() => {
    $enableAllContentScriptsTriggered.set(false)
  }, 2000)
})

$disableAllContentScriptsTriggered.listen(() => {
  setTimeout(() => {
    $disableAllContentScriptsTriggered.set(false)
  }, 2000)
})

export function AdvancedView() {
  const resetConfirmOpen = useStore($resetConfirmOpen)
  const doneMessage = useStore($doneMessage)
  const doneOpen = useStore($doneOpen)
  const loading = useStore($loading)
  const enableAllContentScriptsTriggered = useStore(
    $enableAllContentScriptsTriggered
  )
  const disableAllContentScriptsTriggered = useStore(
    $disableAllContentScriptsTriggered
  )

  return (
    <>
      <Flex direction="column" gap="4">
        {/* <Callout.Root size="1" color="gray">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text></Callout.Text>
      </Callout.Root> */}

        <Heading>고급</Heading>

        <Card size="2" variant="classic">
          <Flex align="center" justify="between">
            <Flex>
              <Heading size="3">백업</Heading>
            </Flex>

            <Flex gap="2">
              <Button
                variant="soft"
                color="green"
                onClick={async () => {
                  const settings = await loadSettings()

                  const blob = new Blob([JSON.stringify(settings, null, 2)], {
                    type: 'application/json',
                  })

                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `web_toolkit_settings_${dayjs().format(
                    'YYYY-MM-DD_HH-mm-ss'
                  )}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  a.remove()
                }}
              >
                <DownloadIcon />
                Backup
              </Button>
              <Button
                variant="soft"
                color="gray"
                onClick={async () => {
                  const input = document.getElementById(
                    'file'
                  ) as HTMLInputElement
                  input.click()
                  input.onchange = async (e) => {
                    $loading.set(true)

                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      const text = await file.text()

                      try {
                        const settings = JSON.parse(text) as Settings

                        await LastChecked.setLastCheckedVersion(
                          browser.runtime.getManifest().version
                        )

                        await writeSettingsAndRefreshContentScripts(settings)

                        $doneMessage.set('복원되었습니다.')
                        $doneOpen.set(true)
                      } catch (e) {
                        $doneMessage.set('잘못된 파일입니다.')
                        $doneOpen.set(true)
                      } finally {
                        input.value = ''
                        $loading.set(false)
                      }
                    }
                  }
                }}
              >
                <UploadIcon />
                복구
              </Button>
              <input
                type="file"
                id="file"
                accept=".json"
                style={{
                  display: 'none',
                }}
              />
            </Flex>
          </Flex>

          <Callout.Root mt="4" size="1" color="gray">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>복원 시 기존 설정이 덮어씌워집니다.</Callout.Text>
          </Callout.Root>
        </Card>

        <Card size="2" variant="classic">
          <Flex align="center" justify="between">
            <Flex>
              <Heading size="3" color="blue">
                {/* 모든 기능 사용 또는 해제 */}
                모든 기능 사용 또는 해제
              </Heading>
            </Flex>

            <Flex gap="2">
              <Button
                variant="soft"
                onClick={async () => {
                  await ContentScriptUtil.enableContentScripts(contentScripts)

                  $enableAllContentScriptsTriggered.set(true)
                }}
              >
                {enableAllContentScriptsTriggered ? <CheckIcon /> : '모두 사용'}
              </Button>
              <Button
                color="gray"
                variant="soft"
                onClick={async () => {
                  await ContentScriptUtil.disableContentScripts(
                    contentScripts.map((c) => c.name)
                  )

                  $disableAllContentScriptsTriggered.set(true)
                }}
              >
                {disableAllContentScriptsTriggered ? (
                  <CheckIcon />
                ) : (
                  '모두 해제'
                )}
              </Button>
            </Flex>
          </Flex>
        </Card>

        <Card size="2" variant="classic">
          <Flex align="center" justify="between">
            <Flex>
              <Heading size="3" color="red">
                모든 설정 초기화
              </Heading>
            </Flex>

            <Flex>
              <IconButton
                color="red"
                onClick={() => {
                  $resetConfirmOpen.set(true)
                }}
              >
                <ResetIcon />
              </IconButton>

              <AlertDialog.Root open={resetConfirmOpen}>
                <AlertDialog.Content maxWidth="450px">
                  <AlertDialog.Title>정말 초기화 하시겠어요?</AlertDialog.Title>
                  <AlertDialog.Description color="gray" size="2">
                    모든 기능이 해제되고 데이터가 삭제됩니다.
                  </AlertDialog.Description>

                  <Flex gap="3" mt="4" justify="end">
                    <Button
                      variant="soft"
                      color="gray"
                      onClick={() => {
                        $resetConfirmOpen.set(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="red"
                      onClick={async () => {
                        await writeSettingsAndRefreshContentScripts({})

                        $resetConfirmOpen.set(false)

                        $doneMessage.set('초기화되었습니다.')
                        $doneOpen.set(true)
                      }}
                    >
                      Reset
                    </Button>
                  </Flex>
                </AlertDialog.Content>
              </AlertDialog.Root>

              <AlertDialog.Root open={doneOpen}>
                <AlertDialog.Content maxWidth="450px">
                  <AlertDialog.Description>
                    {doneMessage}
                  </AlertDialog.Description>
                  <Flex gap="3" mt="4" justify="end">
                    <Button
                      variant="soft"
                      color="gray"
                      onClick={() => {
                        $doneOpen.set(false)
                      }}
                    >
                      Done
                    </Button>
                  </Flex>
                </AlertDialog.Content>
              </AlertDialog.Root>
            </Flex>
          </Flex>
        </Card>
      </Flex>
      <Flex
        position="fixed"
        top="0"
        right="0"
        bottom="0"
        left="0"
        align="center"
        justify="center"
        style={{
          backgroundColor: 'var(--gray-a9)',
          zIndex: 9999,
          transition: 'opacity 200ms ease',
          opacity: loading ? 1 : 0,
          pointerEvents: loading ? 'auto' : 'none',
        }}
      >
        <Flex
          align="center"
          justify="center"
          style={{
            backgroundColor: 'var(--gray-4)',
            width: 50,
            height: 50,
            borderRadius: 'var(--radius-4)',
          }}
        >
          <Spinner size="3" />
        </Flex>
      </Flex>
    </>
  )
}
