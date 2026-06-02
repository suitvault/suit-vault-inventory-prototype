# Suit Vault Inventory Prototype

Next.js + TypeScript prototype for Suit Vault rental inventory management.

This first slice focuses on the backend shape:

- database schema for inventory items and bookings
- seed data with 20 sample inventory items
- booking conflict detection that blocks overlapping bookings for the same item
- tests covering blocked and allowed booking windows plus inventory barcode validation
- functional inventory management screens for dashboard, inventory, booking list, and booking creation
- inventory maintenance workflows for create, edit, status change, and retirement

## Local Development

Install dependencies first:

```bash
npm install
```

Then run the app:

```bash
npm run dev
```

Run the booking tests:

```bash
npm test
```

## Database Files

- `db/schema.sql` defines the PostgreSQL schema, enums, indexes, and booking conflict trigger.
- `db/seed.sql` inserts 20 inventory items across Jackets, Pants, Vests, and Chinos.

## Booking Rule

Bookings use inclusive date ranges. If an item is booked from `2026-06-01` through `2026-06-05`, another booking for that same item starting on `2026-06-05` is considered overlapping and is blocked. A booking starting on `2026-06-06` is allowed.

## Prototype Routes

- `/` dashboard
- `/inventory` inventory list
- `/inventory/new` create inventory item
- `/inventory/[itemId]` inventory detail
- `/inventory/[itemId]/edit` edit inventory item
- `/bookings` booking list
- `/bookings/new` create booking
