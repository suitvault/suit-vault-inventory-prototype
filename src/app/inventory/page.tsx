import Link from "next/link";
import { formatEnumLabel } from "@/lib/formatting";
import { sampleInventoryItems } from "@/lib/seed-data";

function getStatusClass(status: string): string {
  if (status === "AVAILABLE") {
    return "status status-available";
  }

  if (["REPAIR", "RETIRED"].includes(status)) {
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
                <th>Brand</th>
                <th>Style Name</th>
                <th>Category</th>
                <th>Colour</th>
                <th>Size</th>
                <th>Barcode</th>
                <th>Rack</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {sampleInventoryItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.brand}</td>
                  <td>{item.styleName}</td>
                  <td>{formatEnumLabel(item.category)}</td>
                  <td>{item.colour}</td>
                  <td>{item.size}</td>
                  <td>{item.barcode}</td>
                  <td>{item.rackLocation}</td>
                  <td>{item.condition}</td>
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
