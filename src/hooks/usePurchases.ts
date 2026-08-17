import { useEffect, useState } from 'react';
import { onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { purchasesCollection, purchaseRef } from '../firebase/firestore';
import type { Purchase } from '../types/models';
import { useAuth } from '../contexts/AuthContext';

export function usePurchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPurchases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(purchasesCollection(user.uid), (snap) => {
      setPurchases(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
      setLoading(false);
    });
  }, [user]);

  async function addPurchase(input: Omit<Purchase, 'id' | 'createdAt'>) {
    if (!user) return;
    // Firestore rejects `undefined` field values, so drop notes entirely when empty.
    const { notes, ...rest } = input;
    await addDoc(purchasesCollection(user.uid), {
      ...rest,
      ...(notes ? { notes } : {}),
      id: '',
      createdAt: Date.now(),
    });
  }

  async function updatePurchase(purchaseId: string, updates: Partial<Purchase>) {
    if (!user) return;
    await updateDoc(purchaseRef(user.uid, purchaseId), updates);
  }

  return { purchases, loading, addPurchase, updatePurchase };
}
