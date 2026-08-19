import { useEffect, useState } from 'react';
import { onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
      const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      setCategories(docs);
      setLoading(false);
      // Categories archived under the old flow are now deleted outright — sweep them
      // once so "archived" no longer lingers as a hidden state.
      for (const c of docs) {
        if (c.archived) deleteDoc(budgetCategoryRef(user.uid, c.id));
      }
    });
  }, [user]);

  async function addCategory(name: string, monthlyBudget: number, color?: string) {
    if (!user) return;
    const now = Date.now();
    await addDoc(budgetCategoriesCollection(user.uid), {
      id: '',
      name,
      monthlyBudget,
      // Firestore rejects `undefined` field values, so only include color when set.
      ...(color ? { color } : {}),
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

  async function deleteCategory(categoryId: string) {
    if (!user) return;
    await deleteDoc(budgetCategoryRef(user.uid, categoryId));
  }

  return { categories, loading, addCategory, updateCategory, deleteCategory };
}
