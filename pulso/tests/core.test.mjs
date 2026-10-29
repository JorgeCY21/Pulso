import test from "node:test";
import assert from "node:assert/strict";
import {
  RANGES,
  cleanSeries,
  stats,
  filterCoins,
  money,
  pct,
  MarketAPI,
  loadFavorites,
  saveFavorites,
} from "../dist/core.js";
const goodCoin = { id: "bitcoin", name: "Bitcoin", symbol: "btc" };
const response = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});
test("FR-05: rangos 1, 7, 30 y 90 días", () =>
  assert.deepEqual(Object.keys(RANGES), ["1", "7", "30", "90"]));
test("FR-06: normaliza fechas y rechaza muestras inválidas sin mutar", () => {
  const p = [[2, 30], [1, 20], [3, -1], [4, NaN], ["5", 30], null];
  assert.deepEqual(cleanSeries(p), [
    [1, 20],
    [2, 30],
  ]);
  assert.equal(p[0][0], 2);
});
test("FR-06: rendimiento, mínimo y máximo", () => {
  const r = stats([
    [1, 100],
    [2, 80],
    [3, 120],
  ]);
  assert.equal(r.min, 80);
  assert.equal(r.max, 120);
  assert.ok(Math.abs(r.change - 20) < 1e-10);
});
test("FR-06: serie vacía y base cero no producen infinito", () => {
  assert.deepEqual(stats([]), { min: null, max: null, change: null });
  assert.equal(
    stats([
      [1, 0],
      [2, 10],
    ]).change,
    null,
  );
});
test("FR-02: buscar BTC y Bitcoin sin importar mayúsculas", () => {
  const coins = [goodCoin, { id: "ethereum", name: "Ethereum", symbol: "eth" }];
  assert.equal(filterCoins(coins, " BTC ")[0].id, "bitcoin");
  assert.equal(filterCoins(coins, "bItCoIn")[0].id, "bitcoin");
  assert.equal(filterCoins(coins, "zzz").length, 0);
});
test("FR-01: valores ausentes no se convierten en cero", () => {
  assert.equal(money(null), "—");
  assert.equal(money(NaN), "—");
  assert.equal(pct(undefined), "—");
  assert.equal(pct(-1.5), "-1.50%");
  assert.equal(pct(0), "+0.00%");
});
test("FR-09: favoritos persisten por ID", () => {
  let value = null;
  const storage = {
    getItem: () => value,
    setItem: (k, v) => {
      value = v;
    },
  };
  assert.equal(saveFavorites(storage, new Set(["bitcoin", "ethereum"])), true);
  assert.deepEqual([...loadFavorites(storage)], ["bitcoin", "ethereum"]);
});
test("FR-09: almacenamiento corrupto o bloqueado no rompe la página", () => {
  assert.equal(loadFavorites({ getItem: () => "{bad" }).size, 0);
  assert.equal(
    loadFavorites({
      getItem: () => {
        throw Error();
      },
    }).size,
    0,
  );
  assert.equal(
    saveFavorites(
      {
        setItem: () => {
          throw Error();
        },
      },
      new Set(),
    ),
    false,
  );
});
test("FR-05: cada rango produce una URL distinta", async () => {
  const urls = [],
    api = new MarketAPI(async (url) => {
      urls.push(url);
      return response({ prices: [[1, 1]], total_volumes: [] });
    });
  for (const days of Object.keys(RANGES)) await api.history("bitcoin", days);
  assert.equal(urls.length, 4);
  for (const days of Object.keys(RANGES))
    assert.ok(urls.some((u) => u.endsWith(`days=${days}`)));
});
test("FR-05: rechaza temporalidades no permitidas", async () => {
  const api = new MarketAPI(() => {
    throw Error("No debe consultar");
  });
  await assert.rejects(api.history("bitcoin", "999"), /Temporalidad/);
});
test("FR-11: caché evita peticiones y expira según TTL", async () => {
  let time = 0,
    calls = 0;
  const api = new MarketAPI(
    async () => {
      calls++;
      return response([goodCoin]);
    },
    () => time,
  );
  await api.markets();
  await api.markets();
  assert.equal(calls, 1);
  time = 60001;
  await api.markets();
  assert.equal(calls, 2);
});
test("FR-11: actualización manual omite caché", async () => {
  let calls = 0;
  const api = new MarketAPI(async () => {
    calls++;
    return response([goodCoin]);
  });
  await api.markets();
  await api.markets("", true);
  assert.equal(calls, 2);
});
test("FR-11: peticiones simultáneas se deduplican", async () => {
  let calls = 0;
  const api = new MarketAPI(async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 5));
    return response([goodCoin]);
  });
  await Promise.all([api.markets(), api.markets()]);
  assert.equal(calls, 1);
});
test("FR-04: 429 informa límite y evita bucle de reintento", async () => {
  let calls = 0;
  const api = new MarketAPI(async () => {
    calls++;
    return response({}, 429);
  });
  await assert.rejects(api.markets(), /limitó/);
  await assert.rejects(api.history("bitcoin", 7), /limitó/);
  assert.equal(calls, 1);
});
test("FR-04: errores 403 y 500 son explícitos", async () => {
  await assert.rejects(
    new MarketAPI(async () => response({}, 403)).markets(),
    /restringió/,
  );
  await assert.rejects(
    new MarketAPI(async () => response({}, 500)).markets(),
    /500/,
  );
});
test("FR-04: rechaza JSON con contrato de mercado incorrecto", async () => {
  await assert.rejects(
    new MarketAPI(async () => response({ wrong: true })).markets(),
    /inválido/,
  );
});
test("FR-08: rechaza histórico con estructura incorrecta", async () => {
  await assert.rejects(
    new MarketAPI(async () => response({ prices: [] })).history("bitcoin", 7),
    /inválido/,
  );
});
test("FR-02: codifica búsqueda e ID para no alterar ruta", async () => {
  let url;
  const api = new MarketAPI(async (u) => {
    url = u;
    return response({ coins: [] });
  });
  await api.search("a&b /");
  assert.ok(url.endsWith("query=a%26b%20%2F"));
});
test("FR-04: timeout cancela consulta y produce mensaje recuperable", async () => {
  const api = new MarketAPI(
    (url, { signal }) =>
      new Promise((resolve, reject) =>
        signal.addEventListener("abort", () =>
          reject(Object.assign(Error(), { name: "AbortError" })),
        ),
      ),
    Date.now,
    5,
  );
  await assert.rejects(api.markets(), /tardó demasiado/);
});
test("SC-04: captura entregada contiene datos reales y cuatro históricos diferentes", async () => {
  const { readFile } = await import("node:fs/promises");
  const snapshot = JSON.parse(
    await readFile(new URL("../dist/snapshot.json", import.meta.url)),
  );
  assert.ok(snapshot.source.startsWith("https://api.coingecko.com"));
  assert.equal(snapshot.markets.length, 50);
  assert.ok(Date.parse(snapshot.capturedAt) > 0);
  const durations = [];
  for (const days of Object.keys(RANGES)) {
    const p = cleanSeries(snapshot.histories[`bitcoin:${days}`].prices);
    assert.ok(p.length > 1);
    durations.push(p.at(-1)[0] - p[0][0]);
  }
  assert.ok(durations.every((d, i) => !i || d > durations[i - 1]));
});
