import { useState, useEffect } from 'react';
import axios from 'axios';

export const useDeliveryPrices = () => {
  const [deliveryPrices, setDeliveryPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchDeliveryPrices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/delivery-prices`);
      setDeliveryPrices(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching delivery prices:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryPriceByWilaya = async (wilayaCode) => {
    try {
      const response = await axios.get(`${apiUrl}/delivery-prices/wilaya/${wilayaCode}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching delivery price:', err);
      throw err;
    }
  };

  const updateDeliveryPrice = async (id, priceData, token) => {
    try {
      const response = await axios.put(
        `${apiUrl}/delivery-prices/${id}`,
        priceData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchDeliveryPrices();
      return response.data;
    } catch (err) {
      console.error('Error updating delivery price:', err);
      throw err;
    }
  };

  const createDeliveryPrice = async (priceData, token) => {
    try {
      const response = await axios.post(
        `${apiUrl}/delivery-prices`,
        priceData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchDeliveryPrices();
      return response.data;
    } catch (err) {
      console.error('Error creating delivery price:', err);
      throw err;
    }
  };

  const deleteDeliveryPrice = async (id, token) => {
    try {
      await axios.delete(
        `${apiUrl}/delivery-prices/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchDeliveryPrices();
    } catch (err) {
      console.error('Error deleting delivery price:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDeliveryPrices();
  }, []);

  return {
    deliveryPrices,
    loading,
    error,
    refetch: fetchDeliveryPrices,
    getDeliveryPriceByWilaya,
    updateDeliveryPrice,
    createDeliveryPrice,
    deleteDeliveryPrice
  };
};
