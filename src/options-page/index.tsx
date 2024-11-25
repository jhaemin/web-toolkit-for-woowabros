import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { allTasks } from 'nanostores'
import ReactDOM from 'react-dom/client'
import OptionsPage from './options-page'
import { $registeredContentScripts, $settings } from './store'

const matchMedia = window.matchMedia('(prefers-color-scheme: dark)')

// Listen to dark mode change
matchMedia.addEventListener('change', (event) => {
  const isDark = event.matches
  handleDarkModeChange(isDark)
})

// Initial dark mode
handleDarkModeChange(matchMedia.matches)

/**
 * Handle dark mode change
 */
function handleDarkModeChange(isDark: boolean) {
  if (isDark) {
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
  }
}

// Intentionally subscribe before rendering to initialize atoms
$settings.listen(() => {})
$registeredContentScripts.listen(() => {})

// Wait for all tasks to complete before rendering
allTasks().then(() => {
  // Render the options page
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <Theme accentColor="blue">
      <OptionsPage />
    </Theme>
  )
})
