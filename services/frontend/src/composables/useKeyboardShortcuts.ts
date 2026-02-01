import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNavigation } from '@/router/utils'
import { useDarkMode } from './useDarkMode'

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
  const authStore = useAuthStore()
  const { goToUserProfile, goToCreateEvent, goToHome } = useNavigation()
  const darkMode = useDarkMode()

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'd',
      ctrl: true,
      meta: true,
      description: 'Toggle dark mode',
      action: (event) => {
        event.preventDefault()
        darkMode.toggle()
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
        if (authStore.user?.role === 'organization') {
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
