import { sampleInventoryItems } from "@/lib/seed-data";

export default function Home() {
  const categories = new Map<string, number>();

  for (const item of sampleInventoryItems) {
    categories.set(item.category, (categories.get(item.category) ?? 0) + 1);
  }

  return (
    <main>
      <h1>Suit Vault Inventory Prototype</h1>
      <p>Backend inventory and booking logic scaffold. UI polish is intentionally out of scope for this slice.</p>
      <h2>Seed Inventory</h2>
      <ul>
        {[...categories.entries()].map(([category, count]) => (
          <li key={category}>
            {category}: {count}
          </li>
        ))}
      </ul>
    </main>
  );
}
