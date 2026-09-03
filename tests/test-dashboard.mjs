import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(read('data.js'), context);
const rows = context.window.LOGIFRESH_DATA;

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const approx = (actual, expected, tolerance = 0.05) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);

function metrics(data) {
  const late = data.filter(row => row.retraso_min > 0);
  return {
    shipments: data.length,
    sla: data.length ? data.filter(row => row.sla_entrega === 'Cumple').length / data.length * 100 : 0,
    lateAverage: late.length ? late.reduce((sum, row) => sum + row.retraso_min, 0) / late.length : null,
    incidents: data.filter(row => row.tipo_incidente !== 'Sin incidente').length,
    excursions: data.filter(row => row.excursion_temp_mayor_8c === 'Sí').length,
    claims: data.reduce((sum, row) => sum + row.reclamacion_mxn, 0),
    satisfaction: data.length ? data.reduce((sum, row) => sum + row.satisfaccion_1_10, 0) / data.length : null
  };
}

const filter = criteria => rows.filter(row => Object.entries(criteria).every(([key, value]) => {
  const actual = key === 'mes' ? row.fecha_salida.slice(0, 7) : row[key];
  return actual === value;
}));

test('data.js expone un arreglo', () => assert.ok(Array.isArray(rows)));
test('total sin filtros = 240', () => assert.equal(metrics(rows).shipments, 240));
test('identificadores únicos', () => assert.equal(new Set(rows.map(row => row.id_embarque)).size, 240));
test('SLA = 76.7%', () => approx(metrics(rows).sla, 76.7));
test('retraso promedio de tardíos = 51.8 min', () => approx(metrics(rows).lateAverage, 51.8));
test('incidentes = 52', () => assert.equal(metrics(rows).incidents, 52));
test('excursiones >8 °C = 9', () => assert.equal(metrics(rows).excursions, 9));
test('reclamaciones = $882,649 MXN', () => assert.equal(metrics(rows).claims, 882649));
test('satisfacción = 8.5/10', () => approx(metrics(rows).satisfaction, 8.5));
test('LF-0224 contiene la corrección autorizada', () => assert.equal(rows.find(row => row.id_embarque === 'LF-0224').reclamacion_mxn, 4499));
test('filtro abril = 80 embarques y SLA 100%', () => {
  const result = metrics(filter({ mes: '2026-04' }));
  assert.equal(result.shipments, 80);
  assert.equal(result.sla, 100);
});
test('filtros abril + Centro = 20 embarques', () => assert.equal(filter({ mes: '2026-04', transportista: 'Centro' }).length, 20));
test('abril + No cumple produce selección vacía', () => assert.equal(filter({ mes: '2026-04', sla_entrega: 'No cumple' }).length, 0));
test('la selección vacía no divide entre cero', () => {
  const result = metrics([]);
  assert.equal(result.sla, 0);
  assert.equal(result.lateAverage, null);
  assert.equal(result.satisfaction, null);
});
test('SLA y retraso son coherentes', () => assert.ok(rows.every(row =>
  (row.sla_entrega === 'Cumple' && row.retraso_min === 0) ||
  (row.sla_entrega === 'No cumple' && row.retraso_min > 0)
)));
test('excursión y temperatura son coherentes', () => assert.ok(rows.every(row =>
  (row.excursion_temp_mayor_8c === 'Sí') === (row.temperatura_max_c > 8)
)));
test('index.html referencia recursos relativos de publicación', () => {
  const html = read('index.html');
  for (const resource of ['styles.css', 'data.js', 'app.js']) assert.ok(html.includes(resource));
  assert.ok(!/(src|href)=["']\//.test(html), 'Se encontró una ruta absoluta incompatible con GitHub Pages');
});
test('index.html contiene la meta SLA y regiones accesibles', () => {
  const html = read('index.html');
  assert.ok(html.includes('90%'));
  assert.ok(html.includes('aria-live="polite"'));
  assert.ok(html.includes('Saltar al contenido'));
});
test('CSS aplica box-sizing y contención responsive', () => {
  const css = read('styles.css');
  assert.ok(css.includes('box-sizing:border-box'));
  assert.ok(css.includes('max-width:100%'));
  assert.ok(css.includes('@media'));
});
test('no hay secretos comunes en archivos publicables', () => {
  const content = ['index.html', 'styles.css', 'app.js', 'data.js', 'README.md'].map(read).join('\n');
  assert.ok(!/(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|BEGIN (RSA|OPENSSH) PRIVATE KEY)/.test(content));
});

let failures = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${name}\n  ${error.message}`);
  }
}
console.log(`\n${tests.length - failures}/${tests.length} pruebas aprobadas.`);
if (failures) process.exitCode = 1;

