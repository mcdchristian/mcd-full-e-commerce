/**
 * Currency formatting for the storefront.
 *
 * Prices reach the client as DECIMAL strings from Sequelize ("934.28"), and
 * the pages rendered them four different ways: raw, `toFixed(2)`, or wrapped
 * in `Number()` first. So the same amount appeared as "934.28 €" on a card and
 * "934,28 €" nowhere at all, with no thousands separator anywhere.
 *
 * The formatter is built once — constructing an Intl.NumberFormat per render
 * is the expensive part.
 */
const EURO = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

/**
 * @param value - Amount as a number or a DECIMAL string
 * @returns The amount in euros, French formatting; zero for unparseable input
 */
export const formatPrice = (value: number | string): string => {
  const amount = typeof value === 'number' ? value : Number.parseFloat(value);
  return EURO.format(Number.isFinite(amount) ? amount : 0);
};
