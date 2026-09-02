/**
 * The order lifecycle, and which moves through it are legal.
 *
 * The Order model declares five statuses but nothing could set them beyond the
 * webhook flipping `pending` to `paid`. Encoding the transitions here keeps the
 * rule in one place and out of the controller.
 *
 * `delivered` and `cancelled` are terminal: an order that arrived cannot be
 * un-delivered, and a cancelled one is reopened by placing a new order.
 */
const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const ALLOWED_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

/**
 * @param {*} status - Candidate status
 * @returns {boolean} True when the value is one the model accepts
 */
const isOrderStatus = (status) => ORDER_STATUSES.includes(status);

/**
 * @param {string} from - Current status
 * @param {string} to - Requested status
 * @returns {boolean} True when the move is allowed
 */
const canTransition = (from, to) => (ALLOWED_TRANSITIONS[from] ?? []).includes(to);

/**
 * @param {string} from - Current status
 * @returns {string[]} Statuses reachable from here, for use in an error message
 */
const nextStatuses = (from) => [...(ALLOWED_TRANSITIONS[from] ?? [])];

module.exports = { ORDER_STATUSES, isOrderStatus, canTransition, nextStatuses };
