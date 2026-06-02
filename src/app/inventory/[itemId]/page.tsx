import Link from "next/link";
import { getInventoryItem } from "@/lib/inventory-data";
import { InventoryDetailClient } from "./inventory-detail-client";

export default async function InventoryDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = getInventoryItem(itemId);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>{item?.styleName ?? "Inventory Item"}</h1>
          <p className="muted">{item ? `${item.brand} - ${item.barcode}` : itemId}</p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/inventory">
            Back to inventory
          </Link>
          <Link className="button" href={`/inventory/${itemId}/edit`}>
            Edit item
          </Link>
        </div>
      </div>

      <InventoryDetailClient itemId={itemId} initialItem={item} />
    </main>
  );
}
