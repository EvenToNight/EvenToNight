import { Dark } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { createLogger } from '@/utils/logger'

const logger = createLogger('DARK MODE')

export const useDarkMode = () => {
  const authStore = useAuthStore()

  const doWithoutTransitions = (action: () => void) => {
    document.documentElement.classList.add('disable-transitions')
    action()
    setTimeout(() => {
      document.documentElement.classList.remove('disable-transitions')
    }, 100)
  }

  const savePreference = () => {
    localStorage.setItem('darkMode', String(Dark.isActive))
    if (authStore.isAuthenticated) {
      logger.log('Updating user dark mode preference')
      authStore.updateUser({ darkMode: Dark.isActive })
    }
  }

  const load = () => {
    const savedDarkMode = localStorage.getItem('darkMode')
    logger.log('Saved dark mode preference:', savedDarkMode)
    if (savedDarkMode === 'true') {
      set(true)
    } else if (savedDarkMode === 'false') {
      set(false)
    } else {
      set('auto')
    }
  }

  const toggle = () => {
    doWithoutTransitions(() => {
      Dark.toggle()
    })
    savePreference()
  }

  const set = (value: boolean | 'auto') => {
    doWithoutTransitions(() => {
      Dark.set(value)
    })
    savePreference()
  }

  return {
    toggle,
    load,
    get isActive() {
      return Dark.isActive
    },
    set,
  }
}
