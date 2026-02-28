import { useState, useEffect } from 'react';
import { fetchStands, fetchStand, fetchReviews } from './api';
import type { Stand, Review } from '../data/types';

export function useStands() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state must be set before async fetch
    setLoading(true);
    fetchStands()
      .then(data => {
        if (!cancelled) {
          setStands(data);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { stands, loading, error, refetch: () => fetchStands().then(setStands) };
}

export function useStand(id: string | undefined) {
  const [stand, setStand] = useState<Stand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state must be set before async fetch
    setLoading(true);
    fetchStand(id)
      .then(data => {
        if (!cancelled) {
          setStand(data);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  return { stand, loading, error };
}

export function useReviews(standId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!standId) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state must be set before async fetch
    setLoading(true);
    fetchReviews(standId)
      .then(data => {
        if (!cancelled) setReviews(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [standId]);

  const addReview = (review: Review) => {
    setReviews(prev => [review, ...prev]);
  };

  return { reviews, loading, addReview };
}
