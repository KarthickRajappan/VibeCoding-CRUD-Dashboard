export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
}
