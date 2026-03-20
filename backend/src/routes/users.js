import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    // Map users to extract necessary data
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      is_banned: !!user.banned_until && new Date(user.banned_until) > new Date(),
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Block/Ban a user (admin only)
router.put('/:id/block', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ban for ~100 years
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: '876000h' 
    });

    if (error) throw error;

    res.json({ message: 'User successfully blocked', user: data.user });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock/Unban a user (admin only)
router.put('/:id/unblock', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: 'none'
    });

    if (error) throw error;

    res.json({ message: 'User successfully unblocked', user: data.user });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

export default router;
