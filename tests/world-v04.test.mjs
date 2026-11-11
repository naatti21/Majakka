import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const base = 'experiments/maplibre-world-v04';
const page = readFileSync(base + '/index.html', 'utf8');
const model = readFileSync(base + '/node-3d.js', 'utf8');

test('v0.4 page module is syntactically parseable', () => {
  const script = page.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'page module script missing');
  new Script(script.replace(/^\s*import .*?;\s*$/gm, ''));
});

test('3D layer module is syntactically parseable', () => {
  new Script(model.replace(/^\s*import .*?;\s*$/gm, '').replace(/^\s*export /gm, ''));
});

test('selected Android-approved readable Dark style is the default', () => {
  assert.match(page, /styleURL\s*=\s*'https:\/\/tiles\.openfreemap\.org\/styles\/dark'/);
  assert.match(page, /applyReadableDark\(\)/);
  assert.match(page, /highway_name_/);
  assert.match(page, /text-halo-color/);
  assert.doesNotMatch(page, /navigator\.geolocation|getCurrentPosition/);
});

test('Node is true georeferenced 3D geometry, not a billboard', () => {
  assert.match(model, /MercatorCoordinate\.fromLngLat\(coords, 0\)/);
  assert.match(model, /meterInMercatorCoordinateUnits\(\)/);
  assert.match(model, /renderingMode:\s*'3d'/);
  assert.match(model, /defaultProjectionData\.mainMatrix/);
  assert.match(model, /OctahedronGeometry/);
  assert.match(model, /TorusGeometry/);
  assert.match(model, /WebGLRenderer/);
  assert.match(model, /renderer\.autoClear\s*=\s*false/);
  assert.doesNotMatch(model, /THREE\.Sprite|CanvasTexture|Billboard/);
  assert.match(page, /import\('\.\/node-3d\.js\?v=041'\)/);
});

test('an isolated 3D failure leaves MapLibre map available', () => {
  assert.match(page, /\.catch\(error\s*=>\s*\{/);
  assert.match(page, /3D-moduulia ei saatu ladattua/);
  assert.match(page, /nodeToggle/);
  assert.match(model, /onRemove\(\)/);
  assert.match(model, /renderer\?\.dispose\(\)/);
});

test('v0.4.1 Node has a genuinely opaque faceted 3D body, not just glow', () => {
  assert.match(model, /const crystal = new THREE\.Mesh\(/);
  assert.match(model, /new THREE\.MeshBasicMaterial\(\{\s*vertexColors: true/);
  assert.match(model, /transparent: false, opacity: 1, depthTest: true, depthWrite: true/);
  assert.match(model, /Float32BufferAttribute\(colorAttr, 3\)/);
  assert.match(model, /this\.core\.position\.y = 34 \+ Math\.sin/);
  assert.match(model, /const glow = new THREE\.Mesh/);
  assert.match(model, /opacity: 0\.028/);
  assert.match(page, /Nocturne · 3D World v0\.4\.1/);
});
