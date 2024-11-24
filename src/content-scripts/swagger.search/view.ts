import { htmlToFragment } from '@/utils'
import { OP_BLOCK_TAG_SECTION, WTK_SWAGGER_SEARCH_RESULT } from './constants'
import magnifyingGlass from './icons/magnifying_glass'

export const searchInput = htmlToFragment(/* html */ `
  <div class="sticky-wrapper">
    <div class="wtk-swagger-search">
      <div class="wtk-swagger-search-options">
        <div class="wtk-swagger-search-option-item wtk-fuzzy-option">Fuzzy</div>
        <div class="wtk-swagger-search-option-item wtk-exact-option">Exact</div>
      </div>
      <div class="wtk-swagger-search-input-wrapper">
        <input
          class="wtk-swagger-search-input"
          type="search"
          maxlength="100"
          placeholder="API 검색 ( / )"
        />
        ${magnifyingGlass}
      </div>
      <span class="wtk-swagger-search-result"></span>
    </div>
  </div>
`).firstElementChild as HTMLDivElement

/**
 * 검색 입력 엘리먼트
 */
export const inputElement = searchInput.querySelector<HTMLInputElement>(
  '.wtk-swagger-search-input'
)!
/**
 * Fuzzy 검색 옵션 엘리먼트
 */
export const fuzzyOptionElm = searchInput.querySelector<HTMLElement>(
  '.wtk-swagger-search-option-item.wtk-fuzzy-option'
)!
/**
 * Exact 검색 옵션 엘리먼트
 */
export const exactOptionElm = searchInput.querySelector<HTMLElement>(
  '.wtk-swagger-search-option-item.wtk-exact-option'
)!

export const SEARCH_RESULT_ELEMENT = searchInput.querySelector(
  `.${WTK_SWAGGER_SEARCH_RESULT}`
)

export const API_SECTION_ELEMENT_LIST = document.querySelectorAll(
  `div.${OP_BLOCK_TAG_SECTION}`
)
