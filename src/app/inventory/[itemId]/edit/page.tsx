import Link from "next/link";
import { getInventoryItem } from "@/lib/inventory-data";
import { EditInventoryItemClient } from "./edit-inventory-item-client";

export default async function EditInventoryItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const initialItem = getInventoryItem(itemId);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Edit Inventory Item</h1>
          <p className="muted">{initialItem ? `${initialItem.brand} - ${initialItem.barcode}` : itemId}</p>
        </div>
        <Link className="button secondary" href={`/inventory/${itemId}`}>
          Back to detail
        </Link>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Item fields</h2>
        </div>
        <EditInventoryItemClient itemId={itemId} initialItem={initialItem} />
      </section>
    </main>
  );
}
