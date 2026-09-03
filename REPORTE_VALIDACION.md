# Reporte de validación — LogiFresh México

**Estado antes de publicación:** aprobado localmente  
**Periodo:** abril–junio de 2026  
**Fuente:** `LogiFreshDatos.xlsx`, información sintética  
**Fecha de validación:** 2 de septiembre de 2026

## Perfil de calidad

- 240 filas y 18 campos; grano: un embarque por fila.
- 0 valores faltantes, 0 filas duplicadas y 0 identificadores duplicados.
- Fechas válidas entre 2026-04-01 y 2026-06-28.
- 0 retrasos o reclamaciones negativos; satisfacción dentro de 1–10; ocupación dentro de 0–100%.
- Coherencia completa entre SLA y retraso, y entre indicador de excursión y temperatura máxima.
- Incidentes reconciliados: falla mecánica 14, ventana de entrega 12, temperatura 9, documentación 9 y tráfico 8.

## Reconciliación

Se validaron seis controles directamente contra el archivo. El monto de reclamaciones presentó una diferencia de $100: registros = $882,549 y control = $882,649. Se documentó y aplicó la corrección autorizada de LF-0224, de $4,399 a $4,499, exclusivamente en `data.js`. El archivo fuente permanece intacto.

## Decisiones de diseño

- Modo híbrido: exploración mediante filtros y explicación mediante lectura ejecutiva.
- Paleta seleccionada: Operación nocturna, con índigo, violeta, grafito, lima para referencia y rojo reservado para alertas.
- Barras con base cero para comparaciones; línea para evolución temporal; tabla para valores exactos.
- Meta SLA del 90% visible en KPI, brecha y gráficas.
- Sin imágenes decorativas ni librerías externas de gráficos.

## Matriz de pruebas locales

| Prueba | Esperado | Obtenido | Estado |
|---|---:|---:|---|
| Embarques sin filtros | 240 | 240 | Aprobado |
| SLA sin filtros | 76.7% | 76.7% | Aprobado |
| Retraso promedio de tardíos | 51.8 min | 51.8 min | Aprobado |
| Incidentes | 52 | 52 | Aprobado |
| Excursiones >8 °C | 9 | 9 | Aprobado |
| Reclamaciones reconciliadas | $882,649 | $882,649 | Aprobado |
| Satisfacción | 8.5/10 | 8.5/10 | Aprobado |
| Filtro individual: abril | 80 embarques; SLA 100% | 80; 100% | Aprobado |
| Combinados: abril + Centro | 20 embarques; intersección | 20; todos los componentes actualizados | Aprobado |
| Restablecer filtros | 240 embarques | 240 | Aprobado |
| Sin resultados: abril + No cumple | Mensaje y página estable | Mensaje claro; KPIs en cero | Aprobado |
| Actualización integral | KPIs, 4 gráficas, hechos y tabla | Actualización observada | Aprobado |
| Vista móvil 390 × 844 | Sin desbordamiento del layout | Una columna; tabla contenida con desplazamiento propio | Aprobado |
| Accesibilidad básica | Etiquetas, foco y alternativa textual | Controles etiquetados, foco visible y descripciones de gráficos | Aprobado |
| Consola del navegador | Sin errores ni advertencias | 0 errores; 0 advertencias | Aprobado |
| Etiquetas monetarias extensas | Dentro del marco | Reubicación automática al interior de la barra | Aprobado |
| Contraste de la paleta | ≥4.5:1 en texto clave | 5.09:1–16.24:1 | Aprobado |

## Hallazgos

1. El SLA agregado es 76.7%, 13.3 puntos porcentuales por debajo de la meta de 90%.
2. Los 56 incumplimientos están concentrados en junio: abril y mayo registran 100% y junio 30%. Este patrón temporal requiere validar si refleja operación real o construcción sintética.
3. Preparados concentra $359,900 MXN en reclamaciones, pero el monto observado no demuestra que el producto las cause.

## Hipótesis por validar

1. El deterioro de junio podría asociarse a un cambio operativo, de capacidad o de medición no incluido en el dataset.
2. La concentración de reclamaciones en Preparados podría explicarse por severidad o exposición económica, no necesariamente por una mayor frecuencia de fallas.

## Piloto de 30 días

Priorizar una cohorte operativa de junio y un segmento con suficiente volumen; registrar línea base, intervención, responsable y eventos externos. Medir semanalmente SLA, retraso, incidentes, excursiones y reclamaciones. Criterio preliminar: mejorar al menos 5 puntos porcentuales el SLA sin aumentar excursiones ni reclamaciones. Usar un segmento comparable sin intervención cuando sea viable.

## Riesgos y datos faltantes

- Causa raíz validada y tiempos por etapa del viaje.
- Clima, tráfico, ventanas reales, mantenimiento y disponibilidad de capacidad.
- Número y valor expuesto de embarques por segmento para normalizar reclamaciones.
- Costo, factibilidad y adherencia de la intervención.
- Datos históricos adicionales para distinguir patrón de artefacto sintético.

## Control de calidad

**Verificaciones:** datos, fórmulas, filtros, intersecciones, estado vacío, responsividad, desbordamientos, contraste, accesibilidad básica y errores de navegador.
**Supuesto autorizado:** corrección de $100 en LF-0224.
**Límite:** las pruebas públicas de GitHub Pages deben añadirse después de publicar.
**Estado:** aprobado localmente; publicación pendiente de autorización.

