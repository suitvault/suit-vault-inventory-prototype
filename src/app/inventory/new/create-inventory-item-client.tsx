"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  appendStatusHistory,
  buildInventoryId,
  buildSku,
  createInventoryItem,
  readInventoryItems,
  subscribeToInventory
} from "@/lib/browser-inventory-store";
import { InventoryItemForm } from "../inventory-item-form";
import type { InventoryItem, InventoryItemFormValues } from "@/lib/types";

export function CreateInventoryItemClient() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>(() => readInventoryItems());

  useEffect(() => {
    const refresh = () => setItems(readInventoryItems());
    refresh();
    return subscribeToInventory(refresh);
  }, []);

  function handleSubmit(values: InventoryItemFormValues) {
    const item: InventoryItem = {
      id: buildInventoryId(values.barcode),
      sku: buildSku(values.category, values.barcode),
      ...values
    };

    createInventoryItem(item);
    appendStatusHistory({
      id: `history-${Date.now()}`,
      inventoryItemId: item.id,
      toStatus: item.status,
      changedAt: new Date().toISOString(),
      note: `Item created with status ${item.status}`
    });

    router.push(`/inventory/${item.id}`);
  }

  return <InventoryItemForm existingItems={items} submitLabel="Create item" onSubmit={handleSubmit} />;
}
