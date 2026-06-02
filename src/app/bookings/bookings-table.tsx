"use client";

import { useEffect, useMemo, useState } from "react";
import { readCreatedBookings, subscribeToCreatedBookings } from "@/lib/browser-booking-store";
import { formatBookingNumber, formatEnumLabel } from "@/lib/formatting";
import { getAssignedItemLabels } from "@/lib/inventory-data";
import { sampleBookings } from "@/lib/sample-bookings";
import type { Booking } from "@/lib/types";

export function BookingsTable() {
  const [createdBookings, setCreatedBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const refresh = () => setCreatedBookings(readCreatedBookings());
    refresh();
    return subscribeToCreatedBookings(refresh);
  }, []);

  const bookings = useMemo(
    () => [...sampleBookings, ...createdBookings].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [createdBookings]
  );

  return (
    <section className="panel">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Booking number</th>
              <th>Customer</th>
              <th>Start date</th>
              <th>End date</th>
              <th>Assigned items</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{formatBookingNumber(booking)}</td>
                <td>{booking.customerName}</td>
                <td>{booking.startDate}</td>
                <td>{booking.endDate}</td>
                <td>{getAssignedItemLabels(booking).join(", ")}</td>
                <td>{formatEnumLabel(booking.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
