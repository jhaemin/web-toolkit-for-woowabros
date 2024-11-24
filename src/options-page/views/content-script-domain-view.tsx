import { ContentScriptUtil } from '@/content-script-util'
import {
  type ContentScriptDomain,
  contentScriptDomainLabel,
  contentScripts,
} from '@/content-scripts'
import { Button, Flex, Heading } from '@radix-ui/themes'
import { ContentScriptCard } from '../components/content-script-card'

export type ContentScriptDomainProps = {
  contentScriptDomain: ContentScriptDomain
}

export function ContentScriptDomainView({
  contentScriptDomain,
}: ContentScriptDomainProps) {
  const label = contentScriptDomainLabel[contentScriptDomain]

  /**
   * Filter content scripts by domain.
   */
  const domainContentScripts = contentScripts.filter(({ name }) =>
    name.startsWith(contentScriptDomain)
  )

  return (
    <Flex direction="column" gap="4">
      <Heading>
        <Flex align="center" justify="between">
          {label}
          <Flex gap="4" mr="2">
            <Button
              variant="ghost"
              size="1"
              onClick={async () => {
                await ContentScriptUtil.enableContentScripts(
                  domainContentScripts
                )
              }}
            >
              모두 사용
            </Button>
            <Button
              variant="ghost"
              size="1"
              onClick={async () => {
                await ContentScriptUtil.disableContentScripts(
                  domainContentScripts.map((f) => f.name)
                )
              }}
            >
              모두 해제
            </Button>
          </Flex>
        </Flex>
      </Heading>
      {domainContentScripts.map((contentScript) => (
        <ContentScriptCard
          contentScript={contentScript}
          key={contentScript.name}
        />
      ))}
    </Flex>
  )
}
