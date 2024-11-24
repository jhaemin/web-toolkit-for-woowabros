/**
 * Run a function at document end.
 */
export function runAtDocumentEnd(func: () => void) {
  if (typeof document === 'undefined') {
    console.warn(
      'runAtDocumentEnd: You are trying to run a function at document end in a wrong environment.'
    )
    return
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      func()
    })
  } else {
    func()
  }
}
