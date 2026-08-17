import {
  doc,
  collection,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import type {
  UserProfile,
  PaycheckConfig,
  PostTaxAllocations,
  BudgetCategory,
  Subscription,
  Purchase,
} from '../types/models';

function converter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data: T) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
  };
}

export const userProfileRef = (uid: string) =>
  doc(db, 'users', uid).withConverter(converter<UserProfile>());

export const paycheckConfigRef = (uid: string) =>
  doc(db, 'users', uid, 'paycheckConfig', 'current').withConverter(converter<PaycheckConfig>());

export const postTaxAllocationsRef = (uid: string) =>
  doc(db, 'users', uid, 'postTaxAllocations', 'current').withConverter(
    converter<PostTaxAllocations>()
  );

export const budgetCategoriesCollection = (uid: string) =>
  collection(db, 'users', uid, 'budgetCategories').withConverter(converter<BudgetCategory>());

export const budgetCategoryRef = (uid: string, categoryId: string) =>
  doc(db, 'users', uid, 'budgetCategories', categoryId).withConverter(
    converter<BudgetCategory>()
  );

export const subscriptionsCollection = (uid: string) =>
  collection(db, 'users', uid, 'subscriptions').withConverter(converter<Subscription>());

export const subscriptionRef = (uid: string, subscriptionId: string) =>
  doc(db, 'users', uid, 'subscriptions', subscriptionId).withConverter(
    converter<Subscription>()
  );

export const purchasesCollection = (uid: string) =>
  collection(db, 'users', uid, 'purchases').withConverter(converter<Purchase>());

export const purchaseRef = (uid: string, purchaseId: string) =>
  doc(db, 'users', uid, 'purchases', purchaseId).withConverter(converter<Purchase>());
