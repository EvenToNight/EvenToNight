import type { Conversation, ConversationMessages } from '@/api/types/chat'
import { loadConversations, loadMessages } from '../storage/chatStorage'

const defaultConversations: Conversation[] = [
  {
    id: '1',
    organization: {
      id: 'organization_1',
      name: 'Coccorico Events',
      username: 'organization_1',
      avatar:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3s2TWG_y1cT4NHdiYO0_MBkrI9wGTAIF_QA&s',
    },
    member: {
      id: 'member_1',
      name: 'Alex Johnson',
      username: 'member_1',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    lastMessage: {
      senderId: 'organization_1',
      content: 'Grazie, a presto!',
      timestamp: new Date('2025-11-24T18:30:00'),
    },
    unreadCount: 0,
  },
  {
    id: '2',
    organization: {
      id: 'organization_2',
      name: 'Riviera Sounds',
      username: 'organization_2',
      avatar: 'https://www.cdclick.it/gfx/Vinyl/12-BLACK.jpg',
    },
    member: {
      id: 'member_1',
      name: 'Alex Johnson',
      username: 'member_1',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    lastMessage: {
      senderId: 'member_1',
      content: 'Ok perfetto',
      timestamp: new Date('2025-11-23T15:45:00'),
    },
    unreadCount: 0,
  },
  {
    id: '3',
    organization: {
      id: 'organization_3',
      name: 'Italy Music Group',
      username: 'organization_3',
      avatar: 'https://cdn.bestmovie.it/wp-content/uploads/2020/11/maradona.jpg',
    },
    member: {
      id: 'member_1',
      name: 'Alex Johnson',
      username: 'member_1',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    lastMessage: {
      senderId: 'organization_3',
      content: 'Ti aspettiamo!',
      timestamp: new Date('2025-11-21T20:00:00'),
    },
    unreadCount: 1,
  },
]

const defaultMessages: ConversationMessages = {
  '1': [
    {
      id: 'm1',
      senderId: 'member_1',
      content: "Ciao, vorrei informazioni sull'evento di sabato",
      timestamp: new Date('2025-11-24T17:00:00'),
    },
    {
      id: 'm2',
      senderId: 'organization_1',
      content: "Certo! L'evento inizia alle 22:00 e l'ingresso costa 15€",
      timestamp: new Date('2025-11-24T17:15:00'),
    },
    {
      id: 'm3',
      senderId: 'member_1',
      content: 'Perfetto, grazie! È necessaria la prenotazione?',
      timestamp: new Date('2025-11-24T17:20:00'),
    },
    {
      id: 'm4',
      senderId: 'organization_1',
      content: "Sì, ti consiglio di prenotare tramite l'app",
      timestamp: new Date('2025-11-24T18:00:00'),
    },
    {
      id: 'm5',
      senderId: 'organization_1',
      content: 'Ci sono posti limitati!',
      timestamp: new Date('2025-11-24T18:30:00'),
    },
    {
      id: 'm6',
      senderId: 'member_1',
      content: 'Ok, prenoto subito allora 😊',
      timestamp: new Date('2025-11-24T18:35:00'),
    },
    {
      id: 'm7',
      senderId: 'organization_1',
      content: 'Perfetto! Ti aspettiamo 🎶',
      timestamp: new Date('2025-11-24T18:40:00'),
    },
    {
      id: 'm8',
      senderId: 'member_1',
      content: 'C’è un dress code particolare?',
      timestamp: new Date('2025-11-24T19:00:00'),
    },
    {
      id: 'm9',
      senderId: 'organization_1',
      content: 'No, vieni pure come preferisci 😉',
      timestamp: new Date('2025-11-24T19:10:00'),
    },
    {
      id: 'm10',
      senderId: 'member_1',
      content: 'Perfetto, a sabato allora!',
      timestamp: new Date('2025-11-24T19:15:00'),
    },
    {
      id: 'm11',
      senderId: 'organization_1',
      content: 'A sabato! Se hai altre domande scrivici pure.',
      timestamp: new Date('2025-11-24T19:20:00'),
    },
    {
      id: 'm12',
      senderId: 'member_1',
      content: 'Inizia puntuale o conviene arrivare prima?',
      timestamp: new Date('2025-11-24T19:45:00'),
    },
    {
      id: 'm13',
      senderId: 'organization_1',
      content: 'Consigliamo di arrivare 15 minuti prima per evitare fila.',
      timestamp: new Date('2025-11-24T19:50:00'),
    },
    {
      id: 'm14',
      senderId: 'member_1',
      content: 'Perfetto, grazie mille!',
      timestamp: new Date('2025-11-24T19:55:00'),
    },
    {
      id: 'm15',
      senderId: 'organization_1',
      content: 'Di nulla 😊',
      timestamp: new Date('2025-11-24T20:00:00'),
    },
    {
      id: 'm16',
      senderId: 'member_1',
      content: 'Ultima cosa: c’è il guardaroba?',
      timestamp: new Date('2025-11-24T20:30:00'),
    },
    {
      id: 'm17',
      senderId: 'organization_1',
      content: 'Sì, guardaroba disponibile all’ingresso.',
      timestamp: new Date('2025-11-24T20:35:00'),
    },
    {
      id: 'm18',
      senderId: 'member_1',
      content: 'Perfetto allora 👌',
      timestamp: new Date('2025-11-24T20:40:00'),
    },
    {
      id: 'm19',
      senderId: 'organization_1',
      content: 'Ti aspettiamo, buona serata!',
      timestamp: new Date('2025-11-24T20:45:00'),
    },
    {
      id: 'm20',
      senderId: 'member_1',
      content: 'Grazie, a presto!',
      timestamp: new Date('2025-11-24T20:50:00'),
    },
  ],
  '2': [
    {
      id: 'm21',
      senderId: 'member_1',
      content: 'Buongiorno, ho un problema con il mio biglietto',
      timestamp: new Date('2025-11-23T14:00:00'),
    },
    {
      id: 'm22',
      senderId: 'organization_2',
      content: 'Mi dispiace, di cosa si tratta?',
      timestamp: new Date('2025-11-23T14:30:00'),
    },
    {
      id: 'm23',
      senderId: 'member_1',
      content: 'Non riesco a visualizzare il QR code',
      timestamp: new Date('2025-11-23T14:35:00'),
    },
    {
      id: 'm24',
      senderId: 'organization_2',
      content: 'Prova a ricaricare la pagina. Se il problema persiste te lo invio via email',
      timestamp: new Date('2025-11-23T15:00:00'),
    },
    {
      id: 'm25',
      senderId: 'member_1',
      content: 'Ok perfetto',
      timestamp: new Date('2025-11-23T15:45:00'),
    },
  ],
  '3': [
    {
      id: 'm26',
      senderId: 'member_1',
      content: "Ciao! Ci sono ancora posti disponibili per l'evento di venerdì?",
      timestamp: new Date('2025-11-21T19:00:00'),
    },
    {
      id: 'm27',
      senderId: 'organization_3',
      content: 'Sì! Abbiamo ancora circa 20 posti',
      timestamp: new Date('2025-11-21T19:30:00'),
    },
    {
      id: 'm28',
      senderId: 'member_1',
      content: 'Perfetto, ne prenoto 2',
      timestamp: new Date('2025-11-21T19:35:00'),
    },
    {
      id: 'm29',
      senderId: 'organization_3',
      content: 'Ti aspettiamo!',
      timestamp: new Date('2025-11-21T20:00:00'),
    },
  ],
}

// Export data loaded from localStorage (or defaults if not found)
export let mockConversations = loadConversations(defaultConversations)
export let mockMessages = loadMessages(defaultMessages)

// Listen for storage changes from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'mock-support-messages' && event.newValue) {
      console.log('[SupportData] Messages updated in another tab, reloading...')
      mockMessages = loadMessages(defaultMessages)
    }
    if (event.key === 'mock-support-conversations' && event.newValue) {
      console.log('[SupportData] Conversations updated in another tab, reloading...')
      mockConversations = loadConversations(defaultConversations)
    }
  })
}
