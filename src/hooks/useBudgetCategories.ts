import { useEffect, useState } from 'react';
import { onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { budgetCategoriesCollection, budgetCategoryRef } from '../firebase/firestore';
import type { BudgetCategory } from '../types/models';
import { useAuth } from '../contexts/AuthContext';

export function useBudgetCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(budgetCategoriesCollection(user.uid), (snap) => {
      setCategories(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
      setLoading(false);
    });
  }, [user]);

  async function addCategory(name: string, monthlyBudget: number, color?: string) {
    if (!user) return;
    const now = Date.now();
    await addDoc(budgetCategoriesCollection(user.uid), {
      id: '',
      name,
      monthlyBudget,
      color,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateCategory(categoryId: string, updates: Partial<BudgetCategory>) {
    if (!user) return;
    await updateDoc(budgetCategoryRef(user.uid, categoryId), {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  async function archiveCategory(categoryId: string) {
    await updateCategory(categoryId, { archived: true });
  }

  return { categories, loading, addCategory, updateCategory, archiveCategory };
}
