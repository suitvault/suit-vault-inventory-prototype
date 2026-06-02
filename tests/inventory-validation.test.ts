import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateInventoryItemForm } from "../src/lib/inventory-validation.ts";
import { sampleInventoryItems } from "../src/lib/seed-data.ts";
import type { InventoryItemFormValues } from "../src/lib/types.ts";

const validValues: InventoryItemFormValues = {
  brand: "M.J. Bale",
  styleName: "Kingston Slim Jacket",
  category: "JACKETS",
  colour: "Navy",
  size: "40R",
  barcode: "SV-JKT-999",
  rackLocation: "J1-A",
  condition: "Excellent",
  status: "AVAILABLE",
  purchaseCostCents: 24900,
  replacementCostCents: 49900,
  notes: ""
};

describe("inventory item validation", () => {
  it("blocks duplicate barcodes case-insensitively", () => {
    const result = validateInventoryItemForm(
      { ...validValues, barcode: sampleInventoryItems[0].barcode.toLowerCase() },
      sampleInventoryItems
    );

    assert.equal(result.valid, false);
    assert.equal(result.errors.barcode, "Barcode must be unique");
  });

  it("allows the current item barcode while editing that item", () => {
    const existingItem = sampleInventoryItems[0];
    const result = validateInventoryItemForm(
      { ...validValues, barcode: existingItem.barcode },
      sampleInventoryItems,
      existingItem.id
    );

    assert.equal(result.valid, true);
  });

  it("requires core inventory fields but allows blank notes", () => {
    const result = validateInventoryItemForm(
      { ...validValues, brand: "", notes: "" },
      sampleInventoryItems
    );

    assert.equal(result.valid, false);
    assert.equal(result.errors.brand, "Required");
    assert.equal(result.errors.notes, undefined);
  });
});
