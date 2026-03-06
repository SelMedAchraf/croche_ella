import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all price components (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = supabase
      .from('price_components')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching price components:', error);
    res.status(500).json({ error: 'Failed to fetch price components' });
  }
});

// Get single price component by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('price_components')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Price component not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching price component:', error);
    res.status(500).json({ error: 'Failed to fetch price component' });
  }
});

// Create price component (admin only)
router.post('/',
  authenticateAdmin,
  [
    body('name').notEmpty().trim(),
    body('category').notEmpty().trim(),
    body('image_url').notEmpty().trim(),
    body('price').isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, category, image_url, price } = req.body;

      const { data, error } = await supabase
        .from('price_components')
        .insert([{
          name,
          description: description || null,
          category,
          image_url,
          price
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error('Error creating price component:', error);
      res.status(500).json({ error: 'Failed to create price component' });
    }
  }
);

// Update price component (admin only)
router.put('/:id',
  authenticateAdmin,
  async (req, res) => {
    try {
      const { name, description, category, image_url, price } = req.body;

      const { data, error } = await supabase
        .from('price_components')
        .update({
          name,
          description,
          category,
          image_url,
          price
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Price component not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error updating price component:', error);
      res.status(500).json({ error: 'Failed to update price component' });
    }
  }
);

// Delete price component (admin only)
router.delete('/:id',
  authenticateAdmin,
  async (req, res) => {
    try {
      const { error } = await supabase
        .from('price_components')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ message: 'Price component deleted successfully' });
    } catch (error) {
      console.error('Error deleting price component:', error);
      res.status(500).json({ error: 'Failed to delete price component' });
    }
  }
);

export default router;
