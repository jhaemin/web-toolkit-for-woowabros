import fuzzysort from 'fuzzysort'

import { sleep } from '@/utils'
import { runAtDocumentEnd } from '../../utils/run-at-document-end'
import {
  INFORMATION_CONTAINER,
  OP_BLOCK,
  OP_BLOCK_SUMMARY_DESCRIPTION,
  OP_BLOCK_SUMMARY_PATH,
  OP_BLOCK_SUMMARY_PATH_DEPRECATED,
  OP_BLOCK_TAG,
  OP_BLOCK_TAG_SECTION,
  WTK_NO_RESULT,
  WTK_SWAGGER_SEARCH_STORAGE_KEY,
} from './constants'
import {
  generateUrlList,
  handleOpenSectionObserver,
  highlightKeyword,
  removeHighlightTags,
  renderSearchResultText,
} from './functions'
import { createStyle } from './styles'
import type { SwaggerSearchType, UrlType } from './types/types'
import {
  API_SECTION_ELEMENT_LIST,
  SEARCH_RESULT_ELEMENT,
  exactOptionElm,
  fuzzyOptionElm,
  inputElement,
  searchInput,
} from './view'

/**
 * input 검색
 */
let searchType: SwaggerSearchType =
  (localStorage.getItem(WTK_SWAGGER_SEARCH_STORAGE_KEY) as SwaggerSearchType) ??
  'FUZZY'
let searchKeyword: null | string = null
let searchTimeout = 0
let searchResult: UrlType[] = []
let searchResultOption: {
  FUZZY: UrlType[]
  NORMAL: UrlType[]
} = {
  FUZZY: [],
  NORMAL: [],
}

function resetGroupElement({
  groupNodeList,
}: {
  groupNodeList: HTMLElement[]
}) {
  Array.from(groupNodeList).forEach((el) => {
    el.style.setProperty('display', 'flex')

    const API_ELEMENT_LIST = (el.lastChild as HTMLElement)?.querySelectorAll(
      '.opblock'
    )
    Array.from(API_ELEMENT_LIST).forEach((childrenEl) => {
      const URL_ELEMENT = childrenEl?.querySelector(
        `span.${OP_BLOCK_SUMMARY_PATH}`
      )?.firstChild
      const DEPRECATED_URL_ELEMENT = childrenEl?.querySelector(
        `span.${OP_BLOCK_SUMMARY_PATH_DEPRECATED}`
      )?.firstChild
      const SUMMARY_ELEMENT = childrenEl?.querySelector(
        `.${OP_BLOCK_SUMMARY_DESCRIPTION}`
      )
      const urlText = URL_ELEMENT?.textContent ?? ''
      const urlText2 = DEPRECATED_URL_ELEMENT?.textContent ?? ''
      const summaryText = SUMMARY_ELEMENT?.textContent ?? ''

      //하이라이트 제거
      URL_ELEMENT?.firstChild?.remove()
      DEPRECATED_URL_ELEMENT?.firstChild?.remove()
      SUMMARY_ELEMENT?.firstChild?.remove()

      const newSpan = document.createElement('span')
      newSpan.innerHTML = removeHighlightTags(urlText)
      URL_ELEMENT?.appendChild(newSpan)

      const newSpan2 = document.createElement('span')
      newSpan2.innerHTML = removeHighlightTags(urlText2)
      DEPRECATED_URL_ELEMENT?.appendChild(newSpan2)

      const summarySpan = document.createElement('span')
      summarySpan.innerHTML = removeHighlightTags(summaryText)
      SUMMARY_ELEMENT?.appendChild(summarySpan)
      ;(childrenEl as HTMLElement).style.setProperty('display', 'block')
    })
  })
}

function renderSearchResultElement(nodeList: HTMLElement[]) {
  /**
   * 그룹 노출 여부 관리
   * - 검색결과에 포함된 그룹만 보이게 처리
   * - 검색결과에 포한되어있지 않으면 숨김 처리
   */
  nodeList.forEach((groupElement) => {
    const API_ELEMENT_LIST = (
      groupElement.lastChild as HTMLElement
    )?.querySelectorAll(`.${OP_BLOCK}`)

    const sectionTitle = groupElement.querySelector(`.${OP_BLOCK_TAG}`)
      ?.firstChild?.textContent

    if (searchResult.find((item) => item.tag === sectionTitle)) {
      groupElement.style.setProperty('display', 'flex')
    } else {
      groupElement.style.setProperty('display', 'none')
    }

    /**
     * 검색결과에 포함된 opblock만 보이기
     */
    renderOpblockTagElement(Array.from(API_ELEMENT_LIST))
  })
}

function renderOpblockTagElement(nodeList: Element[]) {
  nodeList.forEach((childrenEl) => {
    const URL_ELEMENT = childrenEl?.querySelector(
      `span.${OP_BLOCK_SUMMARY_PATH}`
    )?.firstChild
    const DEPRECATED_URL_ELEMENT = childrenEl?.querySelector(
      `span.${OP_BLOCK_SUMMARY_PATH_DEPRECATED}`
    )?.firstChild

    const urlText = URL_ELEMENT?.textContent?.replaceAll(/\u200B/g, '') ?? ''
    const urlText2 =
      DEPRECATED_URL_ELEMENT?.textContent?.replaceAll(/\u200B/g, '') ?? ''

    const SUMMARY_ELEMENT = childrenEl?.querySelector(
      `.${OP_BLOCK_SUMMARY_DESCRIPTION}`
    )
    const summaryText =
      SUMMARY_ELEMENT?.textContent?.replaceAll(/\u200B/g, '') ?? ''

    // 기본으로 다 안보이게 해놓고, 검색결과에 포함된 것만 보이게 처리
    ;(childrenEl as HTMLElement).style.setProperty('display', 'none')

    const isFuzzy = searchType === 'FUZZY'
    if (isFuzzy) {
      if (fuzzysort.single(searchKeyword ?? '', urlText)) {
        highlightFuzzyText({ el: URL_ELEMENT, text: urlText })
        ;(childrenEl as HTMLElement).style.setProperty('display', 'block')
      }
      if (fuzzysort.single(searchKeyword ?? '', urlText2)) {
        highlightFuzzyText({ el: DEPRECATED_URL_ELEMENT, text: urlText2 })
        ;(childrenEl as HTMLElement).style.setProperty('display', 'block')
      }
      if (fuzzysort.single(searchKeyword ?? '', summaryText)) {
        highlightFuzzyText({ el: SUMMARY_ELEMENT, text: summaryText })
        ;(childrenEl as HTMLElement).style.setProperty('display', 'block')
      }
      return
    }

    if (urlText.includes(searchKeyword ?? '')) {
      highlightNodeText({ el: URL_ELEMENT, text: urlText })
      ;(childrenEl as HTMLElement).style.setProperty('display', 'block')
    }
    if (urlText2.includes(searchKeyword ?? '')) {
      highlightNodeText({ el: DEPRECATED_URL_ELEMENT, text: urlText2 })
      ;(childrenEl as HTMLElement).style.setProperty('display', 'block')
    }
    if (summaryText.includes(searchKeyword ?? '')) {
      highlightNodeText({ el: SUMMARY_ELEMENT, text: summaryText })
      ;(childrenEl as HTMLElement).style.setProperty('display', 'block')
    }
  })

  function highlightFuzzyText({
    el,
    text,
  }: {
    el: ChildNode | null | undefined
    text: string
  }) {
    // 기존 URL 제거
    el?.firstChild?.remove()
    const highlightElm = document.createElement('span')
    highlightElm.innerHTML = fuzzysort
      .single(searchKeyword ?? '', text)
      ?.highlight('<span class="wtk-highlight">', '</span>') as string

    // url 하이라이트 추가
    el?.appendChild(highlightElm)
  }

  function highlightNodeText({
    el,
    text,
  }: {
    el: ChildNode | null | undefined
    text: string
  }) {
    // 기존 URL 제거
    el?.firstChild?.remove()
    const highlightElm = document.createElement('span')
    highlightElm.innerHTML = highlightKeyword(
      text,
      searchKeyword ?? '',
      searchType === 'FUZZY'
    )

    // url 하이라이트 추가
    el?.appendChild(highlightElm)
  }
}

function renderSearchInputResultCount(SEARCH_RESULT_ELEMENT: Element | null) {
  if (!searchKeyword) return

  if (SEARCH_RESULT_ELEMENT) {
    SEARCH_RESULT_ELEMENT.innerHTML = `검색결과 ${searchResult.length}개`
  }
}

async function run() {
  createStyle()

  const swaggerSearch = async () => {
    const informationContainerElement = document.querySelector(
      `.${INFORMATION_CONTAINER}`
    )

    if (!informationContainerElement) {
      return
    }

    const urlElement = document.querySelector<HTMLElement>('span.url')

    // TODO: url 없을때 안내 문구 추가
    if (!urlElement) {
      return
    }

    const API_SECTION_ELEMENT_LIST = document.querySelectorAll<HTMLElement>(
      `div.${OP_BLOCK_TAG_SECTION}`
    )

    // swagger fetch
    const urlList: UrlType[] = await fetch(urlElement.innerText).then((res) =>
      res.json().then((data) => (data.paths ? generateUrlList(data.paths) : []))
    )

    // 검색결과 전체 목록으로 초기화
    searchResultOption = {
      FUZZY: urlList,
      NORMAL: urlList,
    }

    searchResult = searchResultOption[searchType]

    if (SEARCH_RESULT_ELEMENT) {
      SEARCH_RESULT_ELEMENT.innerHTML = `API 총 ${urlList.length}개`
    }

    const apiSectionWrapperElement =
      document.querySelectorAll<HTMLElement>('div.wrapper')

    const apiSectionWrapper =
      apiSectionWrapperElement[apiSectionWrapperElement.length - 3]

    // 첫 로드 검색 옵션 초기화
    if (searchType === 'FUZZY') {
      fuzzyOptionElm.classList.add('wtk-selected')
      exactOptionElm.classList.remove('wtk-selected')
    } else {
      fuzzyOptionElm.classList.remove('wtk-selected')
      exactOptionElm.classList.add('wtk-selected')
    }

    // Fuzzy 옵션 클릭 이벤트
    // selected 설정 & 검색 인풋 포커스 & localStorage에 저장
    fuzzyOptionElm.addEventListener('click', () => {
      searchType = 'FUZZY'
      searchResult = searchResultOption[searchType]
      localStorage.setItem(WTK_SWAGGER_SEARCH_STORAGE_KEY, searchType)
      fuzzyOptionElm.classList.add('wtk-selected')
      exactOptionElm.classList.remove('wtk-selected')
      if (searchKeyword) {
        renderSearchResultElement(Array.from(API_SECTION_ELEMENT_LIST))
      } else {
        resetGroupElement({
          groupNodeList: Array.from(API_SECTION_ELEMENT_LIST),
        })
      }
      renderSearchResultText({ apiSectionWrapper, searchKeyword, searchResult })
      renderSearchInputResultCount(SEARCH_RESULT_ELEMENT)

      inputElement.focus()
    })

    // Exact 옵션 클릭 이벤트
    // selected 설정 & 검색 인풋 포커스 & localStorage에 저장
    exactOptionElm.addEventListener('click', () => {
      searchType = 'NORMAL'
      searchResult = searchResultOption[searchType]
      localStorage.setItem(WTK_SWAGGER_SEARCH_STORAGE_KEY, searchType)

      fuzzyOptionElm.classList.remove('wtk-selected')
      exactOptionElm.classList.add('wtk-selected')
      if (searchKeyword) {
        renderSearchResultElement(Array.from(API_SECTION_ELEMENT_LIST))
      } else {
        resetGroupElement({
          groupNodeList: Array.from(API_SECTION_ELEMENT_LIST),
        })
      }
      renderSearchResultText({ apiSectionWrapper, searchKeyword, searchResult })
      renderSearchInputResultCount(SEARCH_RESULT_ELEMENT)

      inputElement.focus()
    })

    // 단축키(/)로 검색창 포커스
    window.addEventListener('keydown', (e) => {
      if (e.key === '/') {
        if (document.activeElement instanceof HTMLInputElement) {
          return
        }

        e.preventDefault()
        inputElement.focus()
      }
    })

    /**
     * 검색 이벤트
     */
    searchInput.addEventListener('input', (e) => {
      const SEARCH_RESULT_ELEMENT = document.querySelector(
        '.wtk-swagger-search-result'
      )

      if (!SEARCH_RESULT_ELEMENT) {
        return
      }

      window.clearTimeout(searchTimeout)

      searchKeyword = (e.target as HTMLInputElement).value.trimStart() ?? ''

      // 현재 화면에 보이는 API Section 열기
      handleOpenSectionObserver(API_SECTION_ELEMENT_LIST, searchKeyword)

      const fuzzySearchResult: UrlType[] = searchKeyword
        ? fuzzysort
            .go(searchKeyword, urlList, {
              keys: ['summary', 'url'],
            })
            .map((result) => result.obj)
        : urlList

      const normalSearchResult: UrlType[] = searchKeyword
        ? urlList.filter((url) => {
            return (
              url.url.includes(searchKeyword ?? '') ||
              url.summary?.includes(searchKeyword ?? '')
            )
          })
        : urlList

      searchResultOption = {
        FUZZY: fuzzySearchResult,
        NORMAL: normalSearchResult,
      }

      // fuzzy랑, normal 골라서 사용하기
      searchResult = searchResultOption[searchType]

      searchTimeout = window.setTimeout(() => {
        /**
         * 키워드가 없을 때
         *  */
        if (!searchKeyword) {
          SEARCH_RESULT_ELEMENT.innerHTML = `API 총 ${urlList.length}개`

          /**
           * api 그룹 초기화
           */
          resetGroupElement({
            groupNodeList: Array.from(API_SECTION_ELEMENT_LIST),
          })

          if ((e.target as HTMLInputElement).tagName === 'INPUT') {
            document.documentElement.scrollTo(0, 0)
          }
          document.querySelector(`.${WTK_NO_RESULT}`)?.remove()
          return
        }

        /**
         * 키워드 있을 때
         */

        /**
         * 검색결과로 dom 렌더링
         * 1. 검색결과에 포함된 opblock만 보이기
         * 2. 검색결과에 포함된 url 하이라이트 처리
         */
        renderSearchResultElement(Array.from(API_SECTION_ELEMENT_LIST))

        // 조작 후 스크롤 최상단으로 이동
        document.documentElement.scrollTo(0, 0)

        // input창에 검색 결과 개수 표시
        renderSearchInputResultCount(SEARCH_RESULT_ELEMENT)

        // 검색결과 안내 문구 관리
        renderSearchResultText({
          apiSectionWrapper,
          searchKeyword,
          searchResult,
        })
      }, 250)
    })

    const infoElement = document.querySelector<HTMLDivElement>('.info')
    if (infoElement) {
      infoElement.style.marginBottom = '0px'
    }

    informationContainerElement.parentNode?.insertBefore(
      searchInput,
      informationContainerElement.nextSibling
    )
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          // information-container가 추가되면 실행 메인 코드 실행
          if (
            node instanceof HTMLElement &&
            (node.classList.contains('.information-container') ||
              node.querySelector('.information-container'))
          ) {
            runAtDocumentEnd(swaggerSearch)
            observer.disconnect()
          }

          // 검색 후 section을 클릭시 검색 결과 재 랜더링
          if (
            node instanceof HTMLElement &&
            (node.classList.contains(`.${OP_BLOCK_TAG_SECTION}`) ||
              node.querySelector(`.${OP_BLOCK_TAG_SECTION}`))
          ) {
            API_SECTION_ELEMENT_LIST.forEach((el) => {
              el.firstChild?.addEventListener('click', async () => {
                await sleep(1)

                const API_ELEMENT_LIST = (
                  el.lastChild as HTMLElement
                )?.querySelectorAll('.opblock')

                renderOpblockTagElement(Array.from(API_ELEMENT_LIST))
              })
            })
          }
        })
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

runAtDocumentEnd(run)
