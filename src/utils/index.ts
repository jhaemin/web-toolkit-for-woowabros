import { browser } from '@/browser'

export function getSvgUrl(svgPath: string) {
  return browser.runtime.getURL(svgPath)
}

export async function svgFileAsString(svgPath: string): Promise<string> {
  return new Promise((resolve) => {
    fetch(getSvgUrl(svgPath))
      .then((response) => response.text())
      .then((text) => {
        resolve(text)
      })
  })
}

export function setSvgFill(svg: string, color: string) {
  return svg.replace(/fill=".*?"/g, `fill="${color}"`)
}

export async function getSvgElm(
  svgPath: string,
  options?: { color?: string; size?: number }
): Promise<SVGElement> {
  const parser = new DOMParser()
  const svg = parser.parseFromString(
    await svgFileAsString(svgPath),
    'image/svg+xml'
  )

  const { color, size } = options ?? {}

  if (color) {
    svg.firstElementChild!.innerHTML = setSvgFill(
      svg.firstElementChild!.innerHTML,
      color
    )
  }

  if (size) {
    svg.firstElementChild!.setAttribute('width', size.toString())
    svg.firstElementChild!.setAttribute('height', size.toString())
  }

  return svg.firstElementChild as SVGElement
}

export function svgToDataUrl(svgSource: string): string {
  return `data:image/svg+xml;base64,${btoa(encodeURIComponent(svgSource))}`
}

export function stringTemplate(
  strings: TemplateStringsArray,
  ...values: any[]
) {
  let str = ''
  strings.forEach((string, i) => {
    str += string + (values[i] || '')
  })
  return str
}

export function decodeHtml(html: string) {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

export function htmlToFragment(html: string) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if the user is using macOS
 */
export const isMac = navigator.userAgent.includes('Mac')

export function popupWindow(
  url: string,
  windowName: string,
  win: Window,
  w: number,
  h: number
) {
  const y = (win.outerHeight ?? 0) / 2 + (win.screenY ?? 0) - h / 2
  const x = (win.outerWidth ?? 0) / 2 + (win.screenX ?? 0) - w / 2
  return win.open(
    url,
    windowName,
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`
  )
}
