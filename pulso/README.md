# Pulso: rastreador de criptomonedas

Pulso es una aplicación web académica para consultar criptomonedas mediante la API pública de [CoinGecko](https://www.coingecko.com/en/api). Muestra precio en USD, variación de 24 horas, volumen, favoritos y gráficos de precio o volumen para 24 horas, 7 días, 30 días y 90 días.

El proyecto se desarrolló con **Spec-Driven Development (SDD)** y la estructura de [GitHub Spec Kit](https://github.com/github/spec-kit) 1.2.5.

## Requisitos

- Git.
- Node.js 20 o superior.
- Conexión a Internet para consultar CoinGecko. No se necesita una API key para el funcionamiento básico.

## Clonar y levantar el proyecto

```powershell
git clone https://github.com/JorgeCY21/Pulso.git
cd Pulso
node --version
npm --version
npm start
```

Abrir `http://127.0.0.1:4173`. También se puede usar `npm run dev`; ambos comandos inician el mismo servidor. No abrir `dist/index.html` con `file://`, porque los módulos JavaScript requieren HTTP.

## Comandos disponibles

```powershell
# Iniciar el servidor local
npm start

# Comprobar sintaxis y ejecutar las 20 pruebas
npm run check

# Ejecutar solamente las pruebas
npm test

# Actualizar la captura de respaldo con datos de CoinGecko
npm run snapshot
```

`npm run snapshot` requiere conexión y disponibilidad de CoinGecko. Si el proveedor limita una consulta, se registra el error y no se inventan datos.

## Qué se puede probar

1. Buscar `BTC` o `Bitcoin` y revisar precio, variación y volumen.
2. Seleccionar `ETH` y cambiar entre 24 h, 7 d, 30 d y 90 d.
3. Cambiar el gráfico entre precio y volumen.
4. Guardar una moneda como favorita, recargar y comprobar que permanece.
5. Filtrar y ordenar la tabla de mercado.
6. Buscar `AAPL` para observar el mensaje de alcance: esta versión trabaja con criptomonedas, no con acciones bursátiles.

## Estructura principal

```text
Pulso/
├── dist/                         # HTML, CSS y JavaScript de la aplicación
├── scripts/                      # Servidor local y captura de datos
├── tests/                        # Pruebas automatizadas
├── specs/001-crypto-tracker/     # Especificación y diseño SDD
├── docs/                         # Informe, revisión y evidencias
├── .specify/                     # Plantillas y workflows de Spec Kit
├── .agents/skills/               # Skills instaladas para Spec Kit
├── package.json                  # Scripts del proyecto
└── README.md                     # Esta guía
```

## Documentación SDD

| Documento | Ubicación |
|---|---|
| Informe completo | [docs/INFORME.md](docs/INFORME.md) |
| Revisión SDD y validación | [docs/REVISION-SDD.md](docs/REVISION-SDD.md) |
| Constitución | [.specify/memory/constitution.md](.specify/memory/constitution.md) |
| Especificación funcional | [specs/001-crypto-tracker/spec.md](specs/001-crypto-tracker/spec.md) |
| Plan y arquitectura | [specs/001-crypto-tracker/plan.md](specs/001-crypto-tracker/plan.md) |
| Investigación | [specs/001-crypto-tracker/research.md](specs/001-crypto-tracker/research.md) |
| Modelo de datos | [specs/001-crypto-tracker/data-model.md](specs/001-crypto-tracker/data-model.md) |
| Contrato de CoinGecko | [specs/001-crypto-tracker/contracts/coingecko.md](specs/001-crypto-tracker/contracts/coingecko.md) |
| Tareas | [specs/001-crypto-tracker/tasks.md](specs/001-crypto-tracker/tasks.md) |
| Evidencias | [docs/evidence](docs/evidence) |

La especificación funcional define 13 requisitos: consulta del mercado, análisis histórico, favoritos, manejo de errores, caché, accesibilidad y entrega documentada. También define las condiciones de éxito y lo que queda fuera del alcance: compra/venta, autenticación, recomendaciones y acciones bursátiles.

## Inicialización de Spec Kit

La inicialización real está registrada en [docs/evidence/spec-kit-init.txt](docs/evidence/spec-kit-init.txt). Para reproducir la instalación:

```powershell
python -m venv .spec-kit-venv
.spec-kit-venv\Scripts\python -m pip install specify-cli==1.2.5
specify init . --integration codex --script ps --force
```

El flujo SDD utilizó las instrucciones `speckit-constitution`, `speckit-specify`, `speckit-plan`, `speckit-tasks`, `speckit-implement` y `speckit-converge`. Son instrucciones del agente, no comandos nativos de PowerShell.

## Datos, límites y respaldo

Las consultas se realizan desde el navegador y CoinGecko puede aplicar límites o devolver errores `429`. Cuando existe una captura real, la aplicación la muestra identificada con su fecha; nunca la presenta como cotización en vivo. Los favoritos se guardan solamente en el navegador actual mediante `localStorage`.

El volumen representa una ventana móvil de 24 horas. La aplicación es informativa, no ofrece recomendaciones financieras ni ejecuta transacciones.

## Publicación

La versión publicada está disponible en [Pulso](https://pulso-mercado-sdd.deepgiant66.chatgpt.site/). Para revisar el informe localmente, abrir:

```text
http://127.0.0.1:4173/informe.html
```
