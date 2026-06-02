"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  appendStatusHistory,
  buildSku,
  readInventoryItems,
  subscribeToInventory,
  updateInventoryItem
} from "@/lib/browser-inventory-store";
import { InventoryItemForm } from "../../inventory-item-form";
import type { InventoryItem, InventoryItemFormValues } from "@/lib/types";

export function EditInventoryItemClient({
  itemId,
  initialItem
}: {
  itemId: string;
  initialItem?: InventoryItem;
}) {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>(() => readInventoryItems());

  useEffect(() => {
    const refresh = () => setItems(readInventoryItems());
    refresh();
    return subscribeToInventory(refresh);
  }, []);

  const item = useMemo(() => items.find((candidate) => candidate.id === itemId) ?? initialItem, [items, initialItem, itemId]);

  function handleSubmit(values: InventoryItemFormValues) {
    if (!item) {
      return;
    }

    const updatedItem: InventoryItem = {
      ...item,
      ...values,
      sku: buildSku(values.category, values.barcode)
    };

    updateInventoryItem(itemId, updatedItem);

    if (item.status !== values.status) {
      appendStatusHistory({
        id: `history-${Date.now()}`,
        inventoryItemId: itemId,
        fromStatus: item.status,
        toStatus: values.status,
        changedAt: new Date().toISOString(),
        note: "Status changed during item edit"
      });
    }

    router.push(`/inventory/${itemId}`);
  }

  if (!item) {
    return <p className="empty-state">Inventory item not found.</p>;
  }

  return <InventoryItemForm existingItems={items} initialItem={item} submitLabel="Save item" onSubmit={handleSubmit} />;
}
