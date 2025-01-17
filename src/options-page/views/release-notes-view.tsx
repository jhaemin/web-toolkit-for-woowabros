import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { releaseNotes } from '../release-notes'

export function ReleaseNotesView() {
  return (
    <Flex id="release-notes" direction="column" gap="4">
      <Flex align="end" justify="between">
        <Heading>업데이트 내역</Heading>
      </Flex>
      {releaseNotes.map((note) => (
        <Card key={note.version} variant="classic" size="2">
          <Flex align="center" justify="between">
            <Heading size="5">
              <Flex align="center" gap="2">
                {note.version}
              </Flex>
            </Heading>
            <Text as="div" size="2" color="gray">
              {note.date}
            </Text>
          </Flex>
          <Box mt="3">
            <Box>
              <ul>
                {note.messages?.map((message, i) => {
                  return (
                    <li key={i}>
                      <Flex direction="column">
                        <Text key={i} size="2">
                          {message}
                        </Text>
                      </Flex>
                    </li>
                  )
                })}
              </ul>
            </Box>
          </Box>
        </Card>
      ))}
    </Flex>
  )
}
