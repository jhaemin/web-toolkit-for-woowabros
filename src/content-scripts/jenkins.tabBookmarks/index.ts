import { loadSettings } from '@/settings/load-settings'
import { saveSettings } from '@/settings/save-settings'
import { getSvgUrl } from '@/utils'
import { runAtDocumentEnd } from '@/utils/run-at-document-end'

type Callback = () => void | Promise<void>

/**
 * <div class="tab">    // tab
 *   <a>                // content
 *     <img />          // bookmarkIcon
 *   </a>
 * </div>
 */

const svgBookmark = getSvgUrl(
  'content-scripts/jenkins.tabBookmarks/icons/bookmark.svg'
)
const svgBookmarkFill = getSvgUrl(
  'content-scripts/jenkins.tabBookmarks/icons/bookmark_fill.svg'
)

runAtDocumentEnd(() => {
  const zone = location.hostname.split('.')[0]

  function getTabs() {
    return Array.from<HTMLDivElement>(document.querySelectorAll('.tabBar .tab'))
      .slice(0, -1) // Except 'Add tab'
      .filter((tab) => inspectTab(tab).key !== '-') // Except 'Filter'
  }

  function inspectTab(tab: HTMLElement) {
    const key = tab.textContent ?? ''
    const content = tab.querySelector('a')

    if (!content) {
      throw new Error('Content not found')
    }

    const getBookmarkIcon = () => {
      return tab.querySelector('img') || null
    }

    const getIsActivated = () => {
      return tab.classList.contains('active')
    }

    const getIsBookmarked = async () => {
      const bookmarks =
        (await loadSettings())['jenkins.tabBookmarks.bookmarks'] ?? {}
      bookmarks[zone] = bookmarks[zone] ?? []

      return bookmarks[zone].includes(key)
    }

    const toggleBookmark = async () => {
      const bookmarks =
        (await loadSettings())['jenkins.tabBookmarks.bookmarks'] ?? {}
      bookmarks[zone] = bookmarks[zone] ?? []

      if (await getIsBookmarked()) {
        bookmarks[zone] = bookmarks[zone].filter(
          (bookmark: string) => bookmark !== key
        )
        await saveSettings('jenkins.tabBookmarks.bookmarks', { ...bookmarks })
      } else {
        bookmarks[zone] = [...bookmarks[zone], key]
        await saveSettings('jenkins.tabBookmarks.bookmarks', { ...bookmarks })
      }
    }

    return {
      key,
      content,
      getBookmarkIcon,
      getIsActived: getIsActivated,
      getIsBookmarked,
      toggleBookmark,
    }
  }

  async function useBookmarkIcon(tab: HTMLElement) {
    const { getIsBookmarked, getIsActived, toggleBookmark } = inspectTab(tab)
    const callbackList: Callback[] = []

    const bookmark = document.createElement('img')

    const handleStyle = async () => {
      bookmark.src = svgBookmark
      bookmark.style.opacity = '0.5'
      bookmark.style.width = '0.625rem'
      bookmark.style.marginLeft = '0.5rem'
      bookmark.style.filter = 'invert(1)'
      bookmark.style.display = 'none'
      tab.style.order = ''
      tab.style.marginRight = ''

      if (await getIsBookmarked()) {
        bookmark.src = svgBookmarkFill
        bookmark.style.display = 'inline'
        tab.style.order = '-1'
      }

      if (getIsActived()) {
        bookmark.style.filter = 'invert(0)'
      }
    }

    handleStyle()

    bookmark.onclick = async (e) => {
      e.preventDefault()
      e.stopPropagation()

      await toggleBookmark().then(() => callbackList.forEach((cb) => cb()))

      await handleStyle()
    }

    const onTogglebookmark = (callback: Callback) => {
      callbackList.push(callback)
    }

    return [bookmark, onTogglebookmark] as const
  }

  async function useFilterBookmarkTab() {
    const tab = document.createElement('div')
    tab.className = 'tab'
    tab.style.order = '-1'

    const content = document.createElement('a')
    content.textContent = '-'
    content.style.fontSize = '0rem'
    tab.appendChild(content)

    const { getIsBookmarked, toggleBookmark } = inspectTab(tab)

    const bookmark = document.createElement('img')
    bookmark.style.opacity = '0.5'
    bookmark.style.width = '0.625rem'
    bookmark.style.padding = '0.125rem 0'
    bookmark.style.marginLeft = '0.325rem'
    bookmark.style.filter = 'invert(1)'
    content.appendChild(bookmark)

    const handleFilter = async () => {
      const isFiltered = await getIsBookmarked()

      const tabs = getTabs()

      if (isFiltered) {
        tabs.forEach(async (tab) => {
          const { getIsBookmarked } = inspectTab(tab)

          if (await getIsBookmarked()) tab.style.display = ''
          else tab.style.display = 'none'
        })

        bookmark.src = svgBookmarkFill
      } else {
        tabs.forEach((tab) => {
          tab.style.display = ''
        })

        bookmark.src = svgBookmark
      }
    }

    await handleFilter()

    content.onclick = async () => {
      await toggleBookmark()

      await handleFilter()
    }

    return [tab, handleFilter] as const
  }

  function onEnterTab(e: Event) {
    const tab = e.target as HTMLElement
    const { getBookmarkIcon } = inspectTab(tab)
    const bookmark = getBookmarkIcon()

    if (bookmark) {
      const prevY = tab.getBoundingClientRect().y
      bookmark.style.display = 'inline'
      const y = tab.getBoundingClientRect().y
      const isRoundFigure = prevY !== y
      if (isRoundFigure) {
        tab.style.marginRight = '-1.125rem'
      }
    }
  }

  async function onLeaveTab(e: Event) {
    const tab = e.target as HTMLElement
    const { getBookmarkIcon, getIsBookmarked } = inspectTab(tab)
    const bookmark = getBookmarkIcon()
    const isBookmarked = await getIsBookmarked()

    if (bookmark && !isBookmarked) {
      bookmark.style.display = 'none'
    }
  }

  async function render() {
    const tabBar = document.querySelector<HTMLElement>('.tabBar')

    if (!tabBar) return

    tabBar.style.overflowX = 'hidden'

    const [filterTab, handleFilter] = await useFilterBookmarkTab()

    const tabs = getTabs()

    tabs.forEach(async (tab) => {
      const { content, getBookmarkIcon } = inspectTab(tab)
      const prevBookmarkIcon = getBookmarkIcon()
      const [bookmarkIcon, onTogglebookmark] = await useBookmarkIcon(tab)

      onTogglebookmark(handleFilter)

      tab.addEventListener('mouseenter', onEnterTab)
      tab.addEventListener('mouseleave', onLeaveTab)

      if (prevBookmarkIcon) {
        prevBookmarkIcon.replaceWith(bookmarkIcon)
      } else {
        content.appendChild(bookmarkIcon)
      }
    })

    const prevFilterTab = Array.from(
      document.querySelectorAll<HTMLElement>('.tabBar .tab')
    ).find((tab) => inspectTab(tab).key === '-')

    if (prevFilterTab) prevFilterTab.replaceWith(filterTab)
    else tabBar.insertBefore(filterTab, tabBar.firstChild)
  }

  let timer: number | null = null

  render()

  window.addEventListener('resize', () => {
    if (timer) window.clearTimeout(timer)

    timer = window.setTimeout(() => {
      render()
    }, 100)
  })
})
