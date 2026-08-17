import { useEffect, useState } from 'react';
import { onSnapshot, setDoc } from 'firebase/firestore';
import { paycheckConfigRef, postTaxAllocationsRef } from '../firebase/firestore';
import type { PaycheckConfig, PostTaxAllocations } from '../types/models';
import { useAuth } from '../contexts/AuthContext';

export function usePaycheckConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState<PaycheckConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConfig(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(paycheckConfigRef(user.uid), (snap) => {
      setConfig(snap.exists() ? snap.data() : null);
      setLoading(false);
    });
  }, [user]);

  async function save(next: PaycheckConfig) {
    if (!user) return;
    await setDoc(paycheckConfigRef(user.uid), next);
  }

  return { config, loading, save };
}

export function usePostTaxAllocations() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<PostTaxAllocations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAllocations(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(postTaxAllocationsRef(user.uid), (snap) => {
      setAllocations(snap.exists() ? snap.data() : null);
      setLoading(false);
    });
  }, [user]);

  async function save(next: PostTaxAllocations) {
    if (!user) return;
    await setDoc(postTaxAllocationsRef(user.uid), next);
  }

  return { allocations, loading, save };
}
