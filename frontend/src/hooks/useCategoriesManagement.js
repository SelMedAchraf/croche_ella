import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useCategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      // Always use public endpoint since categories don't have active/inactive status
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Authentication required');

      const response = await axios.post(
        `${API_URL}/categories`,
        categoryData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCategories();
      return response.data;
    } catch (err) {
      console.error('Error creating category:', err);
      const errorMsg = err.response?.data?.error || 'Failed to create category';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Authentication required');

      const response = await axios.put(
        `${API_URL}/categories/${id}`,
        categoryData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCategories();
      return response.data;
    } catch (err) {
      console.error('Error updating category:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update category';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Authentication required');

      await axios.delete(
        `${API_URL}/categories/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete category';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
