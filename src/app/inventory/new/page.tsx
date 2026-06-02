import Link from "next/link";
import { CreateInventoryItemClient } from "./create-inventory-item-client";

export default function CreateInventoryItemPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Create Inventory Item</h1>
          <p className="muted">Add a new Suit Vault rental item.</p>
        </div>
        <Link className="button secondary" href="/inventory">
          Back to inventory
        </Link>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Item fields</h2>
        </div>
        <CreateInventoryItemClient />
      </section>
    </main>
  );
}
