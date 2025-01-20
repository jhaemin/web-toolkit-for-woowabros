import { browser } from '@/browser'
import { htmlToFragment } from '@/utils'
import { runAtDocumentEnd } from '@/utils/run-at-document-end'
import { css, html } from '@/utils/syntactic-sugar'

const styles = css`
  .wtk-copy-slack-previewable-url-button {
    position: relative;
    margin-left: 8px !important;
    background-color: #e85f00 !important;
    color: var(--ds-text-inverse, #FFFFFF) !important;
    border-radius: 3px !important;
    border: none !important;
    appearance: none !important;
    align-self: center !important;
    padding: 0 10px !important;
    height: 32px !important;
    cursor: pointer !important;
    outline: none !important;
    display: flex;
    align-items: center;
    transition: background-color 0.1s ease-out !important;
  }

  .wtk-copy-slack-previewable-url-button:hover {
    background-color: #d45701 !important;
  }

  .wtk-copy-slack-previewable-url-button:active {
    background-color: #b04901 !important;
  }

  .wtk-copy-slack-previewable-url-button .content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wtk-copy-slack-previewable-url-button .check-icon {
    height: 12px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
  }

  .wtk-copy-slack-previewable-url-button.copied .content {
    opacity: 0;
  }

  .wtk-copy-slack-previewable-url-button.copied .check-icon {
    opacity: 1;
  }
`

runAtDocumentEnd(() => {
  const style = document.createElement('style')
  style.textContent = styles
  document.head.appendChild(style)

  let createButtonFound = false

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (createButtonFound) return

      const createButton = document.querySelector(
        '#ak-jira-navigation #createGlobalItem'
      )

      if (createButton) {
        observer.disconnect()
        createButtonFound = true

        const copyButton = htmlToFragment(html`
          <button class="wtk-copy-slack-previewable-url-button">
            <div class="content">
              <img
                src=${browser.runtime.getURL('/icons/icon64.png')}
                width="18px"
              />
              Slack용 링크 복사
            </div>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 26.2541 26.1129"
              class="check-icon"
            >
              <g>
                <rect
                  height="26.1129"
                  opacity="0"
                  width="26.2541"
                  x="0"
                  y="0"
                />
                <path
                  d="M9.90672 26.1129C10.6684 26.1129 11.2693 25.795 11.6868 25.1581L25.4557 3.69344C25.7642 3.21063 25.8879 2.80663 25.8879 2.40907C25.8879 1.40039 25.1786 0.704302 24.1594 0.704302C23.4363 0.704302 23.0165 0.947464 22.5779 1.63593L9.84813 21.8596L3.28826 13.425C2.8614 12.8596 2.41346 12.6229 1.78065 12.6229C0.734759 12.6229 0 13.355 0 14.3663C0 14.8008 0.162304 15.2396 0.527633 15.6835L8.11699 25.1789C8.62236 25.8108 9.16874 26.1129 9.90672 26.1129Z"
                  fill="var(--ds-text-inverse, #FFFFFF)"
                  fill-opacity="1"
                />
              </g>
            </svg>
          </button>
        `).firstElementChild as HTMLButtonElement

        let timeout: Timer

        copyButton.addEventListener('click', () => {
          clearTimeout(timeout)

          const url = window.location.href
          navigator.clipboard.writeText(
            url.replace(
              process.env.WTK_WOOWABROS_JIRA_HOST as string,
              process.env.WTK_WOOWABROS_JIRA_ATLASSIAN_HOST as string
            )
          )
          copyButton.classList.add('copied')
          timeout = setTimeout(() => {
            copyButton.classList.remove('copied')
          }, 1000)
        })

        createButton.parentElement?.insertAdjacentElement(
          'afterend',
          copyButton
        )
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
})
