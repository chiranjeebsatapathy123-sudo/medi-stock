import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export function useApi(endpoint, initialData = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    let mounted = true;
    try {
      setLoading(true);
      const res = await client.get(endpoint);
      if (mounted) setData(res.data);
    } catch (err) {
      if (mounted) setError(err);
    } finally {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false; };
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}
