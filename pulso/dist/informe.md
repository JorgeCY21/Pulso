# Informe de implementación: Pulso

**Caso práctico grupal: flujo SDD con GitHub Spec Kit**  
**Fecha:** 29 de octubre de 2026 · **Versión del producto:** 1.0.0  
**Herramienta:** GitHub Spec Kit / Specify CLI 1.2.5  
**Fuente de datos:** CoinGecko API · **Moneda:** USD

## 1. Resumen del proyecto

Pulso es una página de consulta del mercado de criptomonedas. Permite buscar un activo por nombre o símbolo, revisar precio, variación porcentual de 24 horas y volumen, y estudiar gráficos en diferentes temporalidades. Incluye favoritos locales, ordenación, minigráficos y un informe integrado.

El trabajo emplea SDD: una especificación con requisitos identificados dirige las decisiones técnicas, las tareas y la verificación. La evidencia combina archivos del proyecto, salidas reales de herramientas, consultas efectivas a CoinGecko y comprobaciones de navegador. No se declaran pruebas simuladas como si fueran disponibilidad real de la API.

## 2. Interpretación y alcance

El enunciado propone «criptomonedas / acciones» y exige CoinGecko. Se seleccionó el rastreador de criptomonedas, con BTC y ETH como casos principales. AAPL identifica una acción bursátil y no debe resolverse arbitrariamente como un token de nombre parecido. Por ello, símbolos bursátiles comunes reciben un mensaje de alcance. Incorporar acciones de bolsa requeriría acordar otro proveedor y una nueva especificación.

Se implementan cuatro rangos: 24 horas, 7, 30 y 90 días. Cada gráfico representa precio en USD o volumen móvil de 24 horas. La variación de 24 horas del mercado y el rendimiento entre la primera y última muestra del gráfico son métricas distintas y se muestran separadas.

No se incluyen compras, ventas, recomendaciones de inversión, cuentas propias, portafolios con saldos ni streaming de cotizaciones.

## 3. Qué es SDD y cómo se aplicó

Spec-Driven Development parte de describir el comportamiento verificable antes de implementar. La especificación es un contrato: explica qué problema se resuelve y permite comprobar el resultado. El plan define cómo resolverlo; las tareas convierten ese plan en trabajo ejecutable.

El flujo de referencia de Spec Kit es constitución → especificación → plan → tareas → implementación → convergencia. La integración actual de Codex instala instrucciones con nombres como `$speckit-specify`; no son comandos de terminal ni un generador automático de toda la aplicación.

| Etapa | Aplicación en Pulso | Evidencia |
|---|---|---|
| Constitución | Cinco principios: trazabilidad, integridad del dato, pruebas, accesibilidad y simplicidad | `.specify/memory/constitution.md` |
| Especificación | Cuatro historias, 13 requisitos FR y cinco condiciones SC | `specs/001-crypto-tracker/spec.md` |
| Aclaración | Criptomonedas frente a bolsa; USD; volumen móvil; rangos | `spec.md`, sección de alcance |
| Investigación | Lectura de documentación primaria y prueba de endpoints | `research.md`, captura real |
| Plan | Sitio estático, cliente API aislado, estados, caché y diseño | `plan.md`, `data-model.md`, `contracts/` |
| Tareas | T001–T012 con relación a historias | `tasks.md` |
| Implementación | HTML/CSS/JS, gráficos SVG y servidor local Node | `dist/`, `scripts/` |
| Verificación | 20 pruebas, sintaxis, revisión visual y consultas reales | `docs/evidence/`, `tests/` |

### Registro honesto de la ejecución

La especificación, investigación, plan y lista inicial de tareas se escribieron antes del código de la aplicación, mientras se instalaba el CLI. La inicialización formal de Spec Kit finalizó después de comenzar la implementación; entonces se incorporaron sus scripts, plantillas y skills oficiales y se formalizó la constitución sobre el scaffold resuelto. Esta ejecución es una aplicación del flujo en una sesión asistida, no una grabación de seis comandos independientes ni evidencia de revisión humana entre etapas. Para una práctica con puertas estrictas, el equipo debe iniciar el scaffold y aprobar la constitución antes de implementar.

No se simula un historial de commits previo ni se atribuyen validaciones a compañeros que no participaron. El equipo puede repetir las etapas con las instrucciones instaladas y revisar cada resultado.

## 4. Uso real de GitHub Spec Kit

Se instaló la distribución oficial `specify-cli==1.2.5` en un entorno virtual de Python 3.12.14. La documentación oficial reconoce PyPI como canal de distribución del proyecto de GitHub.

El lanzador `specify.exe` generado por pip fue bloqueado por Control de aplicaciones de Windows. Se utilizó el mismo punto de entrada Python del paquete instalado; no se cambió la política del equipo. La API de GitHub devolvió un límite de consultas anónimas al consultar la versión más reciente; la instalación por PyPI y las plantillas empaquetadas permitieron completar la inicialización sin depender de esa API.

Comandos efectivamente ejecutados, desde la carpeta del proyecto:

```powershell
../.spec-kit-venv/Scripts/python.exe -m pip install specify-cli
../.spec-kit-venv/Scripts/python.exe -c 'from specify_cli import main; main()' version
../.spec-kit-venv/Scripts/python.exe -c 'from specify_cli import main; main()' init --here --force --non-interactive --integration codex --integration-options=--skills --script ps --ignore-agent-tools
./.specify/scripts/powershell/resolve-template.ps1 constitution-template -Json
./.specify/scripts/powershell/resolve-template.ps1 spec-template -Json
./.specify/scripts/powershell/resolve-template.ps1 plan-template -Json
./.specify/scripts/powershell/resolve-template.ps1 tasks-template -Json
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireSpec -RequireTasks -IncludeTasks
```

El primer comando de instalación se ejecutó desde la carpeta superior al crear el entorno; las rutas anteriores describen el entorno resultante desde el proyecto. Los logs preservan versión, inicialización y verificación de prerrequisitos. `.specify/integration.json` registra integración Codex y versión; `.agents/skills/` contiene las instrucciones oficiales. No se invocó el motor de workflow para una corrida desatendida ni se creó un repositorio en GitHub del usuario.

### Prompts reproducibles para el equipo

Estas son instrucciones sugeridas para repetir el flujo con las skills instaladas; no se presentan como transcripciones de comandos ejecutados:

```text
$speckit-constitution Define principios de trazabilidad, datos verificables,
pruebas reproducibles, accesibilidad y ausencia de claves en el cliente.

$speckit-specify Construye un rastreador de criptomonedas con CoinGecko.
Buscar por nombre o símbolo; mostrar precio USD, cambio 24 h y volumen.
Añadir favoritos y gráficos de 24 h, 7, 30 y 90 días.

$speckit-plan Usa HTML, CSS y módulos JavaScript sin framework.
Aísla API, caché y cálculos. Distingue datos actuales de capturas fechadas.

$speckit-tasks Divide el trabajo por historias, dependencias y verificación.
$speckit-implement Ejecuta las tareas y registra las pruebas reales.
$speckit-converge Revisa el resultado contra spec.md, plan.md y tasks.md.
```

## 5. Arquitectura y decisiones

El navegador carga `index.html`, `styles.css` y el módulo `app.js`. Este último controla el estado y las interacciones y delega en `core.js` las consultas, normalización, formato y cálculos. No se necesita una base de datos: los favoritos se guardan en localStorage y solo contienen IDs de monedas.

```text
Usuario → Interfaz HTML/CSS → app.js → core.js → CoinGecko
                                 ↘ localStorage (favoritos)
                                 ↘ snapshot.json (captura real fechada)
Desarrollo: servidor HTTP Node → archivos de dist/
Publicación: Sites → entrega estática con acceso privado inicial
```

Se eligieron módulos nativos para facilitar la reproducción: `npm start` ejecuta un servidor Node sin dependencias de producción. Los gráficos se dibujan con SVG para conservar control de ejes, tooltip y acceso con teclado sin cargar una biblioteca adicional.

El cliente aplica timeout de 12 segundos, caché de 60 segundos para mercado y 5 minutos para históricos, deduplicación de consultas idénticas y pausa de 60 segundos después de un 429. La búsqueda remota espera 500 ms y descarta resultados obsoletos. El histórico utiliza una secuencia para impedir que una respuesta tardía sustituya el rango o activo más reciente.

La vista usa fondo claro, texto oscuro y verde petróleo para la serie principal; los cambios llevan signo además de color. La barra lateral ofrece mercado, favoritos e informe. En móvil se priorizan gráfico y columnas esenciales, con desplazamiento contenido en la tabla si hace falta.

## 6. Integración con CoinGecko

| Endpoint | Uso | Parámetros relevantes |
|---|---|---|
| `/coins/markets` | Listado y métricas de activos | `vs_currency=usd`, `per_page=50`, `sparkline=true`; `ids` para resultados específicos |
| `/search` | Búsqueda adicional por nombre o símbolo | `query` codificada |
| `/coins/{id}/market_chart` | Series históricas | `vs_currency=usd`, `days=1`, `7`, `30` o `90` |

Se usan identificadores como `bitcoin` y `ethereum`, nunca una conversión improvisada del ticker. Las respuestas se validan antes de cachearse. Las muestras no finitas o negativas se descartan y las fechas se ordenan.

Los valores principales se toman de `current_price`, `price_change_percentage_24h` y `total_volume`. El rendimiento del gráfico es `(último precio / primer precio − 1) × 100`; si el denominador es cero, el resultado se representa como ausente. El máximo y mínimo del período son extremos de las muestras disponibles, no necesariamente máximos intraintervalo de una vela OHLC.

### Captura de respaldo real

El 29/10/2026 a las 10:11 de Colombia se descargaron 50 activos y cuatro históricos de Bitcoin mediante `scripts/capture-snapshot.mjs`. `snapshot.json` conserva fecha de captura, origen y datos. Los registros del proveedor permanecen en las respuestas.

| Período | Valor de days | Muestras de precio capturadas |
|---|---|---|
| 24 horas | 1 | 288 |
| 7 días | 7 | 169 |
| 30 días | 30 | 721 |
| 90 días | 90 | 2160 |

Las cantidades son evidencia de esta captura, no una promesa sobre respuestas futuras. La granularidad la decide CoinGecko. No se interpolaron ni fabricaron series. Si falla la conexión, el gráfico indica «Captura» con fecha. El respaldo incluido cubre Bitcoin; para otros activos se necesita el histórico remoto o una respuesta previa en memoria.

## 7. Matriz de trazabilidad

| Requisitos | Implementación | Evidencia de verificación |
|---|---|---|
| FR-01, FR-03 | Mercado, selección y detalle en `app.js`; formato en `core.js` | Consulta real y selección de Ethereum en navegador; prueba de valores ausentes |
| FR-02 | Filtro local y búsqueda remota con debounce | Búsqueda BTC y ETH; pruebas de mayúsculas y codificación |
| FR-04 | Mensajes, validación, timeout y límite de API | Pruebas HTTP 403/429/500, timeout, contrato inválido; AAPL en navegador |
| FR-05 | Rangos y URLs distintas | Cuatro rangos comprobados; prueba de parámetros y captura |
| FR-06 | SVG, tooltip, estadísticas y selector de métrica | Pruebas de rendimiento/mínimos; tooltip con flechas y volumen en navegador |
| FR-07 | Secuencias de histórico y búsqueda | Inspección del control de secuencia y cambios rápidos de rango en navegador |
| FR-08 | Sin serie ficticia; captura real identificada | Prueba de contrato de histórico; captura ante límite real |
| FR-09 | Favoritos por ID en localStorage | Pruebas de persistencia y almacenamiento bloqueado; recarga en navegador |
| FR-10 | Filtro de favoritos y selector de orden | Filtro confirmado en navegador; inspección de comparadores |
| FR-11 | Caché, deduplicación y actualización manual | Pruebas TTL, actualización, concurrencia y pausa 429 |
| FR-12 | Artefactos SDD, informe y logs | Prerrequisitos oficiales de Spec Kit y revisión de archivos |
| FR-13 | CSS adaptable, etiquetas, foco y manejo de teclado | Revisión visual escritorio/móvil y exploración del gráfico con teclado |

## 8. Resultados de verificación

`npm run check` ejecutó comprobación de sintaxis de los módulos y **20 pruebas: 20 aprobadas, 0 fallidas**. Los casos HTTP de error se ejercitaron con mocks deterministas. El test de captura usa datos reales guardados y confirma cuatro duraciones diferentes.

Las comprobaciones de navegador confirmaron:

- Mercado con 50 activos y precio real de Bitcoin; encabezado identificado como consulta a CoinGecko.
- Búsqueda de BTC y ETH, selección de Ethereum y explicación para AAPL.
- Gráficos de los cuatro rangos y cambio a volumen móvil de 24 horas.
- Tooltip con fecha/valor mediante flecha izquierda.
- Favorito de Bitcoin conservado al recargar y listado en la pestaña de favoritos.
- Límite real del proveedor durante uso intensivo; presentación de captura fechada en lugar de un gráfico inventado.
- Revisión visual en escritorio y pantalla móvil de 390 × 844; corrección de un desbordamiento causado por contenido de tabla y etiquetas ocultas.

La revisión de accesibilidad es básica; no equivale a una auditoría integral WCAG ni a una prueba con todos los lectores de pantalla. FR-07 se verificó por código y cambio rápido de selección, sin afirmar una suite completa de red desordenada. Ordenación se revisó por implementación; las pruebas automatizadas se concentran en las invariantes de datos y API.

## 9. Límites y riesgos observados

CoinGecko respondió sin clave durante la construcción, pero su documentación contempla autenticación para Demo. El acceso público sin clave puede ser restringido. No se solicita ni expone una clave del usuario; un despliegue con acceso autenticado estable necesitaría un proxy con secreto de servidor y respetar el plan contratado.

La captura no garantiza un precio actual después de su fecha. El estado y el gráfico indican su procedencia separadamente: es posible que el mercado se actualice y el histórico use captura. Google Fonts e imágenes de monedas requieren red; hay fuentes del sistema como respaldo. Los favoritos no se sincronizan entre equipos u orígenes.

Los indicadores de capitalización, volumen y dominio de Bitcoin se calculan sobre los activos cargados, no sobre todo CoinGecko. Los porcentajes pueden diferir de una estadística mundial. Los agregados de volumen no deben interpretarse como una medición única de transacciones sin doble conteo entre activos.

## 10. Reproducir y presentar

```powershell
cd D:\carlo\Desktop\lab-topicos\pulso
npm start
# Abrir http://127.0.0.1:4173
npm run check
```

Para actualizar el respaldo: `npm run snapshot`, con conexión y respetando límites. La página del informe ofrece el documento para descargar y una versión imprimible mediante el navegador. El código y todos los artefactos se entregan juntos.

Guion sugerido de exposición: explicar el problema; mostrar constitución y requisitos; presentar plan/contrato; recorrer BTC, temporalidades y favoritos; enseñar pruebas y explicar cómo SDD permite relacionar cada comportamiento con su especificación.

Para repartir el trabajo, el grupo puede asignar análisis/especificación, integración de datos, interfaz/gráficos y verificación/documentación. Esto es una propuesta organizativa: los nombres y aportes reales deben registrarlos sus integrantes. No se atribuye participación ficticia a Geraldine ni a otras personas.

## 11. Fuentes primarias

- [GitHub Spec Kit: repositorio oficial](https://github.com/github/spec-kit).
- [Instalación de Spec Kit](https://github.github.io/spec-kit/installation.html).
- [CoinGecko API: alcance y productos](https://www.coingecko.com/en/api).
- [CoinGecko Demo: mercados](https://docs.coingecko.com/demo/reference/coins-markets).
- [CoinGecko Demo: búsqueda](https://docs.coingecko.com/demo/reference/search).
- [CoinGecko Demo: históricos](https://docs.coingecko.com/demo/reference/coins-id-market-chart).
- [CoinGecko: errores y límites](https://docs.coingecko.com/docs/common-errors-rate-limit).

Las fuentes se consultaron el 29/10/2026. Los archivos locales y logs complementan la documentación del proveedor con evidencia de esta ejecución.
