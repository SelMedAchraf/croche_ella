import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateAdmin, authenticateUser } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { 
  sendNewOrderNotification, 
  sendCustomerOrderConfirmation,
  sendOrderCancelledNotification,
  sendCancelRequestNotification,
  sendDepositConfirmationToCustomer,
  sendCustomPriceSetToCustomer,
  sendOrderStatusUpdateToCustomer
} from '../utils/emailService.js';

const router = express.Router();

// Create order
router.post('/',
  authenticateUser,
  [
    body('customer_name').notEmpty().trim(),
    body('customer_phone').notEmpty().trim(),
    body('customer_city').notEmpty().trim(),
    body('items').isArray({ min: 1 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        user_id,
        customer_name,
        customer_phone,
        customer_city,
        full_address,
        items,
        total_amount,
        delivery_type,
        delivery_price
      } = req.body;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user_id || null,
          customer_name,
          customer_phone,
          customer_city,
          full_address,
          total_amount,
          status: 'pending',
          delivery_type: delivery_type || 'home',
          delivery_price: delivery_price || 0
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with custom order support
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id || null,
        quantity: item.quantity,
        price: item.price,
        custom_order_type: item.custom_order_type || null,
        custom_data: item.custom_data || null,
        reference_images: item.reference_images || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Fetch complete order with items
      const { data: completeOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `)
        .eq('id', order.id)
        .single();

      if (fetchError) throw fetchError;

      // Trigger Email Notifications (non-blocking)
      sendNewOrderNotification(completeOrder).catch(console.error);
      sendCustomerOrderConfirmation(completeOrder).catch(console.error);

      res.status(201).json(completeOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

// ============================================================
// CUSTOMER ENDPOINTS
// ============================================================

// Get all orders for the authenticated customer
router.get('/my-orders',
  authenticateUser,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `)
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      res.status(500).json({ error: 'Failed to fetch your orders' });
    }
  }
);

// Get single order for the authenticated customer
router.get('/my-orders/:id',
  authenticateUser,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `)
        .eq('id', req.params.id)
        .eq('user_id', req.user.id) // verify ownership
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching customer order:', error);
      res.status(500).json({ error: 'Failed to fetch your order' });
    }
  }
);

// Cancel order directly (only if pending or waiting_deposit)
router.post('/:id/cancel',
  authenticateUser,
  async (req, res) => {
    try {
      const orderId = req.params.id;

      // 1. Verify ownership & status
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', req.user.id)
        .single();

      if (fetchError || !order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (['pending', 'waiting_deposit'].includes(order.status) === false) {
        return res.status(400).json({ error: 'Order cannot be cancelled directly in its current state.' });
      }

      // 2. Perform cancellation
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 3. Notify admin
      sendOrderCancelledNotification(updatedOrder).catch(console.error);

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ error: 'Failed to cancel the order' });
    }
  }
);

// Request to cancel an ongoing order (confirmed or in_progress)
router.post('/:id/request-cancel',
  authenticateUser,
  async (req, res) => {
    try {
      const orderId = req.params.id;

      // 1. Verify ownership
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', req.user.id)
        .single();

      if (fetchError || !order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (['confirmed', 'in_progress'].includes(order.status) === false) {
        return res.status(400).json({ error: 'Order cancellation request is not valid for this status.' });
      }

      // 2. Flag as requested for cancellation
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ 
          cancel_requested: true,
          cancel_requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 3. Notify Admin
      sendCancelRequestNotification(updatedOrder).catch(console.error);

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error requesting order cancellation:', error);
      res.status(500).json({ error: 'Failed to request cancellation' });
    }
  }
);

// ============================================================
// ADMIN ENDPOINTS
// ============================================================

// Get all orders (admin only)
router.get('/',
  authenticateAdmin,
  async (req, res) => {
    try {
      const { status } = req.query;
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
);

// Get single order (admin only)
router.get('/:id',
  authenticateAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `)
        .eq('id', req.params.id)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }
);

// Update order status (admin only)
router.patch('/:id/status',
  authenticateAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      const validStatuses = [
        'pending',
        'waiting_deposit',
        'confirmed',
        'in_progress',
        'delivered',
        'done',
        'cancelled'
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status',
          validStatuses 
        });
      }

      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', req.params.id)
        .single();
        
      if (fetchError || !currentOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      let updatePayload = { status, updated_at: new Date().toISOString() };

      if (status === 'done') {
          const remaining = parseFloat(currentOrder.total_amount) - parseFloat(currentOrder.deposit_value || 0);
          if (remaining > 0) {
              updatePayload.second_payment_completed = true;
          }
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Notify customer of status change (non-blocking)
      sendOrderStatusUpdateToCustomer(data, status).catch(console.error);

      res.json(data);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  }
);

// Set second payment value (admin only)
router.patch('/:id/second-payment',
  authenticateAdmin,
  [
    body('proof_url').optional({ nullable: true }).isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { proof_url } = req.body;

      // First fetch the order to calculate remaining
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('id, total_amount, deposit_value, second_payment_completed')
        .eq('id', req.params.id)
        .single();

      if (fetchError) throw fetchError;
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const remaining = parseFloat(order.total_amount) - parseFloat(order.deposit_value || 0);

      if (order.second_payment_completed) {
        return res.status(400).json({ error: 'Second payment has already been completed for this order' });
      }

      if (remaining <= 0) {
        return res.status(400).json({ error: 'There is no remaining amount to be paid' });
      }

      const updatePayload = { 
        second_payment_completed: true,
        updated_at: new Date().toISOString() 
      };

      if (proof_url) {
        updatePayload.second_payment_proof_url = proof_url;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error setting second payment:', error);
      res.status(500).json({ error: 'Failed to set second payment' });
    }
  }
);

// Set deposit value (admin only)
router.patch('/:id/deposit',
  authenticateAdmin,
  [
    body('deposit_value').isNumeric().custom(value => {
      if (value < 0) {
        throw new Error('Deposit must be positive');
      }
      return true;
    }),
    body('deposit_proof_url').optional({ nullable: true }).isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { deposit_value, deposit_proof_url } = req.body;

      // First fetch the order to validate deposit doesn't exceed total
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('id, total_amount')
        .eq('id', req.params.id)
        .single();

      if (fetchError) throw fetchError;
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Validate deposit doesn't exceed total
      if (parseFloat(deposit_value) > parseFloat(order.total_amount)) {
        return res.status(400).json({ 
          error: 'Deposit cannot exceed total amount',
          deposit_value,
          total_amount: order.total_amount
        });
      }

      // Update deposit (trigger will auto-calculate remaining_balance)
      const updatePayload = { 
        deposit_value: parseFloat(deposit_value),
        updated_at: new Date().toISOString() 
      };

      if (deposit_proof_url) {
        updatePayload.deposit_proof_url = deposit_proof_url;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      // Notify customer about deposit confirmation (non-blocking)
      sendDepositConfirmationToCustomer(data).catch(console.error);

      res.json(data);
    } catch (error) {
      console.error('Error setting deposit:', error);
      res.status(500).json({ error: 'Failed to set deposit' });
    }
  }
);

// Set custom item price and recalculate order total (admin only)
router.patch('/:id/custom-price',
  authenticateAdmin,
  [
    body('item_id').isUUID(),
    body('price').isNumeric().custom(value => {
      if (value < 0) {
        throw new Error('Price must be positive');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { item_id, price } = req.body;
      const orderId = req.params.id;

      // Verify the item belongs to this order and is a custom order
      const { data: item, error: itemFetchError } = await supabase
        .from('order_items')
        .select('id, order_id, quantity, custom_order_type')
        .eq('id', item_id)
        .eq('order_id', orderId)
        .single();

      if (itemFetchError) throw itemFetchError;
      if (!item) {
        return res.status(404).json({ error: 'Order item not found' });
      }

      if (!item.custom_order_type) {
        return res.status(400).json({ 
          error: 'Can only set price for custom order items' 
        });
      }

      // Update item price
      const { error: updateItemError } = await supabase
        .from('order_items')
        .update({ price: parseFloat(price) })
        .eq('id', item_id);

      if (updateItemError) throw updateItemError;

      // Get current order to fetch delivery_price
      const { data: currentOrder, error: orderFetchError } = await supabase
        .from('orders')
        .select('delivery_price')
        .eq('id', orderId)
        .single();

      if (orderFetchError) throw orderFetchError;

      // Recalculate order total from all items
      const { data: allItems, error: allItemsError } = await supabase
        .from('order_items')
        .select('price, quantity')
        .eq('order_id', orderId);

      if (allItemsError) throw allItemsError;

      const itemsTotal = allItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price || 0) * item.quantity);
      }, 0);

      // Add delivery price to items total
      const deliveryPrice = parseFloat(currentOrder.delivery_price || 0);
      const newTotal = itemsTotal + deliveryPrice;

      // Update order total (trigger will recalculate remaining_balance)
      const { data: updatedOrder, error: updateOrderError } = await supabase
        .from('orders')
        .update({ 
          total_amount: newTotal,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select(`
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `)
        .single();

      if (updateOrderError) throw updateOrderError;

      // Notify customer that custom item price has been set (non-blocking)
      sendCustomPriceSetToCustomer(updatedOrder).catch(console.error);

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error setting custom price:', error);
      res.status(500).json({ error: 'Failed to set custom price' });
    }
  }
);

// Update individual order item price (admin only)
router.patch('/:id/item-price',
  authenticateAdmin,
  [
    body('item_id').isNumeric(),
    body('price').isNumeric().custom(value => {
      if (value < 0) {
        throw new Error('Price must be positive');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { item_id, price } = req.body;
      const orderId = req.params.id;

      // Verify the item belongs to this order
      const { data: item, error: itemFetchError } = await supabase
        .from('order_items')
        .select('id, order_id, quantity')
        .eq('id', item_id)
        .eq('order_id', orderId)
        .single();

      if (itemFetchError) throw itemFetchError;
      if (!item) {
        return res.status(404).json({ error: 'Order item not found' });
      }

      // Update item price
      const { error: updateItemError } = await supabase
        .from('order_items')
        .update({ price: parseFloat(price) })
        .eq('id', item_id);

      if (updateItemError) throw updateItemError;

      // Get current order to fetch delivery_price
      const { data: currentOrder, error: orderFetchError } = await supabase
        .from('orders')
        .select('delivery_price')
        .eq('id', orderId)
        .single();

      if (orderFetchError) throw orderFetchError;

      // Recalculate order total from all items
      const { data: allItems, error: allItemsError } = await supabase
        .from('order_items')
        .select('price, quantity')
        .eq('order_id', orderId);

      if (allItemsError) throw allItemsError;

      const itemsTotal = allItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price || 0) * item.quantity);
      }, 0);

      // Add delivery price to items total
      const deliveryPrice = parseFloat(currentOrder.delivery_price || 0);
      const newTotal = itemsTotal + deliveryPrice;

      // Update order total (trigger will recalculate remaining_balance)
      const { data: updatedOrder, error: updateOrderError } = await supabase
        .from('orders')
        .update({ 
          total_amount: newTotal,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select(`
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `)
        .single();

      if (updateOrderError) throw updateOrderError;

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating item price:', error);
      res.status(500).json({ error: 'Failed to update item price' });
    }
  }
);

// Update admin note (admin only)
router.patch('/:id/admin-note',
  authenticateAdmin,
  [
    body('admin_note').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { admin_note } = req.body;
      const orderId = req.params.id;

      // Fetch the order to check its status
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Prevent updating admin_note if order is cancelled or done
      if (order.status === 'cancelled' || order.status === 'done') {
        return res.status(403).json({ 
          error: 'Cannot update admin note for orders with status: cancelled or done'
        });
      }

      // Update admin_note
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          admin_note: admin_note || null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error updating admin note:', error);
      res.status(500).json({ error: 'Failed to update admin note' });
    }
  }
);

// Update cancel request status (admin only)
router.patch('/:id/cancel-request',
  authenticateAdmin,
  [
    body('cancel_requested').isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { cancel_requested } = req.body;
      const orderId = req.params.id;

      const { data, error } = await supabase
        .from('orders')
        .update({ 
          cancel_requested,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error updating cancel request status:', error);
      res.status(500).json({ error: 'Failed to update cancel request status' });
    }
  }
);

export default router;

