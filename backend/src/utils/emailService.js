import nodemailer from 'nodemailer';
import { supabase } from '../config/supabase.js';
import dns from 'dns';

// Reusable transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('CRITICAL ERROR: EMAIL_USER or EMAIL_PASS environment variables are not set.');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // This forced IPv4 lookup is essential for stability on Render's network
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, (err, address, family) => {
        callback(err, address, family);
      });
    }
  });
};

/*
 * Helper to fetch user email since orders table only has user_id
 */
const getCustomerEmail = async (userId) => {
  if (!userId) return null;
  try {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
    if (error) {
      console.error('Error fetching user email from Supabase Auth:', error);
      return null;
    }
    return user?.email;
  } catch (err) {
    console.error('Exception fetching user email:', err);
    return null;
  }
};



/*
 * Sends a notification to the admin regarding a new order
 */
export const sendNewOrderNotification = async (order) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const customerEmail = await getCustomerEmail(order.user_id) || 'Not provided';
  
  const hasPendingCustomItems = (order.order_items || []).some(
    item => item.custom_order_type && item.price === null
  );
  const pendingText = hasPendingCustomItems ? ' (+ pending amount)' : '';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'crocheella19@gmail.com',
    subject: 'New Order Received – Crochet Ella Website',
    text: `
=========================================
NEW ORDER RECEIVED
=========================================

ORDER INFORMATION
- Order ID: ${order.order_id}
- Order Date: ${new Date(order.created_at).toLocaleString('en-US')}
- Total Price: ${order.total_amount} DA${pendingText}

CUSTOMER INFORMATION
- Name: ${order.customer_name}
- Email: ${customerEmail}
- Phone: ${order.customer_phone}

=========================================
`.trim()
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin email notification sent for Order ID: ${order.id}`);
    return true;
  } catch (error) {
    console.error(`Failed to send admin email notification for Order ID: ${order.id}`, error);
    return false; // Error handled silently, doesn't interrupt order
  }
};

/*
 * Sends an order confirmation to the customer
 */
export const sendCustomerOrderConfirmation = async (order) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const customerEmail = await getCustomerEmail(order.user_id);
  
  if (!customerEmail) {
    console.warn(`Customer email missing for Order ID: ${order.id}. Skipping customer confirmation email.`);
    return false;
  }

  const hasPendingCustomItems = (order.order_items || []).some(
    item => item.custom_order_type && item.price === null
  );
  
  const pendingText = hasPendingCustomItems ? ' (+ pending amount)' : '';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: 'Your Order Has Been Received – Crochet Ella',
    text: `Hello ${order.customer_name},

Thank you for your order on Crochet Ella.

Your order has been successfully received.

Our team will review your order and contact you soon to confirm the details and the deposit required.

Order Summary:
- Order ID: ${order.order_id}
- Total Price: ${order.total_amount} DA${pendingText}

Thank you for trusting Crochet Ella.

Best regards,
Crochet Ella`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Customer email confirmation sent to ${customerEmail} for Order ID: ${order.id}`);
    return true;
  } catch (error) {
    console.error(`Failed to send customer email confirmation for Order ID: ${order.id}`, error);
    return false; // Error handled silently, doesn't interrupt order
  }
};

/*
 * Sends a notification to the admin when an order is cancelled directly by the customer
 */
export const sendOrderCancelledNotification = async (order) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'crocheella19@gmail.com',
    subject: 'Order Cancelled by Customer – Crochet Ella',
    text: `
=========================================
ORDER CANCELLED
=========================================

An order has been directly cancelled by the customer.

ORDER INFORMATION
- Order ID: ${order.order_id}
- Cancelled At: ${new Date().toLocaleString('en-US')}
- Total Price: ${order.total_amount} DA

CUSTOMER INFORMATION
- Name: ${order.customer_name}
- Phone: ${order.customer_phone}

=========================================
`.trim()
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin cancellation notification sent for Order ID: ${order.id}`);
    return true;
  } catch (error) {
    console.error(`Failed to send cancellation notification for Order ID: ${order.id}`, error);
    return false;
  }
};

/*
 * Sends a notification to the admin when a customer requests order cancellation
 */
export const sendCancelRequestNotification = async (order) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'crocheella19@gmail.com',
    subject: 'Customer Cancellation Request – Crochet Ella',
    text: `
=========================================
CANCELLATION REQUEST
=========================================

A customer has requested to cancel their order.
Please contact them to decide if cancellation is allowed.

ORDER INFORMATION
- Order ID: ${order.order_id}
- Request Date: ${new Date().toLocaleString('en-US')}
- Current Status: ${order.status}
- Total Price: ${order.total_amount} DA

CUSTOMER INFORMATION
- Name: ${order.customer_name}
- Phone: ${order.customer_phone}

=========================================
`.trim()
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin cancel request notification sent for Order ID: ${order.id}`);
    return true;
  } catch (error) {
    console.error(`Failed to send cancel request notification for Order ID: ${order.id}`, error);
    return false;
  }
};

export const sendDepositConfirmationToCustomer = async (order) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const customerEmail = await getCustomerEmail(order.user_id);
  if (!customerEmail) {
    console.warn(`Customer email missing for Order ID: ${order.id}. Skipping deposit confirmation.`);
    return false;
  }

  const depositAmount = parseFloat(order.deposit_value || 0).toFixed(2);
  const totalAmount = parseFloat(order.total_amount || 0).toFixed(2);
  const remaining = (parseFloat(totalAmount) - parseFloat(depositAmount)).toFixed(2);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Deposit Confirmed for Order #${order.order_id} - Crochet Ella`,
    text: `Hello ${order.customer_name},

Great news! We have recorded your deposit payment for Order #${order.order_id}.

Payment Summary:
- Total Order Amount: ${totalAmount} DA
- Deposit Paid: ${depositAmount} DA
- Remaining Balance: ${remaining} DA

Your order is now Confirmed. Our team will begin working on it soon.
You can track your order anytime in the "My Orders" section on our website.

Thank you for trusting Crochet Ella!

Best regards,
Crochet Ella`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Deposit confirmation email sent to ${customerEmail} for Order ID: ${order.id}`);
    return true;
  } catch (error) {
    console.error(`Failed to send deposit confirmation for Order ID: ${order.id}`, error);
    return false;
  }
};

export const sendCustomPriceSetToCustomer = async (order) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const customerEmail = await getCustomerEmail(order.user_id);
  if (!customerEmail) {
    console.warn(`Customer email missing for Order ID: ${order.id}. Skipping custom price notification.`);
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Your Custom Order Price Has Been Set - Order #${order.order_id} - Crochet Ella`,
    text: `Hello ${order.customer_name},

The price for your custom item in Order #${order.order_id} has been set by our team.

Updated Order Total: ${order.total_amount} DA

Please log in to our website and visit "My Orders" to review the price details.
If you have any questions, feel free to contact us.

Thank you for choosing Crochet Ella!

Best regards,
Crochet Ella`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Custom price notification sent to ${customerEmail} for Order ID: ${order.id}`);
    return true;
  } catch (error) {
    console.error(`Failed to send custom price notification for Order ID: ${order.id}`, error);
    return false;
  }
};

export const sendOrderStatusUpdateToCustomer = async (order, newStatus) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const customerEmail = await getCustomerEmail(order.user_id);
  if (!customerEmail) {
    console.warn(`Customer email missing for Order ID: ${order.id}. Skipping status update email.`);
    return false;
  }

  const statusLabels = {
    pending: 'Pending Review',
    waiting_deposit: 'Waiting for Deposit',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    delivered: 'Delivered',
    done: 'Completed',
    cancelled: 'Cancelled'
  };

  const statusMessages = {
    pending: 'Your order is pending review by our team.',
    waiting_deposit: 'Your order is awaiting your deposit payment. Please contact us to arrange it.',
    confirmed: 'Your order has been confirmed. Our team will start working on it soon.',
    in_progress: 'Great news! Our team has started crafting your order.',
    delivered: 'Your order has been handed over for delivery. It should reach you soon!',
    done: 'Your order has been completed. We hope you love it!',
    cancelled: 'Your order has been cancelled. Please contact us if you have any questions.'
  };

  const statusLabel = statusLabels[newStatus] || newStatus;
  const statusMessage = statusMessages[newStatus] || `Your order status is now: ${statusLabel}.`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order #${order.order_id} Update: ${statusLabel} - Crochet Ella`,
    text: `Hello ${order.customer_name},

Your order status has been updated!

Order #${order.order_id} is now: ${statusLabel}

${statusMessage}

Order Summary:
- Order ID: ${order.order_id}
- Total Amount: ${order.total_amount} DA
- Current Status: ${statusLabel}

Track your order anytime in the "My Orders" section on our website.

Thank you for shopping with Crochet Ella!

Best regards,
Crochet Ella`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Status update email (${newStatus}) sent to ${customerEmail} for Order ID: ${order.id}`);
    return true;
  } catch (error) {
    console.error(`Failed to send status update email for Order ID: ${order.id}`, error);
    return false;
  }
};
