import { useState, useEffect } from 'react';
import { itemService } from '../services/itemService';

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await itemService.getItems(query);
      setItems(response.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (data) => {
    try {
      const response = await itemService.createItem(data);
      setItems([response.data.item, ...items]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item');
      throw err;
    }
  };

  return { items, loading, error, fetchItems, createItem };
};
