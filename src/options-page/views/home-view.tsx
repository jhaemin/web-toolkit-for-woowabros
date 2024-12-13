import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Box, Card, Flex, Grid, Heading, Link, Text } from '@radix-ui/themes'

export function HomeView() {
  return (
    <Box>
      <Box mb="5">
        <Heading mb="3">안녕하세요</Heading>
        <Text as="p" size="2" color="gray" highContrast>
          웹 툴킷은 여러 가지 웹 서비스의 사용 경험을 개선하는 도구 모음입니다.
          필요한 기능만 선택적으로 활성화하고, 불필요한 기능은 끌 수 있습니다.
        </Text>
      </Box>

      <Grid columns="2" width="100%" gap="4">
        <Link href="https://github.com/jhaemin/web-toolkit" target="_blank">
          <Card size="2">
            <Heading size="3" color="gray" align="center">
              <Flex align="center" gap="1">
                <GitHubLogoIcon />
                Github
              </Flex>
            </Heading>
          </Card>
        </Link>
      </Grid>
    </Box>
  )
}
