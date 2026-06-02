import Link from "next/link";
import { notFound } from "next/navigation";
import { getInventoryItem } from "@/lib/inventory-data";
import { InventoryDetailClient } from "./inventory-detail-client";

export default async function InventoryDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = getInventoryItem(itemId);

  if (!item) {
    notFound();
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>{item.name}</h1>
          <p className="muted">{item.sku}</p>
        </div>
        <Link className="button secondary" href="/inventory">
          Back to inventory
        </Link>
      </div>

      <InventoryDetailClient item={item} />
    </main>
  );
}
