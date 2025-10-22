import { User, Project, Message } from '../types';

export const demoUsers: User[] = [
  {
    id: '1',
    email: 'admin@amc.com',
    name: 'Marco Rossi',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@amc.com',
    name: 'Giuseppe Verdi',
    role: 'user',
  },
  {
    id: '3',
    email: 'luca@amc.com',
    name: 'Luca Bianchi',
    role: 'user',
  },
];

export const demoProjects: Project[] = [
  {
    id: '1',
    name: 'Cantiere Via Roma 45',
    description: 'Ristrutturazione edificio residenziale',
    createdBy: '1',
    members: ['1', '2', '3'],
    createdAt: new Date('2025-01-15').toISOString(),
    address: 'Via Roma 45, Milano',
    status: 'in_progress',
    startDate: new Date('2025-01-15').toISOString(),
    location: {
      lat: 45.4642,
      lng: 9.1900,
    },
  },
  {
    id: '2',
    name: 'Cantiere Centro Commerciale Nord',
    description: 'Costruzione nuovo centro commerciale',
    createdBy: '1',
    members: ['1', '2'],
    createdAt: new Date('2024-11-01').toISOString(),
    address: 'Via Torino 120, Milano',
    status: 'in_progress',
    startDate: new Date('2024-11-01').toISOString(),
    location: {
      lat: 45.4862,
      lng: 9.2050,
    },
  },
  {
    id: '3',
    name: 'Cantiere Villa Monza',
    description: 'Villa unifamiliare di lusso',
    createdBy: '1',
    members: ['1', '3'],
    createdAt: new Date('2025-02-01').toISOString(),
    address: 'Via Manzoni 8, Monza',
    status: 'planning',
    startDate: new Date('2025-03-01').toISOString(),
    location: {
      lat: 45.5845,
      lng: 9.2744,
    },
  },
  {
    id: '4',
    name: 'Cantiere Scuola Bergamo',
    description: 'Ampliamento scuola elementare',
    createdBy: '1',
    members: ['1', '2', '3'],
    createdAt: new Date('2024-09-01').toISOString(),
    address: 'Via Garibaldi 32, Bergamo',
    status: 'completed',
    startDate: new Date('2024-09-01').toISOString(),
    endDate: new Date('2025-01-15').toISOString(),
    location: {
      lat: 45.6983,
      lng: 9.6773,
    },
  },
];

export const demoMessages: Message[] = [
  {
    id: '1',
    projectId: '1',
    senderId: '1',
    senderName: 'Marco Rossi',
    content: 'Buongiorno a tutti! Iniziamo oggi i lavori di ristrutturazione.',
    type: 'text',
    createdAt: new Date('2025-01-15T08:00:00').toISOString(),
    readBy: ['1', '2', '3'],
  },
  {
    id: '2',
    projectId: '1',
    senderId: '2',
    senderName: 'Giuseppe Verdi',
    content: 'Perfetto! Ho fatto un sopralluogo stamattina, tutto pronto.',
    type: 'text',
    createdAt: new Date('2025-01-15T08:15:00').toISOString(),
    readBy: ['1', '2'],
  },
  {
    id: '3',
    projectId: '1',
    senderId: '3',
    senderName: 'Luca Bianchi',
    content: 'stato_cantiere_ingresso.jpg',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
    createdAt: new Date('2025-01-15T09:30:00').toISOString(),
    readBy: ['1', '3'],
  },
  {
    id: '4',
    projectId: '1',
    senderId: '1',
    senderName: 'Marco Rossi',
    content: 'Ottima foto! Ricordatevi di documentare ogni fase dei lavori.',
    type: 'text',
    createdAt: new Date('2025-01-15T10:00:00').toISOString(),
    readBy: ['1'],
  },
  {
    id: '5',
    projectId: '2',
    senderId: '2',
    senderName: 'Giuseppe Verdi',
    content: 'Aggiornamento: completati i lavori di fondazione.',
    type: 'text',
    createdAt: new Date('2025-01-10T14:30:00').toISOString(),
    readBy: ['1', '2'],
  },
  {
    id: '6',
    projectId: '2',
    senderId: '1',
    senderName: 'Marco Rossi',
    content: 'fondazioni_completate.jpg',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    createdAt: new Date('2025-01-10T15:00:00').toISOString(),
    readBy: ['1'],
  },
  {
    id: '7',
    projectId: '3',
    senderId: '1',
    senderName: 'Marco Rossi',
    content: 'Preparazione documenti per inizio lavori a marzo.',
    type: 'text',
    createdAt: new Date('2025-02-01T11:00:00').toISOString(),
    readBy: ['1', '3'],
  },
  {
    id: '8',
    projectId: '4',
    senderId: '1',
    senderName: 'Marco Rossi',
    content: 'Progetto completato con successo! Complimenti a tutto il team.',
    type: 'text',
    createdAt: new Date('2025-01-15T16:00:00').toISOString(),
    readBy: ['1', '2', '3'],
  },
  {
    id: '9',
    projectId: '4',
    senderId: '2',
    senderName: 'Giuseppe Verdi',
    content: 'progetto_finale_scuola.jpg',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
    createdAt: new Date('2025-01-15T16:30:00').toISOString(),
    readBy: ['1', '2'],
  },
];

export const initializeDemoData = async (persistence: any) => {
  // Check if data already exists
  const existingProjects = await persistence.getItem('projects');

  if (!existingProjects) {
    // Initialize with demo data
    await persistence.setItem('projects', JSON.stringify(demoProjects));
    await persistence.setItem('messages', JSON.stringify(demoMessages));
    return true;
  }

  return false;
};
