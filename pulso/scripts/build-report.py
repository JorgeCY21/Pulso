"""Genera informe web y copia descargable a partir de una única fuente Markdown.
Dependencia de autoría: Markdown 3.11.2; no necesaria para ejecutar la página.
"""
from pathlib import Path
import markdown

root = Path(__file__).resolve().parents[1]
source = (root / "docs/INFORME.md").read_text(encoding="utf-8")
body = markdown.markdown(source, extensions=["tables", "fenced_code", "toc"])
html = '''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Informe SDD · Pulso</title><link rel="stylesheet" href="styles.css">
<style>@media print{body{background:white}.doc-nav,.report-actions{display:none!important}.doc-page{max-width:none;padding:0}.doc-page h2{break-after:avoid}.doc-page table{font-size:10px}a{color:inherit!important}pre{white-space:pre-wrap}tr{break-inside:avoid}}</style></head>
<body><main class="doc-page"><nav class="doc-nav"><a href="./" class="footer-brand">pulso.</a><a href="./">Volver al mercado ↗</a></nav>
<div class="report-actions" style="margin:24px 0"><a href="informe.md" download>Descargar informe Markdown</a> · Usa Imprimir en el navegador para guardarlo como PDF.</div>
''' + body + '''<footer style="padding:35px 0"><a href="./">Volver al rastreador</a></footer></main></body></html>'''
(root / "dist/informe.html").write_text(html, encoding="utf-8")
(root / "dist/informe.md").write_text(source, encoding="utf-8")
print("Informe generado: dist/informe.html y dist/informe.md")
