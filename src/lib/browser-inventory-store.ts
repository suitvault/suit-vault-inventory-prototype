"use client";

import { sampleInventoryItems } from "./seed-data";
import type { InventoryItem, InventoryStatus, InventoryStatusHistoryEntry } from "./types";

const inventoryStorageKey = "suit-vault-inventory-items";
const historyStorageKey = "suit-vault-inventory-status-history";
const inventoryUpdatedEvent = "suit-vault-inventory-updated";

export function readInventoryItems(): InventoryItem[] {
  if (typeof window === "undefined") {
    return sampleInventoryItems;
  }

  const raw = window.localStorage.getItem(inventoryStorageKey);
  if (!raw) {
    return sampleInventoryItems;
  }

  try {
    const items = JSON.parse(raw) as InventoryItem[];
    return Array.isArray(items) ? items : sampleInventoryItems;
  } catch {
    return sampleInventoryItems;
  }
}

export function saveInventoryItems(items: InventoryItem[]): InventoryItem[] {
  window.localStorage.setItem(inventoryStorageKey, JSON.stringify(items));
  window.dispatchEvent(new Event(inventoryUpdatedEvent));
  return items;
}

export function readStatusHistory(): InventoryStatusHistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(historyStorageKey);
  if (!raw) {
    return [];
  }

  try {
    const entries = JSON.parse(raw) as InventoryStatusHistoryEntry[];
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

export function appendStatusHistory(entry: InventoryStatusHistoryEntry): InventoryStatusHistoryEntry[] {
  const entries = [entry, ...readStatusHistory()];
  window.localStorage.setItem(historyStorageKey, JSON.stringify(entries));
  window.dispatchEvent(new Event(inventoryUpdatedEvent));
  return entries;
}

export function subscribeToInventory(listener: () => void): () => void {
  window.addEventListener("storage", listener);
  window.addEventListener(inventoryUpdatedEvent, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(inventoryUpdatedEvent, listener);
  };
}

export function createInventoryItem(item: InventoryItem): InventoryItem[] {
  return saveInventoryItems([...readInventoryItems(), item]);
}

export function updateInventoryItem(itemId: string, updates: InventoryItem): InventoryItem[] {
  return saveInventoryItems(readInventoryItems().map((item) => (item.id === itemId ? updates : item)));
}

export function changeInventoryStatus(itemId: string, nextStatus: InventoryStatus, note: string): InventoryItem | undefined {
  const items = readInventoryItems();
  const item = items.find((candidate) => candidate.id === itemId);

  if (!item || item.status === nextStatus) {
    return item;
  }

  const updatedItem = { ...item, status: nextStatus };
  saveInventoryItems(items.map((candidate) => (candidate.id === itemId ? updatedItem : candidate)));
  appendStatusHistory({
    id: `history-${Date.now()}`,
    inventoryItemId: itemId,
    fromStatus: item.status,
    toStatus: nextStatus,
    changedAt: new Date().toISOString(),
    note: note.trim() || `Status changed to ${nextStatus}`
  });

  return updatedItem;
}

export function retireInventoryItem(itemId: string, note: string): InventoryItem | undefined {
  return changeInventoryStatus(itemId, "RETIRED", note.trim() || "Item retired");
}

export function buildInventoryId(barcode: string): string {
  const safeBarcode = barcode.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `item-${safeBarcode || Date.now()}`;
}

export function buildSku(category: string, barcode: string): string {
  const categoryPrefix = category.slice(0, 3).toUpperCase();
  const barcodeSuffix = barcode.trim().slice(-4).toUpperCase();
  return `SV-${categoryPrefix}-${barcodeSuffix || Date.now().toString().slice(-4)}`;
}
