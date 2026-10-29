export const RANGES = Object.freeze({
  1: "24 h",
  7: "7 d",
  30: "30 d",
  90: "90 d",
});
export const money = (value) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: value < 1 ? 4 : 2,
        maximumFractionDigits: value < 1 ? 6 : 2,
      }).format(value)
    : "—";
export const compact = (value) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(value)
    : "—";
export const pct = (value) =>
  Number.isFinite(value) ? `${value >= 0 ? "+" : ""}${value.toFixed(2)}%` : "—";
export function cleanSeries(series) {
  return Array.isArray(series)
    ? series
        .filter(
          (p) =>
            Array.isArray(p) &&
            Number.isFinite(p[0]) &&
            Number.isFinite(p[1]) &&
            p[0] > 0 &&
            p[1] >= 0,
        )
        .sort((a, b) => a[0] - b[0])
    : [];
}
export function stats(series) {
  const points = cleanSeries(series),
    values = points.map((p) => p[1]);
  if (!points.length) return { min: null, max: null, change: null };
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    change: values[0] ? (values.at(-1) / values[0] - 1) * 100 : null,
  };
}
export function filterCoins(coins, query) {
  const q = query.trim().toLocaleLowerCase();
  return coins.filter(
    (c) =>
      c.name.toLocaleLowerCase().includes(q) ||
      c.symbol.toLocaleLowerCase().includes(q),
  );
}
export function loadFavorites(storage) {
  try {
    const v = JSON.parse(storage.getItem("pulso:favorites:v1"));
    return new Set(
      Array.isArray(v) ? v.filter((x) => typeof x === "string") : [],
    );
  } catch {
    return new Set();
  }
}
export function saveFavorites(storage, favorites) {
  try {
    storage.setItem("pulso:favorites:v1", JSON.stringify([...favorites]));
    return true;
  } catch {
    return false;
  }
}
export class MarketAPI {
  constructor(
    fetcher = globalThis.fetch.bind(globalThis),
    now = Date.now,
    timeout = 12000,
  ) {
    this.fetcher = fetcher;
    this.now = now;
    this.timeout = timeout;
    this.cache = new Map();
    this.inflight = new Map();
    this.blockedUntil = 0;
  }
  async get(path, ttl = 60000, force = false) {
    const cached = this.cache.get(path);
    if (!force && cached && this.now() - cached.storedAt < ttl) return cached;
    if (this.inflight.has(path)) return this.inflight.get(path);
    if (this.now() < this.blockedUntil)
      throw new Error(
        "CoinGecko limitó las consultas. Espera un minuto y vuelve a actualizar.",
      );
    const task = (async () => {
      const controller = new AbortController(),
        timer = setTimeout(() => controller.abort(), this.timeout);
      try {
        const response = await this.fetcher(
          `https://api.coingecko.com/api/v3${path}`,
          {
            signal: controller.signal,
            headers: { accept: "application/json" },
          },
        );
        if (response.status === 429) {
          this.blockedUntil = this.now() + 60000;
          throw new Error(
            "CoinGecko limitó las consultas. Espera un minuto y vuelve a actualizar.",
          );
        }
        if ([401, 403].includes(response.status))
          throw new Error(
            "CoinGecko restringió el acceso público. Reintenta más tarde; puede requerir una clave mediante un servidor.",
          );
        if (!response.ok)
          throw new Error(
            `CoinGecko respondió con error ${response.status}. Reintenta más tarde.`,
          );
        const data = await response.json();
        if (
          path.startsWith("/coins/markets") &&
          (!Array.isArray(data) ||
            data.some(
              (c) =>
                !c.id ||
                typeof c.name !== "string" ||
                typeof c.symbol !== "string",
            ))
        )
          throw new Error("CoinGecko devolvió un mercado inválido.");
        if (
          path.includes("/market_chart") &&
          (!Array.isArray(data.prices) || !Array.isArray(data.total_volumes))
        )
          throw new Error("CoinGecko devolvió un histórico inválido.");
        if (path.startsWith("/search") && !Array.isArray(data.coins))
          throw new Error("CoinGecko devolvió una búsqueda inválida.");
        const entry = { data, storedAt: this.now() };
        this.cache.set(path, entry);
        return entry;
      } catch (error) {
        if (error.name === "AbortError")
          throw new Error(
            "La consulta tardó demasiado. Revisa la conexión y reintenta.",
          );
        if (error instanceof TypeError)
          throw new Error(
            "No se pudo conectar con CoinGecko. Revisa la conexión y reintenta.",
          );
        if (error instanceof SyntaxError)
          throw new Error(
            "CoinGecko devolvió una respuesta que no se pudo leer. Reintenta más tarde.",
          );
        throw error;
      } finally {
        clearTimeout(timer);
        this.inflight.delete(path);
      }
    })();
    this.inflight.set(path, task);
    return task;
  }
  markets(ids = "", force = false) {
    return this.get(
      `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=7d${ids ? `&ids=${encodeURIComponent(ids)}` : ""}`,
      60000,
      force,
    );
  }
  history(id, days, force = false) {
    if (!Object.hasOwn(RANGES, String(days)))
      return Promise.reject(new Error("Temporalidad no válida."));
    return this.get(
      `/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`,
      300000,
      force,
    );
  }
  search(query) {
    return this.get(`/search?query=${encodeURIComponent(query)}`, 300000);
  }
}
