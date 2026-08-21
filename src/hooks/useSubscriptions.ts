import { useEffect, useState } from 'react';
import { onSnapshot, addDoc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { subscriptionsCollection, subscriptionRef } from '../firebase/firestore';
import type { Subscription } from '../types/models';
import { useAuth } from '../contexts/AuthContext';

export function useSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(subscriptionsCollection(user.uid), (snap) => {
      setSubscriptions(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
      setLoading(false);
    });
  }, [user]);

  async function addSubscription(input: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!user) return;
    const now = Date.now();
    await addDoc(subscriptionsCollection(user.uid), { ...input, id: '', createdAt: now, updatedAt: now });
  }

  async function updateSubscription(subscriptionId: string, updates: Partial<Subscription>) {
    if (!user) return;
    // Firestore rejects `undefined` field values (and fails the whole update), so
    // translate an explicit `undefined` into a field deletion instead.
    const sanitized = Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [key, value === undefined ? deleteField() : value])
    );
    await updateDoc(subscriptionRef(user.uid, subscriptionId), { ...sanitized, updatedAt: Date.now() });
  }

  async function deleteSubscription(subscriptionId: string) {
    if (!user) return;
    await deleteDoc(subscriptionRef(user.uid, subscriptionId));
  }

  return { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription };
}
