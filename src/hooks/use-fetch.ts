"use client";

import { useState, useEffect, useCallback } from "react";

export function useFetch<T>(url: string | null, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(url));

  const refetch = useCallback(() => {
    if (!url) return;
    setIsLoading(true);
    setError(null);
    fetch(url, options)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [url, options]);

  useEffect(() => {
    if (!url) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    refetch();
  }, [url, refetch]);

  return { data, error, isLoading, refetch };
}
