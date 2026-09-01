const logger = require('../utils/logger');

/**
 * Mock notification service that can be extended to use
 * SendGrid, AWS SES, Twilio, or Firebase Cloud Messaging.
 */
class NotificationService {
  async sendEmail(to, subject, body) {
    if (!to) {
      logger.warn('Skipping email with no recipient', { subject });
      return false;
    }

    logger.info('Sending email', { to, subject, body });
    // Implementation for real email provider would go here
    return true;
  }

  async sendSMS(to, message) {
    if (!to) {
      logger.warn('Skipping SMS with no recipient');
      return false;
    }

    logger.info('Sending SMS', { to, message });
    // Implementation for real SMS provider would go here
    return true;
  }

  async orderConfirmed(user, order) {
    if (!user) {
      logger.warn('Cannot send order confirmation: no user on the order', { orderId: order.id });
      return false;
    }

    const subject = `Order Confirmation #${order.id}`;
    const body = `Hi ${user.firstName}, your order of ${formatAmount(order.totalAmount)} has been received and is being processed.`;
    return await this.sendEmail(user.email, subject, body);
  }

  async paymentSuccess(user, order) {
    if (!user) {
      logger.warn('Cannot send payment confirmation: no user on the order', { orderId: order.id });
      return false;
    }

    const subject = `Payment Successful #${order.id}`;
    const body = `Hi ${user.firstName}, we've successfully received your payment for order #${order.id}.`;
    return await this.sendEmail(user.email, subject, body);
  }
}

// Orders are priced and charged in euros; the amount arrives as a DECIMAL string.
const formatAmount = (amount) => `${Number(amount).toFixed(2)} €`;

module.exports = new NotificationService();
