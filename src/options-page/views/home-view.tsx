import { Box, Card, Flex, Grid, Heading, Link, Text } from '@radix-ui/themes'

export function HomeView() {
  return (
    <Box>
      <Box mb="5">
        <Heading mb="3">안녕하세요</Heading>
        <Text as="p" size="2" color="gray" highContrast>
          웹 툴킷
        </Text>
      </Box>

      <Grid columns="2" width="100%" gap="4">
        <Link href="https://github.com/jhaemin/web-toolkit" target="_blank">
          <Card size="2">
            <Flex align="center" justify="center" py="4">
              <Heading size="3" color="gray" align="center">
                오픈소스
              </Heading>
            </Flex>
          </Card>
        </Link>
      </Grid>
    </Box>
  )
}
