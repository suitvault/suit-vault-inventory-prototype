"use client";

import { useEffect, useMemo, useState } from "react";
import { readCreatedBookings, subscribeToCreatedBookings } from "@/lib/browser-booking-store";
import { formatBookingNumber, formatEnumLabel, formatMoney } from "@/lib/formatting";
import { getUpcomingBookingsForItem } from "@/lib/inventory-data";
import { sampleBookings } from "@/lib/sample-bookings";
import type { Booking, InventoryItem } from "@/lib/types";

function getStatusClass(status: string): string {
  if (status === "AVAILABLE") {
    return "status status-available";
  }

  if (["REPAIR", "RETIRED"].includes(status)) {
    return "status status-problem";
  }

  return "status status-warning";
}

export function InventoryDetailClient({ item }: { item: InventoryItem }) {
  const [createdBookings, setCreatedBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const refresh = () => setCreatedBookings(readCreatedBookings());
    refresh();
    return subscribeToCreatedBookings(refresh);
  }, []);

  const upcomingBookings = useMemo(
    () => getUpcomingBookingsForItem(item.id, [...sampleBookings, ...createdBookings]),
    [createdBookings, item.id]
  );

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
