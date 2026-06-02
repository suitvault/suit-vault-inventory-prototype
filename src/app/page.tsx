import Link from "next/link";
import { getAssignedItemLabels, getDashboardMetrics, getStatusCounts } from "@/lib/inventory-data";
import { sampleBookings } from "@/lib/sample-bookings";
import { formatBookingNumber, formatEnumLabel } from "@/lib/formatting";

export default function Home() {
  const metrics = getDashboardMetrics();
  const statusCounts = getStatusCounts();
  const activeBookings = sampleBookings.filter((booking) => ["RESERVED", "PICKING", "OUT_ON_HIRE"].includes(booking.status));

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Inventory and rental booking overview.</p>
        </div>
        <Link className="button" href="/bookings/new">
          Create booking
        </Link>
      </div>

      <section className="grid metric-grid">
        <div className="metric">
          <span className="metric-label">Inventory items</span>
          <span className="metric-value">{metrics.totalItems}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Available</span>
          <span className="metric-value">{metrics.availableItems}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Active bookings</span>
          <span className="metric-value">{metrics.activeBookings}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Out on hire</span>
          <span className="metric-value">{metrics.outOnHireItems}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Needs attention</span>
          <span className="metric-value">{metrics.needsAttentionItems}</span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Status counts</h2>
          <Link href="/inventory">View inventory</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statusCounts).map(([status, count]) => (
                <tr key={status}>
                  <td>{formatEnumLabel(status)}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Active bookings</h2>
          <Link href="/bookings">View bookings</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking number</th>
                <th>Customer</th>
                <th>Dates</th>
                <th>Assigned items</th>
              </tr>
            </thead>
            <tbody>
              {activeBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{formatBookingNumber(booking)}</td>
                  <td>{booking.customerName}</td>
                  <td>
                    {booking.startDate} to {booking.endDate}
                  </td>
                  <td>{getAssignedItemLabels(booking).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
