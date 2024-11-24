import { WTK_NO_RESULT } from './constants'
import type { HttpMethod, SwaggerMethodType, UrlType } from './types/types'

export function getTagFromPath(path: any): string {
  if (path?.get?.tags?.length > 0) {
    return path.get.tags[0]
  }
  if (path?.post?.tags?.length > 0) {
    return path.post.tags[0]
  }
  if (path?.put?.tags?.length > 0) {
    return path.put.tags[0]
  }
  if (path?.delete?.tags?.length > 0) {
    return path.delete.tags[0]
  }
  if (path?.patch?.tags?.length > 0) {
    return path.patch.tags[0]
  }
  if (path?.options?.tags?.length > 0) {
    return path.options.tags[0]
  }
  if (path?.head?.tags?.length > 0) {
    return path.head.tags[0]
  }
  if (path?.trace?.tags?.length > 0) {
    return path.trace.tags[0]
  }
  return ''
}

export function generateUrlList(urlList: any): UrlType[] {
  const result: UrlType[] = []
  Object.entries(urlList).forEach(([url, methods]) => {
    Object.entries(methods as SwaggerMethodType).forEach(([method, path]) => {
      result.push({
        url,
        tag: getTagFromPath(urlList[url]),
        method: method as HttpMethod,
        summary: path.summary,
      })
    })
  })
  return result
}

export function escapeSpecialCharsForRegex(str: string): string {
  return str.replace(/[.*+?^$()|[\]\\]/g, '\\$&')
}

export function removeHighlightTags(textWithHighlights: string): string {
  const regexPattern = /<span class="wtk-highlight">([\s\S]*?)<\/span>/gi
  return textWithHighlights.replace(regexPattern, '$1')
}

export function highlightKeyword(
  text: string,
  keyword: string,
  useFuzzySearch: boolean
): string {
  if (!text || !keyword) {
    return text
  }

  const escapedKeyword = escapeSpecialCharsForRegex(keyword)
  const escapedSpecialChars = escapeSpecialCharsForRegex('')

  if (useFuzzySearch) {
    let highlightedText = ''
    let keywordIndex = 0

    for (const char of text) {
      if (char.toLowerCase() === escapedKeyword[keywordIndex].toLowerCase()) {
        highlightedText += `<span class="wtk-highlight">${char}</span>`
        keywordIndex++

        if (keywordIndex === escapedKeyword.length) {
          keywordIndex = 0
        }
      } else {
        highlightedText += char
      }
    }

    return highlightedText
  }
  const regexPattern = new RegExp(
    `(${escapedKeyword.replace(
      new RegExp(`[${escapedSpecialChars}]`, 'g'),
      '\\$&'
    )})`,
    'gi'
  )
  return text.replace(regexPattern, '<span class="wtk-highlight">$1</span>')
}

const IO_LIST: IntersectionObserver[] = []

export function handleOpenSectionObserver(
  nodeList: NodeListOf<HTMLElement>,
  newKey: string | null
) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains('is-open')) {
        if (newKey) {
          ;(entry.target.firstChild as HTMLElement)?.click()
        }
      }
    })
  })

  nodeList.forEach((el) => {
    io.observe(el)
  })

  // 이전에 등록한 IO 제거
  if (IO_LIST.length > 0) {
    const prevIO = IO_LIST.shift()
    prevIO?.disconnect()
  }

  // 새로 등록한 IO 추가
  IO_LIST.push(io)
}

export function renderSearchResultText({
  apiSectionWrapper,
  searchResult,
  searchKeyword,
}: {
  apiSectionWrapper: HTMLElement
  searchResult: UrlType[]
  searchKeyword: string | null
}) {
  const noResultElement = document.querySelector(`.${WTK_NO_RESULT}`)
  if (searchResult.length > 0) {
    noResultElement?.remove()
    return
  }

  // 검색결과가 없을 때
  if (noResultElement) {
    noResultElement.innerHTML = `[${searchKeyword}] 검색 결과가 없습니다.`
  } else {
    const noResultElement = document.createElement('div')
    noResultElement.classList.add(WTK_NO_RESULT)
    noResultElement.innerHTML = `[${searchKeyword}] 검색 결과가 없습니다.`
    apiSectionWrapper.appendChild(noResultElement)
  }
}
