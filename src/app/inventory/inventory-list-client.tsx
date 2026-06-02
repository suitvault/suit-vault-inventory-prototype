"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readInventoryItems, subscribeToInventory } from "@/lib/browser-inventory-store";
import { formatEnumLabel } from "@/lib/formatting";
import { inventoryStatuses } from "@/lib/types";
import type { InventoryStatus } from "@/lib/types";

function getStatusClass(status: string): string {
  if (status === "AVAILABLE") {
    return "status status-available";
  }

  if (["REPAIR", "RETIRED"].includes(status)) {
    return "status status-problem";
  }

  return "status status-warning";
}

export function InventoryListClient() {
  const [items, setItems] = useState(() => readInventoryItems());
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => setItems(readInventoryItems());
    refresh();
    return subscribeToInventory(refresh);
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesSearch =
        query === "" ||
        item.barcode.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.styleName.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [items, search, statusFilter]);

  return (
    <section className="panel">
      <div className="filters">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Barcode, brand, or style name"
          />
        </label>

        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as InventoryStatus | "ALL")}>
            <option value="ALL">All statuses</option>
            {inventoryStatuses.map((status) => (
              <option key={status} value={status}>
                {formatEnumLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
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
                  <div className="inline-actions">
                    <Link href={`/inventory/${item.id}`}>View</Link>
                    <Link href={`/inventory/${item.id}/edit`}>Edit</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 ? <p className="empty-state">No inventory items match the current filters.</p> : null}
    </section>
  );
}
