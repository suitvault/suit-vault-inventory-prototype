import type { InventoryItem, InventoryItemFormValues } from "./types.ts";

export type InventoryValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

const requiredFields: Array<keyof InventoryItemFormValues> = [
  "brand",
  "styleName",
  "category",
  "colour",
  "size",
  "barcode",
  "rackLocation",
  "condition",
  "status",
  "purchaseCostCents",
  "replacementCostCents"
];

export function validateInventoryItemForm(
  values: InventoryItemFormValues,
  existingItems: InventoryItem[],
  ignoreItemId?: string
): InventoryValidationResult {
  const errors: Record<string, string> = {};

  for (const field of requiredFields) {
    const value = values[field];
    if (typeof value === "string" && value.trim() === "") {
      errors[field] = "Required";
    }

    if (typeof value === "number" && !Number.isFinite(value)) {
      errors[field] = "Required";
    }
  }

  if (values.purchaseCostCents < 0) {
    errors.purchaseCostCents = "Must be 0 or greater";
  }

  if (values.replacementCostCents < 0) {
    errors.replacementCostCents = "Must be 0 or greater";
  }

  const normalisedBarcode = values.barcode.trim().toLowerCase();
  const duplicateBarcode = existingItems.some(
    (item) => item.id !== ignoreItemId && item.barcode.trim().toLowerCase() === normalisedBarcode
  );

  if (duplicateBarcode) {
    errors.barcode = "Barcode must be unique";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function dollarsToCents(value: string): number {
  const numericValue = Number.parseFloat(value);
  if (!Number.isFinite(numericValue)) {
    return Number.NaN;
  }

  return Math.round(numericValue * 100);
}

export function centsToDollars(value: number): string {
  return (value / 100).toFixed(2);
}
