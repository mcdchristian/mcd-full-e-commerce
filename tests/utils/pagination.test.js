const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getPagination,
  getPagingData,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
} = require('../../src/utils/pagination');

test('falls back to the first page and the default size', () => {
  assert.deepEqual(getPagination(), { limit: DEFAULT_PAGE_SIZE, offset: 0 });
  assert.deepEqual(getPagination({}), { limit: DEFAULT_PAGE_SIZE, offset: 0 });
});

test('computes the offset from the requested page', () => {
  assert.deepEqual(getPagination({ page: '3', limit: '20' }), { limit: 20, offset: 40 });
});

test('clamps the page size to the maximum', () => {
  assert.deepEqual(getPagination({ limit: '5000' }), { limit: MAX_PAGE_SIZE, offset: 0 });
});

test('never produces a negative limit or offset', () => {
  for (const query of [{ page: '-3' }, { limit: '-5' }, { page: '0', limit: '0' }]) {
    const { limit, offset } = getPagination(query);
    assert.ok(limit > 0, `limit was ${limit} for ${JSON.stringify(query)}`);
    assert.ok(offset >= 0, `offset was ${offset} for ${JSON.stringify(query)}`);
  }
});

test('ignores unparseable page and limit values', () => {
  assert.deepEqual(getPagination({ page: 'abc', limit: 'xyz' }), {
    limit: DEFAULT_PAGE_SIZE,
    offset: 0
  });
});

test('formats a findAndCountAll result into a paged payload', () => {
  const rows = [{ id: 1 }, { id: 2 }];

  assert.deepEqual(getPagingData({ count: 42, rows }, 2, 10), {
    totalItems: 42,
    items: rows,
    totalPages: 5,
    currentPage: 2
  });
});

test('reports page 1 when the current page is not a positive number', () => {
  assert.equal(getPagingData({ count: 0, rows: [] }, 'abc', 10).currentPage, 1);
  assert.equal(getPagingData({ count: 0, rows: [] }, undefined, 10).currentPage, 1);
});

test('reports zero pages for an empty result set', () => {
  assert.equal(getPagingData({ count: 0, rows: [] }, 1, 10).totalPages, 0);
});
