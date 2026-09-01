const test = require('node:test');
const assert = require('node:assert/strict');

const pickFields = require('../../src/utils/pickFields');

test('keeps only the allowed keys', () => {
  const picked = pickFields({ name: 'Lamp', price: 20, id: 'forged' }, ['name', 'price']);

  assert.deepEqual(picked, { name: 'Lamp', price: 20 });
});

test('drops a primary key the caller tried to set', () => {
  const picked = pickFields({ id: 'attacker-chosen', name: 'Lamp' }, ['name', 'price']);

  assert.ok(!('id' in picked));
});

test('omits allowed keys that are absent, so an update stays partial', () => {
  const picked = pickFields({ price: 20 }, ['name', 'description', 'price', 'stock']);

  assert.deepEqual(Object.keys(picked), ['price']);
});

test('treats an explicit undefined as absent but keeps null and zero', () => {
  const picked = pickFields({ name: undefined, stock: 0, imageUrl: null }, [
    'name',
    'stock',
    'imageUrl'
  ]);

  assert.deepEqual(picked, { stock: 0, imageUrl: null });
});

test('ignores inherited properties', () => {
  const body = Object.create({ role: 'admin' });
  body.name = 'Lamp';

  assert.deepEqual(pickFields(body, ['name', 'role']), { name: 'Lamp' });
});

test('returns an empty object for a missing or non-object body', () => {
  for (const body of [undefined, null, 'string', 42]) {
    assert.deepEqual(pickFields(body, ['name']), {});
  }
});

test('never returns the object it was given', () => {
  const body = { name: 'Lamp' };

  assert.notEqual(pickFields(body, ['name']), body);
});
