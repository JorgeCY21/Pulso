# Contrato HTTP externo

Base: https://api.coingecko.com/api/v3. Solo GET. Sin clave embebida.

| Recurso | Parámetros permitidos | Respuesta mínima |
|---|---|---|
| `/coins/markets` | vs_currency=usd, order=market_cap_desc, per_page=50, page=1, sparkline=true, price_change_percentage=7d; opcional ids | array de Coin con ID, nombre y símbolo |
| `/search` | query codificada | `{ coins: [{id,name,symbol,thumb,market_cap_rank}] }` |
| `/coins/{id}/market_chart` | vs_currency=usd, days=1/7/30/90 | `{prices:[[ms,usd]],total_volumes:[[ms,usd]]}` |

Timeout 12 s. 429: informar límite y reintento manual. 401/403: informar restricción de acceso. HTTP distinto de 2xx, JSON inválido o estructura incorrecta: error visible. Resultado tardío: descartar por secuencia. Caché limitada por TTL; al fallar puede ofrecer datos previos con etiqueta de captura y su fecha.
