import { useQuasar } from 'quasar'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import { useAuthStore } from '@/stores/auth'
import { createLogger } from '@/utils/logger'

const logger = createLogger(import.meta.url)
export function useTicketDownload() {
  const $q = useQuasar()
  const authStore = useAuthStore()

  const downloadTickets = async (event: Event) => {
    try {
      if (!authStore.user) throw new Error('User not authenticated')
      const blob = await api.payments.getEventPdfTickets(authStore.user!.id, event.eventId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tickets-${event.title.replace(/\s+/g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      $q.notify({
        type: 'positive',
        message: 'Tickets downloaded successfully',
        icon: 'download',
      })
    } catch (error) {
      logger.error('Failed to download tickets:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to download tickets',
        icon: 'error',
      })
    }
  }

  return {
    downloadTickets,
  }
}
