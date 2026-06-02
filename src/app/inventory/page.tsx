import Link from "next/link";
import { InventoryListClient } from "./inventory-list-client";

export default function InventoryListPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p className="muted">Search, filter, and maintain rental inventory items.</p>
        </div>
        <Link className="button" href="/inventory/new">
          Create item
        </Link>
      </div>

      <InventoryListClient />
    </main>
  );
}
