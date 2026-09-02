const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ORDER_STATUSES,
  isOrderStatus,
  canTransition,
  nextStatuses
} = require('../../src/utils/orderStatus');

test('recognises exactly the statuses the model declares', () => {
  assert.deepEqual(ORDER_STATUSES, ['pending', 'paid', 'shipped', 'delivered', 'cancelled']);

  for (const status of ORDER_STATUSES) {
    assert.equal(isOrderStatus(status), true, `${status} was rejected`);
  }
});

test('rejects anything outside the list', () => {
  for (const status of ['refunded', 'PENDING', '', undefined, null, 42]) {
    assert.equal(isOrderStatus(status), false, `accepted ${JSON.stringify(status)}`);
  }
});

test('allows the fulfilment path', () => {
  assert.equal(canTransition('pending', 'paid'), true);
  assert.equal(canTransition('paid', 'shipped'), true);
  assert.equal(canTransition('shipped', 'delivered'), true);
});

test('allows cancelling until the parcel ships', () => {
  assert.equal(canTransition('pending', 'cancelled'), true);
  assert.equal(canTransition('paid', 'cancelled'), true);
  assert.equal(canTransition('shipped', 'cancelled'), false);
});

test('refuses to skip a step or walk the path backwards', () => {
  assert.equal(canTransition('pending', 'shipped'), false);
  assert.equal(canTransition('pending', 'delivered'), false);
  assert.equal(canTransition('shipped', 'paid'), false);
  assert.equal(canTransition('delivered', 'shipped'), false);
});

test('treats delivered and cancelled as terminal', () => {
  for (const terminal of ['delivered', 'cancelled']) {
    assert.deepEqual(nextStatuses(terminal), []);

    for (const target of ORDER_STATUSES) {
      assert.equal(canTransition(terminal, target), false, `${terminal} -> ${target} allowed`);
    }
  }
});

test('never allows a status to transition to itself', () => {
  for (const status of ORDER_STATUSES) {
    assert.equal(canTransition(status, status), false, `${status} -> ${status} allowed`);
  }
});

test('an unknown current status has no legal move', () => {
  assert.deepEqual(nextStatuses('refunded'), []);
  assert.equal(canTransition('refunded', 'paid'), false);
});

test('nextStatuses hands back a copy, not the table itself', () => {
  const first = nextStatuses('pending');
  first.push('delivered');

  assert.deepEqual(nextStatuses('pending'), ['paid', 'cancelled']);
});
