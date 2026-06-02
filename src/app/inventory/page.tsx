import Link from "next/link";
import { formatEnumLabel } from "@/lib/formatting";
import { sampleInventoryItems } from "@/lib/seed-data";

function getStatusClass(status: string): string {
  if (status === "AVAILABLE") {
    return "status status-available";
  }

  if (["REPAIR", "LOST", "RETIRED"].includes(status)) {
    return "status status-problem";
  }

  return "status status-warning";
}

export default function InventoryListPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p className="muted">All rental inventory items.</p>
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Category</th>
                <th>Style</th>
                <th>Colour</th>
                <th>Size</th>
                <th>Status</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {sampleInventoryItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{formatEnumLabel(item.category)}</td>
                  <td>{item.name}</td>
                  <td>{item.colour}</td>
                  <td>{item.sizeLabel}</td>
                  <td>
                    <span className={getStatusClass(item.status)}>{formatEnumLabel(item.status)}</span>
                  </td>
                  <td>
                    <Link href={`/inventory/${item.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
