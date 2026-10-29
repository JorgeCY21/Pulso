import {
  MarketAPI,
  RANGES,
  money,
  compact,
  pct,
  cleanSeries,
  stats,
  filterCoins,
  loadFavorites,
  saveFavorites,
} from "./core.js";
const $ = (id) => document.getElementById(id),
  api = new MarketAPI();
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = {
    getItem: () => null,
    setItem: () => {
      throw Error();
    },
  };
}
const state = {
  coins: [],
  selected: null,
  days: "7",
  metric: "prices",
  favorites: loadFavorites(storage),
  tab: "all",
  query: "",
  sort: "cap",
  history: null,
  historySource: "",
  historyTime: null,
  historySeq: 0,
  selectSeq: 0,
  searchSeq: 0,
  remote: [],
  searchState: "",
  snapshot: null,
  marketTime: null,
  marketCapture: false,
};
const sign = (value) =>
  Number.isFinite(value) ? (value >= 0 ? "up" : "down") : "";
const dateTime = (value) =>
  new Date(value).toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
function toast(message) {
  $("toast").textContent = message;
  $("toast").hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ($("toast").hidden = true), 3500);
}
function notice(message) {
  $("notice").textContent = message;
  $("notice").hidden = !message;
}
function sourceStatus() {
  const c = state.marketCapture;
  $("data-status").classList.toggle("is-capture", c);
  $("data-status").textContent = state.marketTime
    ? `${c ? "Captura guardada" : "Consulta a CoinGecko"} · ${dateTime(state.marketTime)} · Precio de mercado, sin streaming`
    : "Conectando con CoinGecko…";
}
function favorite(id) {
  state.favorites.has(id)
    ? state.favorites.delete(id)
    : state.favorites.add(id);
  if (!saveFavorites(storage, state.favorites))
    toast(
      "El navegador no permite guardar favoritos. Se conservarán en esta sesión.",
    );
  else
    toast(
      state.favorites.has(id)
        ? "Activo añadido a favoritos"
        : "Activo eliminado de favoritos",
    );
  renderFavorites();
  renderTable();
}
function renderFavorites() {
  const count = state.favorites.size;
  $("fav-count").textContent = count;
  $("tab-fav-count").textContent = count;
  const on = state.selected && state.favorites.has(state.selected.id);
  $("selected-favorite").textContent = on ? "★" : "☆";
  $("selected-favorite").setAttribute("aria-pressed", String(Boolean(on)));
  $("selected-favorite").setAttribute(
    "aria-label",
    `${on ? "Quitar" : "Añadir"} ${state.selected?.name || "activo"} ${on ? "de" : "a"} favoritos`,
  );
}
function overview() {
  const sum = (key) =>
      state.coins.reduce(
        (a, c) => a + (Number.isFinite(c[key]) ? c[key] : 0),
        0,
      ),
    cap = sum("market_cap"),
    btc = state.coins.find((c) => c.id === "bitcoin");
  $("market-cap").textContent = "$" + compact(cap);
  $("market-volume").textContent = "$" + compact(sum("total_volume"));
  $("btc-dominance").textContent =
    btc && cap ? `${((btc.market_cap / cap) * 100).toFixed(1)}%` : "—";
  const up = state.coins.filter(
      (c) =>
        Number.isFinite(c.price_change_percentage_24h) &&
        c.price_change_percentage_24h >= 0,
    ).length,
    down = state.coins.filter((c) => c.price_change_percentage_24h < 0).length;
  $("market-balance").innerHTML =
    `<span class="up">${up} ↗</span> <span style="color:#c7d0d4;font-weight:400">/</span> <span class="down">${down} ↘</span>`;
  $("balance-fill").style.width =
    `${up + down ? (up / (up + down)) * 100 : 50}%`;
}
function miniChart(coin) {
  const raw = coin.sparkline_in_7d?.price?.filter(Number.isFinite) || [];
  if (raw.length < 2) return '<span class="muted">Sin histórico</span>';
  const min = Math.min(...raw),
    max = Math.max(...raw),
    span = max - min || 1;
  const points = raw
    .map(
      (v, i) =>
        `${((i / (raw.length - 1)) * 88).toFixed(1)},${(25 - ((v - min) / span) * 22).toFixed(1)}`,
    )
    .join(" ");
  return `<svg class="spark" viewBox="0 0 88 29" role="img" aria-label="Tendencia de precio en 7 días"><polyline points="${points}" fill="none" stroke="${raw.at(-1) >= raw[0] ? "#32a287" : "#d37889"}" stroke-width="1.5"/></svg>`;
}
function renderTable() {
  let coins = filterCoins(state.coins, state.query);
  if (!coins.length && state.query) coins = state.remote;
  if (state.tab === "favorites")
    coins = coins.filter((c) => state.favorites.has(c.id));
  coins = [...coins].sort((a, b) => {
    if (state.sort === "price")
      return (b.current_price ?? -Infinity) - (a.current_price ?? -Infinity);
    if (state.sort === "gain")
      return (
        (b.price_change_percentage_24h ?? -Infinity) -
        (a.price_change_percentage_24h ?? -Infinity)
      );
    if (state.sort === "loss")
      return (
        (a.price_change_percentage_24h ?? Infinity) -
        (b.price_change_percentage_24h ?? Infinity)
      );
    return (b.market_cap ?? -Infinity) - (a.market_cap ?? -Infinity);
  });
  $("coin-count").textContent = coins.length;
  $("market-body").innerHTML = coins.length
    ? coins
        .map(
          (c) =>
            `<tr class="${state.selected?.id === c.id ? "selected" : ""}"><td><button class="table-star" data-favorite="${esc(c.id)}" aria-label="${state.favorites.has(c.id) ? "Quitar" : "Añadir"} ${esc(c.name)} ${state.favorites.has(c.id) ? "de" : "a"} favoritos" aria-pressed="${state.favorites.has(c.id)}">${state.favorites.has(c.id) ? "★" : "☆"}</button></td><td class="rank-cell">${c.market_cap_rank ?? "—"}</td><td><button class="asset-select" data-select="${esc(c.id)}"><img src="${esc(c.image || c.thumb || "")}" alt="" loading="lazy"><span><strong>${esc(c.name)}</strong><small>${esc(c.symbol.toUpperCase())}</small></span></button></td><td class="number">${money(c.current_price)}</td><td class="number ${sign(c.price_change_percentage_24h)}">${pct(c.price_change_percentage_24h)}</td><td class="number secondary-col">${Number.isFinite(c.total_volume) ? "$" + compact(c.total_volume) : "—"}</td><td class="number secondary-col">${Number.isFinite(c.market_cap) ? "$" + compact(c.market_cap) : "—"}</td><td class="spark-col">${miniChart(c)}</td><td><button class="row-open" data-select="${esc(c.id)}" aria-label="Analizar ${esc(c.name)}">↗</button></td></tr>`,
        )
        .join("")
    : `<tr><td colspan="9" class="table-empty">${emptyMessage()}</td></tr>`;
  $("table-caption").textContent = state.query
    ? `${coins.length} resultado${coins.length === 1 ? "" : "s"} · USD`
    : `${coins.length} activos · Precios expresados en USD`;
}
function emptyMessage() {
  if (/^(aapl|msft|tsla|amzn|googl|nvda)$/i.test(state.query.trim()))
    return "Ese símbolo corresponde a una acción bursátil. Este rastreador consulta criptomonedas de CoinGecko.";
  if (state.tab === "favorites")
    return "Tu lista empieza con una estrella. Marca ☆ junto a una criptomoneda para seguirla aquí.";
  if (state.searchState === "loading") return "Buscando en CoinGecko…";
  if (state.searchState.startsWith("error:"))
    return esc(state.searchState.slice(6));
  return state.query
    ? "No encontramos esa criptomoneda. Prueba con su nombre o símbolo."
    : "No hay datos de mercado disponibles. Pulsa Actualizar para reintentar.";
}
function renderAsset() {
  const c = state.selected;
  if (!c) return;
  $("coin-name").textContent = c.name;
  $("coin-symbol").textContent = c.symbol.toUpperCase();
  $("coin-rank").textContent = c.market_cap_rank
    ? `#${c.market_cap_rank}`
    : "—";
  $("coin-icon").outerHTML =
    `<img id="coin-icon" src="${esc(c.image || c.thumb || "")}" alt="">`;
  $("coin-price").textContent = money(c.current_price);
  $("coin-change").textContent = pct(c.price_change_percentage_24h);
  $("coin-change").className = `change ${sign(c.price_change_percentage_24h)}`;
  $("asset-cap").textContent = Number.isFinite(c.market_cap)
    ? "$" + compact(c.market_cap)
    : "—";
  $("asset-volume").textContent = Number.isFinite(c.total_volume)
    ? "$" + compact(c.total_volume)
    : "—";
  $("asset-high").textContent = money(c.high_24h);
  $("asset-low").textContent = money(c.low_24h);
  $("coin-link").href =
    `https://www.coingecko.com/en/coins/${encodeURIComponent(c.id)}`;
  renderFavorites();
}
function resetPeriod() {
  for (const id of ["period-change", "period-min", "period-max"])
    $(id).textContent = "—";
  $("period-change").className = "period-change";
  $("period-label").textContent =
    state.days === "1" ? "24 horas" : `${state.days} días`;
}
async function loadHistory(force = false) {
  const seq = ++state.historySeq;
  state.history = null;
  resetPeriod();
  $("chart-container").setAttribute("aria-busy", "true");
  $("chart-container").innerHTML =
    '<div class="chart-empty">Consultando histórico…</div>';
  $("chart-status").textContent = "Consultando CoinGecko…";
  if (!state.selected) return;
  const id = state.selected.id,
    days = state.days;
  try {
    const r = await api.history(id, days, force);
    if (seq !== state.historySeq) return;
    state.history = r.data;
    state.historySource = "CoinGecko";
    state.historyTime = r.storedAt;
  } catch (error) {
    if (seq !== state.historySeq) return;
    const cache = api.cache.get(
        `/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`,
      ),
      snapshot = state.snapshot?.histories?.[`${id}:${days}`];
    if (cache || snapshot) {
      state.history = cache?.data || snapshot;
      state.historySource = "Captura";
      state.historyTime = cache?.storedAt || state.snapshot.capturedAt;
      state.historyError = error.message;
    } else {
      state.historyError = error.message;
    }
  } finally {
    if (seq === state.historySeq) {
      $("chart-container").setAttribute("aria-busy", "false");
      renderChart();
    }
  }
}
function renderChart() {
  resetPeriod();
  const priceStats = stats(state.history?.prices);
  $("period-change").textContent = pct(priceStats.change);
  $("period-change").className = `period-change ${sign(priceStats.change)}`;
  $("period-min").textContent = money(priceStats.min);
  $("period-max").textContent = money(priceStats.max);
  $("chart-legend").textContent =
    state.metric === "prices" ? "Precio · USD" : "Volumen móvil 24 h · USD";
  const points = cleanSeries(state.history?.[state.metric]);
  if (points.length < 2) {
    $("chart-container").innerHTML =
      `<div class="chart-empty">${esc(state.historyError || "No hay suficientes muestras para este período.")}<button id="retry-chart">Reintentar histórico</button></div>`;
    $("chart-status").textContent = "Histórico no disponible";
    return;
  }
  const w = 780,
    h = 240,
    left = 5,
    right = 73,
    top = 16,
    bottom = 29,
    plotW = w - left - right,
    plotH = h - top - bottom;
  let min = Math.min(...points.map((p) => p[1])),
    max = Math.max(...points.map((p) => p[1]));
  const pad = (max - min) * 0.15 || max * 0.03 || 1;
  min = Math.max(0, min - pad);
  max += pad;
  const first = points[0][0],
    last = points.at(-1)[0],
    x = (t) => left + ((t - first) / (last - first || 1)) * plotW,
    y = (v) => top + ((max - v) / (max - min)) * plotH;
  const line = points
    .map(
      (p, i) => `${i ? "L" : "M"}${x(p[0]).toFixed(2)} ${y(p[1]).toFixed(2)}`,
    )
    .join(" ");
  let grid = "",
    labels = "";
  for (let i = 0; i <= 4; i++) {
    const yy = top + (i / 4) * plotH,
      value = max - (i / 4) * (max - min);
    grid += `<line x1="${left}" x2="${w - right + 4}" y1="${yy}" y2="${yy}" stroke="#edf1f2" stroke-dasharray="3 4"/><text x="${w - right + 16}" y="${yy + 3}" fill="#85949c" font-size="9">${value >= 1000 ? compact(value) : value.toFixed(value < 1 ? 4 : 2)}</text>`;
  }
  for (let i = 0; i <= 5; i++) {
    const ts = first + ((last - first) * i) / 5,
      label = new Date(ts).toLocaleString(
        "es-CO",
        state.days === "1"
          ? { hour: "2-digit", minute: "2-digit" }
          : { day: "2-digit", month: "short" },
      );
    labels += `<text x="${left + (i / 5) * plotW}" y="${h - 6}" text-anchor="${i === 0 ? "start" : i === 5 ? "end" : "middle"}" fill="#85949c" font-size="9">${esc(label)}</text>`;
  }
  $("chart-container").innerHTML =
    `<svg id="main-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" tabindex="0" aria-label="Gráfico de ${state.metric === "prices" ? "precio" : "volumen móvil de 24 horas"} de ${esc(state.selected.name)} durante ${RANGES[state.days]}. Usa flechas izquierda y derecha para explorar valores."><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#159b87" stop-opacity=".17"/><stop offset="100%" stop-color="#159b87" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${line} L${x(last)} ${h - bottom} L${left} ${h - bottom} Z" fill="url(#chart-fill)"/><path d="${line}" fill="none" stroke="#128c7b" stroke-width="2.1" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>${labels}<circle cx="${x(last)}" cy="${y(points.at(-1)[1])}" r="3.5" fill="#128c7b" stroke="white" stroke-width="2"/><line id="crosshair" y1="${top}" y2="${h - bottom}" stroke="#8bbfb5" stroke-dasharray="4 3" visibility="hidden"/><circle id="chart-dot" r="4" fill="#087f72" stroke="white" stroke-width="2" visibility="hidden"/></svg><div class="chart-tooltip" id="chart-tooltip" hidden></div>`;
  const svg = $("main-chart"),
    tip = $("chart-tooltip");
  let index = points.length - 1;
  function show(i) {
    index = Math.max(0, Math.min(points.length - 1, i));
    const p = points[index],
      xx = x(p[0]);
    tip.hidden = false;
    tip.innerHTML = `<small>${esc(dateTime(p[0]))}</small><strong>${money(p[1])}</strong>`;
    tip.style.left = `${Math.min(Math.max(0, (xx / w) * svg.clientWidth - 65), Math.max(0, svg.clientWidth - 155))}px`;
    $("crosshair").setAttribute("x1", xx);
    $("crosshair").setAttribute("x2", xx);
    $("crosshair").setAttribute("visibility", "visible");
    $("chart-dot").setAttribute("cx", xx);
    $("chart-dot").setAttribute("cy", y(p[1]));
    $("chart-dot").setAttribute("visibility", "visible");
    svg.setAttribute(
      "aria-label",
      `${state.selected.name}, ${dateTime(p[0])}: ${money(p[1])}. Usa las flechas para explorar.`,
    );
  }
  svg.addEventListener("pointermove", (e) => {
    const ratio = Math.max(
        0,
        Math.min(
          1,
          (((e.clientX - svg.getBoundingClientRect().left) / svg.clientWidth) *
            w -
            left) /
            plotW,
        ),
      ),
      target = first + (last - first) * ratio;
    let nearest = 0;
    for (let i = 1; i < points.length; i++)
      if (
        Math.abs(points[i][0] - target) < Math.abs(points[nearest][0] - target)
      )
        nearest = i;
    show(nearest);
  });
  svg.addEventListener("pointerleave", () => {
    tip.hidden = true;
    $("crosshair").setAttribute("visibility", "hidden");
    $("chart-dot").setAttribute("visibility", "hidden");
  });
  svg.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      show(
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? points.length - 1
            : index + (e.key === "ArrowRight" ? 1 : -1),
      );
    }
  });
  svg.addEventListener("focus", () => show(index));
  svg.addEventListener("blur", () => {
    tip.hidden = true;
  });
  $("chart-status").textContent =
    `${state.historySource} · ${dateTime(state.historyTime)} · ${points.length.toLocaleString("es-CO")} muestras${state.historySource === "Captura" ? " · sin conexión al histórico actual" : ""}`;
}
async function selectCoin(id) {
  const seq = ++state.selectSeq;
  let c = state.coins.find((c) => c.id === id);
  state.selected = c || state.remote.find((c) => c.id === id);
  renderAsset();
  renderTable();
  if (!c) {
    ++state.historySeq;
    state.history = null;
    resetPeriod();
    $("chart-container").innerHTML =
      '<div class="chart-empty">Cargando activo…</div>';
    try {
      const r = await api.markets(id);
      if (seq !== state.selectSeq) return;
      if (!r.data.length)
        throw Error("No hay datos de mercado para este activo.");
      c = r.data[0];
      state.coins.push(c);
      state.selected = c;
      renderAsset();
      renderTable();
    } catch (error) {
      if (seq !== state.selectSeq) return;
      notice(error.message);
      $("chart-container").innerHTML =
        '<div class="chart-empty">No se pudo cargar este activo. Reintenta seleccionándolo.</div>';
      return;
    }
  }
  if (seq !== state.selectSeq) return;
  await loadHistory();
}
async function refresh(force = false) {
  $("refresh").disabled = true;
  notice("");
  try {
    const r = await api.markets("", force);
    state.coins = r.data;
    state.marketTime = r.storedAt;
    state.marketCapture = false;
    const missing = [...state.favorites].filter(
      (id) => !state.coins.some((c) => c.id === id),
    );
    if (state.selected && !state.coins.some((c) => c.id === state.selected.id))
      missing.push(state.selected.id);
    if (missing.length) {
      try {
        const extra = await api.markets([...new Set(missing)].join(","));
        state.coins.push(...extra.data);
      } catch (error) {
        notice(
          "El mercado se cargó, pero algunos favoritos no están disponibles. " +
            error.message,
        );
      }
    }
  } catch (error) {
    notice(error.message);
    if (!state.coins.length && state.snapshot?.markets?.length) {
      state.coins = state.snapshot.markets;
      state.marketTime = state.snapshot.capturedAt;
      state.marketCapture = true;
    } else if (state.coins.length) {
      state.marketCapture = true;
    }
  } finally {
    sourceStatus();
    overview();
    renderTable();
    $("refresh").disabled = false;
    const c =
      state.coins.find((c) => c.id === (state.selected?.id || "bitcoin")) ||
      state.coins[0];
    if (c) {
      state.selected = c;
      renderAsset();
      await loadHistory(force);
    } else {
      $("chart-container").setAttribute("aria-busy", "false");
      $("chart-container").innerHTML =
        '<div class="chart-empty">Sin datos. Pulsa Actualizar para reintentar.</div>';
    }
  }
}
function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll("[data-tab]").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
    b.setAttribute("aria-pressed", String(b.dataset.tab === tab));
  });
  document
    .querySelectorAll("[data-view]")
    .forEach((b) => b.classList.toggle("active", b.dataset.view === tab));
  $("breadcrumb-current").textContent =
    tab === "favorites" ? "Mis favoritos" : "Vista general";
  renderTable();
  if (tab === "favorites")
    $("market-title").scrollIntoView({ block: "center", behavior: "instant" });
}
let searchTimer;
$("search").addEventListener("input", () => {
  state.query = $("search").value;
  state.remote = [];
  state.searchState = "";
  const seq = ++state.searchSeq;
  clearTimeout(searchTimer);
  renderTable();
  if (
    state.query.trim().length < 2 ||
    filterCoins(state.coins, state.query).length ||
    /^(aapl|msft|tsla|amzn|googl|nvda)$/i.test(state.query.trim())
  )
    return;
  state.searchState = "loading";
  renderTable();
  searchTimer = setTimeout(async () => {
    try {
      const r = await api.search(state.query.trim());
      if (seq !== state.searchSeq) return;
      state.remote = r.data.coins.slice(0, 12);
      state.searchState = "done";
    } catch (error) {
      if (seq !== state.searchSeq) return;
      state.searchState = "error:" + error.message;
    }
    renderTable();
  }, 500);
});
$("market-body").addEventListener("click", (e) => {
  const f = e.target.closest("[data-favorite]"),
    s = e.target.closest("[data-select]");
  if (f) favorite(f.dataset.favorite);
  else if (s) selectCoin(s.dataset.select);
});
$("selected-favorite").addEventListener("click", () => {
  if (state.selected) favorite(state.selected.id);
});
document.querySelectorAll("[data-days]").forEach((b) =>
  b.addEventListener("click", () => {
    if (state.days === b.dataset.days) return;
    state.days = b.dataset.days;
    document.querySelectorAll("[data-days]").forEach((c) => {
      c.classList.toggle("active", c === b);
      c.setAttribute("aria-pressed", String(c === b));
    });
    loadHistory();
  }),
);
document.querySelectorAll("[data-metric]").forEach((b) =>
  b.addEventListener("click", () => {
    state.metric = b.dataset.metric;
    document.querySelectorAll("[data-metric]").forEach((c) => {
      c.classList.toggle("active", c === b);
      c.setAttribute("aria-pressed", String(c === b));
    });
    renderChart();
  }),
);
document
  .querySelectorAll("[data-tab],[data-view]")
  .forEach((b) =>
    b.addEventListener("click", () =>
      switchTab(b.dataset.tab || b.dataset.view),
    ),
  );
$("sort").addEventListener("change", () => {
  state.sort = $("sort").value;
  renderTable();
});
$("refresh").addEventListener("click", () => refresh(true));
$("chart-container").addEventListener("click", (e) => {
  if (e.target.id === "retry-chart") loadHistory(true);
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)
  ) {
    e.preventDefault();
    $("search").focus();
  }
});
async function init() {
  renderFavorites();
  try {
    const r = await fetch("snapshot.json");
    if (r.ok) state.snapshot = await r.json();
  } catch {}
  await refresh();
}
init();
