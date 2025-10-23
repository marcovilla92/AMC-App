
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
  mediaSize?: number;
  createdAt: string;
  readBy: string[];
}

export interface MediaItem {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  type: 'image' | 'video' | 'file';
  url: string;
  size: number;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  type: 'check-in' | 'check-out';
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  note?: string;
}

export interface TimeSession {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  checkIn: TimeEntry;
  checkOut?: TimeEntry;
  duration?: number; // in milliseconds
  status: 'active' | 'completed';
}
