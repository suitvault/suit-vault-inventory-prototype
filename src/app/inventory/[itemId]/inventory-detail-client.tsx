"use client";

import { useEffect, useMemo, useState } from "react";
import { readCreatedBookings, subscribeToCreatedBookings } from "@/lib/browser-booking-store";
import {
  changeInventoryStatus,
  readInventoryItems,
  readStatusHistory,
  retireInventoryItem,
  subscribeToInventory
} from "@/lib/browser-inventory-store";
import { formatBookingNumber, formatEnumLabel, formatMoney } from "@/lib/formatting";
import { getUpcomingBookingsForItem } from "@/lib/inventory-data";
import { sampleBookings } from "@/lib/sample-bookings";
import { inventoryStatuses } from "@/lib/types";
import type { Booking, InventoryItem, InventoryStatus, InventoryStatusHistoryEntry } from "@/lib/types";

function getStatusClass(status: string): string {
  if (status === "AVAILABLE") {
    return "status status-available";
  }

  if (["REPAIR", "RETIRED"].includes(status)) {
    return "status status-problem";
  }

  return "status status-warning";
}

export function InventoryDetailClient({ itemId, initialItem }: { itemId: string; initialItem?: InventoryItem }) {
  const [items, setItems] = useState<InventoryItem[]>(initialItem ? [initialItem] : []);
  const [history, setHistory] = useState<InventoryStatusHistoryEntry[]>([]);
  const [createdBookings, setCreatedBookings] = useState<Booking[]>([]);
  const [nextStatus, setNextStatus] = useState<InventoryStatus>(initialItem?.status ?? "AVAILABLE");
  const [statusNote, setStatusNote] = useState("");
  const [retireNote, setRetireNote] = useState("");

  useEffect(() => {
    const refresh = () => setCreatedBookings(readCreatedBookings());
    refresh();
    return subscribeToCreatedBookings(refresh);
  }, []);

  useEffect(() => {
    const refresh = () => {
      setItems(readInventoryItems());
      setHistory(readStatusHistory());
    };

    refresh();
    return subscribeToInventory(refresh);
  }, []);

  const item = useMemo(() => items.find((candidate) => candidate.id === itemId) ?? initialItem, [items, initialItem, itemId]);

  useEffect(() => {
    if (item) {
      setNextStatus(item.status);
    }
  }, [item]);

  const upcomingBookings = useMemo(
    () => (item ? getUpcomingBookingsForItem(item.id, [...sampleBookings, ...createdBookings]) : []),
    [createdBookings, item]
  );

  const statusHistory = useMemo(
    () => history.filter((entry) => entry.inventoryItemId === itemId),
    [history, itemId]
  );

  function handleStatusChange() {
    if (!item) {
      return;
    }

    changeInventoryStatus(item.id, nextStatus, statusNote);
    setStatusNote("");
  }

  function handleRetire() {
    if (!item) {
      return;
    }

    retireInventoryItem(item.id, retireNote);
    setRetireNote("");
  }

  if (!item) {
    return <p className="empty-state">Inventory item not found. It may have been removed from local prototype storage.</p>;
  }

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <h2>Item details</h2>
          <span className={getStatusClass(item.status)}>{formatEnumLabel(item.status)}</span>
        </div>
        <dl className="detail-list">
          <div className="detail-row">
            <dt>Item ID</dt>
            <dd>{item.id}</dd>
          </div>
          <div className="detail-row">
            <dt>SKU</dt>
            <dd>{item.sku}</dd>
          </div>
          <div className="detail-row">
            <dt>Brand</dt>
            <dd>{item.brand}</dd>
          </div>
          <div className="detail-row">
            <dt>Style Name</dt>
            <dd>{item.styleName}</dd>
          </div>
          <div className="detail-row">
            <dt>Category</dt>
            <dd>{formatEnumLabel(item.category)}</dd>
          </div>
          <div className="detail-row">
            <dt>Colour</dt>
            <dd>{item.colour}</dd>
          </div>
          <div className="detail-row">
            <dt>Size</dt>
            <dd>{item.size}</dd>
          </div>
          <div className="detail-row">
            <dt>Barcode</dt>
            <dd>{item.barcode}</dd>
          </div>
          <div className="detail-row">
            <dt>Rack Location</dt>
            <dd>{item.rackLocation}</dd>
          </div>
          <div className="detail-row">
            <dt>Condition</dt>
            <dd>{item.condition}</dd>
          </div>
          <div className="detail-row">
            <dt>Purchase Cost</dt>
            <dd>{formatMoney(item.purchaseCostCents)}</dd>
          </div>
          <div className="detail-row">
            <dt>Replacement Cost</dt>
            <dd>{formatMoney(item.replacementCostCents)}</dd>
          </div>
          <div className="detail-row">
            <dt>Current status</dt>
            <dd>{formatEnumLabel(item.status)}</dd>
          </div>
          <div className="detail-row">
            <dt>Notes</dt>
            <dd>{item.notes}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Change Status</h2>
        </div>
        <div className="form-grid">
          <label>
            Status
            <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as InventoryStatus)}>
              {inventoryStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatEnumLabel(status)}
                </option>
              ))}
            </select>
          </label>
          <label>
            History note
            <textarea value={statusNote} onChange={(event) => setStatusNote(event.target.value)} rows={3} />
          </label>
          <div className="actions">
            <button className="button" type="button" onClick={handleStatusChange} disabled={nextStatus === item.status}>
              Save status
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Retire Inventory Item</h2>
        </div>
        <div className="form-grid">
          <label>
            Retirement note
            <textarea value={retireNote} onChange={(event) => setRetireNote(event.target.value)} rows={3} />
          </label>
          <div className="actions">
            <button className="button" type="button" onClick={handleRetire} disabled={item.status === "RETIRED"}>
              Retire item
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Status History</h2>
        </div>
        {statusHistory.length === 0 ? (
          <p className="empty-state">No status changes recorded yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Changed At</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {statusHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.changedAt).toLocaleString()}</td>
                    <td>{entry.fromStatus ? formatEnumLabel(entry.fromStatus) : "New item"}</td>
                    <td>{formatEnumLabel(entry.toStatus)}</td>
                    <td>{entry.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Upcoming bookings</h2>
        </div>
        {upcomingBookings.length === 0 ? (
          <p className="empty-state">No active upcoming bookings for this item.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking number</th>
                  <th>Customer</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{formatBookingNumber(booking)}</td>
                    <td>{booking.customerName}</td>
                    <td>{booking.startDate}</td>
                    <td>{booking.endDate}</td>
                    <td>{formatEnumLabel(booking.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
