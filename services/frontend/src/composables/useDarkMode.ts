import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { createLogger } from '@/utils/logger'

const logger = createLogger('DARK MODE')

export const useDarkMode = () => {
  const $q = useQuasar()
  const authStore = useAuthStore()

  const doWithoutTransitions = (action: () => void) => {
    document.documentElement.classList.add('disable-transitions')
    action()
    setTimeout(() => {
      document.documentElement.classList.remove('disable-transitions')
    }, 100)
  }

  const savePreference = () => {
    localStorage.setItem('darkMode', String($q.dark.isActive))
    if (authStore.isAuthenticated) {
      logger.log('Updating user dark mode preference')
      authStore.updateUser({ darkMode: $q.dark.isActive })
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
      $q.dark.toggle()
    })
    savePreference()
  }

  const set = (value: boolean | 'auto') => {
    doWithoutTransitions(() => {
      $q.dark.set(value)
    })
    savePreference()
  }

  return {
    toggle,
    load,
    get isActive() {
      return $q.dark.isActive
    },
    set,
  }
}
