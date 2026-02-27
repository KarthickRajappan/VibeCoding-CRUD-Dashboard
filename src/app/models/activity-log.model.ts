export interface ActivityLogEntry {
  id: number;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  itemName: string;
  itemSku: string;
  details?: string | null;
  timestamp: string;
}
