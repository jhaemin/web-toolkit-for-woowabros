import { RocketIcon } from '@radix-ui/react-icons'
import { Badge, Box, Card, Flex, Heading, Link, Text } from '@radix-ui/themes'
import { BugIcon, WrenchIcon } from 'lucide-react'
import {
  type ReleaseNote,
  type ReleaseNoteContent,
  releaseNotes,
} from '../release-notes'

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
            <Flex direction="column" gap="3">
              {note.content?.news && ReleaseNotes('news', note.content.news)}
              {note.content?.fixes && ReleaseNotes('fixes', note.content.fixes)}
              {note.content?.engineering &&
                ReleaseNotes('engineering', note.content.engineering)}
            </Flex>
          </Box>
        </Card>
      ))}
    </Flex>
  )
}

function ReleaseNotes(
  type: keyof NonNullable<ReleaseNote['content']>,
  content: ReleaseNoteContent[]
) {
  const badgeText =
    type === 'news' ? (
      <>
        <RocketIcon width="12" height="12" /> New Features
      </>
    ) : type === 'fixes' ? (
      <>
        <BugIcon size={12} strokeWidth={1.7} /> Bug Fixes
      </>
    ) : type === 'engineering' ? (
      <>
        <WrenchIcon size={12} strokeWidth={1.7} /> Engineering
      </>
    ) : null
  const badgeColor =
    type === 'news'
      ? 'red'
      : type === 'fixes'
        ? 'gray'
        : type === 'engineering'
          ? 'gray'
          : undefined

  return (
    <Flex direction="column">
      <Box>
        <Badge color={badgeColor} mb="2">
          {badgeText}
        </Badge>
      </Box>
      <Box>
        <ul>
          {content.map((content, i) => {
            const { message, contributors } = content

            return (
              <li key={i}>
                <Flex direction="column">
                  <Text key={i} size="2">
                    {message}
                  </Text>
                  {contributors && (
                    <Text size="1" color="blue" highContrast mt="1">
                      by {contributors.join(', ')}
                    </Text>
                  )}
                </Flex>
              </li>
            )
          })}
        </ul>
      </Box>
    </Flex>
  )
}
