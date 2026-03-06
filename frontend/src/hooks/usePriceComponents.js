import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePriceComponents = (category = null) => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const url = category 
        ? `${apiUrl}/price-components?category=${category}`
        : `${apiUrl}/price-components`;
      const response = await axios.get(url);
      setComponents(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching price components:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createComponent = async (componentData, token) => {
    try {
      const response = await axios.post(
        `${apiUrl}/price-components`,
        componentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchComponents();
      return response.data;
    } catch (err) {
      console.error('Error creating price component:', err);
      throw err;
    }
  };

  const updateComponent = async (id, componentData, token) => {
    try {
      const response = await axios.put(
        `${apiUrl}/price-components/${id}`,
        componentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchComponents();
      return response.data;
    } catch (err) {
      console.error('Error updating price component:', err);
      throw err;
    }
  };

  const deleteComponent = async (id, token) => {
    try {
      await axios.delete(
        `${apiUrl}/price-components/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchComponents();
    } catch (err) {
      console.error('Error deleting price component:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [category]);

  return {
    components,
    loading,
    error,
    refetch: fetchComponents,
    createComponent,
    updateComponent,
    deleteComponent
  };
};
