import { contentScripts } from '@/content-scripts'
import { useStore } from '@nanostores/react'
import { Flex, Heading, Text } from '@radix-ui/themes'
import { onlyText } from 'react-children-utilities'
import { ContentScriptCard } from '../components/content-script-card'
import { $searchQuery } from '../store'

export function SearchResultView() {
  const searchQuery = useStore($searchQuery)
  const lowerCaseSearchQuery = searchQuery.toLowerCase()

  const filteredContentScripts = contentScripts.filter(
    ({ name, description }) => {
      return (
        name.toLowerCase().includes(lowerCaseSearchQuery) ||
        onlyText(description).includes(lowerCaseSearchQuery)
      )
    }
  )

  return (
    <Flex direction="column" gap="4">
      <Heading>검색 결과</Heading>
      {filteredContentScripts.length === 0 && (
        <Flex
          align="center"
          justify="center"
          style={{ height: 'calc(var(--space-9) * 2)' }}
        >
          <Text size="2" color="gray">
            검색 결과가 없어요
          </Text>
        </Flex>
      )}
      {filteredContentScripts.map((contentScript) => (
        <ContentScriptCard
          contentScript={contentScript}
          key={contentScript.name}
        />
      ))}
    </Flex>
  )
}
