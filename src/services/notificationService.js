/**
 * Mock notification service that can be extended to use
 * SendGrid, AWS SES, Twilio, or Firebase Cloud Messaging.
 */
class NotificationService {
  async sendEmail(to, subject, body) {
    console.log(`[Notification Service] Sending Email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    // Implementation for real email provider would go here
    return true;
  }

  async sendSMS(to, message) {
    console.log(`[Notification Service] Sending SMS to: ${to}`);
    console.log(`Message: ${message}`);
    // Implementation for real SMS provider would go here
    return true;
  }

  async orderConfirmed(user, order) {
    const subject = `Order Confirmation #${order.id}`;
    const body = `Hi ${user.firstName}, your order of $${order.totalAmount} has been received and is being processed.`;
    return await this.sendEmail(user.email, subject, body);
  }

  async paymentSuccess(user, order) {
    const subject = `Payment Successful #${order.id}`;
    const body = `Hi ${user.firstName}, we've successfully received your payment for order #${order.id}.`;
    return await this.sendEmail(user.email, subject, body);
  }
}

module.exports = new NotificationService();
