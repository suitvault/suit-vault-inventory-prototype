"use client";

import { FormEvent, useMemo, useState } from "react";
import { inventoryCategories, inventoryStatuses } from "@/lib/types";
import { centsToDollars, dollarsToCents, validateInventoryItemForm } from "@/lib/inventory-validation";
import { formatEnumLabel } from "@/lib/formatting";
import type { InventoryCategory, InventoryItem, InventoryItemFormValues, InventoryStatus } from "@/lib/types";

type InventoryItemFormProps = {
  existingItems: InventoryItem[];
  initialItem?: InventoryItem;
  submitLabel: string;
  onSubmit: (values: InventoryItemFormValues) => void;
};

function buildInitialValues(item?: InventoryItem): InventoryItemFormValues {
  return {
    brand: item?.brand ?? "",
    styleName: item?.styleName ?? "",
    category: item?.category ?? "JACKETS",
    colour: item?.colour ?? "",
    size: item?.size ?? "",
    barcode: item?.barcode ?? "",
    rackLocation: item?.rackLocation ?? "",
    condition: item?.condition ?? "",
    status: item?.status ?? "AVAILABLE",
    purchaseCostCents: item?.purchaseCostCents ?? 0,
    replacementCostCents: item?.replacementCostCents ?? 0,
    notes: item?.notes ?? ""
  };
}

export function InventoryItemForm({ existingItems, initialItem, submitLabel, onSubmit }: InventoryItemFormProps) {
  const initialValues = useMemo(() => buildInitialValues(initialItem), [initialItem]);
  const [values, setValues] = useState(initialValues);
  const [purchaseCost, setPurchaseCost] = useState(centsToDollars(initialValues.purchaseCostCents));
  const [replacementCost, setReplacementCost] = useState(centsToDollars(initialValues.replacementCostCents));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField<K extends keyof InventoryItemFormValues>(field: K, value: InventoryItemFormValues[K]) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValues: InventoryItemFormValues = {
      ...values,
      brand: values.brand.trim(),
      styleName: values.styleName.trim(),
      colour: values.colour.trim(),
      size: values.size.trim(),
      barcode: values.barcode.trim(),
      rackLocation: values.rackLocation.trim(),
      condition: values.condition.trim(),
      purchaseCostCents: dollarsToCents(purchaseCost),
      replacementCostCents: dollarsToCents(replacementCost),
      notes: values.notes.trim()
    };

    const validation = validateInventoryItemForm(nextValues, existingItems, initialItem?.id);
    setErrors(validation.errors);

    if (!validation.valid) {
      return;
    }

    onSubmit(nextValues);
  }

  return (
    <form className="form-grid wide-form" onSubmit={handleSubmit}>
      <label>
        Brand
        <input value={values.brand} onChange={(event) => updateField("brand", event.target.value)} />
        {errors.brand ? <span className="field-error">{errors.brand}</span> : null}
      </label>

      <label>
        Style Name
        <input value={values.styleName} onChange={(event) => updateField("styleName", event.target.value)} />
        {errors.styleName ? <span className="field-error">{errors.styleName}</span> : null}
      </label>

      <label>
        Category
        <select value={values.category} onChange={(event) => updateField("category", event.target.value as InventoryCategory)}>
          {inventoryCategories.map((category) => (
            <option key={category} value={category}>
              {formatEnumLabel(category)}
            </option>
          ))}
        </select>
        {errors.category ? <span className="field-error">{errors.category}</span> : null}
      </label>

      <label>
        Colour
        <input value={values.colour} onChange={(event) => updateField("colour", event.target.value)} />
        {errors.colour ? <span className="field-error">{errors.colour}</span> : null}
      </label>

      <label>
        Size
        <input value={values.size} onChange={(event) => updateField("size", event.target.value)} />
        {errors.size ? <span className="field-error">{errors.size}</span> : null}
      </label>

      <label>
        Barcode
        <input value={values.barcode} onChange={(event) => updateField("barcode", event.target.value)} />
        {errors.barcode ? <span className="field-error">{errors.barcode}</span> : null}
      </label>

      <label>
        Rack Location
        <input value={values.rackLocation} onChange={(event) => updateField("rackLocation", event.target.value)} />
        {errors.rackLocation ? <span className="field-error">{errors.rackLocation}</span> : null}
      </label>

      <label>
        Condition
        <input value={values.condition} onChange={(event) => updateField("condition", event.target.value)} />
        {errors.condition ? <span className="field-error">{errors.condition}</span> : null}
      </label>

      <label>
        Status
        <select value={values.status} onChange={(event) => updateField("status", event.target.value as InventoryStatus)}>
          {inventoryStatuses.map((status) => (
            <option key={status} value={status}>
              {formatEnumLabel(status)}
            </option>
          ))}
        </select>
        {errors.status ? <span className="field-error">{errors.status}</span> : null}
      </label>

      <label>
        Purchase Cost
        <input value={purchaseCost} onChange={(event) => setPurchaseCost(event.target.value)} inputMode="decimal" />
        {errors.purchaseCostCents ? <span className="field-error">{errors.purchaseCostCents}</span> : null}
      </label>

      <label>
        Replacement Cost
        <input value={replacementCost} onChange={(event) => setReplacementCost(event.target.value)} inputMode="decimal" />
        {errors.replacementCostCents ? <span className="field-error">{errors.replacementCostCents}</span> : null}
      </label>

      <label>
        Notes
        <textarea value={values.notes} onChange={(event) => updateField("notes", event.target.value)} rows={4} />
        {errors.notes ? <span className="field-error">{errors.notes}</span> : null}
      </label>

      <div className="actions">
        <button className="button" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
