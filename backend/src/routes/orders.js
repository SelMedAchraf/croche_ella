import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Create order (public)
router.post('/',
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
        customer_name,
        customer_phone,
        customer_city,
        delivery_notes,
        items,
        total_amount,
        wilaya_code,
        delivery_type,
        delivery_price
      } = req.body;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name,
          customer_phone,
          customer_city,
          delivery_notes,
          total_amount,
          status: 'pending',
          order_state: 'pending_contact',
          wilaya_code: wilaya_code || null,
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
        color: item.color || null,
        custom_order_type: item.custom_order_type || null,
        custom_data: item.custom_data || null,
        reference_image_url: item.reference_image_url || null
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
            products (*)
          )
        `)
        .eq('id', order.id)
        .single();

      if (fetchError) throw fetchError;

      res.status(201).json(completeOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

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
            products (*)
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
            products (*)
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

      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  }
);

// ============================================================
// LIFECYCLE MANAGEMENT ENDPOINTS
// ============================================================

// Update order state (admin only)
router.patch('/:id/state',
  authenticateAdmin,
  async (req, res) => {
    try {
      const { order_state } = req.body;

      const validStates = [
        'pending_contact',
        'waiting_deposit',
        'confirmed',
        'in_progress',
        'ready_for_delivery',
        'delivered',
        'cancelled'
      ];

      if (!validStates.includes(order_state)) {
        return res.status(400).json({ 
          error: 'Invalid order state',
          validStates 
        });
      }

      const { data, error } = await supabase
        .from('orders')
        .update({ order_state, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error updating order state:', error);
      res.status(500).json({ error: 'Failed to update order state' });
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
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { deposit_value } = req.body;

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
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          deposit_value: parseFloat(deposit_value),
          updated_at: new Date().toISOString() 
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

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

      // Recalculate order total from all items
      const { data: allItems, error: allItemsError } = await supabase
        .from('order_items')
        .select('price, quantity')
        .eq('order_id', orderId);

      if (allItemsError) throw allItemsError;

      const newTotal = allItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price || 0) * item.quantity);
      }, 0);

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
            products (*)
          )
        `)
        .single();

      if (updateOrderError) throw updateOrderError;

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

      // Recalculate order total from all items
      const { data: allItems, error: allItemsError } = await supabase
        .from('order_items')
        .select('price, quantity')
        .eq('order_id', orderId);

      if (allItemsError) throw allItemsError;

      const newTotal = allItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price || 0) * item.quantity);
      }, 0);

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
            products (*)
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

export default router;

