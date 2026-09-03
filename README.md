# LogiFresh México — dashboard operativo

Dashboard HTML interactivo para apoyar la selección de un piloto de mejora operativa de 30 días. Analiza 240 embarques sintéticos del periodo abril–junio de 2026 y recalcula todos los componentes al aplicar filtros.

## Pregunta de decisión

¿En qué segmentos debería concentrarse un piloto de mejora operativa de 30 días y qué evidencia adicional hace falta antes de intervenir?

## Contenido

- Ocho KPIs: embarques, SLA, brecha contra meta de 90%, retraso de tardíos, incidentes, excursiones, reclamaciones y satisfacción.
- Filtros por mes, origen, destino, producto, transportista, tipo de ruta, SLA e incidente.
- Evolución semanal, SLA por transportista, incidentes, reclamaciones por producto y tabla de detalle.
- Panel separado de Hechos, Hipótesis y Próximo paso.
- Estados sin resultados, diseño responsive, navegación por teclado y etiquetas accesibles.

## Arquitectura

Sitio estático sin framework ni librerías de visualización. `index.html` contiene la estructura, `styles.css` el sistema visual, `app.js` los cálculos e interacciones y `data.js` el dataset incorporado. Esta arquitectura reduce dependencias y es compatible con GitHub Pages.

## Cálculos

- SLA = embarques con `sla_entrega = Cumple` / embarques seleccionados.
- Brecha = SLA − 90%, expresada en puntos porcentuales.
- Retraso promedio = media de `retraso_min` únicamente para valores mayores que cero.
- Incidentes = registros cuyo `tipo_incidente` es distinto de `Sin incidente`.
- Excursiones = registros con `excursion_temp_mayor_8c = Sí`.
- Reclamaciones = suma de `reclamacion_mxn`.
- Satisfacción = promedio simple de `satisfaccion_1_10`.

## Reconciliación autorizada

El archivo original suma $882,549 MXN, mientras que su hoja de control y la guía establecen $882,649 MXN. Con autorización de la responsable, la versión incorporada corrige LF-0224 de $4,399 a $4,499 MXN. El Excel original no fue modificado.

## Uso local

Puede abrirse mediante cualquier servidor HTTP estático. No requiere compilación, variables de entorno ni secretos.

## Límites

Los datos son sintéticos y no contienen información personal. Las asociaciones entre incidentes, retrasos, temperatura y reclamaciones no prueban causalidad. Faltan causa raíz validada, tiempos por etapa, condiciones externas, costo de intervención y exposición comparable por segmento.

La matriz completa de pruebas y decisiones se encuentra en [REPORTE_VALIDACION.md](REPORTE_VALIDACION.md).

