import { useState, useEffect } from 'react';
import api from '../api';
import { handleApiError } from '../utils';

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(url, options);
        setData(response.data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url, options]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url, options);
      setData(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

export function useApiMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (method, url, data = null, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch (method.toLowerCase()) {
        case 'post':
          response = await api.post(url, data, options);
          break;
        case 'put':
          response = await api.put(url, data, options);
          break;
        case 'patch':
          response = await api.patch(url, data, options);
          break;
        case 'delete':
          response = await api.delete(url, options);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}