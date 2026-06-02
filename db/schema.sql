CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE inventory_category AS ENUM (
  'JACKETS',
  'PANTS',
  'VESTS',
  'CHINOS'
);

CREATE TYPE inventory_status AS ENUM (
  'AVAILABLE',
  'RESERVED',
  'PICKING',
  'OUT_ON_HIRE',
  'RETURNED',
  'CLEANING',
  'REPAIR',
  'LOST',
  'RETIRED'
);

CREATE TYPE booking_status AS ENUM (
  'RESERVED',
  'PICKING',
  'OUT_ON_HIRE',
  'RETURNED',
  'CANCELLED'
);

CREATE TABLE inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  category inventory_category NOT NULL,
  name text NOT NULL,
  size_label text NOT NULL,
  colour text NOT NULL,
  status inventory_status NOT NULL DEFAULT 'AVAILABLE',
  replacement_value_cents integer NOT NULL CHECK (replacement_value_cents >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status booking_status NOT NULL DEFAULT 'RESERVED',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_valid_date_range CHECK (start_date <= end_date)
);

CREATE TABLE booking_items (
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (booking_id, inventory_item_id)
);

CREATE INDEX inventory_items_category_status_idx ON inventory_items (category, status);
CREATE INDEX booking_items_inventory_item_id_idx ON booking_items (inventory_item_id);
CREATE INDEX bookings_active_range_idx ON bookings (status, start_date, end_date);

CREATE OR REPLACE FUNCTION prevent_overlapping_booking_items()
RETURNS trigger AS $$
DECLARE
  incoming_booking bookings%ROWTYPE;
BEGIN
  SELECT * INTO incoming_booking
  FROM bookings
  WHERE id = NEW.booking_id;

  IF incoming_booking.status NOT IN ('RESERVED', 'PICKING', 'OUT_ON_HIRE') THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM booking_items existing_item
    JOIN bookings existing_booking ON existing_booking.id = existing_item.booking_id
    WHERE existing_item.inventory_item_id = NEW.inventory_item_id
      AND existing_item.booking_id <> NEW.booking_id
      AND existing_booking.status IN ('RESERVED', 'PICKING', 'OUT_ON_HIRE')
      AND incoming_booking.start_date <= existing_booking.end_date
      AND existing_booking.start_date <= incoming_booking.end_date
  ) THEN
    RAISE EXCEPTION 'Inventory item % is already booked for overlapping dates', NEW.inventory_item_id
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_items_no_overlap
BEFORE INSERT OR UPDATE ON booking_items
FOR EACH ROW
EXECUTE FUNCTION prevent_overlapping_booking_items();
