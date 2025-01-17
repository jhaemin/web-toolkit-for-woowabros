import { browser } from '@/browser'
import { useStore } from '@nanostores/react'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Badge, Box, Flex, Heading, TextField } from '@radix-ui/themes'
import { $searchQuery, $searchQueryInput } from './store'

export function Header() {
  const searchQueryInput = useStore($searchQueryInput)

  return (
    <Box
      id="header-outer"
      position="sticky"
      top="0"
      style={{
        backgroundColor: 'var(--color-panel-solid)',
        zIndex: 10,
      }}
    >
      <Flex
        id="header-inner"
        width="100%"
        align="center"
        justify="between"
        gap="3"
        px="5"
        style={{
          margin: 'auto',
          height: 'var(--space-9)',
        }}
      >
        <Flex gap="3" align="center">
          <img src="icons/icon128.png" id="logo" />
          <Heading size="5">웹 툴킷 for 우아한형제들</Heading>

          <Badge
            size="3"
            color="gray"
            variant="surface"
            radius="full"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              window.location.href = '#release-notes'
            }}
          >
            {browser.runtime.getManifest().version}
          </Badge>
        </Flex>

        <TextField.Root
          size="2"
          radius="large"
          placeholder="검색"
          value={searchQueryInput}
          onChange={(e) => {
            $searchQueryInput.set(e.currentTarget.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              $searchQuery.set(searchQueryInput)
            }
          }}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
      </Flex>
    </Box>
  )
}
