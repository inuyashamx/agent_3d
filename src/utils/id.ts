import { v4 as uuidv4 } from 'uuid';

// Generar ID único usando UUID
export function generateId(): string {
  return uuidv4();
}

// Generar ID único para objetos 3D
export function generateObjectId(shape: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${shape}_${timestamp}_${random}`;
}

// Generar ID único para chat entries
export function generateChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Generar ID único simple basado en timestamp
export function generateSimpleId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Validar si un ID es válido
export function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.trim() !== '';
}

// Generar ID único para comandos
export function generateCommandId(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
} 