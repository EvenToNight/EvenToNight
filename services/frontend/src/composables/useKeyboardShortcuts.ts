import { onMounted, onUnmounted, toRef } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { useNavigation } from '@/router/utils'
import { useUserProfile } from './useUserProfile'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  action: (event: KeyboardEvent) => void
  description?: string
}

export const useKeyboardShortcuts = () => {
  const $q = useQuasar()
  const authStore = useAuthStore()
  const { goToUserProfile, goToCreateEvent, goToHome } = useNavigation()
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'd',
      ctrl: true,
      meta: true,
      description: 'Toggle dark mode',
      action: (event) => {
        event.preventDefault()
        $q.dark.toggle()
        if (authStore.isAuthenticated) {
          authStore.updateUser({ darkMode: $q.dark.isActive })
        }
        localStorage.setItem('darkMode', String($q.dark.isActive))
      },
    },
    {
      key: 'h',
      ctrl: true,
      meta: true,
      description: 'Go to home page',
      action: (event) => {
        event.preventDefault()
        goToHome()
      },
    },
    {
      key: 'p',
      ctrl: true,
      meta: true,
      description: 'Open profile',
      action: (event) => {
        event.preventDefault()
        if (!authStore.isAuthenticated) return
        goToUserProfile(authStore.user!.id)
      },
    },
    {
      key: 'e',
      ctrl: true,
      meta: true,
      description: 'Go to create event page',
      action: (event) => {
        event.preventDefault()
        if (!authStore.isAuthenticated) return
        const { isOrganization } = useUserProfile(toRef(authStore.user!))
        if (isOrganization.value) {
          goToCreateEvent()
        }
      },
    },
  ]

  const handleKeyDown = (event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const key = event.key?.toLowerCase() || '' // Fingerprint is a keydown event without key property
      const ctrlPressed = event.ctrlKey || event.metaKey
      const shiftPressed = event.shiftKey
      const altPressed = event.altKey

      const keyMatches = key === shortcut.key.toLowerCase()
      const ctrlMatches = shortcut.ctrl || shortcut.meta ? ctrlPressed : !ctrlPressed
      const shiftMatches = shortcut.shift ? shiftPressed : !shiftPressed
      const altMatches = shortcut.alt ? altPressed : !altPressed

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        shortcut.action(event)
        return
      }
    }
  }

  const registerShortcuts = () => {
    window.addEventListener('keydown', handleKeyDown)
  }

  const unregisterShortcuts = () => {
    window.removeEventListener('keydown', handleKeyDown)
  }

  onMounted(() => {
    registerShortcuts()
  })

  onUnmounted(() => {
    unregisterShortcuts()
  })

  return {
    shortcuts,
    registerShortcuts,
    unregisterShortcuts,
  }
}
