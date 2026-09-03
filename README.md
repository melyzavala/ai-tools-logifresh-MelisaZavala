# LogiFresh México — dashboard operativo

Dashboard HTML interactivo para explorar 240 embarques sintéticos de cadena fría de abril a junio de 2026. Su propósito es apoyar la selección de un piloto operativo de 30 días y dejar explícita la evidencia que todavía se necesita antes de intervenir.

- **Dashboard publicado:** https://melyzavala.github.io/ai-tools-logifresh-MelisaZavala/
- **Repositorio público:** https://github.com/melyzavala/ai-tools-logifresh-MelisaZavala
- **Estado de validación:** aprobado y publicado

## Pregunta de decisión

¿En qué segmentos debería concentrarse un piloto de mejora operativa de 30 días y qué evidencia adicional hace falta antes de intervenir?

## Qué incluye

- Ocho KPIs: embarques, SLA, brecha frente a la meta de 90%, retraso promedio de tardíos, incidentes, excursiones mayores a 8 °C, reclamaciones y satisfacción.
- Ocho filtros globales: mes, origen, destino, producto, transportista, tipo de ruta, SLA e incidente.
- Evolución semanal del SLA, comparación por transportista, incidentes y reclamaciones por producto.
- Tabla de detalle con hasta 50 filas visibles; los KPIs y gráficas consideran toda la selección.
- Panel diferenciado de Hechos, Hipótesis y Próximo paso.
- Estado sin resultados, restablecimiento de filtros, diseño responsive y accesibilidad básica.
- Definiciones, unidades, periodo, fuente sintética, fecha de actualización y limitaciones visibles.

Todos los componentes analíticos se recalculan con la misma selección de filtros.

## Indicadores de control

| Indicador | Resultado sin filtros |
|---|---:|
| Embarques | 240 |
| SLA | 76.7% |
| Brecha frente a meta de 90% | −13.3 pp |
| Retraso promedio de tardíos | 51.8 min |
| Incidentes | 52 |
| Excursiones >8 °C | 9 |
| Reclamaciones | $882,649 MXN |
| Satisfacción | 8.5/10 |

## Arquitectura

El sitio usa HTML, CSS, JavaScript y SVG nativos. No requiere framework, backend, base de datos, API, claves ni librerías de visualización externas.

```text
index.html                 Estructura semántica del dashboard
styles.css                 Sistema visual y reglas responsive
data.js                    240 observaciones sintéticas incorporadas
app.js                     Métricas, filtros, gráficas y tabla
tests/test-dashboard.mjs   Pruebas automáticas sin dependencias
REPORTE_VALIDACION.md      Trazabilidad de calidad y evidencia
.nojekyll                  Publicación estática en GitHub Pages
```

Esta arquitectura reduce dependencias, mantiene una carga rápida y permite publicar directamente desde la raíz de la rama `main`.

## Definiciones y cálculos

- **Embarques:** conteo de filas de la selección.
- **SLA:** `100 × embarques con sla_entrega = Cumple / embarques seleccionados`.
- **Brecha:** SLA menos la meta de 90%, expresada en puntos porcentuales.
- **Retraso promedio de tardíos:** promedio de `retraso_min` únicamente para valores mayores que cero.
- **Incidentes:** registros cuyo `tipo_incidente` es distinto de `Sin incidente`.
- **Excursiones:** registros con `excursion_temp_mayor_8c = Sí`.
- **Reclamaciones:** suma de `reclamacion_mxn`, en MXN.
- **Satisfacción:** promedio simple de `satisfaccion_1_10`.

Cuando una selección no tiene registros, los conteos se muestran en cero y no se calculan promedios sobre un denominador vacío.

## Reconciliación autorizada

La suma del libro original es $882,549 MXN, mientras que la hoja de control y la guía establecen $882,649 MXN. Con autorización de la responsable, la versión incorporada en `data.js` corrige el registro LF-0224 de $4,399 a $4,499 MXN. El archivo Excel original no fue modificado y no se publica en este repositorio.

## Ejecución local

No se necesita instalar ninguna biblioteca. Desde la carpeta del proyecto puede iniciarse cualquier servidor HTTP estático. Por ejemplo:

```powershell
python -m http.server 8000
```

Después se abre `http://localhost:8000/`. Un servidor local reproduce mejor el comportamiento del alojamiento público que abrir el archivo directamente.

## Pruebas automáticas

Requisito: Node.js 18 o posterior. No hay dependencias que instalar.

```powershell
node tests/test-dashboard.mjs
```

La suite verifica:

- los siete valores de aceptación y el total de embarques;
- unicidad de identificadores y la corrección autorizada de LF-0224;
- filtro individual, filtros combinados y selección sin resultados;
- consistencia entre SLA y retraso, y entre excursión y temperatura;
- prevención de división entre cero;
- rutas relativas compatibles con GitHub Pages;
- presencia de meta SLA, accesibilidad básica y reglas responsive;
- ausencia de patrones comunes de secretos en archivos publicables.

Las pruebas visuales e interactivas de navegador —restablecimiento, actualización integral, vista móvil, desbordamiento y carga pública— están documentadas en [REPORTE_VALIDACION.md](REPORTE_VALIDACION.md).

## Hallazgos principales

1. El SLA agregado es 76.7%, 13.3 puntos porcentuales por debajo de la meta de 90%.
2. Los 56 incumplimientos están concentrados en junio: abril y mayo registran 100% y junio 30%. Debido al carácter sintético de los datos, este patrón requiere validación antes de interpretarse como comportamiento operativo real.
3. Preparados concentra $359,900 MXN en reclamaciones. La concentración observada no demuestra que el producto cause las reclamaciones.

## Piloto recomendado de 30 días

Priorizar una cohorte comparable al segmento de junio y con volumen suficiente. Registrar línea base, intervención, responsable y eventos externos; revisar semanalmente SLA, retraso, incidentes, excursiones y reclamaciones. El criterio preliminar es mejorar al menos 5 puntos porcentuales el SLA sin aumentar excursiones ni reclamaciones, usando un segmento comparable sin intervención cuando sea viable.

## Limitaciones

- Dataset sintético y periodo de sólo tres meses.
- Patrón temporal extremo que puede responder a la construcción de los datos.
- Sin causa raíz validada ni tiempos por etapa del viaje.
- Sin clima, tráfico observado, ventanas reales, mantenimiento o capacidad disponible.
- Sin valor expuesto por segmento para normalizar reclamaciones.
- Sin costo, factibilidad o adherencia de una intervención.

Las asociaciones observadas sirven para formular hipótesis; no justifican causalidad, sanciones ni decisiones operativas definitivas.

## Publicación

GitHub Pages sirve el sitio desde la rama `main`, carpeta raíz `/`. `index.html` y `.nojekyll` permanecen en la raíz publicable. La URL pública fue verificada con valores iniciales, filtros, restablecimiento, estado sin resultados y una vista móvil de 390 × 844 px.

## Privacidad y seguridad

El repositorio no contiene credenciales, tokens, información personal ni el libro de trabajo original. Únicamente publica el sitio estático, la versión sintética incorporada, pruebas y documentación.

## Trazabilidad

La metodología, perfil de calidad, decisiones de diseño, pruebas esperadas y obtenidas, correcciones, límites y estado final se encuentran en [REPORTE_VALIDACION.md](REPORTE_VALIDACION.md).

