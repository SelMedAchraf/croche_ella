import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all delivery prices (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('delivery_prices')
      .select('*')
      .order('wilaya_code', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching delivery prices:', error);
    res.status(500).json({ error: 'Failed to fetch delivery prices' });
  }
});

// Get delivery price by wilaya code (public)
router.get('/wilaya/:wilaya_code', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('delivery_prices')
      .select('*')
      .eq('wilaya_code', req.params.wilaya_code)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Delivery price not found for this wilaya' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching delivery price:', error);
    res.status(500).json({ error: 'Failed to fetch delivery price' });
  }
});

// Get delivery price by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('delivery_prices')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Delivery price not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching delivery price:', error);
    res.status(500).json({ error: 'Failed to fetch delivery price' });
  }
});

// Create delivery price (admin only)
router.post('/',
  authenticateAdmin,
  [
    body('wilaya_code').isInt({ min: 1 }),
    body('wilaya_name').notEmpty().trim(),
    body('home_delivery_price').isFloat({ min: 0 }),
    body('stopdesk_delivery_price').isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { wilaya_code, wilaya_name, home_delivery_price, stopdesk_delivery_price } = req.body;

      const { data, error } = await supabase
        .from('delivery_prices')
        .insert([{
          wilaya_code,
          wilaya_name,
          home_delivery_price,
          stopdesk_delivery_price
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error('Error creating delivery price:', error);
      res.status(500).json({ error: 'Failed to create delivery price' });
    }
  }
);

// Update delivery price (admin only)
router.put('/:id',
  authenticateAdmin,
  async (req, res) => {
    try {
      const { wilaya_name, home_delivery_price, stopdesk_delivery_price } = req.body;

      const { data, error } = await supabase
        .from('delivery_prices')
        .update({
          wilaya_name,
          home_delivery_price,
          stopdesk_delivery_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Delivery price not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error updating delivery price:', error);
      res.status(500).json({ error: 'Failed to update delivery price' });
    }
  }
);

// Delete delivery price (admin only)
router.delete('/:id',
  authenticateAdmin,
  async (req, res) => {
    try {
      const { error } = await supabase
        .from('delivery_prices')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ message: 'Delivery price deleted successfully' });
    } catch (error) {
      console.error('Error deleting delivery price:', error);
      res.status(500).json({ error: 'Failed to delete delivery price' });
    }
  }
);

export default router;
