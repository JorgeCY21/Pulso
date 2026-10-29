import { writeFile } from "node:fs/promises";
const base = "https://api.coingecko.com/api/v3";
const capture = {
  capturedAt: new Date().toISOString(),
  source: base,
  markets: [],
  histories: {},
};
const get = async (path) => {
  const r = await fetch(base + path, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};
capture.markets = await get(
  "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=7d",
);
await writeFile("dist/snapshot.json", JSON.stringify(capture));
for (const days of [1, 7, 30, 90]) {
  try {
    capture.histories[`bitcoin:${days}`] = await get(
      `/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`,
    );
    console.log(
      `bitcoin ${days} días: ${capture.histories[`bitcoin:${days}`].prices.length} muestras`,
    );
  } catch (e) {
    console.log(`Histórico ${days} no disponible: ${e.message}`);
  }
  await writeFile("dist/snapshot.json", JSON.stringify(capture));
}
console.log(
  `Captura real: ${capture.markets.length} activos, ${capture.capturedAt}`,
);
