import {
  contentScriptDomainLabel,
  contentScriptDomains,
  contentScripts,
} from '@/content-scripts'
import { useStore } from '@nanostores/react'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Button,
  Flex,
  Link,
  ScrollArea,
  Separator,
  Text,
} from '@radix-ui/themes'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Header } from './header'
import { $currentMenu, $settings } from './store'
import { AdvancedView } from './views/advanced-view'
import { ContentScriptDomainView } from './views/content-script-domain-view'
import { HomeView } from './views/home-view'
import { ReleaseNotesView } from './views/release-notes-view'
import { SearchResultView } from './views/search-result-view'

export default function OptionsPage() {
  const currentMenu = useStore($currentMenu)
  const settings = useStore($settings)

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <Flex id="options-page" direction="column" gap="4">
      <Box
        id="panel"
        className={clsx({
          loaded: isLoaded,
        })}
      >
        <Header />

        <Flex id="content">
          <Box id="sidebar">
            <ScrollArea>
              <Flex direction="column" p="5">
                <Link draggable={false} href="#home" className="menu-link">
                  <Flex
                    align="center"
                    className={clsx('menu-item', {
                      selected: currentMenu === 'home',
                    })}
                  >
                    <Text size="2">홈</Text>
                  </Flex>
                </Link>
                <Link
                  draggable={false}
                  href="#release-notes"
                  className="menu-link"
                >
                  <Flex
                    align="center"
                    className={clsx('menu-item', {
                      selected: currentMenu === 'release-notes',
                    })}
                  >
                    <Text size="2">업데이트 내역</Text>
                  </Flex>
                </Link>

                <Link draggable={false} href="#advanced" className="menu-link">
                  <Flex
                    align="center"
                    className={clsx('menu-item', {
                      selected: currentMenu === 'advanced',
                    })}
                  >
                    <Text size="2">고급</Text>
                  </Flex>
                </Link>

                {/* Only visible when the current menu is search */}
                {currentMenu === 'search' && (
                  <Flex
                    align="center"
                    className={clsx('menu-item', 'selected')}
                  >
                    <Text size="2">검색 결과</Text>
                  </Flex>
                )}

                <Separator size="4" my="2" />

                {contentScriptDomains.map((contentScriptDomain) => {
                  const enabledContentScriptsCount = contentScripts.filter(
                    (contentScript) =>
                      // Filter content scripts by domain and enabled
                      contentScript.name.startsWith(contentScriptDomain) &&
                      settings[`${contentScript.name}.enabled`] === true
                  ).length
                  const selected = currentMenu === contentScriptDomain

                  return (
                    <Link
                      key={contentScriptDomain}
                      href={`#${contentScriptDomain}`}
                      className="menu-link"
                      draggable={false}
                    >
                      <Flex
                        align="center"
                        justify="between"
                        className={clsx('menu-item', { selected })}
                      >
                        <Text size="2">
                          {contentScriptDomainLabel[contentScriptDomain]}
                        </Text>
                        {enabledContentScriptsCount > 0 && (
                          <Badge
                            radius="full"
                            variant={selected ? 'solid' : 'soft'}
                            size="1"
                          >
                            {enabledContentScriptsCount}
                          </Badge>
                        )}
                      </Flex>
                    </Link>
                  )
                })}
              </Flex>
            </ScrollArea>
          </Box>

          <Box id="document" flexGrow="1">
            <ScrollArea>
              <Box p="5">
                {currentMenu === 'home' ? (
                  <HomeView />
                ) : currentMenu === 'advanced' ? (
                  <AdvancedView />
                ) : currentMenu === 'release-notes' ? (
                  <ReleaseNotesView />
                ) : currentMenu === 'search' ? (
                  <SearchResultView />
                ) : (
                  <ContentScriptDomainView contentScriptDomain={currentMenu} />
                )}
              </Box>
            </ScrollArea>
          </Box>
        </Flex>
      </Box>
    </Flex>
  )
}
