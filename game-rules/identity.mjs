// Opaque, published world IDs only. Never infer world identity from geometry.
function checked(ids, count) {
  if (ids.length !== count) throw new TypeError(`Expected ${count} node IDs`);
  for (const id of ids) {
    if (typeof id !== 'string' || id.length === 0 || id.trim() !== id || /[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/u.test(id)) throw new TypeError('Expected nonempty canonical world node ID');
  }
  if (new Set(ids).size !== count) throw new RangeError('Distinct world nodes required');
  // JS UTF-16 lexical order is specified; avoid locale-dependent ordering.
  return [...ids].sort();
}
export function linkId(a, b) { return 'link:v1:' + JSON.stringify(checked([a, b], 2)); }
export function fieldId(a, b, c) { return 'field:v1:' + JSON.stringify(checked([a, b, c], 3)); }
