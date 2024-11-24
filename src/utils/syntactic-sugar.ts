function sugar(strings: TemplateStringsArray, ...values: any[]) {
  let str = ''
  strings.forEach((string, i) => {
    str += string + (values[i] || '')
  })
  return str
}

export const css = sugar
export const html = sugar
